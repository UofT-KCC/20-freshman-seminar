# UTKCC Freshman Seminar 2026

An interactive in-flight screen invitation for the UTKCC Freshman Seminar, built around a boarding-pass style flow with personalized names, city-specific seminar information, live attendee count, weather, and a restartable screen experience.

---

## 🛫 Concept

This project turns the freshman seminar invite into an airplane seatback screen. Guests enter their name, choose the seminar city they are attending, and then arrive at a personalized event dashboard.

The experience supports two seminar tracks:

- **Seoul**: KST event details, Seoul weather, Yonsei location links
- **Toronto**: EDT event details, Toronto weather, Toronto-specific placeholders

---

## ✨ Main Features

- Personalized welcome screen after name entry
- Separate seminar city selection step
- Seoul / Toronto event mode switching
- Route display based on selected seminar city
- Live attendee counter with Vercel Blob support
- Weather widget using Open-Meteo
- Korean / English language toggle
- Screen brightness dimmer
- Power button restart flow
- Scanner page for event check-in workflows
- Responsive airplane-screen layout for desktop and mobile

---

## 📁 Project Layout

```text
├── index.html                 # Main interactive invitation
├── script.js                  # UI state, city switching, weather, attendee logic
├── style.css                  # Full visual system and responsive layout
├── scanner.html               # Check-in scanner page
├── scanner.js                 # Scanner page behavior
├── api/
│   ├── attendees.js           # Live attendee count API
│   └── checkin.js             # Google Sheets-backed QR check-in API
├── images/
│   ├── boarding-pass.png      # Boarding pass asset
│   ├── desktop-screen.png     # Wide desktop screen frame
│   ├── screen.png             # Main airplane screen frame
│   ├── utkcc-logo.png         # UTKCC logo
│   └── wallpaper.png          # In-screen skyline wallpaper
├── favicon.ico
└── package.json
```

---

## 🚀 Run Locally

This is a mostly static site. A simple local server is enough:

```bash
python3 -m http.server 3000
```

Then open:

```text
http://127.0.0.1:3000
```

The scanner page is available at:

```text
http://127.0.0.1:3000/scanner.html
```

---

## 🧭 User Flow

1. Guest opens the invitation.
2. Guest enters their boarding name.
3. Guest selects **Seoul** or **Toronto** as their seminar city.
4. The app updates route, timezone, location, weather, and event details.
5. Guest lands on the main event dashboard.
6. The power button briefly shuts down the screen and restarts the flow.

---

## 🧩 Event Modes

### Seoul

- Timezone: `KST`
- Weather: Seoul
- Location: Baekyang Hall S208, Yonsei University
- Afterparty: Hyunmyeong Pocha
- Map links enabled

### Toronto

- Timezone: `EDT`
- Weather: Toronto
- Location: Toronto / U of T placeholder
- Afterparty details marked as TBA
- Map links disabled until details are finalized

---

## 🛠 Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Ionicons
- Open-Meteo API
- Vercel Serverless Function
- Vercel Blob for persistent attendee count

---

## 🔌 API Notes

The live attendee count uses:

```text
api/attendees.js
```

When `BLOB_READ_WRITE_TOKEN` is configured, visitor IDs are stored in Vercel Blob. Without it, the API falls back to temporary in-memory storage so the site can still run locally.

Required production environment variable:

```text
BLOB_READ_WRITE_TOKEN
```

### QR Check-In with Google Sheets

The staff scanner validates QR payloads in this format:

```text
UTKCC2026:seoul:A8K29QZ4P1
UTKCC2026:toronto:N4X7B2M9LA
```

Use a Google Sheet with a header row containing these columns:

```text
Name | Email | City | Checked In At | Notes | QR Payload | QR Code
```

Minimum required columns:

```text
Checked In At | QR Payload
```

Recommended values:

- `Name`: attendee name, for staff display
- `Email`: optional admin reference
- `City`: `seoul` or `toronto`
- `Checked In At`: leave blank; the scanner fills it when checked in
- `Notes`: optional admin notes
- `QR Payload`: generated from attendee row data
- `QR Code`: generated QR image for printing or boarding-pass placement

Use this formula in `F2`:

```text
=IF(OR(A2="",C2=""),"","UTKCC2026:"&LOWER(C2)&":FS"&TEXT(ROW()-1,"0000")&"-"&REGEXREPLACE(UPPER(LEFT(A2,3)&LEFT(B2,FIND("@",B2&"@")-1)),"[^A-Z0-9_-]",""))
```

Use this formula in `G2`:

```text
=IF(F2="","",IMAGE("https://quickchart.io/qr?text="&ENCODEURL(F2)&"&size=220"))
```

Drag both formulas down for attendee rows. The scanner accepts either a camera scan of the QR image or a manual paste of the `QR Payload` value. Avoid sorting rows after QR codes are printed because the formula uses the row number as part of the generated ticket code.

The scanner page calls:

```text
api/checkin.js
```

Required production environment variables:

```text
GOOGLE_SHEETS_CLIENT_EMAIL
GOOGLE_SHEETS_PRIVATE_KEY
GOOGLE_SHEETS_SPREADSHEET_ID
```

Optional:

```text
GOOGLE_SHEETS_ATTENDEES_RANGE=Attendees!A:H
```

Create a Google Cloud service account, enable the Google Sheets API, and share the attendee spreadsheet with the service account email as an editor. Store the private key with newline characters escaped as `\n` if your host requires one-line environment variables.

---

## 🌐 Browser Support

Recommended:

- Chrome
- Safari
- Firefox
- Edge

The layout is optimized for modern browsers with support for CSS grid, custom properties, backdrop filters, and responsive viewport units.

---

## 👥 Credits

Built for the University of Toronto Korean Community Club (UTKCC).

© 2026 UTKCC. All rights reserved.

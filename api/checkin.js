const crypto = require("crypto");

const EVENT_CODE = "UTKCC2026";
const DEFAULT_RANGE = "Attendees!A:H";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

const HEADER_ALIASES = {
  ticketId: ["ticket id", "ticket", "id", "qr id", "qr"],
  name: ["name", "passenger", "attendee name", "student name"],
  email: ["email", "e-mail"],
  city: ["city", "seminar city", "location"],
  status: ["status", "check in status", "check-in status"],
  checkedInAt: ["checked in at", "check in time", "checkedin at"],
  checkedInBy: ["checked in by", "staff", "scanner"],
};

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function getRequestBody(request) {
  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch (error) {
      return {};
    }
  }

  return request.body || {};
}

function base64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function parseQrValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^UTKCC2026:(seoul|toronto):([a-zA-Z0-9_-]{6,40})$/);

  if (!match) {
    return null;
  }

  return {
    eventCode: EVENT_CODE,
    city: match[1].toLowerCase(),
    ticketId: match[2].toUpperCase(),
  };
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findHeaderIndex(headers, aliases) {
  const normalizedHeaders = headers.map(normalizeHeader);
  return normalizedHeaders.findIndex((header) => aliases.includes(header));
}

function mapHeaders(headers) {
  return Object.fromEntries(
    Object.entries(HEADER_ALIASES).map(([key, aliases]) => [key, findHeaderIndex(headers, aliases)])
  );
}

function columnName(index) {
  let value = index + 1;
  let name = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }

  return name;
}

function sheetNameFromRange(range) {
  const [sheetName] = range.split("!");
  return sheetName.replace(/^'|'$/g, "");
}

function escapeSheetName(sheetName) {
  return sheetName.replace(/'/g, "''");
}

function getEnvConfig() {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return {
    clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    privateKey,
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: process.env.GOOGLE_SHEETS_ATTENDEES_RANGE || DEFAULT_RANGE,
  };
}

async function getAccessToken(config) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const claim = {
    iss: config.clientEmail,
    scope: SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  const signature = signer
    .sign(config.privateKey, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedToken}.${signature}`,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Google Sheets authentication failed.");
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function getSheetValues(config, accessToken) {
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(config.range)}`
  );

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not read attendee sheet.");
  }

  const data = await response.json();
  return Array.isArray(data.values) ? data.values : [];
}

async function updateSheetCells(config, accessToken, rowNumber, updates) {
  const sheetName = sheetNameFromRange(config.range);
  const data = updates.map(({ columnIndex, value }) => ({
    range: `'${escapeSheetName(sheetName)}'!${columnName(columnIndex)}${rowNumber}`,
    values: [[value]],
  }));

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Could not update attendee sheet.");
  }
}

function getCell(row, index) {
  return index >= 0 ? String(row[index] || "").trim() : "";
}

function isCheckedInStatus(status) {
  const normalizedStatus = normalizeHeader(status);

  if (!normalizedStatus || normalizedStatus.includes("not checked") || normalizedStatus.includes("미완료")) {
    return false;
  }

  return ["checked in", "checked-in", "complete", "completed", "done", "yes", "y", "완료", "체크인"].includes(
    normalizedStatus
  );
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED" });
    return;
  }

  const body = getRequestBody(request);
  const parsedQr = parseQrValue(body.qrValue);

  if (!parsedQr) {
    sendJson(response, 200, {
      ok: false,
      code: "INVALID_FORMAT",
      title: "NOT A UTKCC PASS",
      message: "QR 코드 형식이 올바르지 않습니다.",
    });
    return;
  }

  const config = getEnvConfig();

  if (!config.clientEmail || !config.privateKey || !config.spreadsheetId) {
    sendJson(response, 500, {
      ok: false,
      code: "SHEETS_NOT_CONFIGURED",
      title: "CHECK-IN NOT CONFIGURED",
      message: "Google Sheets 환경 변수가 설정되지 않았습니다.",
    });
    return;
  }

  try {
    const accessToken = await getAccessToken(config);
    const values = await getSheetValues(config, accessToken);
    const headers = values[0] || [];
    const columns = mapHeaders(headers);

    if (columns.ticketId < 0 || columns.city < 0 || columns.status < 0 || columns.checkedInAt < 0) {
      sendJson(response, 500, {
        ok: false,
        code: "SHEET_COLUMNS_MISSING",
        title: "SHEET SETUP ERROR",
        message: "Ticket ID, City, Status, Checked In At 컬럼이 필요합니다.",
      });
      return;
    }

    const attendeeRowIndex = values.findIndex((row, index) => {
      if (index === 0) {
        return false;
      }

      return getCell(row, columns.ticketId).toUpperCase() === parsedQr.ticketId;
    });

    if (attendeeRowIndex < 0) {
      sendJson(response, 200, {
        ok: false,
        code: "UNKNOWN_TICKET",
        title: "INVALID PASS",
        message: "등록된 티켓을 찾을 수 없습니다.",
      });
      return;
    }

    const attendeeRow = values[attendeeRowIndex];
    const attendeeCity = getCell(attendeeRow, columns.city).toLowerCase();
    const attendeeName = getCell(attendeeRow, columns.name) || "Guest";
    const attendeeStatus = getCell(attendeeRow, columns.status).toLowerCase();
    const checkedInAt = getCell(attendeeRow, columns.checkedInAt);

    if (attendeeCity !== parsedQr.city) {
      sendJson(response, 200, {
        ok: false,
        code: "CITY_MISMATCH",
        title: "WRONG CITY",
        message: `${attendeeName}님은 ${attendeeCity || "다른"} 세미나 명단에 있습니다.`,
        attendee: {
          name: attendeeName,
          city: attendeeCity,
          ticketId: parsedQr.ticketId,
        },
      });
      return;
    }

    if (isCheckedInStatus(attendeeStatus)) {
      sendJson(response, 200, {
        ok: true,
        code: "ALREADY_CHECKED_IN",
        title: "ALREADY CHECKED IN",
        message: checkedInAt ? `${checkedInAt}에 이미 체크인되었습니다.` : "이미 체크인된 티켓입니다.",
        attendee: {
          name: attendeeName,
          city: attendeeCity,
          ticketId: parsedQr.ticketId,
          checkedInAt,
        },
      });
      return;
    }

    const now = new Date().toISOString();
    const updates = [
      {
        columnIndex: columns.status,
        value: "Checked in",
      },
      {
        columnIndex: columns.checkedInAt,
        value: now,
      },
    ];

    if (columns.checkedInBy >= 0) {
      updates.push({
        columnIndex: columns.checkedInBy,
        value: body.staffName || "Scanner",
      });
    }

    await updateSheetCells(config, accessToken, attendeeRowIndex + 1, updates);

    sendJson(response, 200, {
      ok: true,
      code: "CHECKED_IN",
      title: "VALID PASS",
      message: "체크인이 완료되었습니다.",
      attendee: {
        name: attendeeName,
        city: attendeeCity,
        ticketId: parsedQr.ticketId,
        checkedInAt: now,
      },
    });
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      code: "CHECKIN_FAILED",
      title: "CHECK-IN FAILED",
      message: "Google Sheets 체크인 처리 중 문제가 발생했습니다.",
    });
  }
};

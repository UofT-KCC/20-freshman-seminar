const panels = {
  event: {
    kicker: "Event Info",
    title: "Freshman Seminar 2026",
    body:
      "Join UTKCC for your first landing into campus life: meet the team, find your people, and start your chapter.",
    details: ["Date · 2026. 7. 11. (Sat)", "Time · 3:00 PM - 6:00 PM KST", "Location · 백양관 S208호"],
    strip: "Your journey starts here",
    seat: "S208",
  },
  program: {
    kicker: "Program",
    title: "Your arrival timeline",
    body:
      "Check in, meet the executives, hear campus survival tips, and close with a community mixer.",
    details: ["6:00 · Boarding", "6:20 · Seminar", "7:15 · Mixer"],
    strip: "Timeline loaded",
    seat: "ROW-2026",
  },
  faq: {
    kicker: "FAQ",
    title: "Before you board",
    body:
      "No preparation is required. Bring yourself, questions, and anything you want to learn about campus life.",
    details: ["Dress code · Casual", "Cost · Free", "Who can join · New students"],
    strip: "Answers ready",
    seat: "INFO-FAQ",
  },
  checkin: {
    kicker: "Check-In",
    title: "Your boarding pass is ready",
    body:
      "Use the RSVP button or scan at the event desk when you arrive. Your seminar boarding pass will be confirmed there.",
    details: ["Seat · UTKCC-031", "Status · Ready", "Gate · Freshman Seminar"],
    strip: "Check-in ready",
    seat: "QR READY",
  },
  contact: {
    kicker: "Contact",
    title: "Questions before takeoff?",
    body:
      "Reach out to UTKCC for event updates, accessibility questions, or freshman seminar details.",
    details: ["Website · utkcc.org", "Instagram · @utkcc_", "Team · UTKCC Execs"],
    strip: "Contact channel open",
    seat: "CONTACT",
  },
};

const cards = document.querySelectorAll("[data-panel]");
const contentPanels = document.querySelectorAll("[data-content-panel]");
const navButtons = document.querySelectorAll("[data-nav]");
const countdownLabel = document.querySelector("[data-countdown-label]");
const liveCount = document.querySelector("[data-live-count]");
const liveLabel = document.querySelector("[data-live-label]");
const languageButton = document.querySelector("[data-language]");
const languageLabel = document.querySelector("[data-language-label]");
const weatherIcon = document.querySelector("[data-weather-icon]");
const weatherTitle = document.querySelector("[data-weather-title]");
const weatherTemp = document.querySelector("[data-weather-temp]");
const weatherLabel = document.querySelector("[data-weather-label]");
const arrivalCountdown = document.querySelector("[data-arrival-countdown]");
const nameForm = document.querySelector("[data-name-form]");
const nameInput = document.querySelector("[data-name-input]");
const nameCard = document.querySelector(".name-card");
const nameError = document.querySelector("[data-name-error]");
const introKicker = document.querySelector("[data-intro-kicker]");
const introTitle = document.querySelector("[data-intro-title]");
const introLabel = document.querySelector("[data-intro-label]");
const introFlightTime = document.querySelector("[data-intro-flight-time]");
const introButton = document.querySelector("[data-intro-button]");
const heroTitle = document.querySelector("[data-hero-title]");
const routeLine = document.querySelector("[data-route-line]");

const SESSION_STATE_KEY = "utkccFreshmanSeminarState";
const savedState = readSavedState();
let count = 0;
let korean = savedState.korean;
let guestName = savedState.guestName;
let introComplete = savedState.introComplete;
let activePanel = savedState.activePanel;
let languageUpdateTimer;
let languageDoneTimer;
let activeWeatherIndex = 0;
const ARRIVAL_TIME = new Date("2026-07-11T18:00:00+09:00").getTime();
const introCopy = {
  en: {
    language: "EN",
    kicker: "UTKCC FRESHMAN SEMINAR 2026",
    title: "Passenger Name",
    label: "Your boarding name",
    flightTime: "JUL 11 · DEP 15:00 · ARR 18:00 KST",
    placeholder: "Your Name",
    button: "Begin Journey",
    error: "Please enter your passenger name.",
  },
  kr: {
    language: "KR",
    kicker: "UTKCC 신입생 세미나 2026",
    title: "환영합니다",
    label: "탑승객 이름",
    flightTime: "7월 11일 · 출발 15:00 · 도착 18:00 KST",
    placeholder: "이름",
    button: "여정 시작하기",
    error: "탑승객 이름을 입력해 주세요.",
  },
};
const mainCopy = {
  en: {
    countdown: "Arriving in · KST",
    route: ["From Seoul ", " To Toronto"],
    welcome: (name) => `Welcome, ${name}.`,
    journey: "Your journey starts here.",
    live: "Live attendees",
    cards: {
      event: ["Event Info", "View event details"],
      program: ["Program", "See the timeline"],
      checkin: ["Check-In", "Scan QR code"],
      faq: ["FAQ", "Find answers"],
      contact: ["Contact", "Get in touch"],
    },
    headings: {
      event: "Event at a glance",
      contact: "Contact us",
    },
  },
  kr: {
    countdown: "도착까지 · KST",
    route: ["서울 출발 ", " 토론토 도착"],
    welcome: (name) => `${name}님, 환영합니다.`,
    journey: "여정이 곧 시작됩니다.",
    live: "실시간 탑승객",
    cards: {
      event: ["행사 정보", "일정과 장소 보기"],
      program: ["프로그램", "타임라인 보기"],
      checkin: ["체크인", "QR 코드 확인"],
      faq: ["자주 묻는 질문", "답변 확인"],
      contact: ["문의", "연락처 보기"],
    },
    headings: {
      event: "행사 한눈에 보기",
      contact: "문의하기",
    },
  },
};

const weatherLocations = [
  {
    title: { en: "Weather in Toronto", kr: "토론토 날씨" },
    fallbackLabel: { en: "Partly Cloudy", kr: "구름 조금" },
    fallbackTemp: "23°C",
    endpoint:
      "https://api.open-meteo.com/v1/forecast?latitude=43.6532&longitude=-79.3832&current=temperature_2m,weather_code&timezone=America%2FToronto",
  },
  {
    title: { en: "Weather in Seoul", kr: "서울 날씨" },
    fallbackLabel: { en: "Partly Cloudy", kr: "구름 조금" },
    fallbackTemp: "24°C",
    endpoint:
      "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&timezone=Asia%2FSeoul",
  },
];

liveCount.textContent = count;

function readSavedState() {
  let parsed = window.history.state?.utkccFreshmanSeminarState || null;

  try {
    parsed = JSON.parse(window.sessionStorage.getItem(SESSION_STATE_KEY)) || parsed;
  } catch (error) {
    // Fall back to history state when storage is unavailable.
  }

  const savedPanel = panels[parsed?.activePanel] ? parsed.activePanel : null;
  const savedName = typeof parsed?.guestName === "string" && parsed.guestName.trim()
    ? parsed.guestName.trim()
    : "Your Name";

  return {
    korean: parsed?.korean === true,
    guestName: savedName,
    introComplete: parsed?.introComplete === true,
    activePanel: savedPanel,
  };
}

function persistState() {
  const state = {
    korean,
    guestName,
    introComplete,
    activePanel,
  };

  window.history.replaceState(
    {
      ...window.history.state,
      utkccFreshmanSeminarState: state,
    },
    "",
    window.location.href
  );

  try {
    window.sessionStorage.setItem(SESSION_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    // The page should keep working even if storage is blocked.
  }
}

function formatArrivalCountdown(milliseconds) {
  if (milliseconds <= 0) {
    return "Arrived";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function updateArrivalCountdown() {
  arrivalCountdown.textContent = formatArrivalCountdown(ARRIVAL_TIME - Date.now());
}

updateArrivalCountdown();
window.setInterval(updateArrivalCountdown, 1000);

window.setTimeout(() => {
  if (document.body.classList.contains("intro-active")) {
    nameInput.focus();
  }
}, 1180);

function restartViewAnimation(className) {
  document.body.classList.remove("panel-enter", "home-enter");
  void document.body.offsetWidth;
  document.body.classList.add(className);
}

function setWelcomeTitle() {
  const welcomeLine = document.createElement("span");
  const welcomePrefix = document.createElement("span");
  const welcomeName = document.createElement("span");
  const journeyLine = document.createElement("span");
  const locale = korean ? "kr" : "en";
  const copy = mainCopy[locale];

  welcomeLine.className = "welcome-line";
  welcomePrefix.className = "welcome-prefix";
  welcomeName.className = "welcome-name";
  journeyLine.className = "journey-line";
  journeyLine.textContent = copy.journey;

  if (locale === "kr") {
    welcomeName.textContent = `${guestName}님,`;
    welcomePrefix.textContent = "환영합니다.";
    welcomeLine.replaceChildren(welcomeName, document.createTextNode(" "), welcomePrefix);
  } else {
    welcomePrefix.textContent = "Welcome,";
    welcomeName.textContent = `${guestName}.`;
    welcomeLine.replaceChildren(welcomePrefix, document.createTextNode(" "), welcomeName);
  }

  heroTitle.replaceChildren(
    welcomeLine,
    document.createElement("br"),
    journeyLine
  );
}

function setRouteLine() {
  const locale = korean ? "kr" : "en";
  const copy = mainCopy[locale];
  const flightIcon = document.createElement("span");

  flightIcon.setAttribute("aria-hidden", "true");
  flightIcon.textContent = "✈";
  routeLine.replaceChildren(
    document.createTextNode(copy.route[0]),
    flightIcon,
    document.createTextNode(copy.route[1])
  );
}

function applyMainLanguage(locale) {
  const copy = mainCopy[locale];

  countdownLabel.textContent = copy.countdown;
  liveLabel.textContent = copy.live;

  cards.forEach((card) => {
    const cardCopy = copy.cards[card.dataset.panel];

    if (!cardCopy) {
      return;
    }

    card.querySelector("[data-card-title]").textContent = cardCopy[0];
    card.querySelector("[data-card-subtitle]").textContent = cardCopy[1];
  });

  document.querySelectorAll("[data-panel-heading]").forEach((heading) => {
    const headingCopy = copy.headings[heading.dataset.panelHeading];

    if (headingCopy) {
      heading.textContent = headingCopy;
    }
  });

  setRouteLine();
  setWelcomeTitle();
  renderWeatherLabel();
}

function setHomeView() {
  document.body.classList.remove("panel-view");
  cards.forEach((card) => card.classList.remove("is-active"));
  contentPanels.forEach((contentPanel) => contentPanel.classList.remove("is-active"));
  activePanel = null;

  setRouteLine();
  setWelcomeTitle();
  restartViewAnimation("home-enter");
  persistState();
}

function setPanel(key) {
  activePanel = panels[key] ? key : "event";

  cards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.panel === activePanel);
  });

  contentPanels.forEach((contentPanel) => {
    contentPanel.classList.toggle("is-active", contentPanel.dataset.contentPanel === activePanel);
  });

  persistState();
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    navButtons.forEach((item) => item.classList.remove("is-active"));
    document.body.classList.remove("home-enter");
    document.body.classList.add("panel-view");
    setPanel(card.dataset.panel);
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    if (button.dataset.nav === "home") {
      setHomeView();
    }
  });
});

document.querySelector("[data-sound]").addEventListener("click", () => {
  document.body.classList.toggle("is-muted");
});

function applyIntroLanguage(locale) {
  const copy = introCopy[locale];

  nameCard.classList.toggle("is-korean", locale === "kr");
  languageLabel.textContent = copy.language;
  introKicker.textContent = copy.kicker;
  introTitle.textContent = copy.title;
  introLabel.textContent = copy.label;
  introFlightTime.textContent = copy.flightTime;
  introButton.textContent = copy.button;
  nameError.textContent = copy.error;
  nameInput.placeholder = copy.placeholder;
  applyMainLanguage(locale);
}

function showNameError() {
  nameCard.classList.remove("has-error");
  void nameCard.offsetWidth;
  nameCard.classList.add("has-error");
  nameInput.setAttribute("aria-invalid", "true");
  nameInput.focus();
}

function clearNameError() {
  nameCard.classList.remove("has-error");
  nameInput.removeAttribute("aria-invalid");
}

languageButton.addEventListener("click", () => {
  korean = !korean;
  const locale = korean ? "kr" : "en";
  persistState();

  window.clearTimeout(languageUpdateTimer);
  window.clearTimeout(languageDoneTimer);
  languageButton.setAttribute("aria-pressed", String(korean));
  nameCard.classList.add("is-swapping");
  languageButton.classList.add("is-swapping");
  document.body.classList.add("is-language-swapping");

  languageUpdateTimer = window.setTimeout(() => {
    applyIntroLanguage(locale);
    persistState();
  }, 120);

  languageDoneTimer = window.setTimeout(() => {
    nameCard.classList.remove("is-swapping");
    languageButton.classList.remove("is-swapping");
    document.body.classList.remove("is-language-swapping");
  }, 260);
});

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const submittedName = nameInput.value.trim().replace(/\s+/g, " ");

  if (!submittedName) {
    showNameError();
    return;
  }

  clearNameError();
  guestName = submittedName;
  introComplete = true;
  persistState();
  setWelcomeTitle();

  document.body.classList.add("intro-exiting");

  window.setTimeout(() => {
    document.body.classList.remove("intro-active", "intro-exiting");
    document.body.classList.add("intro-complete");
  }, 480);
});

nameInput.addEventListener("input", () => {
  if (nameInput.value.trim()) {
    clearNameError();
  }
});

const weatherCodes = {
  0: ["sunny-outline", "Clear", "맑음"],
  1: ["partly-sunny-outline", "Mostly Clear", "대체로 맑음"],
  2: ["partly-sunny-outline", "Partly Cloudy", "구름 조금"],
  3: ["cloudy-outline", "Cloudy", "흐림"],
  45: ["cloud-outline", "Fog", "안개"],
  48: ["cloud-outline", "Fog", "안개"],
  51: ["rainy-outline", "Drizzle", "이슬비"],
  53: ["rainy-outline", "Drizzle", "이슬비"],
  55: ["rainy-outline", "Drizzle", "이슬비"],
  61: ["rainy-outline", "Rain", "비"],
  63: ["rainy-outline", "Rain", "비"],
  65: ["rainy-outline", "Heavy Rain", "강한 비"],
  71: ["snow-outline", "Snow", "눈"],
  73: ["snow-outline", "Snow", "눈"],
  75: ["snow-outline", "Heavy Snow", "폭설"],
  80: ["rainy-outline", "Showers", "소나기"],
  81: ["rainy-outline", "Showers", "소나기"],
  82: ["thunderstorm-outline", "Heavy Showers", "강한 소나기"],
  95: ["thunderstorm-outline", "Thunderstorm", "뇌우"],
  96: ["thunderstorm-outline", "Thunderstorm", "뇌우"],
  99: ["thunderstorm-outline", "Thunderstorm", "뇌우"],
};

function renderWeatherLabel() {
  const location = weatherLocations[activeWeatherIndex];
  const locale = korean ? "kr" : "en";
  const weather = location.current;

  weatherTitle.textContent = location.title[locale];

  if (!weather) {
    weatherIcon.setAttribute("name", "partly-sunny-outline");
    weatherTemp.textContent = location.fallbackTemp;
    weatherLabel.textContent = location.fallbackLabel[locale];
    return;
  }

  const [, englishLabel, koreanLabel] =
    weatherCodes[weather.code] || [
      "partly-sunny-outline",
      location.fallbackLabel.en,
      location.fallbackLabel.kr,
    ];

  weatherIcon.setAttribute("name", weather.icon);
  weatherTemp.textContent = `${Math.round(weather.temperature)}°C`;
  weatherLabel.textContent = korean ? koreanLabel : englishLabel;
}

function restoreSavedView() {
  applyIntroLanguage(korean ? "kr" : "en");
  languageButton.setAttribute("aria-pressed", String(korean));
  nameInput.value = guestName === "Your Name" ? "" : guestName;

  if (!introComplete) {
    return;
  }

  document.body.classList.remove("intro-active", "intro-exiting");
  document.body.classList.add("intro-complete");

  if (activePanel) {
    document.body.classList.add("panel-view");
    setPanel(activePanel);
  } else {
    setHomeView();
    document.body.classList.remove("home-enter");
  }
}

restoreSavedView();

async function fetchLocationWeather(location) {
  try {
    const response = await fetch(location.endpoint);

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();
    const current = data.current;
    const [icon] =
      weatherCodes[current.weather_code] || [
        "partly-sunny-outline",
        location.fallbackLabel.en,
        location.fallbackLabel.kr,
      ];

    location.current = {
      code: current.weather_code,
      icon,
      temperature: current.temperature_2m,
    };
  } catch (error) {
    location.current = undefined;
  }
}

async function updateWeather() {
  await Promise.all(weatherLocations.map(fetchLocationWeather));
  renderWeatherLabel();
}

function rotateWeather() {
  const weather = weatherTitle.closest(".weather");

  weather.classList.add("is-weather-swapping");
  window.setTimeout(() => {
    activeWeatherIndex = (activeWeatherIndex + 1) % weatherLocations.length;
    renderWeatherLabel();
  }, 140);
  window.setTimeout(() => {
    weather.classList.remove("is-weather-swapping");
  }, 240);
}

updateWeather();
window.setInterval(rotateWeather, 5000);
window.setInterval(updateWeather, 600000);

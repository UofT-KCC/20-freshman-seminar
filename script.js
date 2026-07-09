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
const themeButton = document.querySelector("[data-theme]");
const themeIcon = themeButton.querySelector("ion-icon");
const powerButton = document.querySelector("[data-power]");
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
const introOrigin = document.querySelector("[data-intro-origin]");
const introDestination = document.querySelector("[data-intro-destination]");
const introFlightTime = document.querySelector("[data-intro-flight-time]");
const introButton = document.querySelector("[data-intro-button]");
const destinationLabel = document.querySelector("[data-destination-label]");
const destinationOptionItems = document.querySelectorAll("[data-destination-option]");
const locationInputs = document.querySelectorAll("[data-location-input]");
const heroTitle = document.querySelector("[data-hero-title]");
const routeLine = document.querySelector("[data-route-line]");
const eventDetailItems = document.querySelectorAll("[data-event-detail]");
const contactDetailItems = document.querySelectorAll("[data-contact-detail]");
const checkinCopyItems = document.querySelectorAll("[data-checkin-copy]");
const programSeoul = document.querySelector("[data-program-seoul]");
const programToronto = document.querySelector("[data-program-toronto]");
const programDetailItems = document.querySelectorAll("[data-program-detail]");
const programPlaceholderItems = document.querySelectorAll("[data-program-placeholder]");

const SESSION_STATE_KEY = "utkccFreshmanSeminarState";
const ATTENDEE_ID_KEY = "utkccFreshmanSeminarAttendeeId";
const savedState = readSavedState();
let korean = savedState.korean;
let guestName = savedState.guestName;
let introComplete = savedState.introComplete;
let activePanel = savedState.activePanel;
let screenDimmed = savedState.screenDimmed;
let seminarLocation = savedState.seminarLocation;
let choosingDestination = false;
let languageUpdateTimer;
let languageDoneTimer;
let introStepTimer;
let introStepDoneTimer;
let screenPoweredOff = false;
let powerCycleTimer;
const SCREEN_RESTART_DELAY = 800;
const seminarLocations = {
  seoul: {
    arrivalTime: "2026-07-11T18:00:00+09:00",
    origin: "TORONTO",
    destination: "SEOUL",
    route: {
      en: ["From Toronto ", " To Seoul"],
      kr: ["토론토 출발 ", " 서울 도착"],
    },
    countdown: {
      en: "Arriving in · KST",
      kr: "도착까지 · KST",
    },
    introFlightTime: {
      en: "JUL 11 · DEP 15:00 · ARR 18:00 KST",
      kr: "7월 11일 · 15:00 - 18:00 KST",
    },
    eventDetails: {
      en: {
        dateValue: "July 11, 2026 (Sat)",
        timeValue: "3:00 PM - 6:00 PM",
        timeNote: "KST · 3 hours",
        locationValue: "Baekyang Hall S208",
        locationNote: "Yonsei University",
        directionsLabel: "Directions",
        afterpartyValue: "Hyunmyeong Pocha",
        afterpartyGroupLabel: "Food / drink groups",
        afterpartyMinorLabel: "Minors allowed",
        afterpartyDirectionsLabel: "Directions",
      },
      kr: {
        dateValue: "2026. 7. 11. (토)",
        timeValue: "15:00 - 18:00",
        timeNote: "KST · 총 3시간",
        locationValue: "백양관 S208호",
        locationNote: "연세대학교",
        directionsLabel: "길찾기",
        afterpartyValue: "현명포차",
        afterpartyGroupLabel: "밥팀 / 술팀",
        afterpartyMinorLabel: "미성년자 가능",
        afterpartyDirectionsLabel: "길찾기",
      },
    },
    links: {
      location: {
        href: "https://kko.to/IlnmU2PcdE",
        aria: "카카오맵에서 연세대학교 백양관 S208호 오는 길 보기",
      },
      afterparty: {
        href: "https://kko.to/bEmvarGx3s",
        aria: "카카오맵에서 2차 장소 현명포차 길찾기",
      },
    },
  },
  toronto: {
    arrivalTime: "2026-07-18T18:00:00-04:00",
    origin: "SEOUL",
    destination: "TORONTO",
    route: {
      en: ["From Seoul ", " To Toronto"],
      kr: ["서울 출발 ", " 토론토 도착"],
    },
    countdown: {
      en: "Arriving in · EDT",
      kr: "도착까지 · EDT",
    },
    introFlightTime: {
      en: "JUL 18 · DEP 15:00 · ARR 18:00 EDT",
      kr: "7월 18일 · 15:00 - 18:00 EDT",
    },
    eventDetails: {
      en: {
        dateValue: "July 18, 2026 (Sat)",
        timeValue: "3:00 PM - 6:00 PM",
        timeNote: "EDT · 3 hours",
        locationValue: "Bahen Centre BA 1190",
        locationNote: "University of Toronto",
        directionsLabel: "Directions",
        afterpartyValue: "Afterparty TBA",
        afterpartyGroupLabel: "Details coming soon",
        afterpartyMinorLabel: "Toronto local time",
        afterpartyDirectionsLabel: "Details TBA",
      },
      kr: {
        dateValue: "2026. 7. 18. (토)",
        timeValue: "15:00 - 18:00",
        timeNote: "EDT · 총 3시간",
        locationValue: "Bahen Centre BA 1190",
        locationNote: "University of Toronto",
        directionsLabel: "길찾기",
        afterpartyValue: "2차 장소 추후 공지",
        afterpartyGroupLabel: "세부 정보 준비 중",
        afterpartyMinorLabel: "토론토 현지 시간",
        afterpartyDirectionsLabel: "추후 공지",
      },
    },
    links: {
      location: {
        href: "https://www.google.com/maps/search/?api=1&query=Bahen%20Centre%20for%20Information%20Technology%20BA%201190%20University%20of%20Toronto",
        aria: "Open directions to Bahen Centre for Information Technology BA 1190 at University of Toronto",
      },
      afterparty: null,
    },
  },
};
const introCopy = {
  en: {
    language: "EN",
    kicker: "UTKCC FRESHMAN SEMINAR 2026",
    title: "Welcome Onboard",
    destinationTitle: "Select Seminar City",
    label: "Your boarding name",
    destinationLabel: "Choose your seminar city",
    destinations: {
      seoulTitle: "Seoul",
      seoulMeta: "Yonsei · KST",
      torontoTitle: "Toronto",
      torontoMeta: "U of T · EDT",
    },
    placeholder: "Your Name",
    button: "Begin Journey",
    destinationButton: "Continue",
    error: "Please enter your passenger name.",
  },
  kr: {
    language: "KR",
    kicker: "UTKCC 신입생 세미나 2026",
    title: "환영합니다",
    destinationTitle: "세미나 도시 선택",
    label: "탑승객 이름",
    destinationLabel: "세미나 도시 선택",
    destinations: {
      seoulTitle: "서울",
      seoulMeta: "연세대 · KST",
      torontoTitle: "토론토",
      torontoMeta: "U of T · EDT",
    },
    placeholder: "이름",
    button: "여정 시작하기",
    destinationButton: "계속하기",
    error: "탑승객 이름을 입력해 주세요.",
  },
};
const mainCopy = {
  en: {
    welcome: (name) => `Welcome, ${name}.`,
    journey: "Your journey starts here.",
    live: "Live attendees",
    cards: {
      event: ["Event Info", "View event details"],
      program: ["Program", "See the timeline"],
      checkin: ["Check-In", "Check at the desk"],
      faq: ["FAQ", "Find answers"],
      contact: ["Contact", "Get in touch"],
    },
    headings: {
      event: "Event at a glance",
      program: "Seminar program",
      contact: "Contact us",
    },
    eventDetails: {
      dateLabel: "Seminar Date",
      locationLabel: "Seminar Location",
      afterpartyLabel: "Afterparty Venue",
    },
    contactDetails: {
      websiteLabel: "KCC Official Website",
      websiteValue: "utkcc.org",
      websiteAction: "Visit website",
      instagramLabel: "KCC Instagram",
      instagramValue: "@utkcc_",
      instagramAction: "Open Instagram",
    },
    checkin: {
      eyebrow: "Event Desk Check-In",
      title: "Please check in at the desk",
      body: "When you arrive, show your name or QR code to the UTKCC staff at the front desk.",
    },
    programPlaceholder: {
      title: "Toronto program coming soon",
      body: "Program details will be announced before the seminar.",
    },
    programDetails: {
      missionLabel: "Mission Run",
      missionTitle: "KCC Mission Run & Raffle",
      missionBody: "Complete team missions and win prizes.",
      panelLabel: "Panel Session",
      panelTitle: "Upper-Year Student Panel",
      panelBody: "UT tips from senior students.",
      mentoringLabel: "Mentoring Session",
      mentoringTitle: "Major Mentoring",
      mentoringBody: "Ask your department mentors anything.",
    },
  },
  kr: {
    welcome: (name) => `${name}님, 환영합니다.`,
    journey: "여정이 곧 시작됩니다.",
    live: "실시간 탑승객",
    cards: {
      event: ["행사 정보", "일정과 장소 보기"],
      program: ["프로그램", "타임라인 보기"],
      checkin: ["체크인", "데스크에서 확인"],
      faq: ["자주 묻는 질문", "답변 확인"],
      contact: ["문의", "연락처 보기"],
    },
    headings: {
      event: "행사 한눈에 보기",
      program: "세미나 프로그램",
      contact: "문의하기",
    },
    eventDetails: {
      dateLabel: "세미나 일정",
      locationLabel: "세미나 장소",
      afterpartyLabel: "2차 장소",
    },
    contactDetails: {
      websiteLabel: "KCC 공식 웹사이트",
      websiteValue: "utkcc.org",
      websiteAction: "방문하기",
      instagramLabel: "KCC 인스타그램",
      instagramValue: "@utkcc_",
      instagramAction: "인스타그램 열기",
    },
    checkin: {
      eyebrow: "데스크 체크인",
      title: "데스크에서 확인해 주세요",
      body: "도착하시면 입구 데스크의 UTKCC 임원에게 이름 또는 QR 코드를 보여 주세요.",
    },
    programPlaceholder: {
      title: "토론토 프로그램 준비 중",
      body: "세미나 전 프로그램 세부 정보를 안내드릴 예정입니다.",
    },
    programDetails: {
      missionLabel: "미션 런",
      missionTitle: "KCC 미션 런 & 래플",
      missionBody: "팀별로 미션 수행하고 상품 받자~",
      panelLabel: "패널 세션",
      panelTitle: "고학번 선배 패널",
      panelBody: "고학번 선배들이 알려주는 유티 꿀팁",
      mentoringLabel: "멘토링 세션",
      mentoringTitle: "과별 멘토링",
      mentoringBody: "과별 멘토링 세션에서 다 물어보세요!",
    },
  },
};

const weatherLocations = {
  toronto: {
    title: { en: "Weather in Toronto", kr: "토론토 날씨" },
    city: { en: "Toronto", kr: "토론토" },
    fallbackLabel: { en: "Partly Cloudy", kr: "구름 조금" },
    fallbackTemp: "23°C",
    endpoint:
      "https://api.open-meteo.com/v1/forecast?latitude=43.6532&longitude=-79.3832&current=temperature_2m,weather_code&timezone=America%2FToronto",
  },
  seoul: {
    title: { en: "Weather in Seoul", kr: "서울 날씨" },
    city: { en: "Seoul", kr: "서울" },
    fallbackLabel: { en: "Partly Cloudy", kr: "구름 조금" },
    fallbackTemp: "24°C",
    endpoint:
      "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weather_code&timezone=Asia%2FSeoul",
  },
};

liveCount.textContent = "0";

function createAttendeeId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function getAttendeeId() {
  try {
    const storedId = window.localStorage.getItem(ATTENDEE_ID_KEY);

    if (storedId) {
      return storedId;
    }

    const attendeeId = createAttendeeId();
    window.localStorage.setItem(ATTENDEE_ID_KEY, attendeeId);
    return attendeeId;
  } catch (error) {
    return createAttendeeId();
  }
}

function showLocalAttendeeFallback() {
  if (!Number.parseInt(liveCount.textContent, 10)) {
    liveCount.textContent = "1";
  }
}

async function registerAttendeeVisit() {
  showLocalAttendeeFallback();

  try {
    const response = await fetch("/api/attendees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitorId: getAttendeeId(),
      }),
    });

    if (!response.ok) {
      console.warn("Live attendee counter is unavailable.", await response.json().catch(() => ({})));
      showLocalAttendeeFallback();
      return;
    }

    const data = await response.json();

    if (Number.isInteger(data.count) && data.count >= 0) {
      liveCount.textContent = data.count;
    } else {
      showLocalAttendeeFallback();
    }

    if (data.storage === "memory") {
      console.info("Live attendee counter is using temporary memory storage.");
    }
  } catch (error) {
    showLocalAttendeeFallback();
  }
}

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
    screenDimmed: parsed?.screenDimmed === true,
    seminarLocation: ["seoul", "toronto"].includes(parsed?.seminarLocation)
      ? parsed.seminarLocation
      : "seoul",
  };
}

function persistState() {
  const state = {
    korean,
    guestName,
    introComplete,
    activePanel,
    screenDimmed,
    seminarLocation,
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
  const arrivalTime = new Date(seminarLocations[seminarLocation].arrivalTime).getTime();
  arrivalCountdown.textContent = formatArrivalCountdown(arrivalTime - Date.now());
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
  const route = seminarLocations[seminarLocation].route[locale];
  const flightIcon = document.createElement("span");

  flightIcon.setAttribute("aria-hidden", "true");
  flightIcon.textContent = "✈";
  routeLine.replaceChildren(
    document.createTextNode(route[0]),
    flightIcon,
    document.createTextNode(route[1])
  );
}

function setEventLink(linkElement, linkConfig) {
  if (!linkElement) {
    return;
  }

  if (!linkConfig) {
    linkElement.removeAttribute("href");
    linkElement.removeAttribute("target");
    linkElement.removeAttribute("rel");
    linkElement.setAttribute("aria-disabled", "true");
    return;
  }

  linkElement.href = linkConfig.href;
  linkElement.target = "_blank";
  linkElement.rel = "noopener noreferrer";
  linkElement.setAttribute("aria-label", linkConfig.aria);
  linkElement.removeAttribute("aria-disabled");
}

function applySeminarLocationDetails(locale) {
  const locationCopy = seminarLocations[seminarLocation];
  const locationDetailCopy = locationCopy.eventDetails[locale];
  const locationTile = document.querySelector('[data-event-detail="locationValue"]')?.closest("a");
  const afterpartyTile = document.querySelector('[data-event-detail="afterpartyValue"]')?.closest("a");

  countdownLabel.textContent = locationCopy.countdown[locale];
  introOrigin.textContent = locationCopy.origin;
  introDestination.textContent = locationCopy.destination;
  introFlightTime.textContent = locationCopy.introFlightTime[locale];
  setEventLink(locationTile, locationCopy.links.location);
  setEventLink(afterpartyTile, locationCopy.links.afterparty);

  if (programSeoul && programToronto) {
    programSeoul.hidden = seminarLocation !== "seoul";
    programToronto.hidden = seminarLocation === "seoul";
  }

  eventDetailItems.forEach((item) => {
    const detailCopy = locationDetailCopy[item.dataset.eventDetail];

    if (detailCopy) {
      item.textContent = detailCopy;
    }
  });
}

function applyMainLanguage(locale) {
  const copy = mainCopy[locale];

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

  eventDetailItems.forEach((item) => {
    const detailCopy =
      copy.eventDetails[item.dataset.eventDetail] ||
      seminarLocations[seminarLocation].eventDetails[locale][item.dataset.eventDetail];

    if (detailCopy) {
      item.textContent = detailCopy;
    }
  });

  contactDetailItems.forEach((item) => {
    const detailCopy = copy.contactDetails[item.dataset.contactDetail];

    if (detailCopy) {
      item.textContent = detailCopy;
    }
  });

  checkinCopyItems.forEach((item) => {
    const checkinCopy = copy.checkin[item.dataset.checkinCopy];

    if (checkinCopy) {
      item.textContent = checkinCopy;
    }
  });

  programPlaceholderItems.forEach((item) => {
    const programCopy = copy.programPlaceholder[item.dataset.programPlaceholder];

    if (programCopy) {
      item.textContent = programCopy;
    }
  });

  programDetailItems.forEach((item) => {
    const programCopy = copy.programDetails[item.dataset.programDetail];

    if (programCopy) {
      item.textContent = programCopy;
    }
  });

  applySeminarLocationDetails(locale);
  setRouteLine();
  setWelcomeTitle();
  renderWeatherLabel();
  updateArrivalCountdown();
}

function updateIntroStep() {
  const locale = korean ? "kr" : "en";
  const copy = introCopy[locale];

  nameCard.classList.toggle("is-choosing-destination", choosingDestination);
  introTitle.textContent = choosingDestination ? copy.destinationTitle : copy.title;
  introButton.textContent = choosingDestination ? copy.destinationButton : copy.button;

  if (choosingDestination) {
    clearNameError();
  }
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

function applyScreenBrightness() {
  document.body.classList.toggle("is-screen-dimmed", screenDimmed);
  themeButton.setAttribute("aria-pressed", String(screenDimmed));
  themeButton.setAttribute(
    "aria-label",
    screenDimmed ? "Restore screen brightness" : "Dim screen brightness"
  );
  themeIcon.setAttribute("name", screenDimmed ? "moon-outline" : "sunny-outline");
}

themeButton.addEventListener("click", () => {
  screenDimmed = !screenDimmed;
  applyScreenBrightness();
  persistState();
});

function resetIntroState() {
  window.clearTimeout(introStepTimer);
  guestName = "Your Name";
  introComplete = false;
  activePanel = null;
  choosingDestination = false;
  nameInput.value = "";
  clearNameError();
  nameCard.classList.remove(
    "is-step-changing",
    "is-step-splitting",
    "is-step-entering",
    "has-step-transitioned",
    "is-choosing-destination"
  );
  document.body.classList.remove(
    "intro-complete",
    "intro-exiting",
    "panel-view",
    "home-enter",
    "panel-enter"
  );
  document.body.classList.add("intro-active");
  cards.forEach((card) => card.classList.remove("is-active"));
  contentPanels.forEach((contentPanel) => contentPanel.classList.remove("is-active"));
  navButtons.forEach((item) => item.classList.remove("is-active"));
  document.querySelector('[data-nav="home"]')?.classList.add("is-active");
  applyIntroLanguage(korean ? "kr" : "en");
  persistState();
}

function restartScreenAfterShutdown() {
  screenPoweredOff = false;
  document.body.classList.remove("is-screen-off");
  powerButton.disabled = false;
  powerButton.setAttribute("aria-label", "Turn screen off and restart");
  powerButton.setAttribute("aria-pressed", "false");
  resetIntroState();

  window.setTimeout(() => {
    if (document.body.classList.contains("intro-active")) {
      nameInput.focus();
    }
  }, 380);
}

function runScreenPowerCycle() {
  if (screenPoweredOff) {
    return;
  }

  window.clearTimeout(powerCycleTimer);
  screenPoweredOff = true;
  document.body.classList.add("is-screen-off");
  powerButton.disabled = true;
  powerButton.setAttribute("aria-label", "Restarting screen");
  powerButton.setAttribute("aria-pressed", "true");
  powerCycleTimer = window.setTimeout(restartScreenAfterShutdown, SCREEN_RESTART_DELAY);
}

powerButton.addEventListener("click", () => {
  runScreenPowerCycle();
});

function applyIntroLanguage(locale) {
  const copy = introCopy[locale];

  nameCard.classList.toggle("is-korean", locale === "kr");
  languageLabel.textContent = copy.language;
  introKicker.textContent = copy.kicker;
  introLabel.textContent = copy.label;
  destinationLabel.textContent = copy.destinationLabel;
  destinationOptionItems.forEach((item) => {
    const destinationCopy = copy.destinations[item.dataset.destinationOption];

    if (destinationCopy) {
      item.textContent = destinationCopy;
    }
  });
  nameError.textContent = copy.error;
  nameInput.placeholder = copy.placeholder;
  applyMainLanguage(locale);
  updateIntroStep();
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

locationInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked || !seminarLocations[input.value]) {
      return;
    }

    seminarLocation = input.value;
    applyMainLanguage(korean ? "kr" : "en");
    persistState();
    updateWeather();
  });
});

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const submittedName = nameInput.value.trim().replace(/\s+/g, " ");

  if (!choosingDestination && !submittedName) {
    showNameError();
    return;
  }

  if (!choosingDestination) {
    clearNameError();
    guestName = submittedName;
    window.clearTimeout(introStepTimer);
    window.clearTimeout(introStepDoneTimer);
    nameCard.classList.remove("is-step-changing", "is-step-entering");
    nameCard.classList.add("has-step-transitioned", "is-step-splitting");
    choosingDestination = true;
    introStepTimer = window.setTimeout(() => {
      updateIntroStep();
      persistState();
      nameCard.classList.remove("is-step-splitting");
      nameCard.classList.add("is-step-entering");
      introStepDoneTimer = window.setTimeout(() => {
        nameCard.classList.remove("is-step-entering");
      }, 360);
    }, 420);
    return;
  }

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
  const location = weatherLocations[seminarLocation];
  const locale = korean ? "kr" : "en";
  const weather = location.current;
  const compactWeatherTitle = window.matchMedia("(max-width: 700px)").matches;

  weatherTitle.textContent = compactWeatherTitle ? location.city[locale] : location.title[locale];

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
  applyScreenBrightness();
  languageButton.setAttribute("aria-pressed", String(korean));
  nameInput.value = guestName === "Your Name" ? "" : guestName;
  locationInputs.forEach((input) => {
    input.checked = input.value === seminarLocation;
  });

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
  await fetchLocationWeather(weatherLocations[seminarLocation]);
  renderWeatherLabel();
}

updateWeather();
registerAttendeeVisit();
window.setInterval(updateWeather, 600000);
window.addEventListener("resize", renderWeatherLabel);

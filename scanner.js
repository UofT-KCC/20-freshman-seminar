const qrVideo = document.querySelector("[data-qr-video]");
const qrStartButton = document.querySelector("[data-qr-start]");
const qrStopButton = document.querySelector("[data-qr-stop]");
const qrStatus = document.querySelector("[data-scanner-status]");
const qrResult = document.querySelector("[data-scanner-result]");
const scannerState = document.querySelector("[data-scanner-state]");
const manualCheckinForm = document.querySelector("[data-manual-checkin]");
const manualTicketInput = document.querySelector("[data-manual-ticket]");

let qrStream;
let qrAnimationFrame;
let qrDetector;
let qrCanvas;
let qrCanvasContext;

const scannerCopy = {
  ready: "시작을 누르고 카메라 접근을 허용해 주세요.",
  scanning: "QR 코드가 프레임 안에 들어오도록 맞춰 주세요.",
  checking: "티켓 정보를 확인하고 있습니다.",
  success: "체크인이 완료되었습니다.",
  alreadyCheckedIn: "이미 체크인된 티켓입니다.",
  invalid: "유효하지 않은 티켓입니다.",
  unsupported: "이 브라우저에서는 QR 스캔을 지원하지 않습니다.",
  cameraError: "카메라 접근이 차단되었거나 사용할 수 없습니다.",
  networkError: "체크인 서버에 연결할 수 없습니다.",
  stopped: "스캐너가 중지되었습니다.",
};

function setScannerStatus(key, value) {
  qrStatus.textContent = value || scannerCopy[key];
  scannerState.textContent =
    key === "scanning"
      ? "Scanning"
      : key === "checking"
        ? "Checking"
        : key === "success"
          ? "Valid"
          : key === "invalid"
            ? "Invalid"
            : "Ready";
  scannerState.dataset.state = key;
}

function normalizeQrValue(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  try {
    const url = new URL(rawValue);
    const queryValue = url.searchParams.get("text") || url.searchParams.get("data") || url.searchParams.get("qr");

    if (queryValue) {
      return queryValue.trim();
    }
  } catch (error) {
    // Plain QR payloads are expected; URLs are only a compatibility path.
  }

  try {
    return decodeURIComponent(rawValue).trim();
  } catch (error) {
    return rawValue;
  }
}

function parseTicketValue(value) {
  const normalizedValue = normalizeQrValue(value);
  const match = normalizedValue.match(/^UTKCC2026:(seoul|toronto):([a-zA-Z0-9_-]{6,80})$/i);

  if (!match) {
    return null;
  }

  return {
    city: match[1].toLowerCase(),
    ticketId: match[2].toUpperCase(),
  };
}

function showScannerResult(type, title, message, attendee) {
  qrResult.hidden = false;
  qrResult.dataset.result = type;
  qrResult.replaceChildren();

  const titleNode = document.createElement("strong");
  titleNode.textContent = title;

  const messageNode = document.createElement("span");
  messageNode.textContent = message;

  qrResult.append(titleNode, messageNode);

  if (attendee?.name) {
    const metaNode = document.createElement("small");
    metaNode.textContent = `${attendee.name} · ${String(attendee.city || "").toUpperCase()} · ${attendee.ticketId || ""}`;
    qrResult.append(metaNode);
  }
}

async function checkInTicket(qrValue) {
  const normalizedQrValue = normalizeQrValue(qrValue);
  const ticket = parseTicketValue(qrValue);

  if (!ticket) {
    showScannerResult("invalid", "NOT A UTKCC PASS", scannerCopy.invalid);
    setScannerStatus("invalid", scannerCopy.invalid);
    return;
  }

  setScannerStatus("checking");
  showScannerResult("checking", "CHECKING PASS", scannerCopy.checking, {
    city: ticket.city,
    ticketId: ticket.ticketId,
  });

  try {
    const response = await fetch("/api/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qrValue: normalizedQrValue,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      showScannerResult("invalid", result.title || "CHECK-IN FAILED", result.message || scannerCopy.networkError);
      setScannerStatus("invalid", result.message || scannerCopy.networkError);
      return;
    }

    if (result.code === "CHECKED_IN") {
      showScannerResult("success", result.title, result.message, result.attendee);
      setScannerStatus("success", scannerCopy.success);
      return;
    }

    if (result.code === "ALREADY_CHECKED_IN") {
      showScannerResult("warning", result.title, result.message || scannerCopy.alreadyCheckedIn, result.attendee);
      setScannerStatus("success", scannerCopy.alreadyCheckedIn);
      return;
    }

    showScannerResult("invalid", result.title || "INVALID PASS", result.message || scannerCopy.invalid, result.attendee);
    setScannerStatus("invalid", result.message || scannerCopy.invalid);
  } catch (error) {
    showScannerResult("invalid", "CONNECTION ERROR", scannerCopy.networkError);
    setScannerStatus("invalid", scannerCopy.networkError);
  }
}

function prepareQrCanvas() {
  if (!qrCanvas) {
    qrCanvas = document.createElement("canvas");
    qrCanvasContext = qrCanvas.getContext("2d", { willReadFrequently: true });
  }
}

async function scanWithBarcodeDetector() {
  if (!("BarcodeDetector" in window)) {
    return null;
  }

  if (!qrDetector) {
    qrDetector = new BarcodeDetector({ formats: ["qr_code"] });
  }

  const codes = await qrDetector.detect(qrVideo);
  return codes[0]?.rawValue || null;
}

function scanWithJsQr() {
  if (!window.jsQR || !qrVideo.videoWidth || !qrVideo.videoHeight) {
    return null;
  }

  prepareQrCanvas();
  qrCanvas.width = qrVideo.videoWidth;
  qrCanvas.height = qrVideo.videoHeight;
  qrCanvasContext.drawImage(qrVideo, 0, 0, qrCanvas.width, qrCanvas.height);

  const imageData = qrCanvasContext.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
  return window.jsQR(imageData.data, imageData.width, imageData.height)?.data || null;
}

async function scanQrFrame() {
  if (!qrStream) {
    return;
  }

  try {
    const detectedValue = scanWithJsQr() || await scanWithBarcodeDetector();

    if (detectedValue) {
      stopQrScanner(false);
      await checkInTicket(detectedValue);
      return;
    }
  } catch (error) {
    // Keep scanning if a single frame fails.
  }

  qrAnimationFrame = window.requestAnimationFrame(scanQrFrame);
}

async function startQrScanner() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setScannerStatus("unsupported");
    return;
  }

  try {
    qrResult.hidden = true;
    qrResult.textContent = "";
    delete qrResult.dataset.result;
    qrStartButton.disabled = true;
    qrStopButton.disabled = false;
    setScannerStatus("scanning");

    qrStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
      },
      audio: false,
    });

    qrVideo.srcObject = qrStream;
    await qrVideo.play();
    scanQrFrame();
  } catch (error) {
    qrStartButton.disabled = false;
    qrStopButton.disabled = true;
    setScannerStatus("cameraError");
  }
}

function stopQrScanner(showStoppedStatus = true) {
  if (qrAnimationFrame) {
    window.cancelAnimationFrame(qrAnimationFrame);
    qrAnimationFrame = undefined;
  }

  if (qrStream) {
    qrStream.getTracks().forEach((track) => track.stop());
    qrStream = undefined;
  }

  qrVideo.srcObject = null;
  qrStartButton.disabled = false;
  qrStopButton.disabled = true;

  if (showStoppedStatus) {
    setScannerStatus("stopped");
  }
}

qrStartButton.addEventListener("click", startQrScanner);
qrStopButton.addEventListener("click", () => stopQrScanner(true));

manualCheckinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  stopQrScanner(false);
  await checkInTicket(manualTicketInput.value);
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopQrScanner(false);
  }
});

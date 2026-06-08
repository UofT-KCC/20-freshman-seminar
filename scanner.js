const qrVideo = document.querySelector("[data-qr-video]");
const qrStartButton = document.querySelector("[data-qr-start]");
const qrStopButton = document.querySelector("[data-qr-stop]");
const qrStatus = document.querySelector("[data-scanner-status]");
const qrResult = document.querySelector("[data-scanner-result]");
const scannerState = document.querySelector("[data-scanner-state]");

let qrStream;
let qrAnimationFrame;
let qrDetector;
let qrCanvas;
let qrCanvasContext;

const scannerCopy = {
  ready: "시작을 누르고 카메라 접근을 허용해 주세요.",
  scanning: "QR 코드가 프레임 안에 들어오도록 맞춰 주세요.",
  success: "QR 코드가 인식되었습니다",
  unsupported: "이 브라우저에서는 QR 스캔을 지원하지 않습니다.",
  cameraError: "카메라 접근이 차단되었거나 사용할 수 없습니다.",
  stopped: "스캐너가 중지되었습니다.",
};

function setScannerStatus(key, value) {
  qrStatus.textContent = value || scannerCopy[key];
  scannerState.textContent = key === "scanning" ? "Scanning" : key === "success" ? "Detected" : "Ready";
  scannerState.dataset.state = key;
}

function showQrResult(value) {
  qrResult.hidden = false;
  qrResult.textContent = `${scannerCopy.success}: ${value}`;
  setScannerStatus("success");
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
      showQrResult(detectedValue);
      stopQrScanner(false);
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

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopQrScanner(false);
  }
});

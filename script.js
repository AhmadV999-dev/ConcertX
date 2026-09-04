"use strict";

/* =========================
   ConvertX
   Browser-only converter
   ========================= */

const fileInput = document.getElementById("fileInput");
const fileBox = document.getElementById("fileBox");
const chooseBtn = document.getElementById("chooseBtn");
const removeBtn = document.getElementById("removeBtn");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileInfo = document.getElementById("fileInfo");
const fileHint = document.getElementById("fileHint");

const typeCards = document.querySelectorAll(".type-card");

const imageFormats = document.getElementById("imageFormats");
const audioFormats = document.getElementById("audioFormats");

const formatButtons = document.querySelectorAll(".format-btn");

const convertBtn = document.getElementById("convertBtn");

const progressArea = document.getElementById("progressArea");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");

const resultBox = document.getElementById("resultBox");
const resultName = document.getElementById("resultName");
const resultDetails = document.getElementById("resultDetails");
const downloadBtn = document.getElementById("downloadBtn");

const errorBox = document.getElementById("errorBox");

const themeBtn = document.getElementById("themeBtn");

let currentType = "image";
let selectedFormat = "png";
let selectedFile = null;
let outputURL = null;


/* =========================
   Helpers
   ========================= */

function randomNumber() {
  return Math.floor(1000 + Math.random() * 90000);
}

function makeFileName(format) {
  return `ConvertX${format}${randomNumber()}.${format}`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return (
    (bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2) +
    " " +
    units[index]
  );
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

function setProgress(percent, text) {
  const value = Math.max(0, Math.min(100, percent));

  progressBar.style.width = `${value}%`;
  progressPercent.textContent = `${Math.round(value)}%`;

  if (text) {
    progressText.textContent = text;
  }
}

function resetResult() {
  resultBox.classList.add("hidden");

  if (outputURL) {
    URL.revokeObjectURL(outputURL);
    outputURL = null;
  }

  downloadBtn.removeAttribute("href");
}

function resetFile() {
  selectedFile = null;

  fileInput.value = "";

  fileInfo.classList.add("hidden");

  convertBtn.disabled = true;

  resetResult();
  hideError();

  progressArea.classList.add("hidden");
  setProgress(0, "Converting...");

  fileName.textContent = "";
  fileSize.textContent = "";
}

function showResult(blob, name) {
  if (outputURL) {
    URL.revokeObjectURL(outputURL);
  }

  outputURL = URL.createObjectURL(blob);

  resultName.textContent = name;
  resultDetails.textContent =
    `${formatBytes(blob.size)} • Ready to download`;

  downloadBtn.href = outputURL;
  downloadBtn.download = name;

  resultBox.classList.remove("hidden");
}


/* =========================
   File type handling
   ========================= */

function getAccept() {
  if (currentType === "image") {
    return "image/png,image/jpeg,image/webp,image/bmp";
  }

  return "audio/*";
}

function isValidFile(file) {
  if (!file) return false;

  if (currentType === "image") {
    return (
      file.type.startsWith("image/") &&
      ["image/png", "image/jpeg", "image/webp", "image/bmp"].includes(file.type)
    );
  }

  if (currentType === "audio") {
    return file.type.startsWith("audio/");
  }

  return false;
}

function updateInputType() {
  fileInput.accept = getAccept();
}


/* =========================
   Type switching
   ========================= */

typeCards.forEach(card => {
  card.addEventListener("click", () => {

    currentType = card.dataset.type;

    typeCards.forEach(item => {
      item.classList.remove("active");
    });

    card.classList.add("active");

    resetFile();

    if (currentType === "image") {

      imageFormats.classList.remove("hidden");
      audioFormats.classList.add("hidden");

      document.getElementById("formatLabel").textContent = "Picture";

      fileHint.textContent =
        "PNG, JPG, JPEG, WEBP or BMP";

      selectedFormat = "png";

    } else {

      imageFormats.classList.add("hidden");
      audioFormats.classList.remove("hidden");

      document.getElementById("formatLabel").textContent = "Audio";

      fileHint.textContent =
        "Audio files supported by your browser";

      selectedFormat = "wav";
    }

    updateInputType();

    formatButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    document
      .querySelector(`.format-btn[data-format="${selectedFormat}"]`)
      ?.classList.add("active");
  });
});


/* =========================
   Format buttons
   ========================= */

formatButtons.forEach(button => {

  button.addEventListener("click", () => {

    if (button.parentElement.classList.contains("hidden")) {
      return;
    }

    formatButtons.forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    selectedFormat = button.dataset.format;

    resetResult();
    hideError();
  });

});


/* =========================
   File picker
   ========================= */

chooseBtn.addEventListener("click", event => {
  event.stopPropagation();
  fileInput.click();
});

fileBox.addEventListener("click", event => {

  if (
    event.target === removeBtn ||
    removeBtn.contains(event.target) ||
    event.target === chooseBtn
  ) {
    return;
  }

  fileInput.click();
});


fileInput.addEventListener("change", () => {

  const file = fileInput.files[0];

  if (!file) return;

  if (!isValidFile(file)) {

    resetFile();

    showError(
      currentType === "image"
        ? "Please choose a PNG, JPG, JPEG, WEBP or BMP picture."
        : "Please choose an audio file supported by your browser."
    );

    return;
  }

  selectedFile = file;

  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);

  fileInfo.classList.remove("hidden");

  convertBtn.disabled = false;

  hideError();
  resetResult();
});


removeBtn.addEventListener("click", event => {
  event.preventDefault();
  event.stopPropagation();

  resetFile();
});


/* =========================
   Drag and drop
   ========================= */

fileBox.addEventListener("dragover", event => {
  event.preventDefault();
  fileBox.classList.add("dragging");
});

fileBox.addEventListener("dragleave", () => {
  fileBox.classList.remove("dragging");
});

fileBox.addEventListener("drop", event => {

  event.preventDefault();

  fileBox.classList.remove("dragging");

  const file = event.dataTransfer.files[0];

  if (!file) return;

  if (!isValidFile(file)) {

    showError(
      currentType === "image"
        ? "That picture format is not supported."
        : "That audio format cannot be opened by this browser."
    );

    return;
  }

  selectedFile = file;

  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);

  fileInfo.classList.remove("hidden");

  convertBtn.disabled = false;

  hideError();
  resetResult();
});


/* =========================
   IMAGE CONVERSION
   ========================= */

function loadImage(file) {
  return new Promise((resolve, reject) => {

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The picture could not be opened."));
    };

    img.src = url;
  });
}


function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {

    canvas.toBlob(blob => {

      if (!blob) {
        reject(new Error("Your browser could not create this image."));
        return;
      }

      resolve(blob);

    }, type, quality);
  });
}


async function convertImage(file, format) {

  setProgress(10, "Opening picture...");

  const img = await loadImage(file);

  setProgress(35, "Preparing picture...");

  const canvas = document.createElement("canvas");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d", {
    alpha: true
  });

  if (!ctx) {
    throw new Error("Canvas is not supported by this browser.");
  }

  /*
   JPG does not support transparency.
   Paint a white background first.
  */

  if (format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  setProgress(65, "Encoding picture...");

  if (format === "png") {
    return await canvasToBlob(
      canvas,
      "image/png"
    );
  }

  if (format === "jpg") {
    return await canvasToBlob(
      canvas,
      "image/jpeg",
      0.92
    );
  }

  if (format === "webp") {
    return await canvasToBlob(
      canvas,
      "image/webp",
      0.92
    );
  }

  if (format === "bmp") {
    return canvasToBMP(canvas);
  }

  throw new Error("Unsupported picture format.");
}


/* =========================
   BMP encoder
   ========================= */

function canvasToBMP(canvas) {

  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;

  const imageData = ctx.getImageData(
    0,
    0,
    width,
    height
  );

  const rowSize = Math.floor(
    (24 * width + 31) / 32
  ) * 4;

  const pixelDataSize = rowSize * height;

  const fileSize = 54 + pixelDataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4D);

  view.setUint32(2, fileSize, true);

  view.setUint32(10, 54, true);

  view.setUint32(14, 40, true);

  view.setInt32(18, width, true);
  view.setInt32(22, height, true);

  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);

  view.setUint32(30, 0, true);
  view.setUint32(34, pixelDataSize, true);

  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);

  let offset = 54;

  for (let y = height - 1; y >= 0; y--) {

    for (let x = 0; x < width; x++) {

      const source =
        (y * width + x) * 4;

      const r = imageData.data[source];
      const g = imageData.data[source + 1];
      const b = imageData.data[source + 2];

      view.setUint8(offset++, b);
      view.setUint8(offset++, g);
      view.setUint8(offset++, r);
    }

    while ((offset - 54) % rowSize !== 0) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob(
    [buffer],
    { type: "image/bmp" }
  );
}


/* =========================
   AUDIO → WAV
   ========================= */

async function convertAudioToWav(file) {

  setProgress(10, "Reading audio...");

  const arrayBuffer =
    await file.arrayBuffer();

  setProgress(35, "Decoding audio...");

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {
    throw new Error(
      "This browser does not support audio conversion."
    );
  }

  const audioContext =
    new AudioContext();

  try {

    const audioBuffer =
      await audioContext.decodeAudioData(
        arrayBuffer.slice(0)
      );

    setProgress(65, "Creating WAV...");

    const wavBlob =
      audioBufferToWav(audioBuffer);

    setProgress(90, "Finishing...");

    return wavBlob;

  } finally {

    try {
      await audioContext.close();
    } catch (_) {}
  }
}


function audioBufferToWav(buffer) {

  const numberOfChannels =
    buffer.numberOfChannels;

  const sampleRate =
    buffer.sampleRate;

  const format = 1;

  const bitDepth = 16;

  const length =
    buffer.length *
    numberOfChannels *
    2;

  const arrayBuffer =
    new ArrayBuffer(44 + length);

  const view =
    new DataView(arrayBuffer);

  function writeString(offset, string) {

    for (let i = 0; i < string.length; i++) {
      view.setUint8(
        offset + i,
        string.charCodeAt(i)
      );
    }
  }

  writeString(0, "RIFF");

  view.setUint32(
    4,
    36 + length,
    true
  );

  writeString(8, "WAVE");

  writeString(12, "fmt ");

  view.setUint32(
    16,
    16,
    true
  );

  view.setUint16(
    20,
    format,
    true
  );

  view.setUint16(
    22,
    numberOfChannels,
    true
  );

  view.setUint32(
    24,
    sampleRate,
    true
  );

  view.setUint32(
    28,
    sampleRate *
    numberOfChannels *
    2,
    true
  );

  view.setUint16(
    32,
    numberOfChannels * 2,
    true
  );

  view.setUint16(
    34,
    bitDepth,
    true
  );

  writeString(36, "data");

  view.setUint32(
    40,
    length,
    true
  );

  const channels = [];

  for (let channel = 0; channel < numberOfChannels; channel++) {
    channels.push(
      buffer.getChannelData(channel)
    );
  }

  let offset = 44;

  for (let i = 0; i < buffer.length; i++) {

    for (let channel = 0; channel < numberOfChannels; channel++) {

      let sample =
        channels[channel][i];

      sample =
        Math.max(-1, Math.min(1, sample));

      const value =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7FFF;

      view.setInt16(
        offset,
        value,
        true
      );

      offset += 2;
    }
  }

  return new Blob(
    [arrayBuffer],
    { type: "audio/wav" }
  );
}


/* =========================
   CONVERT BUTTON
   ========================= */

convertBtn.addEventListener("click", async () => {

  if (!selectedFile) {
    showError("Choose a file first.");
    return;
  }

  convertBtn.disabled = true;

  progressArea.classList.remove("hidden");

  resultBox.classList.add("hidden");

  hideError();

  setProgress(0, "Starting...");

  try {

    let blob;

    if (currentType === "image") {

      blob =
        await convertImage(
          selectedFile,
          selectedFormat
        );

    } else if (currentType === "audio") {

      if (selectedFormat !== "wav") {
        throw new Error(
          "Only WAV output is available in the browser converter."
        );
      }

      blob =
        await convertAudioToWav(
          selectedFile
        );
    }

    setProgress(100, "Complete!");

    const name =
      makeFileName(selectedFormat);

    showResult(blob, name);

  } catch (error) {

    console.error(error);

    showError(
      error?.message ||
      "Conversion failed. The selected file may not be supported by your browser."
    );

    progressArea.classList.add("hidden");

  } finally {

    convertBtn.disabled = !selectedFile;
  }
});


/* =========================
   THEME
   ========================= */

function updateThemeIcon() {

  if (document.body.classList.contains("light")) {
    themeBtn.textContent = "☾";
  } else {
    themeBtn.textContent = "☀";
  }
}

themeBtn.addEventListener("click", () => {

  document.body.classList.toggle("light");

  localStorage.setItem(
    "convertx-theme",
    document.body.classList.contains("light")
      ? "light"
      : "dark"
  );

  updateThemeIcon();
});


if (
  localStorage.getItem("convertx-theme") === "light"
) {
  document.body.classList.add("light");
}

updateThemeIcon();


/* =========================
   Initial setup
   ========================= */

updateInputType();
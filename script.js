"use strict";


/* =========================
   ELEMENTS
========================= */

const typeCards =
  document.querySelectorAll(".type-card");

const fileInput =
  document.getElementById("fileInput");

const fileBox =
  document.getElementById("fileBox");

const chooseBtn =
  document.getElementById("chooseBtn");

const removeBtn =
  document.getElementById("removeBtn");

const fileTitle =
  document.getElementById("fileTitle");

const fileHint =
  document.getElementById("fileHint");

const fileInfo =
  document.getElementById("fileInfo");

const fileName =
  document.getElementById("fileName");

const fileSize =
  document.getElementById("fileSize");

const formatLabel =
  document.getElementById("formatLabel");

const imageFormats =
  document.getElementById("imageFormats");

const audioFormats =
  document.getElementById("audioFormats");

const convertBtn =
  document.getElementById("convertBtn");

const progressArea =
  document.getElementById("progressArea");

const progressText =
  document.getElementById("progressText");

const progressPercent =
  document.getElementById("progressPercent");

const progressBar =
  document.getElementById("progressBar");

const resultBox =
  document.getElementById("resultBox");

const resultName =
  document.getElementById("resultName");

const resultDetails =
  document.getElementById("resultDetails");

const downloadBtn =
  document.getElementById("downloadBtn");

const errorBox =
  document.getElementById("errorBox");

const themeBtn =
  document.getElementById("themeBtn");


/* =========================
   STATE
========================= */

let selectedType = "image";
let selectedFormat = "png";
let currentFile = null;

let outputBlob = null;
let outputName = "";

let outputURL = null;


/* =========================
   HELPERS
========================= */

function formatBytes(bytes) {

  if (!bytes) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return (
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 2)
    + " "
    + units[index];
}


function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


function randomNumber() {

  return Math.floor(
    1000 + Math.random() * 9000
  );
}


function makeOutputName(format) {

  return (
    "ConvertX" +
    format +
    randomNumber() +
    "." +
    format
  );
}


function showError(message) {

  errorBox.textContent = message;

  errorBox.classList.remove("hidden");

  setTimeout(() => {
    errorBox.classList.add("hidden");
  }, 4500);
}


function hideError() {
  errorBox.classList.add("hidden");
}


function setProgress(value, text) {

  value = Math.max(
    0,
    Math.min(100, value)
  );

  progressBar.style.width =
    value + "%";

  progressPercent.textContent =
    Math.round(value) + "%";

  progressText.textContent =
    text;
}


function clearOutput() {

  outputBlob = null;
  outputName = "";

  if (outputURL) {
    URL.revokeObjectURL(outputURL);
    outputURL = null;
  }

  downloadBtn.removeAttribute("href");

  resultBox.classList.add("hidden");
}


/* =========================
   TYPE SELECTION
========================= */

function selectType(type) {

  selectedType = type;

  typeCards.forEach(card => {

    card.classList.toggle(
      "active",
      card.dataset.type === type
    );

  });


  if (type === "image") {

    formatLabel.textContent =
      "Picture";

    fileHint.textContent =
      "PNG, JPG, JPEG or WEBP";

    fileInput.accept =
      "image/png,image/jpeg,image/webp";

    imageFormats.classList.remove(
      "hidden"
    );

    audioFormats.classList.add(
      "hidden"
    );

    selectedFormat = "png";

  }


  if (type === "audio") {

    formatLabel.textContent =
      "Audio";

    fileHint.textContent =
      "Browser-supported audio files";

    fileInput.accept =
      "audio/*";

    imageFormats.classList.add(
      "hidden"
    );

    audioFormats.classList.remove(
      "hidden"
    );

    selectedFormat = "wav";
  }


  updateFormatButtons();

  resetFile();

}


typeCards.forEach(card => {

  card.addEventListener(
    "click",
    () => {
      selectType(
        card.dataset.type
      );
    }
  );

});


/* =========================
   FORMAT SELECTION
========================= */

const formatButtons =
  document.querySelectorAll(
    ".format-btn"
  );


formatButtons.forEach(button => {

  button.addEventListener(
    "click",
    event => {

      event.preventDefault();

      selectedFormat =
        button.dataset.format;

      updateFormatButtons();

      updateConvertButton();

    }
  );

});


function updateFormatButtons() {

  formatButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.format ===
      selectedFormat
    );

  });

}


/* =========================
   FILE PICKER
========================= */

chooseBtn.addEventListener(
  "click",
  event => {

    event.preventDefault();
    event.stopPropagation();

    fileInput.click();

  }
);


fileBox.addEventListener(
  "click",
  event => {

    if (
      event.target.closest("button")
    ) {
      return;
    }

    if (
      event.target.closest(".file-info")
    ) {
      return;
    }

    fileInput.click();

  }
);


fileInput.addEventListener(
  "change",
  () => {

    const file =
      fileInput.files &&
      fileInput.files[0];

    if (!file) {
      return;
    }

    handleFile(file);

  }
);


/* =========================
   FILE VALIDATION
========================= */

function validImage(file) {

  return (
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/webp" ||
    file.name.toLowerCase().endsWith(".png") ||
    file.name.toLowerCase().endsWith(".jpg") ||
    file.name.toLowerCase().endsWith(".jpeg") ||
    file.name.toLowerCase().endsWith(".webp")
  );

}


function validAudio(file) {

  return (
    file.type.startsWith("audio/") ||
    /\.(mp3|wav|ogg|oga|m4a|aac|webm|flac)$/i
      .test(file.name)
  );

}


function handleFile(file) {

  hideError();

  if (selectedType === "image") {

    if (!validImage(file)) {

      fileInput.value = "";

      showError(
        "Please choose a PNG, JPG, JPEG or WEBP image."
      );

      return;
    }

  }


  if (selectedType === "audio") {

    if (!validAudio(file)) {

      fileInput.value = "";

      showError(
        "Please choose a supported audio file."
      );

      return;
    }

  }


  currentFile = file;

  clearOutput();

  fileName.textContent =
    file.name;

  fileSize.textContent =
    formatBytes(file.size);

  fileTitle.textContent =
    "File selected";

  fileInfo.classList.remove(
    "hidden"
  );

  convertBtn.disabled = false;

  progressArea.classList.add(
    "hidden"
  );

}


/* =========================
   RESET
========================= */

function resetFile() {

  currentFile = null;

  fileInput.value = "";

  clearOutput();

  fileTitle.textContent =
    "Choose a file";

  fileInfo.classList.add(
    "hidden"
  );

  progressArea.classList.add(
    "hidden"
  );

  convertBtn.disabled = true;

  setProgress(
    0,
    "Preparing..."
  );

}


removeBtn.addEventListener(
  "click",
  event => {

    event.preventDefault();
    event.stopPropagation();

    resetFile();

  }
);


/* =========================
   CONVERT BUTTON
========================= */

function updateConvertButton() {

  convertBtn.disabled =
    !currentFile ||
    !selectedFormat;

}


convertBtn.addEventListener(
  "click",
  async event => {

    event.preventDefault();

    if (
      !currentFile ||
      !selectedFormat
    ) {
      return;
    }

    hideError();

    convertBtn.disabled = true;

    progressArea.classList.remove(
      "hidden"
    );

    resultBox.classList.add(
      "hidden"
    );

    try {

      setProgress(
        5,
        "Reading file..."
      );

      await wait(150);


      let blob;


      if (
        selectedType === "image"
      ) {

        setProgress(
          20,
          "Loading image..."
        );

        await wait(150);

        blob =
          await convertImage(
            currentFile,
            selectedFormat
          );

      }


      if (
        selectedType === "audio"
      ) {

        setProgress(
          20,
          "Reading audio..."
        );

        await wait(150);

        blob =
          await convertAudioToWav(
            currentFile
          );

      }


      if (!blob) {
        throw new Error(
          "Conversion failed."
        );
      }


      setProgress(
        75,
        "Creating file..."
      );

      await wait(150);


      outputBlob = blob;

      outputName =
        makeOutputName(
          selectedFormat
        );


      setProgress(
        90,
        "Finishing..."
      );

      await wait(200);


      outputURL =
        URL.createObjectURL(
          outputBlob
        );

      downloadBtn.href =
        outputURL;

      downloadBtn.download =
        outputName;

      resultName.textContent =
        outputName;

      resultDetails.textContent =
        formatBytes(
          outputBlob.size
        ) +
        " • Ready to download";


      setProgress(
        100,
        "Complete"
      );

      await wait(250);

      resultBox.classList.remove(
        "hidden"
      );

    } catch (error) {

      console.error(error);

      progressArea.classList.add(
        "hidden"
      );

      showError(
        error.message ||
        "Conversion failed."
      );

    } finally {

      convertBtn.disabled =
        !currentFile;

    }

  }
);


/* =========================
   IMAGE CONVERSION
========================= */

async function convertImage(
  file,
  format
) {

  const url =
    URL.createObjectURL(file);

  try {

    const image =
      new Image();

    image.src = url;


    await new Promise(
      (resolve, reject) => {

        image.onload =
          resolve;

        image.onerror =
          () => reject(
            new Error(
              "Could not read the image."
            )
          );

      }
    );


    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      image.naturalWidth;

    canvas.height =
      image.naturalHeight;


    const ctx =
      canvas.getContext(
        "2d"
      );


    if (format === "jpg") {

      ctx.fillStyle =
        "#ffffff";

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

    }


    ctx.drawImage(
      image,
      0,
      0
    );


    let mime;


    if (format === "png") {
      mime = "image/png";
    }

    else if (format === "jpg") {
      mime = "image/jpeg";
    }

    else if (format === "webp") {
      mime = "image/webp";
    }

    else {
      throw new Error(
        "Unsupported image format."
      );
    }


    const blob =
      await new Promise(
        resolve => {

          canvas.toBlob(
            resolve,
            mime,
            0.92
          );

        }
      );


    if (!blob) {

      throw new Error(
        "Your browser could not create this image format."
      );

    }


    return blob;

  } finally {

    URL.revokeObjectURL(url);

  }

}


/* =========================
   AUDIO → WAV
========================= */

async function convertAudioToWav(
  file
) {

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioContext) {

    throw new Error(
      "Audio conversion is not supported by this browser."
    );

  }


  const context =
    new AudioContext();


  try {

    const arrayBuffer =
      await file.arrayBuffer();


    const audioBuffer =
      await context.decodeAudioData(
        arrayBuffer
      );


    const channels =
      audioBuffer.numberOfChannels;

    const sampleRate =
      audioBuffer.sampleRate;

    const length =
      audioBuffer.length;

    const bytesPerSample = 2;

    const dataSize =
      length *
      channels *
      bytesPerSample;


    const buffer =
      new ArrayBuffer(
        44 + dataSize
      );


    const view =
      new DataView(buffer);


    function writeString(
      offset,
      text
    ) {

      for (
        let i = 0;
        i < text.length;
        i++
      ) {

        view.setUint8(
          offset + i,
          text.charCodeAt(i)
        );

      }

    }


    writeString(
      0,
      "RIFF"
    );


    view.setUint32(
      4,
      36 + dataSize,
      true
    );


    writeString(
      8,
      "WAVE"
    );


    writeString(
      12,
      "fmt "
    );


    view.setUint32(
      16,
      16,
      true
    );

    view.setUint16(
      20,
      1,
      true
    );

    view.setUint16(
      22,
      channels,
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
      channels *
      bytesPerSample,
      true
    );

    view.setUint16(
      32,
      channels *
      bytesPerSample,
      true
    );

    view.setUint16(
      34,
      16,
      true
    );


    writeString(
      36,
      "data"
    );


    view.setUint32(
      40,
      dataSize,
      true
    );


    const channelData = [];


    for (
      let channel = 0;
      channel < channels;
      channel++
    ) {

      channelData.push(
        audioBuffer.getChannelData(
          channel
        )
      );

    }


    let offset = 44;


    for (
      let i = 0;
      i < length;
      i++
    ) {

      for (
        let channel = 0;
        channel < channels;
        channel++
      ) {

        let sample =
          channelData[
            channel
          ][i];


        sample =
          Math.max(
            -1,
            Math.min(
              1,
              sample
            )
          );


        const value =
          sample < 0
            ? sample * 0x8000
            : sample * 0x7fff;


        view.setInt16(
          offset,
          value,
          true
        );


        offset += 2;

      }

    }


    return new Blob(
      [buffer],
      {
        type: "audio/wav"
      }
    );

  } finally {

    await context.close();

  }

}


/* =========================
   DOWNLOAD
========================= */

downloadBtn.addEventListener(
  "click",
  event => {

    if (
      !outputBlob ||
      !outputURL
    ) {

      event.preventDefault();

      showError(
        "There is no converted file."
      );

    }

  }
);


/* =========================
   THEME
========================= */

function loadTheme() {

  const saved =
    localStorage.getItem(
      "convertx-theme"
    );


  if (saved === "light") {

    document.body.classList.add(
      "light"
    );

    themeBtn.textContent =
      "☾";

  } else {

    document.body.classList.remove(
      "light"
    );

    themeBtn.textContent =
      "☀";

  }

}


themeBtn.addEventListener(
  "click",
  () => {

    const isLight =
      document.body.classList.toggle(
        "light"
      );


    localStorage.setItem(
      "convertx-theme",
      isLight
        ? "light"
        : "dark"
    );


    themeBtn.textContent =
      isLight
        ? "☾"
        : "☀";

  }
);


/* =========================
   START
========================= */

selectType("image");

loadTheme();
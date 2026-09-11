"use strict";

/*
==================================================
  CONVERTX
  Image + Audio + Video
  Browser + Termux FFmpeg backend
==================================================
*/

/* =========================
   SETTINGS
========================= */

/*
   Your Termux FFmpeg server.

   If Termux is running on the SAME phone:
*/
const BACKEND_URL = "http://127.0.0.1:8080";


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

const videoFormats =
  document.getElementById("videoFormats");

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

  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) / Math.log(1024)
    ),
    units.length - 1
  );

  return (
    bytes /
    Math.pow(1024, index)
  ).toFixed(
    index === 0 ? 0 : 2
  ) +
    " " +
    units[index];
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

  if (!errorBox) {
    alert(message);
    return;
  }

  errorBox.textContent = message;

  errorBox.classList.remove(
    "hidden"
  );

}


function hideError() {

  errorBox?.classList.add(
    "hidden"
  );

}


function setProgress(value, text) {

  value = Math.max(
    0,
    Math.min(
      100,
      value
    )
  );

  if (progressBar) {

    progressBar.style.width =
      value + "%";

  }

  if (progressPercent) {

    progressPercent.textContent =
      Math.round(value) + "%";

  }

  if (progressText) {

    progressText.textContent =
      text;

  }

}


function clearOutput() {

  outputBlob = null;

  outputName = "";

  if (outputURL) {

    URL.revokeObjectURL(
      outputURL
    );

    outputURL = null;

  }

  if (downloadBtn) {

    downloadBtn.removeAttribute(
      "href"
    );

    downloadBtn.removeAttribute(
      "download"
    );

  }

  resultBox?.classList.add(
    "hidden"
  );

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


  /* IMAGE */

  if (type === "image") {

    formatLabel.textContent =
      "Picture";

    fileHint.textContent =
      "PNG, JPG, JPEG or WEBP";

    fileInput.accept =
      "image/png,image/jpeg,image/webp";

    imageFormats?.classList.remove(
      "hidden"
    );

    audioFormats?.classList.add(
      "hidden"
    );

    videoFormats?.classList.add(
      "hidden"
    );

    selectedFormat =
      "png";

  }


  /* AUDIO */

  else if (type === "audio") {

    formatLabel.textContent =
      "Audio";

    fileHint.textContent =
      "MP3, WAV, OGG, M4A, AAC or FLAC";

    fileInput.accept =
      "audio/*";

    imageFormats?.classList.add(
      "hidden"
    );

    audioFormats?.classList.remove(
      "hidden"
    );

    videoFormats?.classList.add(
      "hidden"
    );

    selectedFormat =
      "mp3";

  }


  /* VIDEO */

  else if (type === "video") {

    formatLabel.textContent =
      "Video";

    fileHint.textContent =
      "MP4, WebM, MKV, MOV, AVI and more";

    fileInput.accept =
      "video/*";

    imageFormats?.classList.add(
      "hidden"
    );

    audioFormats?.classList.add(
      "hidden"
    );

    videoFormats?.classList.remove(
      "hidden"
    );

    selectedFormat =
      "mp4";

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
   FORMAT BUTTONS
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

chooseBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();
    event.stopPropagation();

    fileInput?.click();

  }
);


fileBox?.addEventListener(
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

    fileInput?.click();

  }
);


fileInput?.addEventListener(
  "change",
  () => {

    const file =
      fileInput.files?.[0];

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
    /\.(png|jpg|jpeg|webp)$/i
      .test(file.name)
  );

}


function validAudio(file) {

  return (
    file.type.startsWith("audio/") ||
    /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|webm)$/i
      .test(file.name)
  );

}


function validVideo(file) {

  return (
    file.type.startsWith("video/") ||
    /\.(mp4|webm|mkv|mov|avi|m4v|3gp|mpeg|mpg|ts|flv)$/i
      .test(file.name)
  );

}


/* =========================
   HANDLE FILE
========================= */

function handleFile(file) {

  hideError();

  if (
    selectedType === "image" &&
    !validImage(file)
  ) {

    fileInput.value = "";

    showError(
      "Please choose a PNG, JPG, JPEG or WEBP image."
    );

    return;
  }


  if (
    selectedType === "audio" &&
    !validAudio(file)
  ) {

    fileInput.value = "";

    showError(
      "Please choose a supported audio file."
    );

    return;
  }


  if (
    selectedType === "video" &&
    !validVideo(file)
  ) {

    fileInput.value = "";

    showError(
      "Please choose a supported video file."
    );

    return;
  }


  currentFile =
    file;

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


  convertBtn.disabled =
    false;


  progressArea?.classList.add(
    "hidden"
  );

}


/* =========================
   RESET FILE
========================= */

function resetFile() {

  currentFile =
    null;

  if (fileInput) {
    fileInput.value = "";
  }

  clearOutput();


  if (fileTitle) {

    fileTitle.textContent =
      "Choose a file";

  }


  fileInfo?.classList.add(
    "hidden"
  );


  progressArea?.classList.add(
    "hidden"
  );


  if (convertBtn) {

    convertBtn.disabled =
      true;

  }


  setProgress(
    0,
    "Preparing..."
  );

}


removeBtn?.addEventListener(
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

  if (!convertBtn) {
    return;
  }

  convertBtn.disabled =
    !currentFile ||
    !selectedFormat;

}


convertBtn?.addEventListener(
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

    convertBtn.disabled =
      true;

    progressArea?.classList.remove(
      "hidden"
    );

    resultBox?.classList.add(
      "hidden"
    );


    try {

      let blob;


      /* =====================
         IMAGE
      ===================== */

      if (
        selectedType === "image"
      ) {

        setProgress(
          10,
          "Loading image..."
        );

        await wait(150);


        blob =
          await convertImage(
            currentFile,
            selectedFormat
          );

      }


      /* =====================
         AUDIO
      ===================== */

      else if (
        selectedType === "audio"
      ) {

        blob =
          await convertWithFFmpeg(
            currentFile,
            selectedFormat,
            "audio"
          );

      }


      /* =====================
         VIDEO
      ===================== */

      else if (
        selectedType === "video"
      ) {

        blob =
          await convertWithFFmpeg(
            currentFile,
            selectedFormat,
            "video"
          );

      }


      if (!blob) {

        throw new Error(
          "Conversion failed."
        );

      }


      /* =====================
         RESULT
      ===================== */

      setProgress(
        90,
        "Creating download..."
      );


      outputBlob =
        blob;


      outputName =
        makeOutputName(
          selectedFormat
        );


      if (outputURL) {

        URL.revokeObjectURL(
          outputURL
        );

      }


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

      console.error(
        "ConvertX:",
        error
      );


      progressArea?.classList.add(
        "hidden"
      );


      showError(
        error.message ||
        "Conversion failed."
      );

    }


    finally {

      convertBtn.disabled =
        !currentFile;

    }

  }
);


/* =========================
   IMAGE CONVERTER
========================= */

async function convertImage(
  file,
  format
) {

  const url =
    URL.createObjectURL(
      file
    );


  try {

    const image =
      new Image();


    image.src =
      url;


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


    if (!ctx) {

      throw new Error(
        "Canvas is not supported."
      );

    }


    if (
      format === "jpg"
    ) {

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


    if (
      format === "png"
    ) {

      mime =
        "image/png";

    }

    else if (
      format === "jpg"
    ) {

      mime =
        "image/jpeg";

    }

    else if (
      format === "webp"
    ) {

      mime =
        "image/webp";

    }

    else {

      throw new Error(
        "Unsupported image format."
      );

    }


    const blob =
      await new Promise(
        (resolve, reject) => {

          canvas.toBlob(
            result => {

              if (result) {

                resolve(
                  result
                );

              } else {

                reject(
                  new Error(
                    "Could not create image."
                  )
                );

              }

            },
            mime,
            0.92
          );

        }
      );


    return blob;


  } finally {

    URL.revokeObjectURL(
      url
    );

  }

}


/* =========================
   AUDIO / VIDEO
   FFMPEG BACKEND
========================= */

async function convertWithFFmpeg(
  file,
  format,
  type
) {

  setProgress(
    5,
    "Connecting to FFmpeg..."
  );


  const formData =
    new FormData();


  formData.append(
    "file",
    file,
    file.name
  );


  formData.append(
    "format",
    format
  );


  formData.append(
    "type",
    type
  );


  let response;


  try {

    setProgress(
      10,
      "Uploading file..."
    );


    response =
      await fetch(
        BACKEND_URL +
        "/convert",
        {
          method: "POST",
          body: formData
        }
      );


  } catch (error) {

    throw new Error(
      "Cannot connect to Termux FFmpeg. " +
      "Start your server.py in Termux first."
    );

  }


  if (!response.ok) {

    let message =
      "FFmpeg conversion failed.";


    try {

      const data =
        await response.json();


      if (data.error) {

        message =
          data.error;

      }

    } catch (_) {}


    throw new Error(
      message
    );

  }


  setProgress(
    75,
    "FFmpeg is converting..."
  );


  const blob =
    await response.blob();


  if (
    !blob ||
    blob.size === 0
  ) {

    throw new Error(
      "FFmpeg returned an empty file."
    );

  }


  setProgress(
    85,
    "Preparing output..."
  );


  return blob;

}


/* =========================
   DOWNLOAD
========================= */

downloadBtn?.addEventListener(
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


  if (
    saved === "light"
  ) {

    document.body.classList.add(
      "light"
    );


    if (themeBtn) {

      themeBtn.textContent =
        "☾";

    }

  } else {

    document.body.classList.remove(
      "light"
    );


    if (themeBtn) {

      themeBtn.textContent =
        "☀";

    }

  }

}


themeBtn?.addEventListener(
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


    if (themeBtn) {

      themeBtn.textContent =
        isLight
          ? "☾"
          : "☀";

    }

  }
);


/* =========================
   START
========================= */

selectType(
  "image"
);

loadTheme();


console.log(
  "ConvertX loaded"
);

console.log(
  "FFmpeg:",
  BACKEND_URL
);
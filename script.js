const BACKEND_URL = "http://127.0.0.1:8080";

const typeCards = document.querySelectorAll(".type-card");
const formatButtons = document.querySelectorAll(".format");

const imageFormats = document.getElementById("imageFormats");
const audioFormats = document.getElementById("audioFormats");
const videoFormats = document.getElementById("videoFormats");

const fileInput = document.getElementById("fileInput");
const chooseBtn = document.getElementById("chooseBtn");
const removeBtn = document.getElementById("removeBtn");

const dropZone = document.getElementById("dropZone");
const fileInfo = document.getElementById("fileInfo");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

const fileTitle = document.getElementById("fileTitle");
const fileHint = document.getElementById("fileHint");

const formatLabel = document.getElementById("formatLabel");

const convertBtn = document.getElementById("convertBtn");

const progressArea = document.getElementById("progressArea");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");

const resultBox = document.getElementById("resultBox");
const resultName = document.getElementById("resultName");
const resultDetails = document.getElementById("resultDetails");
const downloadBtn = document.getElementById("downloadBtn");

const errorBox = document.getElementById("errorBox");

const themeBtn = document.getElementById("themeBtn");


let currentType = "image";
let selectedFormat = "png";
let currentFile = null;
let downloadURL = null;


/* -----------------------------
   THEME
----------------------------- */

function loadTheme() {
  const saved = localStorage.getItem("convertx-theme");

  if (saved === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀";
  } else {
    themeBtn.textContent = "☾";
  }
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  localStorage.setItem(
    "convertx-theme",
    dark ? "dark" : "light"
  );

  themeBtn.textContent = dark ? "☀" : "☾";
});


loadTheme();


/* -----------------------------
   TYPE
----------------------------- */

const typeData = {
  image: {
    label: "Picture",
    hint: "PNG, JPG, JPEG or WEBP"
  },

  audio: {
    label: "Audio",
    hint: "MP3, WAV, OGG, M4A, AAC or FLAC"
  },

  video: {
    label: "Video",
    hint: "MP4, WEBM, MKV, MOV or other video"
  }
};


function selectType(type) {

  currentType = type;

  typeCards.forEach(card => {
    card.classList.toggle(
      "active",
      card.dataset.type === type
    );
  });


  imageFormats.classList.add("hidden");
  audioFormats.classList.add("hidden");
  videoFormats.classList.add("hidden");


  if (type === "image") {
    imageFormats.classList.remove("hidden");
  }

  if (type === "audio") {
    audioFormats.classList.remove("hidden");
  }

  if (type === "video") {
    videoFormats.classList.remove("hidden");
  }


  formatLabel.textContent = typeData[type].label;
  fileHint.textContent = typeData[type].hint;


  const visibleFormats =
    type === "image"
      ? imageFormats
      : type === "audio"
        ? audioFormats
        : videoFormats;


  visibleFormats
    .querySelectorAll(".format")
    .forEach((button, index) => {

      button.classList.toggle(
        "active",
        index === 0
      );

    });


  selectedFormat =
    visibleFormats
      .querySelector(".format")
      ?.dataset.format || "png";


  clearFile();
}


typeCards.forEach(card => {

  card.addEventListener("click", () => {
    selectType(card.dataset.type);
  });

});


/* -----------------------------
   FORMAT
----------------------------- */

formatButtons.forEach(button => {

  button.addEventListener("click", () => {

    const parent = button.parentElement;

    parent
      .querySelectorAll(".format")
      .forEach(btn => {
        btn.classList.remove("active");
      });


    button.classList.add("active");

    selectedFormat = button.dataset.format;

  });

});


/* -----------------------------
   FILE
----------------------------- */

chooseBtn.addEventListener("click", () => {
  fileInput.click();
});


fileInput.addEventListener("change", () => {

  if (fileInput.files.length > 0) {
    setFile(fileInput.files[0]);
  }

});


function setFile(file) {

  if (!file) return;

  if (!isValidFile(file)) {

    showError(
      `This file doesn't match the selected ${currentType} type.`
    );

    return;
  }


  currentFile = file;

  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);

  fileInfo.classList.remove("hidden");

  fileTitle.textContent = "File selected";

  convertBtn.disabled = false;

  hideError();

  resultBox.classList.add("hidden");

  progressArea.classList.add("hidden");
}


function clearFile() {

  currentFile = null;

  fileInput.value = "";

  fileInfo.classList.add("hidden");

  fileTitle.textContent = "Drop your file here";

  convertBtn.disabled = true;

  resultBox.classList.add("hidden");

  progressArea.classList.add("hidden");

  hideError();
}


removeBtn.addEventListener("click", clearFile);


/* -----------------------------
   DRAG DROP
----------------------------- */

["dragenter", "dragover"].forEach(eventName => {

  dropZone.addEventListener(eventName, event => {

    event.preventDefault();

    dropZone.classList.add("dragging");

  });

});


["dragleave", "drop"].forEach(eventName => {

  dropZone.addEventListener(eventName, event => {

    event.preventDefault();

    dropZone.classList.remove("dragging");

  });

});


dropZone.addEventListener("drop", event => {

  const file = event.dataTransfer.files[0];

  if (file) {
    setFile(file);
  }

});


function isValidFile(file) {

  const ext =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  if (currentType === "image") {

    return [
      "png",
      "jpg",
      "jpeg",
      "webp"
    ].includes(ext);

  }


  if (currentType === "audio") {

    return [
      "mp3",
      "wav",
      "ogg",
      "oga",
      "m4a",
      "aac",
      "flac",
      "opus",
      "webm"
    ].includes(ext);

  }


  if (currentType === "video") {

    return [
      "mp4",
      "webm",
      "mkv",
      "mov",
      "m4v",
      "3gp",
      "mpeg",
      "mpg",
      "ts",
      "flv",
      "avi"
    ].includes(ext);

  }


  return false;
}


/* -----------------------------
   CONVERT
----------------------------- */

convertBtn.addEventListener("click", async () => {

  if (!currentFile) return;

  hideError();

  resultBox.classList.add("hidden");

  progressArea.classList.remove("hidden");

  setProgress(
    5,
    "Preparing file..."
  );

  convertBtn.disabled = true;


  try {

    let blob;


    if (currentType === "image") {

      setProgress(
        30,
        "Converting picture..."
      );

      blob = await convertImage(
        currentFile,
        selectedFormat
      );

      setProgress(
        100,
        "Finished!"
      );

    } else {

      blob = await convertWithFFmpeg(
        currentFile,
        selectedFormat,
        currentType
      );

    }


    showResult(blob);

  } catch (error) {

    console.error(error);

    showError(
      error.message ||
      "Conversion failed."
    );

    progressArea.classList.add("hidden");

  } finally {

    convertBtn.disabled = false;

  }

});


/* -----------------------------
   IMAGE
----------------------------- */

function convertImage(file, format) {

  return new Promise((resolve, reject) => {

    const img = new Image();

    const reader = new FileReader();


    reader.onload = () => {

      img.onload = () => {

        const canvas =
          document.createElement("canvas");

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;


        const ctx =
          canvas.getContext("2d");


        if (format === "jpg") {

          ctx.fillStyle = "#ffffff";

          ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

        }


        ctx.drawImage(
          img,
          0,
          0
        );


        const mime =
          format === "png"
            ? "image/png"
            : format === "jpg"
              ? "image/jpeg"
              : "image/webp";


        canvas.toBlob(
          blob => {

            if (!blob) {

              reject(
                new Error(
                  "Browser could not convert this image."
                )
              );

              return;
            }

            resolve(blob);

          },
          mime,
          0.92
        );

      };


      img.onerror = () => {

        reject(
          new Error(
            "Could not read the image."
          )
        );

      };


      img.src = reader.result;

    };


    reader.onerror = () => {

      reject(
        new Error(
          "Could not read the file."
        )
      );

    };


    reader.readAsDataURL(file);

  });

}


/* -----------------------------
   FFMPEG BACKEND
----------------------------- */

async function convertWithFFmpeg(
  file,
  format,
  type
) {

  setProgress(
    15,
    "Uploading to FFmpeg..."
  );


  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "format",
    format
  );

  formData.append(
    "type",
    type
  );


  setProgress(
    30,
    "FFmpeg is converting..."
  );


  const response = await fetch(
    `${BACKEND_URL}/convert`,
    {
      method: "POST",
      body: formData
    }
  );


  if (!response.ok) {

    let message =
      `FFmpeg server error (${response.status})`;

    try {

      const data =
        await response.json();

      if (data.error) {
        message = data.error;
      }

    } catch (_) {}

    throw new Error(message);
  }


  setProgress(
    90,
    "Preparing download..."
  );


  const blob =
    await response.blob();


  setProgress(
    100,
    "Finished!"
  );


  return blob;
}


/* -----------------------------
   RESULT
----------------------------- */

function showResult(blob) {

  if (downloadURL) {
    URL.revokeObjectURL(downloadURL);
  }


  downloadURL =
    URL.createObjectURL(blob);


  const outputName =
    makeOutputName(selectedFormat);


  resultName.textContent =
    outputName;


  resultDetails.textContent =
    `${formatBytes(blob.size)} • Ready to download`;


  downloadBtn.href =
    downloadURL;


  downloadBtn.download =
    outputName;


  resultBox.classList.remove("hidden");

}


function makeOutputName(format) {

  const number =
    Math.floor(
      1000 + Math.random() * 9000
    );


  return `ConvertX${format}${number}.${format}`;
}


/* -----------------------------
   PROGRESS
----------------------------- */

function setProgress(percent, text) {

  progressBar.style.width =
    `${percent}%`;

  progressPercent.textContent =
    `${percent}%`;

  progressText.textContent =
    text;

}


/* -----------------------------
   ERROR
----------------------------- */

function showError(message) {

  errorBox.textContent =
    message;

  errorBox.classList.remove(
    "hidden"
  );

}


function hideError() {

  errorBox.classList.add(
    "hidden"
  );

}


/* -----------------------------
   HELPERS
----------------------------- */

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


  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );


  return (
    (bytes /
      Math.pow(1024, index))
      .toFixed(index === 0 ? 0 : 2)
    + " "
    + units[index]
  );

}
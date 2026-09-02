/* =========================================
   CONVERTX
   Fully local browser converter
   No Firebase
   No real Google login
========================================= */


/* ---------- ELEMENTS ---------- */

const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");

const loginName = document.getElementById("loginName");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");
const avatar = document.getElementById("avatar");

const tokenCount = document.getElementById("tokenCount");
const bigTokenCount = document.getElementById("bigTokenCount");

const modeButtons = document.querySelectorAll(".mode");
const formatButtons = document.querySelectorAll(".format");

const formatArea = document.getElementById("formatArea");
const costLabel = document.getElementById("costLabel");
const buttonCost = document.getElementById("buttonCost");

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");

const fileCard = document.getElementById("fileCard");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileIcon = document.getElementById("fileIcon");
const removeFile = document.getElementById("removeFile");

const previewWrap = document.getElementById("previewWrap");
const imagePreview = document.getElementById("imagePreview");

const convertBtn = document.getElementById("convertBtn");

const progressArea = document.getElementById("progressArea");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");

const resultCard = document.getElementById("resultCard");
const resultName = document.getElementById("resultName");
const downloadBtn = document.getElementById("downloadBtn");

const supportedText = document.getElementById("supportedText");

const toast = document.getElementById("toast");


/* ---------- STATE ---------- */

let currentMode = "photo";
let currentFormat = "png";
let selectedFile = null;
let convertedBlob = null;
let convertedName = "";
let downloadURL = null;

const COSTS = {
  photo: 5,
  video: 10
};


/* ---------- TOKENS ---------- */

let tokens = Number(localStorage.getItem("convertx_tokens"));

if (!Number.isFinite(tokens)) {
  tokens = 100;
  localStorage.setItem("convertx_tokens", tokens);
}

function updateTokens() {

  tokenCount.textContent = tokens;
  bigTokenCount.textContent = tokens;

  localStorage.setItem("convertx_tokens", tokens);
}

function spendTokens(amount) {

  if (tokens < amount) {
    showToast(`Not enough tokens. You need ${amount}.`);
    return false;
  }

  tokens -= amount;
  updateTokens();

  return true;
}


/* ---------- TOAST ---------- */

let toastTimer;

function showToast(message) {

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* ---------- LOGIN ---------- */

function openApp(name) {

  name = name.trim();

  if (!name) {
    name = "User";
  }

  localStorage.setItem("convertx_user", name);

  userName.textContent = name;
  avatar.textContent = name.charAt(0).toUpperCase();

  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");

  updateTokens();
}

loginBtn.addEventListener("click", () => {
  openApp(loginName.value);
});

loginName.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    openApp(loginName.value);
  }

});


/* ---------- AUTO LOGIN ---------- */

const savedUser = localStorage.getItem("convertx_user");

if (savedUser) {
  openApp(savedUser);
}


/* ---------- LOGOUT ---------- */

logoutBtn.addEventListener("click", () => {

  localStorage.removeItem("convertx_user");

  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");

  loginName.value = "";

});


/* ---------- MODE ---------- */

modeButtons.forEach(button => {

  button.addEventListener("click", () => {

    modeButtons.forEach(b => b.classList.remove("active"));

    button.classList.add("active");

    currentMode = button.dataset.mode;

    resetFile();

    updateConverterUI();

  });

});


function updateConverterUI() {

  const cost = COSTS[currentMode];

  costLabel.textContent = `${cost} Tokens`;
  buttonCost.textContent = cost;

  if (currentMode === "photo") {

    formatArea.classList.remove("hidden");

    supportedText.textContent = "JPG or PNG • Max 50MB";

    fileInput.accept = "image/jpeg,image/png";

  } else {

    formatArea.classList.add("hidden");

    supportedText.textContent = "MP4, WebM or MOV • Max 200MB";

    fileInput.accept = "video/*";

  }

}


/* ---------- FORMAT ---------- */

formatButtons.forEach(button => {

  button.addEventListener("click", () => {

    formatButtons.forEach(b => b.classList.remove("active"));

    button.classList.add("active");

    currentFormat = button.dataset.format;

  });

});


/* ---------- BROWSE ---------- */

browseBtn.addEventListener("click", event => {

  event.stopPropagation();

  fileInput.click();

});

dropZone.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {

  if (fileInput.files.length) {
    handleFile(fileInput.files[0]);
  }

});


/* ---------- DRAG DROP ---------- */

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
    handleFile(file);
  }

});


/* ---------- FILE ---------- */

function handleFile(file) {

  const maxSize =
    currentMode === "photo"
      ? 50 * 1024 * 1024
      : 200 * 1024 * 1024;

  if (file.size > maxSize) {

    showToast(
      currentMode === "photo"
        ? "Photo is bigger than 50MB."
        : "Video is bigger than 200MB."
    );

    return;
  }


  if (currentMode === "photo" && !file.type.startsWith("image/")) {

    showToast("Please select a JPG or PNG image.");

    return;
  }


  if (currentMode === "video" && !file.type.startsWith("video/")) {

    showToast("Please select a video file.");

    return;
  }


  selectedFile = file;

  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);

  if (currentMode === "photo") {
    fileIcon.textContent = "IMG";
  } else {
    fileIcon.textContent = "VID";
  }

  fileCard.classList.remove("hidden");
  convertBtn.disabled = false;

  resultCard.classList.add("hidden");

  if (downloadURL) {
    URL.revokeObjectURL(downloadURL);
    downloadURL = null;
  }


  /* IMAGE PREVIEW */

  if (currentMode === "photo") {

    const reader = new FileReader();

    reader.onload = event => {

      imagePreview.src = event.target.result;

      previewWrap.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

  } else {

    previewWrap.classList.add("hidden");

  }

}


/* ---------- REMOVE ---------- */

removeFile.addEventListener("click", () => {
  resetFile();
});


function resetFile() {

  selectedFile = null;
  convertedBlob = null;
  convertedName = "";

  fileInput.value = "";

  fileCard.classList.add("hidden");
  previewWrap.classList.add("hidden");
  resultCard.classList.add("hidden");
  progressArea.classList.add("hidden");

  convertBtn.disabled = true;

  progressBar.style.width = "0%";
  progressPercent.textContent = "0%";

  if (downloadURL) {

    URL.revokeObjectURL(downloadURL);

    downloadURL = null;

  }

}


/* ---------- CONVERT ---------- */

convertBtn.addEventListener("click", async () => {

  if (!selectedFile) {
    showToast("Choose a file first.");
    return;
  }

  const cost = COSTS[currentMode];

  if (tokens < cost) {

    showToast(`You need ${cost} Tokens.`);
    return;

  }

  convertBtn.disabled = true;
  progressArea.classList.remove("hidden");

  setProgress(5, "Preparing...");


  try {

    let result;

    if (currentMode === "photo") {

      result = await convertImage(
        selectedFile,
        currentFormat
      );

    } else {

      result = await videoToAudio(
        selectedFile
      );

    }


    /* ONLY CHARGE AFTER SUCCESS */

    tokens -= cost;
    updateTokens();

    convertedBlob = result.blob;
    convertedName = result.name;

    setProgress(100, "Complete");

    setTimeout(() => {

      progressArea.classList.add("hidden");

      resultName.textContent = convertedName;

      resultCard.classList.remove("hidden");

      showToast(`Converted successfully −${cost} Tokens`);

    }, 350);


  } catch (error) {

    console.error(error);

    progressArea.classList.add("hidden");

    showToast(
      "Conversion failed. Your tokens were not used."
    );

  } finally {

    convertBtn.disabled = false;

  }

});


/* ---------- IMAGE CONVERTER ---------- */

function convertImage(file, format) {

  return new Promise((resolve, reject) => {

    const img = new Image();

    const objectURL = URL.createObjectURL(file);

    img.onload = () => {

      URL.revokeObjectURL(objectURL);

      setProgress(25, "Reading image...");

      const canvas = document.createElement("canvas");

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas unavailable."));
        return;
      }


      /* JPG needs a solid background */

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
        0,
        canvas.width,
        canvas.height
      );


      setProgress(60, "Converting...");


      const mime =
        format === "png"
          ? "image/png"
          : "image/jpeg";


      canvas.toBlob(
        blob => {

          if (!blob) {

            reject(
              new Error("Could not create image.")
            );

            return;
          }


          setProgress(90, "Finishing...");


          const baseName =
            file.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^\w\- ]/g, "");


          resolve({

            blob,

            name:
              `${baseName || "converted"}.${format}`

          });

        },

        mime,

        format === "jpg"
          ? 0.92
          : undefined

      );

    };


    img.onerror = () => {

      URL.revokeObjectURL(objectURL);

      reject(
        new Error("Could not read image.")
      );

    };


    img.src = objectURL;

  });

}


/* ---------- VIDEO → AUDIO ---------- */

async function videoToAudio(file) {

  setProgress(15, "Loading video...");

  const video = document.createElement("video");

  video.muted = false;
  video.playsInline = true;
  video.preload = "auto";

  const url = URL.createObjectURL(file);

  video.src = url;


  await new Promise((resolve, reject) => {

    video.onloadedmetadata = resolve;

    video.onerror = () =>
      reject(
        new Error("Video could not be loaded.")
      );

  });


  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {

    URL.revokeObjectURL(url);

    throw new Error(
      "AudioContext is not supported."
    );

  }


  setProgress(30, "Preparing audio...");


  const audioContext = new AudioContext();

  const source =
    audioContext.createMediaElementSource(video);

  const destination =
    audioContext.createMediaStreamDestination();


  source.connect(destination);

  const audioTracks =
    destination.stream.getAudioTracks();


  if (!audioTracks.length) {

    source.disconnect();

    await audioContext.close();

    URL.revokeObjectURL(url);

    throw new Error(
      "This video does not contain an audio track."
    );

  }


  const stream =
    new MediaStream(audioTracks);


  let mimeType = "";

  const possibleTypes = [
    "audio/webm;codecs=opus",
    "audio/webm"
  ];


  for (const type of possibleTypes) {

    if (
      MediaRecorder.isTypeSupported(type)
    ) {

      mimeType = type;
      break;

    }

  }


  if (!mimeType) {

    source.disconnect();

    await audioContext.close();

    URL.revokeObjectURL(url);

    throw new Error(
      "This browser cannot export WebM audio."
    );

  }


  const recorder =
    new MediaRecorder(
      stream,
      { mimeType }
    );


  const chunks = [];


  recorder.ondataavailable = event => {

    if (event.data.size > 0) {
      chunks.push(event.data);
    }

  };


  const finished = new Promise(
    (resolve, reject) => {

      recorder.onstop = () => {

        resolve(
          new Blob(
            chunks,
            { type: mimeType }
          )
        );

      };

      recorder.onerror = event => {
        reject(event.error);
      };

    }
  );


  await video.play();

  recorder.start(250);


  const duration =
    Number.isFinite(video.duration)
      ? video.duration
      : 0;


  const progressTimer =
    setInterval(() => {

      if (duration > 0) {

        const percent =
          Math.min(
            90,
            30 +
            (video.currentTime / duration) * 55
          );

        setProgress(
          percent,
          "Extracting audio..."
        );

      }

    }, 200);


  await new Promise(resolve => {

    video.onended = resolve;

  });


  clearInterval(progressTimer);


  recorder.stop();

  const blob = await finished;


  source.disconnect();

  await audioContext.close();

  video.pause();

  URL.revokeObjectURL(url);


  setProgress(95, "Creating file...");


  const baseName =
    file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^\w\- ]/g, "");


  return {

    blob,

    name:
      `${baseName || "audio"}-voice.webm`

  };

}


/* ---------- PROGRESS ---------- */

function setProgress(percent, text) {

  percent = Math.max(
    0,
    Math.min(100, Math.round(percent))
  );

  progressBar.style.width = `${percent}%`;

  progressPercent.textContent =
    `${percent}%`;

  progressText.textContent =
    text;

}


/* ---------- DOWNLOAD ---------- */

downloadBtn.addEventListener("click", () => {

  if (!convertedBlob) {
    showToast("No converted file.");
    return;
  }


  if (downloadURL) {
    URL.revokeObjectURL(downloadURL);
  }


  downloadURL =
    URL.createObjectURL(
      convertedBlob
    );


  const link =
    document.createElement("a");

  link.href = downloadURL;
  link.download = convertedName;

  document.body.appendChild(link);

  link.click();

  link.remove();

});


/* ---------- FILE SIZE ---------- */

function formatBytes(bytes) {

  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
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
    parseFloat(
      (bytes / Math.pow(1024, index))
        .toFixed(2)
    ) +
    " " +
    units[index]
  );

}


/* ---------- INITIAL ---------- */

updateConverterUI();
updateTokens();

"use strict";

/*
  ConvertX
  Demo file converter
  - Fake Gmail login
  - 100 tokens for new users
  - Redeem codes
  - Admin panel
  - JPG ↔ PNG
  - Video → Audio
  - Audio → Video

  IMPORTANT:
  This is a client-side demo.
  It does NOT use real Google authentication.
  Data is stored in the browser's localStorage.
*/


/* =========================
   CONFIG
========================= */

const CONFIG = {
  ADMIN_EMAIL: "ffbbchfg@gmail.com",

  STORAGE: {
    USERS: "convertx_users_v3",
    CODES: "convertx_codes_v3",
    CURRENT_USER: "convertx_current_user_v3"
  },

  COSTS: {
    image: 5,
    "video-audio": 10,
    "audio-video": 10
  },

  LIMITS: {
    maxImageMB: 50,
    maxVideoMB: 500,
    maxAudioMB: 200
  }
};


/* =========================
   STATE
========================= */

const state = {
  converterType: "image",

  selectedFile: null,

  outputBlob: null,
  outputName: "",

  currentObjectURL: null,
  outputObjectURL: null,

  converting: false,

  mediaRecorder: null,
  mediaStreams: [],

  videoElement: null,
  audioElement: null,

  audioContext: null,
  animationFrame: null
};


/* =========================
   DOM
========================= */

const $ = (id) => document.getElementById(id);

const loginPage = $("loginPage");
const googleLoginButton = $("googleLoginButton");

const gmailModal = $("gmailModal");
const gmailInput = $("gmailInput");
const gmailContinueButton = $("gmailContinueButton");
const gmailCancelButton = $("gmailCancelButton");

const app = $("app");

const tokenCount = $("tokenCount");
const profileName = $("profileName");
const logoutButton = $("logoutButton");

const accountEmail = $("accountEmail");
const tokenDisplay = $("tokenDisplay");

const converterButtons = document.querySelectorAll(".converter-type");

const uploadArea = $("uploadArea");
const fileInput = $("fileInput");
const chooseFileButton = $("chooseFileButton");

const uploadTitle = $("uploadTitle");
const uploadDescription = $("uploadDescription");
const conversionCost = $("conversionCost");

const fileInfo = $("fileInfo");
const fileName = $("fileName");
const fileSize = $("fileSize");
const clearButton = $("clearButton");

const filePreview = $("filePreview");

const progressContainer = $("progressContainer");
const progress = $("progress");
const progressText = $("progressText");

const convertButton = $("convertButton");

const result = $("result");
const resultPreview = $("resultPreview");
const resultName = $("resultName");
const resultSize = $("resultSize");
const downloadButton = $("downloadButton");

const redeemCodeInput = $("redeemCodeInput");
const redeemButton = $("redeemButton");

const adminPanel = $("adminPanel");

const codeInput = $("codeInput");
const tokenInput = $("tokenInput");
const expireInput = $("expireInput");
const createCodeButton = $("createCodeButton");

const adminCodes = $("adminCodes");
const adminUsers = $("adminUsers");

const messageContainer = $("messageContainer");


/* =========================
   STORAGE
========================= */

function readJSON(key, fallback) {
  try {
    const data = localStorage.getItem(key);

    if (!data) {
      return fallback;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Storage read error:", error);
    return fallback;
  }
}


function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Storage write error:", error);
    showMessage("Could not save data.", "error");
    return false;
  }
}


function getUsers() {
  return readJSON(CONFIG.STORAGE.USERS, {});
}


function saveUsers(users) {
  return writeJSON(CONFIG.STORAGE.USERS, users);
}


function getCodes() {
  return readJSON(CONFIG.STORAGE.CODES, []);
}


function saveCodes(codes) {
  return writeJSON(CONFIG.STORAGE.CODES, codes);
}


function getCurrentEmail() {
  return localStorage.getItem(CONFIG.STORAGE.CURRENT_USER);
}


function setCurrentEmail(email) {
  localStorage.setItem(
    CONFIG.STORAGE.CURRENT_USER,
    email
  );
}


function clearCurrentEmail() {
  localStorage.removeItem(
    CONFIG.STORAGE.CURRENT_USER
  );
}


/* =========================
   HELPERS
========================= */

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}


function isGmail(email) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(email);
}


function randomString(length = 10) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let output = "";

  for (let i = 0; i < length; i++) {
    output += chars[
      Math.floor(Math.random() * chars.length)
    ];
  }

  return output;
}


function generateCode() {
  return "CX-" + randomString(10);
}


function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
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
    (bytes / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 2
    ) +
    " " +
    units[index]
  );
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function getCurrentUser() {
  const email = getCurrentEmail();

  if (!email) {
    return null;
  }

  const users = getUsers();

  return users[email] || null;
}


function isAdmin(email) {
  return normalizeEmail(email) ===
    normalizeEmail(CONFIG.ADMIN_EMAIL);
}


/* =========================
   NOTIFICATIONS
========================= */

function showMessage(text, type = "info") {
  if (!messageContainer) {
    return;
  }

  const message = document.createElement("div");

  message.className = "message";

  message.textContent = text;

  message.style.position = "fixed";
  message.style.right = "20px";
  message.style.bottom = "20px";
  message.style.zIndex = "9999";
  message.style.padding = "13px 17px";
  message.style.borderRadius = "10px";
  message.style.background =
    type === "error"
      ? "#3a1111"
      : type === "success"
        ? "#123a1d"
        : "#202020";
  message.style.color = "#fff";
  message.style.border = "1px solid #333";
  message.style.maxWidth = "320px";
  message.style.fontSize = "14px";

  messageContainer.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 3500);
}


/* =========================
   LOGIN
========================= */

function showLogin() {
  loginPage.classList.remove("hidden");
  app.classList.add("hidden");

  gmailModal.classList.add("hidden");
}


function showApp() {
  loginPage.classList.add("hidden");
  gmailModal.classList.add("hidden");
  app.classList.remove("hidden");

  renderUser();
}


function login(email) {
  email = normalizeEmail(email);

  if (!isGmail(email)) {
    showMessage(
      "Please enter a valid Gmail address.",
      "error"
    );

    return false;
  }

  const users = getUsers();

  if (!users[email]) {
    users[email] = {
      email: email,
      name: email.split("@")[0],
      tokens: 100,
      createdAt: Date.now()
    };

    saveUsers(users);

    showMessage(
      "Account created. You received 100 tokens!",
      "success"
    );
  }

  setCurrentEmail(email);

  showApp();

  return true;
}


function logout() {
  clearSelectedFile();
  clearOutput();

  clearCurrentEmail();

  showLogin();

  showMessage(
    "Logged out.",
    "info"
  );
}


/* =========================
   USER DISPLAY
========================= */

function renderUser() {
  const email = getCurrentEmail();
  const user = getCurrentUser();

  if (!email || !user) {
    showLogin();
    return;
  }

  const admin = isAdmin(email);

  accountEmail.textContent = email;

  profileName.textContent =
    user.name || email.split("@")[0];

  if (admin) {
    tokenCount.textContent = "∞";
    tokenDisplay.innerHTML = "🪙 ∞";
  } else {
    tokenCount.textContent =
      String(Math.max(0, Number(user.tokens) || 0));

    tokenDisplay.innerHTML =
      "🪙 " +
      escapeHTML(
        String(Math.max(0, Number(user.tokens) || 0))
      );
  }

  adminPanel.style.display =
    admin ? "block" : "none";

  renderAdmin();

  updateConvertButton();
}


/* =========================
   GMAIL GUI
========================= */

googleLoginButton.addEventListener(
  "click",
  () => {
    gmailModal.classList.remove("hidden");

    setTimeout(() => {
      gmailInput.focus();
    }, 100);
  }
);


gmailCancelButton.addEventListener(
  "click",
  () => {
    gmailModal.classList.add("hidden");
    gmailInput.value = "";
  }
);


gmailContinueButton.addEventListener(
  "click",
  () => {
    const email = gmailInput.value;

    if (login(email)) {
      gmailInput.value = "";
    }
  }
);


gmailInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      gmailContinueButton.click();
    }
  }
);


logoutButton.addEventListener(
  "click",
  logout
);


/* =========================
   CONVERTER UI
========================= */

function updateConverterUI() {
  const type = state.converterType;

  converterButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.converterType === type
    );
  });

  if (type === "image") {
    uploadTitle.textContent =
      "Upload JPG or PNG";

    uploadDescription.textContent =
      "Convert JPG to PNG or PNG to JPG";

    conversionCost.textContent =
      "5 tokens";
  }

  if (type === "video-audio") {
    uploadTitle.textContent =
      "Upload Video";

    uploadDescription.textContent =
      "Convert a video file to an audio file";

    conversionCost.textContent =
      "10 tokens";
  }

  if (type === "audio-video") {
    uploadTitle.textContent =
      "Upload Audio";

    uploadDescription.textContent =
      "Convert an audio file into a video";

    conversionCost.textContent =
      "10 tokens";
  }

  clearSelectedFile();
  clearOutput();
}


converterButtons.forEach((button) => {
  button.addEventListener(
    "click",
    () => {
      if (state.converting) {
        return;
      }

      state.converterType =
        button.dataset.converterType;

      updateConverterUI();
    }
  );
});


/* =========================
   FILE TYPES
========================= */

function getAllowedTypes() {
  if (state.converterType === "image") {
    return [
      "image/jpeg",
      "image/png"
    ];
  }

  if (state.converterType === "video-audio") {
    return [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime"
    ];
  }

  if (state.converterType === "audio-video") {
    return [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/webm",
      "audio/mp4",
      "audio/aac"
    ];
  }

  return [];
}


function getMaxFileSize() {
  if (state.converterType === "image") {
    return CONFIG.LIMITS.maxImageMB * 1024 * 1024;
  }

  if (state.converterType === "video-audio") {
    return CONFIG.LIMITS.maxVideoMB * 1024 * 1024;
  }

  return CONFIG.LIMITS.maxAudioMB * 1024 * 1024;
}


function validateFile(file) {
  if (!file) {
    return false;
  }

  const allowed = getAllowedTypes();

  const typeOkay =
    allowed.includes(file.type);

  if (!typeOkay) {
    showMessage(
      "This file type is not supported.",
      "error"
    );

    return false;
  }

  if (file.size > getMaxFileSize()) {
    showMessage(
      "This file is too large.",
      "error"
    );

    return false;
  }

  return true;
}


/* =========================
   FILE PICKER
========================= */

chooseFileButton.addEventListener(
  "click",
  (event) => {
    event.stopPropagation();
    fileInput.click();
  }
);


uploadArea.addEventListener(
  "click",
  (event) => {
    if (
      event.target === chooseFileButton ||
      state.converting
    ) {
      return;
    }

    fileInput.click();
  }
);


fileInput.addEventListener(
  "change",
  () => {
    const file = fileInput.files[0];

    if (file) {
      handleFile(file);
    }
  }
);


/* =========================
   DRAG & DROP
========================= */

["dragenter", "dragover"].forEach(
  (eventName) => {
    uploadArea.addEventListener(
      eventName,
      (event) => {
        event.preventDefault();

        if (!state.converting) {
          uploadArea.classList.add(
            "dragging"
          );
        }
      }
    );
  }
);


["dragleave", "drop"].forEach(
  (eventName) => {
    uploadArea.addEventListener(
      eventName,
      (event) => {
        event.preventDefault();

        uploadArea.classList.remove(
          "dragging"
        );
      }
    );
  }
);


uploadArea.addEventListener(
  "drop",
  (event) => {
    if (state.converting) {
      return;
    }

    const file =
      event.dataTransfer.files[0];

    if (file) {
      handleFile(file);
    }
  }
);


/* =========================
   HANDLE FILE
========================= */

function handleFile(file) {
  if (!validateFile(file)) {
    return;
  }

  clearOutput();

  if (state.currentObjectURL) {
    URL.revokeObjectURL(
      state.currentObjectURL
    );
  }

  state.currentObjectURL =
    URL.createObjectURL(file);

  state.selectedFile = file;

  fileName.textContent = file.name;
  fileSize.textContent =
    formatBytes(file.size);

  fileInfo.classList.remove("hidden");

  renderFilePreview();

  updateConvertButton();

  showMessage(
    "File selected.",
    "success"
  );
}


/* =========================
   PREVIEW
========================= */

function renderFilePreview() {
  filePreview.innerHTML = "";

  if (!state.selectedFile) {
    filePreview.style.display = "none";
    return;
  }

  const file = state.selectedFile;

  if (state.converterType === "image") {
    const image =
      document.createElement("img");

    image.className =
      "preview-image";

    image.src =
      state.currentObjectURL;

    image.alt =
      "Selected image";

    filePreview.appendChild(image);
  }

  if (state.converterType === "video-audio") {
    const video =
      document.createElement("video");

    video.className =
      "preview-video";

    video.src =
      state.currentObjectURL;

    video.controls = true;

    video.preload = "metadata";

    filePreview.appendChild(video);
  }

  if (state.converterType === "audio-video") {
    const audio =
      document.createElement("audio");

    audio.className =
      "preview-audio";

    audio.src =
      state.currentObjectURL;

    audio.controls = true;

    filePreview.appendChild(audio);
  }

  filePreview.style.display = "block";
}


/* =========================
   CLEAR FILE
========================= */

function clearSelectedFile() {
  stopMedia();

  state.selectedFile = null;

  fileInput.value = "";

  fileInfo.classList.add("hidden");

  filePreview.innerHTML = "";
  filePreview.style.display = "none";

  if (state.currentObjectURL) {
    URL.revokeObjectURL(
      state.currentObjectURL
    );

    state.currentObjectURL = null;
  }

  updateConvertButton();
}


clearButton.addEventListener(
  "click",
  clearSelectedFile
);


/* =========================
   OUTPUT
========================= */

function clearOutput() {
  state.outputBlob = null;
  state.outputName = "";

  if (state.outputObjectURL) {
    URL.revokeObjectURL(
      state.outputObjectURL
    );

    state.outputObjectURL = null;
  }

  resultPreview.innerHTML = "";

  result.style.display = "none";

  downloadButton.removeAttribute("href");
}


function showResult(blob, name) {
  state.outputBlob = blob;
  state.outputName = name;

  if (state.outputObjectURL) {
    URL.revokeObjectURL(
      state.outputObjectURL
    );
  }

  state.outputObjectURL =
    URL.createObjectURL(blob);

  resultName.textContent = name;

  resultSize.textContent =
    formatBytes(blob.size);

  resultPreview.innerHTML = "";

  if (blob.type.startsWith("image/")) {
    const image =
      document.createElement("img");

    image.className =
      "preview-image";

    image.src =
      state.outputObjectURL;

    image.alt =
      "Converted image";

    resultPreview.appendChild(image);
  }

  if (blob.type.startsWith("audio/")) {
    const audio =
      document.createElement("audio");

    audio.className =
      "preview-audio";

    audio.src =
      state.outputObjectURL;

    audio.controls = true;

    resultPreview.appendChild(audio);
  }

  if (blob.type.startsWith("video/")) {
    const video =
      document.createElement("video");

    video.className =
      "preview-video";

    video.src =
      state.outputObjectURL;

    video.controls = true;

    resultPreview.appendChild(video);
  }

  downloadButton.href =
    state.outputObjectURL;

  downloadButton.download =
    name;

  result.style.display = "block";
}


/* =========================
   TOKENS
========================= */

function getCost() {
  return CONFIG.COSTS[
    state.converterType
  ];
}


function hasEnoughTokens() {
  const email = getCurrentEmail();

  if (!email) {
    return false;
  }

  if (isAdmin(email)) {
    return true;
  }

  const user = getCurrentUser();

  if (!user) {
    return false;
  }

  return Number(user.tokens) >= getCost();
}


function spendTokens(amount) {
  const email = getCurrentEmail();

  if (!email) {
    return false;
  }

  if (isAdmin(email)) {
    return true;
  }

  const users = getUsers();

  if (!users[email]) {
    return false;
  }

  const current =
    Number(users[email].tokens) || 0;

  if (current < amount) {
    return false;
  }

  users[email].tokens =
    current - amount;

  saveUsers(users);

  renderUser();

  return true;
}


function updateConvertButton() {
  if (!convertButton) {
    return;
  }

  const enabled =
    Boolean(state.selectedFile) &&
    !state.converting &&
    hasEnoughTokens();

  convertButton.disabled = !enabled;

  if (
    state.selectedFile &&
    !hasEnoughTokens() &&
    !state.converting
  ) {
    convertButton.textContent =
      "Not Enough Tokens";
  } else if (!state.converting) {
    convertButton.textContent =
      "Convert";
  }
}


/* =========================
   PROGRESS
========================= */

function setProgress(value) {
  const safeValue =
    Math.max(
      0,
      Math.min(100, Number(value) || 0)
    );

  progress.value = safeValue;

  progressText.textContent =
    Math.round(safeValue) + "%";
}


function startProgress() {
  progressContainer.style.display =
    "flex";

  setProgress(0);
}


function finishProgress() {
  setProgress(100);

  setTimeout(() => {
    if (!state.converting) {
      progressContainer.style.display =
        "none";
    }
  }, 500);
}


/* =========================
   IMAGE CONVERSION
========================= */

function convertImage() {
  return new Promise(
    (resolve, reject) => {
      const file =
        state.selectedFile;

      const image =
        new Image();

      image.onload = () => {
        try {
          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            image.naturalWidth;

          canvas.height =
            image.naturalHeight;

          const context =
            canvas.getContext("2d");

          context.drawImage(
            image,
            0,
            0
          );

          const isJPG =
            file.type === "image/jpeg";

          const outputType =
            isJPG
              ? "image/png"
              : "image/jpeg";

          const extension =
            isJPG ? "png" : "jpg";

          setProgress(65);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(
                  new Error(
                    "Image conversion failed."
                  )
                );

                return;
              }

              resolve({
                blob,
                name:
                  getOutputName(
                    file.name,
                    extension
                  )
              });
            },
            outputType,
            0.92
          );
        } catch (error) {
          reject(error);
        }
      };

      image.onerror = () => {
        reject(
          new Error(
            "Could not read the image."
          )
        );
      };

      image.src =
        state.currentObjectURL;
    }
  );
}


/* =========================
   VIDEO → AUDIO
========================= */

function chooseAudioMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus"
  ];

  for (const type of types) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }

  return "";
}


function videoToAudio() {
  return new Promise(
    (resolve, reject) => {
      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        reject(
          new Error(
            "Your browser does not support audio recording."
          )
        );

        return;
      }

      const video =
        document.createElement("video");

      state.videoElement = video;

      video.src =
        state.currentObjectURL;

      video.muted = false;
      video.playsInline = true;
      video.preload = "auto";

      video.onloadedmetadata = async () => {
        try {
          if (
            typeof video.captureStream !==
            "function"
          ) {
            reject(
              new Error(
                "This browser does not support video capture."
              )
            );

            return;
          }

          const stream =
            video.captureStream();

          state.mediaStreams.push(stream);

          const audioTracks =
            stream.getAudioTracks();

          if (!audioTracks.length) {
            reject(
              new Error(
                "This video does not contain an audio track."
              )
            );

            return;
          }

          const audioStream =
            new MediaStream(
              audioTracks
            );

          const mime =
            chooseAudioMimeType();

          const recorder =
            mime
              ? new MediaRecorder(
                  audioStream,
                  { mimeType: mime }
                )
              : new MediaRecorder(
                  audioStream
                );

          state.mediaRecorder =
            recorder;

          const chunks = [];

          recorder.ondataavailable =
            (event) => {
              if (event.data.size > 0) {
                chunks.push(event.data);
              }
            };

          recorder.onerror =
            () => {
              reject(
                new Error(
                  "Audio recording failed."
                )
              );
            };

          recorder.onstop = () => {
            const finalType =
              mime ||
              chunks[0]?.type ||
              "audio/webm";

            const blob =
              new Blob(
                chunks,
                {
                  type: finalType
                }
              );

            resolve({
              blob,
              name:
                getOutputName(
                  state.selectedFile.name,
                  "webm"
                )
            });
          };

          video.onended = () => {
            setProgress(90);

            if (
              recorder.state !==
              "inactive"
            ) {
              recorder.stop();
            }
          };

          recorder.start(250);

          await video.play();

          setProgress(30);
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => {
        reject(
          new Error(
            "Could not read the video."
          )
        );
      };

      video.load();
    }
  );
}


/* =========================
   AUDIO → VIDEO
========================= */

function audioToVideo() {
  return new Promise(
    async (resolve, reject) => {
      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        reject(
          new Error(
            "Your browser does not support video recording."
          )
        );

        return;
      }

      const audio =
        document.createElement("audio");

      state.audioElement = audio;

      audio.src =
        state.currentObjectURL;

      audio.preload = "auto";

      try {
        await new Promise(
          (res, rej) => {
            audio.onloadedmetadata = res;
            audio.onerror = () =>
              rej(
                new Error(
                  "Could not read the audio."
                )
              );

            audio.load();
          }
        );

        const canvas =
          document.createElement("canvas");

        canvas.width = 1280;
        canvas.height = 720;

        const context =
          canvas.getContext("2d");

        const canvasStream =
          canvas.captureStream(30);

        state.mediaStreams.push(
          canvasStream
        );

        const AudioContextClass =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContextClass) {
          throw new Error(
            "Web Audio is not supported."
          );
        }

        const audioContext =
          new AudioContextClass();

        state.audioContext =
          audioContext;

        const source =
          audioContext.createMediaElementSource(
            audio
          );

        const destination =
          audioContext.createMediaStreamDestination();

        source.connect(destination);

        const audioTracks =
          destination.stream.getAudioTracks();

        audioTracks.forEach(
          (track) => {
            canvasStream.addTrack(track);
          }
        );

        const mimeOptions = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm"
        ];

        let mime = "";

        for (const type of mimeOptions) {
          if (
            MediaRecorder.isTypeSupported &&
            MediaRecorder.isTypeSupported(type)
          ) {
            mime = type;
            break;
          }
        }

        const recorder =
          mime
            ? new MediaRecorder(
                canvasStream,
                { mimeType: mime }
              )
            : new MediaRecorder(
                canvasStream
              );

        state.mediaRecorder =
          recorder;

        const chunks = [];

        recorder.ondataavailable =
          (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

        recorder.onerror =
          () => {
            reject(
              new Error(
                "Video recording failed."
              )
            );
          };

        recorder.onstop = () => {
          if (state.animationFrame) {
            cancelAnimationFrame(
              state.animationFrame
            );

            state.animationFrame = null;
          }

          const blob =
            new Blob(
              chunks,
              {
                type:
                  mime ||
                  "video/webm"
              }
            );

          resolve({
            blob,
            name:
              getOutputName(
                state.selectedFile.name,
                "webm"
              )
          });
        };

        function drawFrame() {
          context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          context.fillStyle =
            "#080808";

          context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          context.fillStyle =
            "#ffffff";

          context.textAlign =
            "center";

          context.textBaseline =
            "middle";

          context.font =
            "bold 48px Arial";

          context.fillText(
            "ConvertX",
            canvas.width / 2,
            canvas.height / 2 - 35
          );

          context.font =
            "24px Arial";

          context.fillStyle =
            "#999999";

          context.fillText(
            "Audio → Video",
            canvas.width / 2,
            canvas.height / 2 + 25
          );

          const current =
            audio.currentTime || 0;

          const duration =
            audio.duration || 1;

          const percent =
            Math.min(
              90,
              (current / duration) * 90
            );

          setProgress(percent);

          state.animationFrame =
            requestAnimationFrame(
              drawFrame
            );
        }

        audio.onended = () => {
          setProgress(90);

          if (
            recorder.state !==
            "inactive"
          ) {
            recorder.stop();
          }
        };

        recorder.start(250);

        if (
          audioContext.state ===
          "suspended"
        ) {
          await audioContext.resume();
        }

        drawFrame();

        await audio.play();
      } catch (error) {
        reject(error);
      }
    }
  );
}


/* =========================
   OUTPUT NAME
========================= */

function getOutputName(
  originalName,
  extension
) {
  const cleanName =
    originalName.replace(
      /\.[^/.]+$/,
      ""
    );

  return (
    cleanName +
    "_converted." +
    extension
  );
}


/* =========================
   MAIN CONVERSION
========================= */

async function performConversion() {
  if (state.converting) {
    return;
  }

  if (!state.selectedFile) {
    showMessage(
      "Choose a file first.",
      "error"
    );

    return;
  }

  if (!hasEnoughTokens()) {
    showMessage(
      "You don't have enough tokens.",
      "error"
    );

    return;
  }

  state.converting = true;

  clearOutput();

  convertButton.disabled = true;

  convertButton.textContent =
    "Converting...";

  startProgress();

  try {
    let converted;

    setProgress(10);

    if (
      state.converterType ===
      "image"
    ) {
      converted =
        await convertImage();
    }

    if (
      state.converterType ===
      "video-audio"
    ) {
      converted =
        await videoToAudio();
    }

    if (
      state.converterType ===
      "audio-video"
    ) {
      converted =
        await audioToVideo();
    }

    if (!converted || !converted.blob) {
      throw new Error(
        "Conversion failed."
      );
    }

    setProgress(95);

    /*
      Tokens are only removed after
      a successful conversion.
    */
    if (!spendTokens(getCost())) {
      throw new Error(
        "Could not charge tokens."
      );
    }

    showResult(
      converted.blob,
      converted.name
    );

    finishProgress();

    showMessage(
      isAdmin(getCurrentEmail())
        ? "Conversion complete!"
        : `Conversion complete! ${getCost()} tokens used.`,
      "success"
    );
  } catch (error) {
    console.error(error);

    progressContainer.style.display =
      "none";

    showMessage(
      error.message ||
        "Conversion failed.",
      "error"
    );
  } finally {
    state.converting = false;

    stopMedia();

    updateConvertButton();
  }
}


convertButton.addEventListener(
  "click",
  performConversion
);


/* =========================
   MEDIA CLEANUP
========================= */

function stopMedia() {
  if (state.mediaRecorder) {
    try {
      if (
        state.mediaRecorder.state !==
        "inactive"
      ) {
        state.mediaRecorder.stop();
      }
    } catch (error) {
      console.warn(
        "Recorder cleanup:",
        error
      );
    }
  }

  state.mediaRecorder = null;

  state.mediaStreams.forEach(
    (stream) => {
      stream.getTracks().forEach(
        (track) => {
          try {
            track.stop();
          } catch (_) {}
        }
      );
    }
  );

  state.mediaStreams = [];

  if (state.animationFrame) {
    cancelAnimationFrame(
      state.animationFrame
    );

    state.animationFrame = null;
  }

  if (state.videoElement) {
    try {
      state.videoElement.pause();
      state.videoElement.src = "";
    } catch (_) {}
  }

  if (state.audioElement) {
    try {
      state.audioElement.pause();
      state.audioElement.src = "";
    } catch (_) {}
  }

  state.videoElement = null;
  state.audioElement = null;

  if (state.audioContext) {
    try {
      state.audioContext.close();
    } catch (_) {}
  }

  state.audioContext = null;
}


/* =========================
   REDEEM
========================= */

function redeemCode() {
  const email =
    getCurrentEmail();

  if (!email) {
    return;
  }

  const code =
    redeemCodeInput.value
      .trim()
      .toUpperCase();

  if (!code) {
    showMessage(
      "Enter a redeem code.",
      "error"
    );

    return;
  }

  const codes = getCodes();

  const found =
    codes.find(
      (item) =>
        String(item.code)
          .toUpperCase() === code
    );

  if (!found) {
    showMessage(
      "Invalid redeem code.",
      "error"
    );

    return;
  }

  if (found.used) {
    showMessage(
      "This code has already been used.",
      "error"
    );

    return;
  }

  if (
    found.expiresAt &&
    Date.now() >
      Number(found.expiresAt)
  ) {
    showMessage(
      "This code has expired.",
      "error"
    );

    return;
  }

  const users = getUsers();

  if (!users[email]) {
    return;
  }

  const amount =
    Math.max(
      1,
      Number(found.tokens) || 0
    );

  users[email].tokens =
    (Number(users[email].tokens) || 0) +
    amount;

  found.used = true;
  found.usedBy = email;
  found.usedAt = Date.now();

  saveUsers(users);
  saveCodes(codes);

  redeemCodeInput.value = "";

  renderUser();

  showMessage(
    `Redeemed successfully! +${amount} tokens.`,
    "success"
  );
}


redeemButton.addEventListener(
  "click",
  redeemCode
);


redeemCodeInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      redeemCode();
    }
  }
);


/* =========================
   ADMIN
========================= */

function createRedeemCode() {
  const email =
    getCurrentEmail();

  if (!isAdmin(email)) {
    showMessage(
      "Admin access required.",
      "error"
    );

    return;
  }

  let code =
    codeInput.value.trim().toUpperCase();

  const tokens =
    Number(tokenInput.value);

  if (!tokens || tokens < 1) {
    showMessage(
      "Enter a valid token amount.",
      "error"
    );

    return;
  }

  if (!code) {
    code = generateCode();
  }

  if (!/^[A-Z0-9_-]+$/.test(code)) {
    showMessage(
      "Code can only use letters, numbers, _ or -.",
      "error"
    );

    return;
  }

  const codes = getCodes();

  const exists =
    codes.some(
      (item) =>
        String(item.code)
          .toUpperCase() === code
    );

  if (exists) {
    showMessage(
      "That code already exists.",
      "error"
    );

    return;
  }

  let expiresAt = null;

  if (expireInput.value) {
    const date =
      new Date(expireInput.value);

    if (Number.isNaN(date.getTime())) {
      showMessage(
        "Invalid expiration date.",
        "error"
      );

      return;
    }

    expiresAt =
      date.getTime();
  }

  codes.push({
    code: code,
    tokens: Math.floor(tokens),
    expiresAt: expiresAt,
    createdAt: Date.now(),
    used: false,
    usedBy: null,
    usedAt: null
  });

  saveCodes(codes);

  codeInput.value = "";
  tokenInput.value = "";
  expireInput.value = "";

  renderAdmin();

  showMessage(
    `Code created: ${code}`,
    "success"
  );
}


createCodeButton.addEventListener(
  "click",
  createRedeemCode
);


/* =========================
   DELETE ADMIN CODE
========================= */

function deleteRedeemCode(code) {
  const email =
    getCurrentEmail();

  if (!isAdmin(email)) {
    return;
  }

  const codes = getCodes();

  const filtered =
    codes.filter(
      (item) =>
        item.code !== code
    );

  saveCodes(filtered);

  renderAdmin();

  showMessage(
    "Code deleted.",
    "success"
  );
}


/* =========================
   ADMIN USER TOKENS
========================= */

function changeUserTokens(
  email,
  amount,
  mode
) {
  const adminEmail =
    getCurrentEmail();

  if (!isAdmin(adminEmail)) {
    return;
  }

  const users = getUsers();

  if (!users[email]) {
    return;
  }

  const current =
    Number(users[email].tokens) || 0;

  if (mode === "add") {
    users[email].tokens =
      Math.max(
        0,
        current + amount
      );
  }

  if (mode === "set") {
    users[email].tokens =
      Math.max(
        0,
        amount
      );
  }

  saveUsers(users);

  renderUser();
  renderAdmin();

  showMessage(
    "User tokens updated.",
    "success"
  );
}


/* =========================
   ADMIN DISPLAY
========================= */

function renderAdmin() {
  const email =
    getCurrentEmail();

  if (!isAdmin(email)) {
    adminPanel.style.display =
      "none";

    return;
  }

  adminPanel.style.display =
    "block";

  renderAdminCodes();
  renderAdminUsers();
}


function renderAdminCodes() {
  const codes = getCodes();

  if (!codes.length) {
    adminCodes.textContent =
      "No token codes yet.";

    return;
  }

  adminCodes.innerHTML = "";

  codes
    .slice()
    .reverse()
    .forEach(
      (item) => {
        const row =
          document.createElement(
            "div"
          );

        row.className =
          "admin-code-row";

        let status = "Unused";

        if (item.used) {
          status =
            "Used by " +
            item.usedBy;
        } else if (
          item.expiresAt &&
          Date.now() >
            Number(item.expiresAt)
        ) {
          status = "Expired";
        }

        const left =
          document.createElement(
            "div"
          );

        left.innerHTML = `
          <strong>${escapeHTML(
            item.code
          )}</strong>
          <div style="margin-top:5px;color:#888;font-size:12px;">
            ${Number(item.tokens) || 0} tokens
            • ${escapeHTML(status)}
          </div>
        `;

        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.className =
          "delete-code";

        deleteButton.textContent =
          "Delete";

        deleteButton.addEventListener(
          "click",
          () => {
            deleteRedeemCode(
              item.code
            );
          }
        );

        row.appendChild(left);
        row.appendChild(
          deleteButton
        );

        adminCodes.appendChild(row);
      }
    );
}


function renderAdminUsers() {
  const users = getUsers();

  const emails =
    Object.keys(users);

  if (!emails.length) {
    adminUsers.textContent =
      "No users yet.";

    return;
  }

  adminUsers.innerHTML = "";

  emails.forEach(
    (email) => {
      const user =
        users[email];

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "admin-user-row";

      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:15px;align-items:center;flex-wrap:wrap;">
          <div>
            <strong>${escapeHTML(
              email
            )}</strong>
            <div style="margin-top:5px;color:#888;font-size:12px;">
              Tokens: ${
                isAdmin(email)
                  ? "∞"
                  : Number(user.tokens) || 0
              }
            </div>
          </div>

          ${
            isAdmin(email)
              ? ""
              : `
                <div style="display:flex;gap:7px;flex-wrap:wrap;">
                  <button
                    class="admin-add-token"
                    data-email="${escapeHTML(email)}"
                  >
                    +10
                  </button>

                  <button
                    class="admin-add-token"
                    data-email="${escapeHTML(email)}"
                    data-amount="100"
                  >
                    +100
                  </button>

                  <button
                    class="admin-set-token"
                    data-email="${escapeHTML(email)}"
                  >
                    Set
                  </button>
                </div>
              `
          }
        </div>
      `;

      adminUsers.appendChild(row);
    }
  );


  adminUsers
    .querySelectorAll(
      ".admin-add-token"
    )
    .forEach(
      (button) => {
        button.style.border =
          "1px solid #333";

        button.style.borderRadius =
          "7px";

        button.style.padding =
          "7px 10px";

        button.style.background =
          "#181818";

        button.style.color =
          "#fff";

        button.addEventListener(
          "click",
          () => {
            const email =
              button.dataset.email;

            const amount =
              Number(
                button.dataset.amount ||
                10
              );

            changeUserTokens(
              email,
              amount,
              "add"
            );
          }
        );
      }
    );


  adminUsers
    .querySelectorAll(
      ".admin-set-token"
    )
    .forEach(
      (button) => {
        button.style.border =
          "1px solid #333";

        button.style.borderRadius =
          "7px";

        button.style.padding =
          "7px 10px";

        button.style.background =
          "#181818";

        button.style.color =
          "#fff";

        button.addEventListener(
          "click",
          () => {
            const email =
              button.dataset.email;

            const value =
              prompt(
                "Set token amount:"
              );

            if (value === null) {
              return;
            }

            const amount =
              Number(value);

            if (
              !Number.isFinite(amount) ||
              amount < 0
            ) {
              showMessage(
                "Invalid token amount.",
                "error"
              );

              return;
            }

            changeUserTokens(
              email,
              Math.floor(amount),
              "set"
            );
          }
        );
      }
    );
}


/* =========================
   PAGE START
========================= */

function init() {
  updateConverterUI();

  const email =
    getCurrentEmail();

  if (email && getCurrentUser()) {
    showApp();
  } else {
    showLogin();
  }
}


/* =========================
   CLEANUP
========================= */

window.addEventListener(
  "beforeunload",
  () => {
    stopMedia();

    if (state.currentObjectURL) {
      URL.revokeObjectURL(
        state.currentObjectURL
      );
    }

    if (state.outputObjectURL) {
      URL.revokeObjectURL(
        state.outputObjectURL
      );
    }
  }
);


/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  init
);


/* Optional debugging access */
window.ConvertX = {
  getUsers,
  getCodes,
  getCurrentUser,
  logout
};

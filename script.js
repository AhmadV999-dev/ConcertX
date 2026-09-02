"use strict";

/* =========================================================
   CONVERTX v3.0.0
   Local/demo converter
   No Firebase
   No real Google login
   No passwords
========================================================= */

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
  },

  VERSION: "3.0.0"
};

const state = {
  converterType: "image",
  selectedFile: null,
  outputBlob: null,
  outputName: "",
  converting: false,
  currentObjectURL: null,
  outputObjectURL: null,
  videoElement: null,
  audioElement: null,
  mediaRecorder: null,
  mediaStreams: []
};

/* =========================================================
   HELPERS
========================================================= */

const $ = id => document.getElementById(id);

function all(selector) {
  return [...document.querySelectorAll(selector)];
}

/* =========================================================
   STORAGE
========================================================= */

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readJSON(CONFIG.STORAGE.USERS, {});
}

function saveUsers(users) {
  writeJSON(CONFIG.STORAGE.USERS, users);
}

function getCodes() {
  return readJSON(CONFIG.STORAGE.CODES, {});
}

function saveCodes(codes) {
  writeJSON(CONFIG.STORAGE.CODES, codes);
}

function getCurrentEmail() {
  return localStorage.getItem(CONFIG.STORAGE.CURRENT_USER);
}

function setCurrentEmail(email) {
  localStorage.setItem(CONFIG.STORAGE.CURRENT_USER, email);
}

function clearCurrentEmail() {
  localStorage.removeItem(CONFIG.STORAGE.CURRENT_USER);
}

/* =========================================================
   USER SYSTEM
========================================================= */

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
}

function randomID() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return (
    "cx_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2)
  );
}

function getUser(email = getCurrentEmail()) {
  if (!email) return null;

  const users = getUsers();

  return users[normalizeEmail(email)] || null;
}

function isAdmin(user) {
  if (!user) return false;

  return (
    user.admin === true ||
    normalizeEmail(user.email) ===
      normalizeEmail(CONFIG.ADMIN_EMAIL)
  );
}

function createUser(email) {
  email = normalizeEmail(email);

  const users = getUsers();

  if (users[email]) {
    return users[email];
  }

  const admin =
    email === normalizeEmail(CONFIG.ADMIN_EMAIL);

  const name =
    email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .trim() || "User";

  const user = {
    id: randomID(),

    email,

    name,

    tokens: admin ? 0 : 100,

    admin,

    createdAt: Date.now(),

    lastLogin: Date.now(),

    permissions: {
      converter: true,
      redeem: true,
      adminPanel: admin
    },

    usage: {
      image: 0,
      "video-audio": 0,
      "audio-video": 0
    }
  };

  users[email] = user;

  saveUsers(users);

  return user;
}

/* =========================================================
   LOGIN
========================================================= */

function login(email) {
  email = normalizeEmail(email);

  if (!email) {
    showMessage(
      "Login",
      "Enter your Gmail address first.",
      "error"
    );

    return false;
  }

  if (!isGmail(email)) {
    showMessage(
      "Invalid Gmail",
      "Use a Gmail address ending with @gmail.com.",
      "error"
    );

    return false;
  }

  let user = getUser(email);

  if (!user) {
    user = createUser(email);

    showMessage(
      "Welcome",
      "Your new account received 100 tokens.",
      "success"
    );
  } else {
    const users = getUsers();

    users[email].lastLogin = Date.now();

    saveUsers(users);
  }

  setCurrentEmail(email);

  showApp();

  return true;
}

function logout() {
  cleanupMedia();

  clearCurrentEmail();

  state.selectedFile = null;
  state.outputBlob = null;
  state.outputName = "";

  showLogin();
}

/* =========================================================
   PAGE
========================================================= */

function showLogin() {
  const loginPage = $("loginPage");
  const app = $("app");

  if (loginPage) {
    loginPage.style.display = "flex";
  }

  if (app) {
    app.style.display = "none";
  }
}

function showApp() {
  const user = getUser();

  if (!user) {
    showLogin();
    return;
  }

  const loginPage = $("loginPage");
  const app = $("app");

  if (loginPage) {
    loginPage.style.display = "none";
  }

  if (app) {
    app.style.display = "block";
  }

  renderUser();

  applyPermissions();

  if (isAdmin(user)) {
    showAdminPanel();
  } else {
    hideAdminPanel();
  }

  updateConverterUI();
}

/* =========================================================
   USER UI
========================================================= */

function renderUser() {
  const user = getUser();

  if (!user) return;

  const admin = isAdmin(user);

  const tokenText = admin
    ? "∞ Tokens"
    : `${Math.max(0, Number(user.tokens || 0))} Tokens`;

  all(
    "#tokenCount, .token-count, [data-token-count]"
  ).forEach(element => {
    element.textContent = tokenText;
  });

  all(
    "#userEmail, .user-email, [data-user-email]"
  ).forEach(element => {
    element.textContent = user.email;
  });

  all(
    "#userName, .user-name, [data-user-name]"
  ).forEach(element => {
    element.textContent = user.name;
  });

  const initial =
    user.name.trim().charAt(0).toUpperCase() || "U";

  all(
    "#avatar, .avatar, [data-avatar]"
  ).forEach(element => {
    element.textContent = initial;
  });

  all(
    "#accountEmail, [data-account-email]"
  ).forEach(element => {
    element.textContent = user.email;
  });

  all(
    "#accountTokens, [data-account-tokens]"
  ).forEach(element => {
    element.textContent = tokenText;
  });
}

/* =========================================================
   PERMISSIONS
========================================================= */

function applyPermissions() {
  const user = getUser();

  if (!user) return;

  const converterAllowed =
    !user.permissions ||
    user.permissions.converter !== false;

  const redeemAllowed =
    !user.permissions ||
    user.permissions.redeem !== false;

  const converter =
    $("converterSection") ||
    document.querySelector(".converter");

  const redeem =
    $("redeemSection") ||
    document.querySelector(".redeem-section");

  if (converter) {
    converter.style.display =
      converterAllowed ? "" : "none";
  }

  if (redeem) {
    redeem.style.display =
      redeemAllowed ? "" : "none";
  }
}

/* =========================================================
   CONVERTER TYPES
========================================================= */

function setConverterType(type) {
  if (!CONFIG.COSTS[type]) {
    return;
  }

  const user = getUser();

  if (
    user &&
    user.permissions &&
    user.permissions.converter === false
  ) {
    showMessage(
      "Disabled",
      "Converter access is disabled for this account.",
      "error"
    );

    return;
  }

  cleanupMedia();

  state.converterType = type;
  state.selectedFile = null;
  state.outputBlob = null;
  state.outputName = "";

  all("[data-type]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.type === type
    );
  });

  updateConverterUI();

  clearFileUI();
}

function updateConverterUI() {
  const info = {
    image: {
      title: "Upload JPG or PNG",
      description:
        "Convert JPG to PNG or PNG to JPG",
      accept: ".jpg,.jpeg,.png",
      cost: "5 tokens"
    },

    "video-audio": {
      title: "Upload a video",
      description:
        "Extract the audio from your video",
      accept: "video/*",
      cost: "10 tokens"
    },

    "audio-video": {
      title: "Upload audio",
      description:
        "Create a dark video using your audio",
      accept: "audio/*",
      cost: "10 tokens"
    }
  };

  const data = info[state.converterType];

  if (!data) return;

  if ($("uploadTitle")) {
    $("uploadTitle").textContent = data.title;
  }

  if ($("uploadText")) {
    $("uploadText").textContent =
      `${data.description} · ${data.cost}`;
  }

  if ($("fileInput")) {
    $("fileInput").accept = data.accept;
  }

  all("[data-cost]").forEach(element => {
    element.textContent = data.cost;
  });
}

/* =========================================================
   FILE VALIDATION
========================================================= */

function getMaxSize(type) {
  if (type === "image") {
    return CONFIG.LIMITS.maxImageMB * 1024 * 1024;
  }

  if (type === "video-audio") {
    return CONFIG.LIMITS.maxVideoMB * 1024 * 1024;
  }

  return CONFIG.LIMITS.maxAudioMB * 1024 * 1024;
}

function isSupportedFile(file) {
  if (!file) return false;

  if (file.size > getMaxSize(state.converterType)) {
    return false;
  }

  if (state.converterType === "image") {
    return [
      "image/jpeg",
      "image/png"
    ].includes(file.type);
  }

  if (state.converterType === "video-audio") {
    return file.type.startsWith("video/");
  }

  if (state.converterType === "audio-video") {
    return file.type.startsWith("audio/");
  }

  return false;
}

function handleFile(file) {
  if (!file) return;

  if (!isSupportedFile(file)) {
    const maxMB =
      getMaxSize(state.converterType) /
      1024 /
      1024;

    showMessage(
      "Unsupported file",
      `This file isn't supported or is larger than ${maxMB} MB.`,
      "error"
    );

    return;
  }

  cleanupPreview();

  state.selectedFile = file;
  state.outputBlob = null;
  state.outputName = "";

  renderFile(file);
}

/* =========================================================
   FILE UI
========================================================= */

function renderFile(file) {
  const info = $("fileInfo");
  const name = $("fileName");
  const size = $("fileSize");
  const preview = $("preview");

  if (info) {
    info.style.display = "block";
  }

  if (name) {
    name.textContent = file.name;
  }

  if (size) {
    size.textContent =
      `${formatBytes(file.size)} · ${file.type || "Unknown type"}`;
  }

  if (!preview) return;

  cleanupPreview();

  const url = URL.createObjectURL(file);

  state.currentObjectURL = url;

  preview.innerHTML = "";

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");

    img.src = url;
    img.alt = "Image preview";

    preview.appendChild(img);
  }

  if (file.type.startsWith("video/")) {
    const video = document.createElement("video");

    video.src = url;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";

    preview.appendChild(video);
  }

  if (file.type.startsWith("audio/")) {
    const audio = document.createElement("audio");

    audio.src = url;
    audio.controls = true;
    audio.preload = "metadata";

    preview.appendChild(audio);
  }
}

function clearFileUI() {
  cleanupPreview();

  if ($("fileInfo")) {
    $("fileInfo").style.display = "none";
  }

  if ($("preview")) {
    $("preview").innerHTML = "";
  }

  if ($("result")) {
    $("result").style.display = "none";
  }

  if ($("fileInput")) {
    $("fileInput").value = "";
  }

  if ($("downloadButton")) {
    $("downloadButton").removeAttribute("href");
    $("downloadButton").removeAttribute("download");
  }
}

function cleanupPreview() {
  if (state.currentObjectURL) {
    URL.revokeObjectURL(
      state.currentObjectURL
    );

    state.currentObjectURL = null;
  }
}

/* =========================================================
   FORMAT
========================================================= */

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
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    ),
    units.length - 1
  );

  return (
    (bytes /
      Math.pow(1024, index)
    ).toFixed(index === 0 ? 0 : 2)
    +
    " " +
    units[index]
  );
}

function getBaseName(filename) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(
      /[<>:"/\\|?*\x00-\x1F]/g,
      "_"
    );
}

/* =========================================================
   TOKENS
========================================================= */

function canUseConverter() {
  const user = getUser();

  if (!user) {
    showMessage(
      "Login required",
      "Login before converting files.",
      "error"
    );

    return false;
  }

  if (
    user.permissions &&
    user.permissions.converter === false
  ) {
    showMessage(
      "Access denied",
      "Converter permission is disabled.",
      "error"
    );

    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  const cost =
    CONFIG.COSTS[state.converterType];

  const tokens =
    Number(user.tokens || 0);

  if (tokens < cost) {
    showMessage(
      "Not enough tokens",
      `This conversion costs ${cost} tokens. You have ${tokens}.`,
      "error"
    );

    return false;
  }

  return true;
}

function spendTokens(amount) {
  const user = getUser();

  if (!user || isAdmin(user)) {
    return;
  }

  const users = getUsers();

  const email =
    normalizeEmail(user.email);

  if (!users[email]) {
    return;
  }

  users[email].tokens =
    Math.max(
      0,
      Number(users[email].tokens || 0) -
        Number(amount || 0)
    );

  if (!users[email].usage) {
    users[email].usage = {};
  }

  users[email].usage[state.converterType] =
    Number(
      users[email].usage[state.converterType] || 0
    ) + 1;

  saveUsers(users);

  renderUser();
}

/* =========================================================
   CONVERT
========================================================= */

async function convertFile() {
  if (state.converting) return;

  if (!state.selectedFile) {
    showMessage(
      "No file",
      "Upload a file first.",
      "error"
    );

    return;
  }

  if (!canUseConverter()) {
    return;
  }

  state.converting = true;

  setConvertButton(true);

  showProgress(5);

  try {
    if (state.converterType === "image") {
      await convertImage();
    }

    else if (
      state.converterType === "video-audio"
    ) {
      await convertVideoToAudio();
    }

    else if (
      state.converterType === "audio-video"
    ) {
      await convertAudioToVideo();
    }
  }

  catch (error) {
    console.error(
      "ConvertX error:",
      error
    );

    showMessage(
      "Conversion failed",
      error.message ||
        "Something went wrong during conversion.",
      "error"
    );

    cleanupMedia();
  }

  finally {
    state.converting = false;

    setConvertButton(false);

    showProgress(0);
  }
}

/* =========================================================
   IMAGE
========================================================= */

function convertImage() {
  return new Promise(
    (resolve, reject) => {
      const file =
        state.selectedFile;

      const image =
        new Image();

      const url =
        URL.createObjectURL(file);

      image.onload = () => {
        try {
          showProgress(30);

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            image.naturalWidth;

          canvas.height =
            image.naturalHeight;

          const ctx =
            canvas.getContext("2d");

          if (!ctx) {
            throw new Error(
              "Canvas is not supported."
            );
          }

          const toPNG =
            file.type ===
            "image/jpeg";

          if (!toPNG) {
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

          showProgress(70);

          const mime =
            toPNG
              ? "image/png"
              : "image/jpeg";

          canvas.toBlob(
            blob => {
              URL.revokeObjectURL(
                url
              );

              if (!blob) {
                reject(
                  new Error(
                    "Browser could not create the image."
                  )
                );

                return;
              }

              state.outputBlob =
                blob;

              state.outputName =
                `${getBaseName(file.name)}.${toPNG ? "png" : "jpg"}`;

              spendTokens(
                CONFIG.COSTS.image
              );

              showProgress(100);

              showResult();

              resolve();
            },
            mime,
            0.94
          );
        }

        catch (error) {
          URL.revokeObjectURL(url);

          reject(error);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);

        reject(
          new Error(
            "Could not read this image."
          )
        );
      };

      image.src = url;
    }
  );
}

/* =========================================================
   VIDEO → AUDIO
========================================================= */

async function convertVideoToAudio() {
  const file =
    state.selectedFile;

  if (!window.MediaRecorder) {
    throw new Error(
      "Your browser does not support MediaRecorder."
    );
  }

  const video =
    document.createElement("video");

  state.videoElement =
    video;

  const url =
    URL.createObjectURL(file);

  state.currentObjectURL =
    url;

  video.src = url;

  video.preload = "auto";

  video.playsInline = true;

  await waitForMetadata(video);

  if (
    !video.duration ||
    !Number.isFinite(video.duration)
  ) {
    throw new Error(
      "Could not read video duration."
    );
  }

  showProgress(20);

  let stream;

  if (
    typeof video.captureStream ===
    "function"
  ) {
    stream =
      video.captureStream();
  }

  else if (
    typeof video.mozCaptureStream ===
    "function"
  ) {
    stream =
      video.mozCaptureStream();
  }

  else {
    throw new Error(
      "This browser cannot capture video audio."
    );
  }

  const audioTracks =
    stream.getAudioTracks();

  if (!audioTracks.length) {
    throw new Error(
      "This video does not contain an audio track."
    );
  }

  const audioStream =
    new MediaStream(
      audioTracks
    );

  state.mediaStreams.push(
    stream,
    audioStream
  );

  const mime =
    chooseMime([
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus"
    ]);

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
    event => {
      if (
        event.data &&
        event.data.size > 0
      ) {
        chunks.push(
          event.data
        );
      }
    };

  const finished =
    new Promise(
      (resolve, reject) => {
        recorder.onerror = () => {
          reject(
            new Error(
              "Audio recording failed

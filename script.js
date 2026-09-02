// ConvertX - script.js
// Demo/local system. No real Google login or passwords.

const ADMIN_EMAIL = "ffbbchfg@gmail.com";

const COSTS = {
  image: 5,
  "video-audio": 10,
  "audio-video": 10
};

const KEYS = {
  users: "convertx_users",
  codes: "convertx_codes",
  current: "convertx_current_user"
};

let selectedType = "image";
let selectedFile = null;
let convertedBlob = null;
let convertedName = "";

const $ = id => document.getElementById(id);

function getUsers() {
  return JSON.parse(localStorage.getItem(KEYS.users) || "{}");
}

function saveUsers(users) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

function getCodes() {
  return JSON.parse(localStorage.getItem(KEYS.codes) || "{}");
}

function saveCodes(codes) {
  localStorage.setItem(KEYS.codes, JSON.stringify(codes));
}

function getCurrentEmail() {
  return localStorage.getItem(KEYS.current);
}

function getCurrentUser() {
  const email = getCurrentEmail();
  if (!email) return null;

  const users = getUsers();
  return users[email] || null;
}

function isAdmin(user) {
  return user && (
    user.admin === true ||
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   LOGIN
========================= */

function login(email) {
  email = email.trim().toLowerCase();

  if (!email.endsWith("@gmail.com")) {
    alert("Please enter a Gmail address.");
    return;
  }

  const users = getUsers();

  if (!users[email]) {
    users[email] = {
      email,
      name: email.split("@")[0],
      tokens: 100,
      admin: email === ADMIN_EMAIL.toLowerCase(),
      permissions: {
        converter: true,
        redeem: true,
        adminPanel: email === ADMIN_EMAIL.toLowerCase()
      },
      createdAt: Date.now()
    };
  }

  localStorage.setItem(KEYS.current, email);
  saveUsers(users);

  showApp();
}

function logout() {
  localStorage.removeItem(KEYS.current);
  selectedFile = null;
  convertedBlob = null;

  showLogin();
}

function showLogin() {
  const loginPage = $("loginPage");
  const app = $("app");

  if (loginPage) loginPage.style.display = "flex";
  if (app) app.style.display = "none";
}

function showApp() {
  const user = getCurrentUser();

  if (!user) {
    showLogin();
    return;
  }

  const loginPage = $("loginPage");
  const app = $("app");

  if (loginPage) loginPage.style.display = "none";
  if (app) app.style.display = "block";

  updateUserUI();

  if (isAdmin(user)) {
    showAdminPanel();
  } else {
    hideAdminPanel();
  }
}

function updateUserUI() {
  const user = getCurrentUser();
  if (!user) return;

  const tokenElements = document.querySelectorAll(
    "#tokenCount, .token-count, [data-token-count]"
  );

  tokenElements.forEach(el => {
    el.textContent = isAdmin(user)
      ? "∞ Tokens"
      : `${user.tokens} Tokens`;
  });

  const emailElements = document.querySelectorAll(
    "#userEmail, .user-email, [data-user-email]"
  );

  emailElements.forEach(el => {
    el.textContent = user.email;
  });

  const nameElements = document.querySelectorAll(
    "#userName, .user-name, [data-user-name]"
  );

  nameElements.forEach(el => {
    el.textContent = user.name;
  });

  const avatars = document.querySelectorAll(
    "#avatar, .avatar, [data-avatar]"
  );

  avatars.forEach(el => {
    el.textContent = user.name.charAt(0).toUpperCase();
  });
}

/* =========================
   CONVERTER TYPE
========================= */

function setConverterType(type) {
  if (!COSTS[type]) return;

  selectedType = type;
  selectedFile = null;
  convertedBlob = null;

  document.querySelectorAll("[data-type]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.type === type
    );
  });

  updateUploadText();
  clearFileUI();
}

function updateUploadText() {
  const title = $("uploadTitle");
  const text = $("uploadText");

  const data = {
    image: {
      title: "Upload JPG or PNG",
      text: "Convert JPG ↔ PNG"
    },
    "video-audio": {
      title: "Upload a video",
      text: "Convert video to audio"
    },
    "audio-video": {
      title: "Upload audio",
      text: "Convert audio to video"
    }
  };

  if (title) title.textContent = data[selectedType].title;
  if (text) text.textContent = data[selectedType].text;
}

function getAcceptedTypes() {
  if (selectedType === "image") {
    return ["image/jpeg", "image/png"];
  }

  if (selectedType === "video-audio") {
    return ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
  }

  if (selectedType === "audio-video") {
    return ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"];
  }

  return [];
}

function handleFile(file) {
  if (!file) return;

  const accepted = getAcceptedTypes();

  if (!accepted.includes(file.type)) {
    alert("That file type isn't supported.");
    return;
  }

  selectedFile = file;
  convertedBlob = null;

  showFileUI(file);
}

function showFileUI(file) {
  const info = $("fileInfo");
  const name = $("fileName");
  const size = $("fileSize");

  if (name) name.textContent = file.name;

  if (size) {
    size.textContent = formatBytes(file.size);
  }

  if (info) {
    info.style.display = "block";
  }

  const preview = $("preview");

  if (!preview) return;

  preview.innerHTML = "";

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = "Preview";
    preview.appendChild(img);
  }

  if (file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.preload = "metadata";
    preview.appendChild(video);
  }

  if (file.type.startsWith("audio/")) {
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(file);
    audio.controls = true;
    preview.appendChild(audio);
  }
}

function clearFileUI() {
  const info = $("fileInfo");
  const preview = $("preview");
  const result = $("result");

  if (info) info.style.display = "none";
  if (preview) preview.innerHTML = "";
  if (result) result.style.display = "none";

  const fileInput = $("fileInput");
  if (fileInput) fileInput.value = "";
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/* =========================
   TOKENS
========================= */

function hasEnoughTokens() {
  const user = getCurrentUser();

  if (!user) {
    alert("Please login first.");
    return false;
  }

  if (isAdmin(user)) return true;

  const cost = COSTS[selectedType];

  if (user.tokens < cost) {
    alert(`You need ${cost} tokens.`);
    return false;
  }

  return true;
}

function spendTokens() {
  const users = getUsers();
  const email = getCurrentEmail();
  const user = users[email];

  if (!user || isAdmin(user)) return;

  user.tokens -= COSTS[selectedType];

  saveUsers(users);
  updateUserUI();
}

/* =========================
   IMAGE CONVERTER
========================= */

async function convertImage() {
  if (!selectedFile) {
    alert("Upload an image first.");
    return;
  }

  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");

    if (selectedFile.type === "image/png") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    const targetPNG = selectedFile.type === "image/jpeg";

    canvas.toBlob(blob => {
      if (!blob) {
        alert("Conversion failed.");
        return;
      }

      convertedBlob = blob;

      const baseName = selectedFile.name
        .replace(/\.[^/.]+$/, "");

      convertedName = targetPNG
        ? `${baseName}.png`
        : `${baseName}.jpg`;

      spendTokens();
      showResult();
    }, targetPNG ? "image/png" : "image/jpeg", 0.92);
  };

  img.onerror = () => {
    alert("Could not read the image.");
  };

  img.src = URL.createObjectURL(selectedFile);
}

/* =========================
   VIDEO → AUDIO
========================= */

async function videoToAudio() {
  if (!selectedFile) {
    alert("Upload a video first.");
    return;
  }

  if (!window.MediaRecorder) {
    alert("Your browser doesn't support this converter.");
    return;
  }

  const video = document.createElement("video");
  const url = URL.createObjectURL(selectedFile);

  video.src = url;
  video.muted = true;
  video.playsInline = true;

  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });

    const stream = video.captureStream();

    const audioTracks = stream.getAudioTracks();

    if (!audioTracks.length) {
      URL.revokeObjectURL(url);
      alert("This video has no audio track.");
      return;
    }

    const audioStream = new MediaStream(audioTracks);

    let mime = "audio/webm";

    if (!MediaRecorder.isTypeSupported(mime)) {
      mime = "";
    }

    const recorder = new MediaRecorder(
      audioStream,
      mime ? { mimeType: mime } : undefined
    );

    const chunks = [];

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      convertedBlob = new Blob(chunks, {
        type: recorder.mimeType || "audio/webm"
      });

      const baseName = selectedFile.name
        .replace(/\.[^/.]+$/, "");

      convertedName = `${baseName}.webm`;

      URL.revokeObjectURL(url);

      spendTokens();
      showResult();
    };

    video.onended = () => recorder.stop();

    recorder.start();
    await video.play();

  } catch (error) {
    URL.revokeObjectURL(url);
    alert("Video conversion failed.");
  }
}

/* =========================
   AUDIO → VIDEO
========================= */

async function audioToVideo() {
  if (!selectedFile) {
    alert("Upload audio first.");
    return;
  }

  if (!window.MediaRecorder) {
    alert("Your browser doesn't support this converter.");
    return;
  }

  const audio = document.createElement("audio");
  const audioURL = URL.createObjectURL(selectedFile);

  audio.src = audioURL;
  audio.preload = "auto";

  try {
    await new Promise((resolve, reject) => {
      audio.onloadedmetadata = resolve;
      audio.onerror = reject;
    });

    const duration = audio.duration;

    if (!isFinite(duration) || duration <= 0) {
      throw new Error("Invalid audio duration");
    }

    const canvas = document.createElement("canvas");

    canvas.width = 1280;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const canvasStream = canvas.captureStream(30);

    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error("AudioContext unavailable");
    }

    const audioContext = new AudioContext();

    const source =
      audioContext.createMediaElementSource(audio);

    const destination =
      audioContext.createMediaStreamDestination();

    source.connect(destination);

    const combined = new MediaStream();

    canvasStream.getVideoTracks().forEach(track => {
      combined.addTrack(track);
    });

    destination.stream.getAudioTracks().forEach(track => {
      combined.addTrack(track);
    });

    let mime = "video/webm;codecs=vp9,opus";

    if (!MediaRecorder.isTypeSupported(mime)) {
      mime = "video/webm";
    }

    const recorder = new MediaRecorder(
      combined,
      { mimeType: mime }
    );

    const chunks = [];

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      convertedBlob = new Blob(chunks, {
        type: recorder.mimeType || "video/webm"
      });

      const baseName = selectedFile.name
        .replace(/\.[^/.]+$/, "");

      convertedName = `${baseName}.webm`;

      canvasStream.getTracks().forEach(t => t.stop());
      combined.getTracks().forEach(t => t.stop());

      await audioContext.close();

      URL.revokeObjectURL(audioURL);

      spendTokens();
      showResult();
    };

    audio.onended = () => {
      setTimeout(() => recorder.stop(), 300);
    };

    recorder.start(100);

    await audioContext.resume();
    await audio.play();

  } catch (error) {
    URL.revokeObjectURL(audioURL);
    console.error(error);
    alert("Audio conversion failed.");
  }
}

/* =========================
   CONVERT BUTTON
========================= */

async function convertFile() {
  if (!selectedFile) {
    alert("Upload a file first.");
    return;
  }

  if (!hasEnoughTokens()) return;

  setProgress(true);

  try {
    if (selectedType === "image") {
      await convertImage();
    }

    if (selectedType === "video-audio") {
      await videoToAudio();
    }

    if (selectedType === "audio-video") {
      await audioToVideo();
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong.");
  }

  setProgress(false);
}

function setProgress(active) {
  const progress = $("progress");
  const convertButton = $("convertButton");

  if (progress) {
    progress.style.display = active ? "block" : "none";
  }

  if (convertButton) {
    convertButton.disabled = active;
    convertButton.textContent = active
      ? "Converting..."
      : "Convert";
  }
}

/* =========================
   RESULT
========================= */

function showResult() {
  if (!convertedBlob) return;

  const result = $("result");
  const download = $("downloadButton");

  if (result) {
    result.style.display = "block";
  }

  if (download) {
    const url = URL.createObjectURL(convertedBlob);

    download.href = url;
    download.download = convertedName;
    download.textContent = `Download ${convertedName}`;
  }
}

/* =========================
   REDEEM CODES
========================= */

function redeemCode(codeInput) {
  const user = getCurrentUser();

  if (!user) {
    alert("Login first.");
    return;
  }

  if (user.permissions && user.permissions.redeem === false) {
    alert("Redeem is disabled for your account.");
    return;
  }

  const code = codeInput.trim().toUpperCase();

  if (!code) {
    alert("Enter a code.");
    return;
  }

  const codes = getCodes();
  const tokenCode = codes[code];

  if (!tokenCode) {
    alert("Invalid code.");
    return;
  }

  if (tokenCode.used) {
    alert("This code has already been used.");
    return;
  }

  if (
    tokenCode.expire &&
    Date.now() > tokenCode.expire
  ) {
    alert("This code has expired.");
    return;
  }

  const users = getUsers();

  users[user.email].tokens =
    Number(users[user.email].tokens || 0) +
    Number(tokenCode.tokens || 0);

  tokenCode.used = true;
  tokenCode.usedBy = user.email;
  tokenCode.usedAt = Date.now();

  saveUsers(users);
  saveCodes(codes);

  updateUserUI();

  alert(`Added ${tokenCode.tokens} tokens.`);
}

/* =========================
   ADMIN PANEL
========================= */

function showAdminPanel() {
  const panel = $("adminPanel");
  if (panel) panel.style.display = "block";

  renderAdminCodes();
  renderAdminUsers();
}

function hideAdminPanel() {
  const panel = $("adminPanel");
  if (panel) panel.style.display = "none";
}

function createTokenCode(code, tokens, expire) {
  const user = getCurrentUser();

  if (!isAdmin(user)) {
    alert("Admin only.");
    return;
  }

  code = code.trim().toUpperCase();
  tokens = Number(tokens);

  if (!code) {
    alert("Enter a token code.");
    return;
  }

  if (!Number.isFinite(tokens) || tokens <= 0) {
    alert("Enter a valid token amount.");
    return;
  }

  const codes = getCodes();

  if (codes[code]) {
    alert("That code already exists.");
    return;
  }

  let expireTime = null;

  if (expire) {
    const date = new Date(expire);

    if (isNaN(date.getTime())) {
      alert("Invalid expiration date.");
      return;
    }

    expireTime = date.getTime();
  }

  codes[code] = {
    code,
    tokens,
    expire: expireTime,
    used: false,
    createdAt: Date.now()
  };

  saveCodes(codes);

  renderAdminCodes();

  alert("Token code created.");
}

function renderAdminCodes() {
  const container = $("adminCodes");
  if (!container) return;

  const codes = getCodes();
  const list = Object.values(codes);

  if (!list.length) {
    container.innerHTML = "<p>No token codes yet.</p>";
    return;
  }

  container.innerHTML = list.map(code => {
    const expiration = code.expire
      ? new Date(code.expire).toLocaleString()
      : "Never";

    return `
      <div class="admin-item">
        <strong>${escapeHTML(code.code)}</strong>
        <span>${code.tokens} tokens</span>
        <small>
          ${code.used ? "USED" : "UNUSED"} ·
          Expires: ${escapeHTML(expiration)}
        </small>
      </div>
    `;
  }).join("");
}

function renderAdminUsers() {
  const container = $("adminUsers");
  if (!container) return;

  const users = getUsers();
  const list = Object.values(users);

  if (!list.length) {
    container.innerHTML = "<p>No users yet.</p>";
    return;
  }

  container.innerHTML = list.map(user => {
    const admin = isAdmin(user);

    return `
      <div class="admin-item">
        <strong>${escapeHTML(user.email)}</strong>
        <span>
          ${admin ? "∞" : user.tokens} tokens
        </span>

        ${
          admin
          ? `<small>ADMIN</small>`
          : `
            <label>
              <input
                type="checkbox"
                data-permission="converter"
                data-email="${escapeHTML(user.email)}"
                ${user.permissions?.converter !== false ? "checked" : ""}
              >
              Converter
            </label>

            <label>
              <input
                type="checkbox"
                data-permission="redeem"
                data-email="${escapeHTML(user.email)}"
                ${user.permissions?.redeem !== false ? "checked" : ""}
              >
              Redeem
            </label>
          `
        }
      </div>
    `;
  }).join("");
}

function updatePermission(email, permission, enabled) {
  const current = getCurrentUser();

  if (!isAdmin(current)) {
    return;
  }

  const users = getUsers();

  if (!users[email]) return;

  if (!users[email].permissions) {
    users[email].permissions = {};
  }

  users[email].permissions[permission] = enabled;

  saveUsers(users);
}

/* =========================
   EVENT SETUP
========================= */

document.addEventListener("DOMContentLoaded", () => {

  const current = getCurrentEmail();

  if (current && getCurrentUser()) {
    showApp();
  } else {
    showLogin();
  }

  updateUploadText();

  const loginButton = $("loginButton");

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      login($("gmailInput")?.value || "");
    });
  }

  const gmailInput = $("gmailInput");

  if (gmailInput) {
    gmailInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        login(gmailInput.value);
      }
    });
  }

  const logoutButton = $("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  document.querySelectorAll("[data-type]").forEach(button => {
    button.addEventListener("click", () => {
      setConverterType(button.dataset.type);
    });
  });

  const fileInput = $("fileInput");

  if (fileInput) {
    fileInput.addEventListener("change", e => {
      handleFile(e.target.files[0]);
    });
  }

  cons

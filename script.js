"use strict";

/*
  ConvertX
  No FFmpeg.
  No external API.
  No paid service.

  Real browser-side image conversion:
  PNG
  JPG/JPEG
  WEBP
  BMP
  GIF input -> image export

  Audio/video:
  The browser does not provide a universal encoder for every
  format, so unsupported conversions are reported instead of
  faking the file extension.
*/

const state = {
  type: "picture",
  file: null,
  outputFormat: "PNG",
  resultBlob: null,
  resultName: "",
  objectUrl: null
};

const formats = {
  picture: [
    "PNG",
    "JPG",
    "WEBP",
    "BMP",
    "GIF"
  ],

  sound: [
    "MP3",
    "WAV",
    "OGG",
    "M4A",
    "AAC",
    "FLAC"
  ],

  video: [
    "MP4",
    "WEBM",
    "GIF",
    "MP3",
    "WAV",
    "OGG",
    "M4A",
    "AAC",
    "FLAC"
  ]
};

const extensions = {
  picture: [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".bmp",
    ".gif"
  ],

  sound: [
    ".mp3",
    ".wav",
    ".ogg",
    ".oga",
    ".m4a",
    ".aac",
    ".flac",
    ".webm"
  ],

  video: [
    ".mp4",
    ".webm",
    ".mov",
    ".avi",
    ".mkv",
    ".m4v",
    ".ogv",
    ".gif"
  ]
};


/* DOM */

const fileInput = document.getElementById("fileInput");
const fileBox = document.getElementById("fileBox");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileIcon = document.getElementById("fileIcon");

const removeBtn = document.getElementById("removeBtn");

const formatArea = document.getElementById("formatArea");
const formatsBox = document.getElementById("formats");

const convertBtn = document.getElementById("convertBtn");

const progressArea = document.getElementById("progressArea");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");

const resultArea = document.getElementById("resultArea");
const resultName = document.getElementById("resultName");

const downloadBtn = document.getElementById("downloadBtn");
const newBtn = document.getElementById("newBtn");

const message = document.getElementById("message");

const supportedText =
  document.getElementById("supportedText");

const selectedType =
  document.getElementById("selectedType");

const themeBtn =
  document.getElementById("themeBtn");

const deviceBtn =
  document.getElementById("deviceBtn");


/* TYPE NAMES */

const typeNames = {
  picture: "Picture",
  sound: "Audio",
  video: "Video"
};


/* FORMAT MIME */

function mimeFor(format) {
  const f = format.toLowerCase();

  const map = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    bmp: "image/bmp",
    gif: "image/gif",

    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    flac: "audio/flac",

    mp4: "video/mp4",
    webm: "video/webm"
  };

  return map[f] || "application/octet-stream";
}


/* RANDOM OUTPUT NAME */

function makeOutputName(format) {
  const number =
    Math.floor(Math.random() * 90000) + 1000;

  return (
    "ConvertX" +
    format.toLowerCase() +
    number +
    "." +
    format.toLowerCase()
  );
}


/* FILE SIZE */

function readableSize(bytes) {
  if (bytes < 1024) {
    return bytes + " B";
  }

  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  }

  if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1) + " GB";
}


/* MESSAGE */

function showMessage(text) {
  message.textContent = text;
  message.classList.remove("hidden");
}

function hideMessage() {
  message.textContent = "";
  message.classList.add("hidden");
}


/* PROGRESS */

function setProgress(value, text) {
  const safe =
    Math.max(0, Math.min(100, value));

  progressBar.style.width =
    safe + "%";

  progressPercent.textContent =
    Math.round(safe) + "%";

  progressText.textContent =
    text;
}


/* SUPPORTED TEXT */

function updateSupportedText() {
  const names = {
    picture:
      "Add PNG, JPG, JPEG, WEBP, BMP or GIF",

    sound:
      "Add MP3, WAV, OGG, M4A, AAC, FLAC or WEBM",

    video:
      "Add MP4, WEBM, MOV, AVI, MKV, M4V, OGV or GIF"
  };

  supportedText.textContent =
    names[state.type];

  selectedType.textContent =
    typeNames[state.type];

  fileInput.accept =
    extensions[state.type].join(",");
}


/* FORMAT BUTTONS */

function renderFormats() {
  formatsBox.innerHTML = "";

  formats[state.type].forEach(function(format) {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "format-btn";

    button.textContent = format;

    if (format === state.outputFormat) {
      button.classList.add("active");
    }

    button.addEventListener(
      "click",
      function() {
        state.outputFormat = format;

        document
          .querySelectorAll(".format-btn")
          .forEach(function(btn) {
            btn.classList.remove("active");
          });

        button.classList.add("active");

        updateConvertButton();
      }
    );

    formatsBox.appendChild(button);
  });
}


/* CONVERT BUTTON */

function updateConvertButton() {
  convertBtn.disabled =
    !state.file ||
    !state.outputFormat;
}


/* TYPE SWITCH */

document
  .querySelectorAll(".type-card")
  .forEach(function(card) {

    card.addEventListener(
      "click",
      function() {

        document
          .querySelectorAll(".type-card")
          .forEach(function(item) {
            item.classList.remove("active");
          });

        card.classList.add("active");

        state.type =
          card.dataset.type;

        state.outputFormat =
          formats[state.type][0];

        clearFile();

        updateSupportedText();
        renderFormats();
      }
    );
  });


/* FILE BOX */

fileBox.addEventListener(
  "click",
  function() {

    if (!state.file) {
      fileInput.click();
    }
  }
);


/* FILE PICKER */

fileInput.addEventListener(
  "change",
  function(event) {

    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    handleFile(file);
  }
);


/* CHECK EXTENSION */

function getExtension(name) {
  const index =
    name.lastIndexOf(".");

  if (index === -1) {
    return "";
  }

  return name
    .slice(index)
    .toLowerCase();
}


function isAllowedFile(file) {
  const ext =
    getExtension(file.name);

  return extensions[state.type]
    .includes(ext);
}


/* HANDLE FILE */

function handleFile(file) {

  hideMessage();

  if (!isAllowedFile(file)) {

    showMessage(
      "That file type is not supported for " +
      typeNames[state.type] +
      "."
    );

    fileInput.value = "";
    return;
  }

  state.file = file;

  fileName.textContent =
    file.name;

  fileSize.textContent =
    readableSize(file.size);

  if (state.type === "picture") {
    fileIcon.textContent = "🖼️";
  } else if (state.type === "sound") {
    fileIcon.textContent = "🎵";
  } else {
    fileIcon.textContent = "🎬";
  }

  fileBox.classList.add("hidden");
  fileInfo.classList.remove("hidden");

  formatArea.classList.remove("hidden");

  resultArea.classList.add("hidden");
  progressArea.classList.add("hidden");

  updateConvertButton();
}


/* REMOVE */

removeBtn.addEventListener(
  "click",
  function(event) {

    event.stopPropagation();

    clearFile();
  }
);


/* CLEAR */

function clearFile() {

  state.file = null;
  state.resultBlob = null;
  state.resultName = "";

  if (state.objectUrl) {
    URL.revokeObjectURL(
      state.objectUrl
    );

    state.objectUrl = null;
  }

  fileInput.value = "";

  fileBox.classList.remove("hidden");
  fileInfo.classList.add("hidden");

  formatArea.classList.add("hidden");
  progressArea.classList.add("hidden");
  resultArea.classList.add("hidden");

  hideMessage();

  setProgress(
    0,
    "Preparing..."
  );

  updateConvertButton();
}


/* NEW FILE */

newBtn.addEventListener(
  "click",
  function() {
    clearFile();
  }
);


/* CONVERT */

convertBtn.addEventListener(
  "click",
  async function() {

    if (!state.file) {
      return;
    }

    hideMessage();

    convertBtn.disabled = true;

    progressArea.classList.remove("hidden");

    resultArea.classList.add("hidden");

    setProgress(
      5,
      "Starting..."
    );

    try {

      let result;

      if (state.type === "picture") {

        result =
          await convertImage(
            state.file,
            state.outputFormat
          );

      } else {

        result =
          await nativeMediaConversion(
            state.file,
            state.outputFormat,
            state.type
          );
      }

      if (!result) {
        throw new Error(
          "This browser cannot create that format."
        );
      }

      state.resultBlob =
        result.blob;

      state.resultName =
        makeOutputName(
          state.outputFormat
        );

      resultName.textContent =
        state.resultName;

      setProgress(
        100,
        "Complete"
      );

      setTimeout(function() {

        progressArea.classList.add("hidden");

        resultArea.classList.remove("hidden");

      }, 250);

    } catch (error) {

      console.error(error);

      progressArea.classList.add("hidden");

      showMessage(
        error.message ||
        "Conversion failed."
      );

    } finally {

      updateConvertButton();
    }
  }
);


/* IMAGE CONVERTER */

async function convertImage(
  file,
  outputFormat
) {

  setProgress(
    15,
    "Reading image..."
  );

  const bitmap =
    await createImageBitmap(file);

  setProgress(
    45,
    "Rendering..."
  );

  const canvas =
    document.createElement("canvas");

  canvas.width =
    bitmap.width;

  canvas.height =
    bitmap.height;

  const ctx =
    canvas.getContext("2d", {
      alpha: true
    });

  if (!ctx) {
    throw new Error(
      "Your browser does not support Canvas."
    );
  }

  /*
    JPG does not support transparency.
    Put a white background behind it.
  */

  if (
    outputFormat === "JPG" ||
    outputFormat === "BMP"
  ) {

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  ctx.drawImage(
    bitmap,
    0,
    0
  );

  bitmap.close();

  setProgress(
    70,
    "Encoding..."
  );

  const mime =
    mimeFor(outputFormat);

  let blob =
    await canvasToBlob(
      canvas,
      mime,
      outputFormat === "JPG"
        ? 0.92
        : 0.9
    );

  /*
    Some browsers don't support BMP or GIF
    through canvas.toBlob().
  */

  if (!blob) {

    if (outputFormat === "BMP") {

      blob =
        canvasToBMP(canvas);

    } else if (outputFormat === "GIF") {

      throw new Error(
        "GIF output is not available in this browser without an external codec."
      );

    } else {

      throw new Error(
        "Your browser does not support " +
        outputFormat +
        " output."
      );
    }
  }

  setProgress(
    95,
    "Finishing..."
  );

  return {
    blob: blob
  };
}


/* CANVAS TO BLOB */

function canvasToBlob(
  canvas,
  mime,
  quality
) {

  return new Promise(
    function(resolve) {

      canvas.toBlob(
        function(blob) {
          resolve(blob);
        },
        mime,
        quality
      );

    }
  );
}


/* SIMPLE BMP ENCODER */

function canvasToBMP(canvas) {

  const width =
    canvas.width;

  const height =
    canvas.height;

  const ctx =
    canvas.getContext("2d");

  const imageData =
    ctx.getImageData(
      0,
      0,
      width,
      height
    );

  const rowSize =
    Math.floor(
      (24 * width + 31) / 32
    ) * 4;

  const pixelDataSize =
    rowSize * height;

  const fileSize =
    54 + pixelDataSize;

  const buffer =
    new ArrayBuffer(fileSize);

  const view =
    new DataView(buffer);

  /* BMP header */

  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);

  view.setUint32(
    2,
    fileSize,
    true
  );

  view.setUint32(
    10,
    54,
    true
  );

  /* DIB header */

  view.setUint32(
    14,
    40,
    true
  );

  view.setInt32(
    18,
    width,
    true
  );

  view.setInt32(
    22,
    height,
    true
  );

  view.setUint16(
    26,
    1,
    true
  );

  view.setUint16(
    28,
    24,
    true
  );

  view.setUint32(
    34,
    pixelDataSize,
    true
  );

  const data =
    imageData.data;

  let offset = 54;

  /*
    BMP stores rows bottom → top.
  */

  for (
    let y = height - 1;
    y >= 0;
    y--
  ) {

    const rowStart =
      offset;

    for (
      let x = 0;
      x < width;
      x++
    ) {

      const index =
        (y * width + x) * 4;

      const r =
        data[index];

      const g =
        data[index + 1];

      const b =
        data[index + 2];

      view.setUint8(
        offset++,
        b
      );

      view.setUint8(
        offset++,
        g
      );

      view.setUint8(
        offset++,
        r
      );
    }

    while (
      offset - rowStart <
      rowSize
    ) {

      view.setUint8(
        offset++,
        0
      );
    }
  }

  return new Blob(
    [buffer],
    {
      type: "image/bmp"
    }
  );
}


/*
  Native media conversion.

  This DOES NOT rename the file and pretend it
  converted.

  Web browsers have limited native encoding APIs.
*/

async function nativeMediaConversion(
  file,
  outputFormat,
  type
) {

  /*
    WebCodecs may exist in some browsers,
    but browser codec support varies heavily.

    We only attempt conversions that can be
    safely produced by the browser.
  */

  if (
    type === "sound" &&
    outputFormat === "WAV"
  ) {

    return await audioToWav(file);
  }

  /*
    Browser-native MediaRecorder can record
    audio/video, but the resulting codec is
    determined by browser support.

    It cannot guarantee MP3, OGG, AAC, FLAC,
    etc., so don't fake the extension.
  */

  throw new Error(
    outputFormat +
    " conversion for " +
    type +
    " is not universally supported by browsers without a codec engine such as FFmpeg."
  );
}


/* AUDIO → WAV */

async function audioToWav(file) {

  setProgress(
    15,
    "Loading audio..."
  );

  const arrayBuffer =
    await file.arrayBuffer();

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {
    throw new Error(
      "Your browser does not support Web Audio."
    );
  }

  const context =
    new AudioContext();

  let audioBuffer;

  try {

    audioBuffer =
      await context.decodeAudioData(
        arrayBuffer
      );

  } catch (error) {

    await context.close();

    throw new Error(
      "This browser cannot decode that audio format."
    );
  }

  setProgress(
    55,
    "Creating WAV..."
  );

  const wav =
    encodeWAV(audioBuffer);

  await context.close();

  setProgress(
    95,
    "Finishing..."
  );

  return {
    blob: wav
  };
}


/* WAV ENCODER */

function encodeWAV(audioBuffer) {

  const channels =
    audioBuffer.numberOfChannels;

  const sampleRate =
    audioBuffer.sampleRate;

  const length =
    audioBuffer.length;

  const bytesPerSample = 2;

  const blockAlign =
    channels * bytesPerSample;

  const dataSize =
    length *
    blockAlign;

  const buffer =
    new ArrayBuffer(
      44 + dataSize
    );

  const view =
    new DataView(buffer);

  writeString(
    view,
    0,
    "RIFF"
  );

  view.setUint32(
    4,
    36 + dataSize,
    true
  );

  writeString(
    view,
    8,
    "WAVE"
  );

  writeString(
    view,
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
    sampleRate * blockAlign,
    true
  );

  view.setUint16(
    32,
    blockAlign,
    true
  );

  view.setUint16(
    34,
    16,
    true
  );

  writeString(
    view,
    36,
    "data"
  );

  view.setUint32(
    40,
    dataSize,
    true
  );

  /*
    Interleave channels.
  */

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
        channelData[channel][i];

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
}


function writeString(
  view,
  offset,
  string
) {

  for (
    let i = 0;
    i < string.length;
    i++
  ) {

    view.setUint8(
      offset + i,
      string.charCodeAt(i)
    );
  }
}


/* DOWNLOAD */

downloadBtn.addEventListener(
  "click",
  function() {

    if (!state.resultBlob) {
      return;
    }

    const url =
      URL.createObjectURL(
        state.resultBlob
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      state.resultName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, 1000);
  }
);


/* THEME */

const savedTheme =
  localStorage.getItem(
    "convertx-theme"
  );

if (savedTheme === "light") {
  document.body.classList.add("light");
  themeBtn.textContent = "🌙";
}

themeBtn.addEventListener(
  "click",
  function() {

    document.body.classList.toggle(
      "light"
    );

    const light =
      document.body.classList.contains(
        "light"
      );

    localStorage.setItem(
      "convertx-theme",
      light
        ? "light"
        : "dark"
    );

    themeBtn.textContent =
      light
        ? "🌙"
        : "☀️";
  }
);


/* PHONE / DESKTOP */

const savedDevice =
  localStorage.getItem(
    "convertx-device"
  );

if (savedDevice === "phone") {
  document.body.classList.add("phone");
  deviceBtn.textContent = "🖥️";
}

deviceBtn.addEventListener(
  "click",
  function() {

    document.body.classList.toggle(
      "phone"
    );

    const phone =
      document.body.classList.contains(
        "phone"
      );

    localStorage.setItem(
      "convertx-device",
      phone
        ? "phone"
        : "desktop"
    );

    deviceBtn.textContent =
      phone
        ? "🖥️"
        : "📱";
  }
);


/* INITIALIZE */

updateSupportedText();
renderFormats();
updateConvertButton();
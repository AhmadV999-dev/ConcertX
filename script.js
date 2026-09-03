"use strict";

/* =========================
   ELEMENTS
========================= */

const typeCards = document.querySelectorAll(".type-card");

const toolSection = document.getElementById("toolSection");
const typeTitle = document.getElementById("typeTitle");
const typeDescription = document.getElementById("typeDescription");

const fileBox = document.getElementById("fileBox");
const fileInput = document.getElementById("fileInput");

const emptyFile = document.getElementById("emptyFile");
const selectedFile = document.getElementById("selectedFile");
const removeFile = document.getElementById("removeFile");

const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

const convertSection = document.getElementById("convertSection");
const formatGrid = document.getElementById("formatGrid");
const convertButton = document.getElementById("convertButton");

const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressNumber = document.getElementById("progressNumber");

const resultSection = document.getElementById("resultSection");
const resultName = document.getElementById("resultName");
const downloadButton = document.getElementById("downloadButton");

const phoneBtn = document.getElementById("phoneBtn");
const desktopBtn = document.getElementById("desktopBtn");
const themeBtn = document.getElementById("themeBtn");

const toast = document.getElementById("toast");


/* =========================
   STATE
========================= */

let currentType = "";
let currentFile = null;
let selectedFormat = "";
let outputBlob = null;
let outputName = "";
let toastTimer = null;


/* =========================
   FORMATS
========================= */

const formats = {
    picture: ["PNG", "JPG", "WEBP"],
    sound: ["WAV", "MP2", "OGG", "MP4"],
    video: ["MP4", "MP2", "WAV", "OGG"]
};


/* =========================
   TEXT
========================= */

const typeInfo = {
    picture: {
        title: "Add a picture",
        description: "Choose an image from your device."
    },

    sound: {
        title: "Add a sound",
        description: "Choose an audio file from your device."
    },

    video: {
        title: "Add a video",
        description: "Choose a video from your device."
    }
};


/* =========================
   HELPERS
========================= */

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


function formatBytes(bytes) {

    if (!bytes) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return (
        (bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)
        + " "
        + units[index]
    );
}


function extensionOf(name) {

    const parts = name.split(".");

    if (parts.length < 2) return "";

    return parts.pop().toUpperCase();
}


function resetResult() {

    outputBlob = null;
    outputName = "";

    resultSection.classList.add("hidden");

    progressSection.classList.add("hidden");

    progressBar.style.width = "0%";
    progressNumber.textContent = "0%";
    progressText.textContent = "Preparing...";
}


/* =========================
   TYPE SELECTION
========================= */

function selectType(type) {

    currentType = type;
    selectedFormat = "";

    typeCards.forEach(card => {
        card.classList.toggle(
            "active",
            card.dataset.type === type
        );
    });

    typeTitle.textContent = typeInfo[type].title;
    typeDescription.textContent = typeInfo[type].description;

    toolSection.classList.remove("hidden");

    clearFile(false);

    createFormats();

    setTimeout(() => {
        toolSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 80);
}


typeCards.forEach(card => {

    card.addEventListener("click", () => {

        selectType(card.dataset.type);

    });

});


/* =========================
   FILE INPUT
========================= */

function openFilePicker() {

    if (!currentType) {
        showToast("Choose Picture, Sound or Video first.");
        return;
    }

    fileInput.click();
}


fileBox.addEventListener("click", event => {

    if (event.target === removeFile) {
        return;
    }

    if (!currentFile) {
        openFilePicker();
    }

});


fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];

    if (!file) return;

    handleFile(file);

});


/* =========================
   FILE HANDLING
========================= */

function handleFile(file) {

    currentFile = file;

    resetResult();

    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);

    emptyFile.classList.add("hidden");
    selectedFile.classList.remove("hidden");

    createPreview(file);

    convertSection.classList.remove("hidden");

    convertButton.disabled = true;

    selectedFormat = "";

    document.querySelectorAll(".format-option")
        .forEach(button => {
            button.classList.remove("active");
        });

    showToast("File selected");
}


function createPreview(file) {

    preview.innerHTML = "";

    if (
        currentType === "picture" &&
        file.type.startsWith("image/")
    ) {

        const img = document.createElement("img");

        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src);
        };

        preview.appendChild(img);

    } else {

        preview.textContent = extensionOf(file.name) || "FILE";

    }
}


/* =========================
   REMOVE FILE
========================= */

removeFile.addEventListener("click", event => {

    event.preventDefault();
    event.stopPropagation();

    clearFile(true);

});


function clearFile(showMessage) {

    currentFile = null;
    selectedFormat = "";

    fileInput.value = "";

    emptyFile.classList.remove("hidden");
    selectedFile.classList.add("hidden");

    convertSection.classList.add("hidden");

    resetResult();

    preview.innerHTML = "";
    preview.textContent = "FILE";

    if (showMessage) {
        showToast("File removed");
    }
}


/* =========================
   FORMAT BUTTONS
========================= */

function createFormats() {

    formatGrid.innerHTML = "";

    const list = formats[currentType] || [];

    list.forEach(format => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "format-option";
        button.textContent = format;

        button.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            selectedFormat = format;

            document
                .querySelectorAll(".format-option")
                .forEach(item => {
                    item.classList.remove("active");
                });

            button.classList.add("active");

            convertButton.disabled = !currentFile;

        });

        formatGrid.appendChild(button);

    });
}


/* =========================
   CONVERSION
========================= */

convertButton.addEventListener("click", async () => {

    if (!currentFile) {
        showToast("Choose a file first.");
        return;
    }

    if (!selectedFormat) {
        showToast("Choose an output format.");
        return;
    }

    convertButton.disabled = true;

    resultSection.classList.add("hidden");
    progressSection.classList.remove("hidden");

    progressBar.style.width = "0%";
    progressNumber.textContent = "0%";
    progressText.textContent = "Preparing...";

    try {

        await fakeProgress();

        const result = await convertFile();

        outputBlob = result.blob;
        outputName = result.name;

        progressBar.style.width = "100%";
        progressNumber.textContent = "100%";
        progressText.textContent = "Complete";

        await wait(350);

        resultName.textContent = outputName;

        resultSection.classList.remove("hidden");

        showToast("Conversion complete");

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {

        console.error(error);

        progressSection.classList.add("hidden");

        showToast(
            error.message ||
            "This format cannot be converted in the browser."
        );

    } finally {

        convertButton.disabled = false;

    }

});


function wait(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });

}


async function fakeProgress() {

    const steps = [
        [15, "Reading file..."],
        [35, "Processing..."],
        [60, "Converting..."],
        [82, "Finishing..."],
        [96, "Preparing download..."]
    ];

    for (const step of steps) {

        await wait(400);

        progressBar.style.width = step[0] + "%";
        progressNumber.textContent = step[0] + "%";
        progressText.textContent = step[1];

    }

}


/* =========================
   ACTUAL SIMPLE CONVERSIONS
========================= */

async function convertFile() {

    const extension = selectedFormat.toLowerCase();

    if (currentType === "picture") {

        return await convertPicture(extension);

    }

    if (
        currentType === "sound" &&
        extension === "wav"
    ) {

        return await convertAudioToWav();

    }

    /*
       Browser-only JavaScript cannot reliably encode
       every audio/video codec by itself.

       We refuse unsupported conversions instead of
       pretending they worked.
    */

    throw new Error(
        "This conversion needs a media codec engine."
    );
}


/* =========================
   PICTURE CONVERTER
========================= */

async function convertPicture(extension) {

    const image = new Image();

    const url = URL.createObjectURL(currentFile);

    try {

        await new Promise((resolve, reject) => {

            image.onload = resolve;
            image.onerror = () => {
                reject(new Error("Could not read image."));
            };

            image.src = url;

        });

        const canvas = document.createElement("canvas");

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Canvas is not supported.");
        }

        ctx.drawImage(image, 0, 0);

        let mime = "image/png";

        if (extension === "jpg") {
            mime = "image/jpeg";
        }

        if (extension === "webp") {
            mime = "image/webp";
        }

        const blob = await new Promise(resolve => {

            canvas.toBlob(
                resolve,
                mime,
                extension === "jpg" ? 0.92 : 0.95
            );

        });

        if (!blob) {
            throw new Error("Image conversion failed.");
        }

        return {
            blob,
            name: makeOutputName(extension)
        };

    } finally {

        URL.revokeObjectURL(url);

    }
}


/* =========================
   AUDIO → WAV
========================= */

async function convertAudioToWav() {

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) {
        throw new Error("Audio conversion is not supported.");
    }

    const buffer = await currentFile.arrayBuffer();

    const audioContext = new AudioContextClass();

    let decoded;

    try {

        decoded = await audioContext.decodeAudioData(buffer);

    } catch {

        throw new Error(
            "This audio format cannot be read by this browser."
        );

    } finally {

        if (audioContext.close) {
            audioContext.close();
        }

    }

    const wav = audioBufferToWav(decoded);

    return {
        blob: new Blob([wav], {
            type: "audio/wav"
        }),
        name: makeOutputName("wav")
    };
}


/* =========================
   WAV ENCODER
========================= */

function audioBufferToWav(buffer) {

    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;

    const samples = buffer.length;

    const bytesPerSample = 2;
    const blockAlign = channels * bytesPerSample;

    const dataSize = samples * blockAlign;

    const arrayBuffer = new ArrayBuffer(
        44 + dataSize
    );

    const view = new DataView(arrayBuffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, "WAVE");

    writeString(view, 12, "fmt ");

    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);

    view.setUint32(24, sampleRate, true);

    view.setUint32(
        28,
        sampleRate * blockAlign,
        true
    );

    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);

    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;

    for (let i = 0; i < samples; i++) {

        for (let channel = 0; channel < channels; channel++) {

            let sample =
                buffer.getChannelData(channel)[i];

            sample = Math.max(-1, Math.min(1, sample));

            const value =
                sample < 0
                    ? sample * 32768
                    : sample * 32767;

            view.setInt16(
                offset,
                value,
                true
            );

            offset += 2;
        }
    }

    return arrayBuffer;
}


function writeString(view, offset, string) {

    for (let i = 0; i < string.length; i++) {

        view.setUint8(
            offset + i,
            string.charCodeAt(i)
        );

    }
}


/* =========================
   FILE NAME
========================= */

function makeOutputName(extension) {

    const original =
        currentFile.name.replace(
            /\.[^/.]+$/,
            ""
        );

    return `${original}.${extension}`;
}


/* =========================
   DOWNLOAD
========================= */

downloadButton.addEventListener("click", () => {

    if (!outputBlob) {
        showToast("No converted file.");
        return;
    }

    const url =
        URL.createObjectURL(outputBlob);

    const link =
        document.createElement("a");

    link.href = url;
    link.download = outputName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

});


/* =========================
   PHONE / DESKTOP
========================= */

function setDeviceMode(mode) {

    document.body.classList.remove(
        "phone",
        "desktop"
    );

    document.body.classList.add(mode);

    localStorage.setItem(
        "convertx-device",
        mode
    );
}


phoneBtn.addEventListener("click", () => {

    setDeviceMode("phone");

});


desktopBtn.addEventListener("click", () => {

    setDeviceMode("desktop");

});


/* =========================
   AUTOMATIC DEVICE MODE
========================= */

const savedDevice =
    localStorage.getItem("convertx-device");

if (savedDevice) {

    setDeviceMode(savedDevice);

} else {

    setDeviceMode(
        window.innerWidth <= 700
            ? "phone"
            : "desktop"
    );

}


/* =========================
   THEME
========================= */

function updateThemeButton() {

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "☀";
    } else {
        themeBtn.textContent = "☾";
    }

}


themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "convertx-theme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );

    updateThemeButton();

});


const savedTheme =
    localStorage.getItem("convertx-theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
}

updateThemeButton();


/* =========================
   WINDOW RESIZE
========================= */

window.addEventListener("resize", () => {

    if (!localStorage.getItem("convertx-device")) {

        setDeviceMode(
            window.innerWidth <= 700
                ? "phone"
                : "desktop"
        );

    }

});
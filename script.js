const typeCards = document.querySelectorAll(".type-card");

const toolSection = document.getElementById("toolSection");
const selectedTypeText = document.getElementById("selectedTypeText");

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
const conversionText = document.getElementById("conversionText");
const convertButton = document.getElementById("convertButton");

const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressNumber = document.getElementById("progressNumber");

const resultSection = document.getElementById("resultSection");
const resultName = document.getElementById("resultName");
const downloadButton = document.getElementById("downloadButton");

const modeButton = document.getElementById("modeButton");
const toast = document.getElementById("toast");
const typingText = document.getElementById("typingText");

let selectedType = "";
let selectedFormat = "";
let currentFile = null;
let outputBlob = null;
let outputName = "";
let imageObjectURL = null;

const formats = {
    picture: ["PNG", "JPG", "WEBP"],
    sound: ["MP4", "MP2", "WAV", "OGG"],
    video: ["MP4", "MP2", "WAV", "OGG"]
};

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function resetResult() {
    outputBlob = null;
    outputName = "";

    resultSection.hidden = true;
    progressSection.hidden = true;

    progressBar.style.width = "0%";
    progressNumber.textContent = "0%";
    progressText.textContent = "Preparing...";
}

function setProgress(number, text) {
    const value = Math.max(0, Math.min(100, number));

    progressBar.style.width = value + "%";
    progressNumber.textContent = value + "%";
    progressText.textContent = text;
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

function clearFile() {
    currentFile = null;
    selectedFormat = "";

    fileInput.value = "";

    emptyFile.hidden = false;
    selectedFile.hidden = true;
    convertSection.hidden = true;

    preview.innerHTML = "";

    resetResult();
}

function createFormats() {
    formatGrid.innerHTML = "";

    formats[selectedType].forEach(format => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "format-option";
        button.textContent = format;

        button.addEventListener("click", () => {
            document.querySelectorAll(".format-option").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            selectedFormat = format;

            conversionText.textContent =
                "Convert " + selectedType + " to " + format;

            convertButton.disabled = false;
        });

        formatGrid.appendChild(button);
    });
}

function setType(type) {
    selectedType = type;

    typeCards.forEach(card => {
        card.classList.toggle(
            "active",
            card.dataset.type === type
        );
    });

    const names = {
        picture: "Picture",
        sound: "Sound",
        video: "Video"
    };

    selectedTypeText.textContent =
        "Choose your " + names[type].toLowerCase() + " file";

    toolSection.hidden = false;

    fileInput.accept =
        type === "picture"
            ? "image/*"
            : type === "sound"
            ? "audio/*"
            : "video/mp4,video/mpeg,video/quicktime";

    clearFile();

    toolSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

typeCards.forEach(card => {
    card.addEventListener("click", () => {
        setType(card.dataset.type);
    });
});

fileBox.addEventListener("click", event => {
    if (event.target === removeFile) return;

    fileInput.click();
});

fileInput.addEventListener("click", event => {
    event.stopPropagation();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) return;

    currentFile = file;

    resetResult();

    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);

    emptyFile.hidden = true;
    selectedFile.hidden = false;

    preview.innerHTML = "";

    if (selectedType === "picture") {
        const img = document.createElement("img");

        imageObjectURL = URL.createObjectURL(file);
        img.src = imageObjectURL;

        preview.appendChild(img);
    } else {
        const icons = {
            sound: "🎵",
            video: "🎬"
        };

        preview.textContent = icons[selectedType];
    }

    convertSection.hidden = false;

    selectedFormat = "";
    convertButton.disabled = true;

    createFormats();
    conversionText.textContent = "Choose an output format";
});

removeFile.addEventListener("click", event => {
    event.stopPropagation();

    if (imageObjectURL) {
        URL.revokeObjectURL(imageObjectURL);
        imageObjectURL = null;
    }

    clearFile();
});

async function pictureConvert() {
    if (!currentFile) {
        throw new Error("Choose a picture first.");
    }

    const image = new Image();

    const url = URL.createObjectURL(currentFile);

    image.src = url;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });

    const canvas = document.createElement("canvas");

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext("2d");

    if (selectedFormat === "JPG") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(image, 0, 0);

    URL.revokeObjectURL(url);

    let mime = "image/png";

    if (selectedFormat === "JPG") {
        mime = "image/jpeg";
    }

    if (selectedFormat === "WEBP") {
        mime = "image/webp";
    }

    const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, mime, 0.92);
    });

    if (!blob) {
        throw new Error("Picture conversion failed.");
    }

    return blob;
}

async function audioToWav() {
    const arrayBuffer = await currentFile.arrayBuffer();

    const AudioContext =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
        throw new Error("Your browser does not support audio conversion.");
    }

    const context = new AudioContext();

    const audioBuffer =
        await context.decodeAudioData(arrayBuffer);

    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    const buffer = new ArrayBuffer(44 + length * channels * 2);
    const view = new DataView(buffer);

    function writeString(offset, text) {
        for (let i = 0; i < text.length; i++) {
            view.setUint8(offset + i, text.charCodeAt(i));
        }
    }

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * channels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");

    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(
        28,
        sampleRate * channels * 2,
        true
    );
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);

    writeString(36, "data");
    view.setUint32(40, length * channels * 2, true);

    let offset = 44;

    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < channels; channel++) {
            let sample =
                audioBuffer.getChannelData(channel)[i];

            sample = Math.max(-1, Math.min(1, sample));

            const value =
                sample < 0
                    ? sample * 0x8000
                    : sample * 0x7fff;

            view.setInt16(offset, value, true);

            offset += 2;
        }
    }

    await context.close();

    return new Blob([buffer], {
        type: "audio/wav"
    });
}

async function soundConvert() {
    if (selectedFormat === "WAV") {
        return await audioToWav();
    }

    if (
        currentFile.type === "audio/wav" &&
        selectedFormat === "WAV"
    ) {
        return currentFile;
    }

    throw new Error(
        "This browser cannot create that audio format without a codec engine."
    );
}

async function videoConvert() {
    if (
        selectedFormat === "MP4" &&
        currentFile.type === "video/mp4"
    ) {
        return currentFile;
    }

    throw new Error(
        "Video transcoding needs a codec engine. MP4 files can only be kept as MP4 here."
    );
}

async function convertFile() {
    if (!currentFile) {
        showToast("Choose a file first.");
        return;
    }

    if (!selectedFormat) {
        showToast("Choose an output format.");
        return;
    }

    convertButton.disabled = true;

    progressSection.hidden = false;
    resultSection.hidden = true;

    setProgress(0, "Preparing...");

    try {
        for (let i = 10; i <= 30; i += 10) {
            await new Promise(resolve =>
                setTimeout(resolve, 120)
            );

            setProgress(i, "Processing...");
        }

        if (selectedType === "picture") {
            outputBlob = await pictureConvert();
        }

        if (selectedType === "sound") {
            outputBlob = await soundConvert();
        }

        if (selectedType === "video") {
            outputBlob = await videoConvert();
        }

        setProgress(70, "Creating file...");

        await new Promise(resolve =>
            setTimeout(resolve, 250)
        );

        setProgress(90, "Finishing...");

        await new Promise(resolve =>
            setTimeout(resolve, 250)
        );

        const extension = selectedFormat.toLowerCase();

        const originalName =
            currentFile.name.replace(/\.[^/.]+$/, "");

        outputName =
            originalName + "." + extension;

        resultName.textContent = outputName;

        setProgress(100, "Complete");

        await new Promise(resolve =>
            setTimeout(resolve, 300)
        );

        resultSection.hidden = false;

    } catch (error) {
        progressSection.hidden = true;
        showToast(error.message || "Conversion failed.");
    }

    convertButton.disabled = false;
}

convertButton.addEventListener("click", convertFile);

downloadButton.addEventListener("click", () => {
    if (!outputBlob) {
        showToast("No converted file.");
        return;
    }

    const url = URL.createObjectURL(outputBlob);

    const link = document.createElement("a");

    link.href = url;
    link.download = outputName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
});

modeButton.addEventListener("click", () => {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        modeButton.textContent = "☀ Light";
    } else {
        modeButton.textContent = "☾ Dark";
    }
});

let typingIndex = 0;
let deleting = false;

function typeAnimation() {
    const text = "ConvertX";

    if (!deleting) {
        typingText.textContent =
            text.substring(0, typingIndex + 1);

        typingIndex++;

        if (typingIndex === text.length) {
            deleting = true;

            setTimeout(typeAnimation, 1200);
            return;
        }
    } else {
        typingText.textContent =
            text.substring(0, typingIndex - 1);

        typingIndex--;

        if (typingIndex === 0) {
            deleting = false;
        }
    }

    setTimeout(
        typeAnimation,
        deleting ? 90 : 180
    );
}

typeAnimation();
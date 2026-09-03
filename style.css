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

const phoneMode = document.getElementById("phoneMode");
const desktopMode = document.getElementById("desktopMode");
const modeButton = document.getElementById("modeButton");

const toast = document.getElementById("toast");

let selectedType = "";
let selectedFormat = "";
let currentFile = null;
let outputBlob = null;
let outputName = "";

const formats = {
    picture: ["PNG", "JPG", "WEBP"],
    sound: ["MP4", "MP2", "WAV", "OGG"],
    video: ["MP4", "MP2", "WAV", "OGG"]
};

function toastMessage(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function bytes(size) {
    if (size < 1024) return size + " B";

    if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + " KB";
    }

    return (size / 1024 / 1024).toFixed(2) + " MB";
}

function setProgress(value, text) {
    progressBar.style.width = value + "%";
    progressNumber.textContent = value + "%";
    progressText.textContent = text;
}

function resetResult() {
    outputBlob = null;
    outputName = "";

    resultSection.classList.add("hidden");
    progressSection.classList.add("hidden");

    setProgress(0, "Preparing...");
}

function clearFile() {
    currentFile = null;
    selectedFormat = "";
    outputBlob = null;
    outputName = "";

    fileInput.value = "";

    emptyFile.classList.remove("hidden");
    selectedFile.classList.add("hidden");

    convertSection.classList.add("hidden");
    progressSection.classList.add("hidden");
    resultSection.classList.add("hidden");

    preview.innerHTML = "";
    formatGrid.innerHTML = "";

    convertButton.disabled = true;
    conversionText.textContent = "Choose an output format";
}

function chooseType(type) {
    selectedType = type;

    typeCards.forEach(card => {
        card.classList.toggle(
            "active",
            card.dataset.type === type
        );
    });

    const names = {
        picture: "picture",
        sound: "sound",
        video: "video"
    };

    selectedTypeText.textContent =
        "Choose your " + names[type] + " file";

    if (type === "picture") {
        fileInput.accept = "image/*";
    }

    if (type === "sound") {
        fileInput.accept = "audio/*";
    }

    if (type === "video") {
        fileInput.accept =
            "video/mp4,video/mpeg,video/quicktime";
    }

    clearFile();

    toolSection.classList.remove("hidden");

    setTimeout(() => {
        toolSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 50);
}

typeCards.forEach(card => {
    card.addEventListener("click", () => {
        chooseType(card.dataset.type);
    });
});

fileBox.addEventListener("click", event => {
    if (event.target.closest("#removeFile")) {
        return;
    }

    if (!currentFile) {
        fileInput.click();
    }
});

removeFile.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    clearFile();
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
    fileSize.textContent = bytes(file.size);

    emptyFile.classList.add("hidden");
    selectedFile.classList.remove("hidden");

    preview.innerHTML = "";

    if (selectedType === "picture") {

        const image = document.createElement("img");
        image.src = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(image.src);
        };

        preview.appendChild(image);

    } else if (selectedType === "sound") {

        preview.textContent = "🎵";

    } else {

        preview.textContent = "🎬";
    }

    createFormats();

    convertSection.classList.remove("hidden");

    selectedFormat = "";
    convertButton.disabled = true;

    conversionText.textContent =
        "Choose an output format";
});

function createFormats() {
    formatGrid.innerHTML = "";

    formats[selectedType].forEach(format => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "format-option";
        button.textContent = format;

        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            document
                .querySelectorAll(".format-option")
                .forEach(item => {
                    item.classList.remove("active");
                });

            button.classList.add("active");

            selectedFormat = format;

            conversionText.textContent =
                "Convert " +
                selectedType +
                " to " +
                format;

            convertButton.disabled = false;
        });

        formatGrid.appendChild(button);
    });
}

async function convertPicture() {

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
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
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
        canvas.toBlob(
            resolve,
            mime,
            0.92
        );
    });

    if (!blob) {
        throw new Error("Picture conversion failed.");
    }

    return blob;
}

async function convertAudioToWav() {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {
        throw new Error(
            "Audio conversion is not supported by this browser."
        );
    }

    const context = new AudioContext();

    try {

        const data =
            await currentFile.arrayBuffer();

        const audio =
            await context.decodeAudioData(data);

        const channels =
            audio.numberOfChannels;

        const sampleRate =
            audio.sampleRate;

        const length =
            audio.length;

        const buffer =
            new ArrayBuffer(
                44 +
                length *
                channels *
                2
            );

        const view =
            new DataView(buffer);

        function writeText(offset, text) {

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

        writeText(0, "RIFF");

        view.setUint32(
            4,
            36 + length * channels * 2,
            true
        );

        writeText(8, "WAVE");
        writeText(12, "fmt ");

        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);

        view.setUint32(
            24,
            sampleRate,
            true
        );

        view.setUint32(
            28,
            sampleRate * channels * 2,
            true
        );

        view.setUint16(
            32,
            channels * 2,
            true
        );

        view.setUint16(
            34,
            16,
            true
        );

        writeText(36, "data");

        view.setUint32(
            40,
            length * channels * 2,
            true
        );

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
                    audio.getChannelData(
                        channel
                    )[i];

                sample =
                    Math.max(
                        -1,
                        Math.min(1, sample)
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

async function performConversion() {

    if (!currentFile) {
        throw new Error("Choose a file first.");
    }

    if (!selectedFormat) {
        throw new Error(
            "Choose an output format."
        );
    }

    if (
        selectedType === "picture"
    ) {
        return await convertPicture();
    }

    if (
        selectedType === "sound"
    ) {

        if (selectedFormat === "WAV") {
            return await convertAudioToWav();
        }

        throw new Error(
            "This browser can directly create WAV audio. MP2, OGG and MP4 need a codec engine."
        );
    }

    if (
        selectedType === "video"
    ) {

        if (
            selectedFormat === "MP4" &&
            currentFile.type === "video/mp4"
        ) {
            return currentFile;
        }

        throw new Error(
            "This browser cannot directly transcode video without a codec engine."
        );
    }
}

convertButton.addEventListener(
    "click",
    async event => {

        event.preventDefault();
        event.stopPropagation();

        if (!currentFile) {
            toastMessage("Choose a file first.");
            return;
        }

        if (!selectedFormat) {
            toastMessage(
                "Choose an output format."
            );
            return;
        }

        convertButton.disabled = true;

        progressSection.classList.remove(
            "hidden"
        );

        resultSection.classList.add(
            "hidden"
        );

        setProgress(
            0,
            "Preparing..."
        );

        try {

            for (
                let i = 10;
                i <= 30;
                i += 10
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            120
                        )
                );

                setProgress(
                    i,
                    "Processing..."
                );
            }

            outputBlob =
                await performConversion();

            setProgress(
                70,
                "Creating file..."
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        250
                    )
            );

            setProgress(
                90,
                "Finishing..."
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        250
                    )
            );

            const original =
                currentFile.name.replace(
                    /\.[^/.]+$/,
                    ""
                );

            outputName =
                original +
                "." +
                selectedFormat.toLowerCase();

            resultName.textContent =
                outputName;

            setProgress(
                100,
                "Complete"
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        300
                    )
            );

            resultSection.classList.remove(
                "hidden"
            );

        } catch (error) {

            progressSection.classList.add(
                "hidden"
            );

            toastMessage(
                error.message ||
                "Conversion failed."
            );

        } finally {

            convertButton.disabled = false;
        }
    }
);

downloadButton.addEventListener(
    "click",
    event => {

        event.preventDefault();
        event.stopPropagation();

        if (!outputBlob) {
            toastMessage(
                "No converted file."
            );
            return;
        }

        const url =
            URL.createObjectURL(
                outputBlob
            );

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
    }
);

function setDeviceMode(mode) {

    document.body.classList.remove(
        "phone-mode",
        "desktop-mode"
    );

    document.body.classList.add(
        mode + "-mode"
    );

    phoneMode.classList.toggle(
        "active",
        mode === "phone"
    );

    desktopMode.classList.toggle(
        "active",
        mode === "desktop"
    );

    localStorage.setItem(
        "convertx-device",
        mode
    );
}

phoneMode.addEventListener(
    "click",
    () => {
        setDeviceMode("phone");
    }
);

desktopMode.addEventListener(
    "click",
    () => {
        setDeviceMode("desktop");
    }
);

const savedMode =
    localStorage.getItem(
        "convertx-device"
    );

if (
    savedMode === "phone" ||
    savedMode === "desktop"
) {

    setDeviceMode(savedMode);

} else {

    const phone =
        window.matchMedia(
            "(max-width: 650px)"
        ).matches;

    setDeviceMode(
        phone
            ? "phone"
            : "desktop"
    );
}

modeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );

        if (
            document.body.classList.contains(
                "light"
            )
        ) {

            modeButton.textContent =
                "☀ Light";

        } else {

            modeButton.textContent =
                "☾ Dark";
        }
    }
);

/* ConvertX typing animation */

let typingIndex = 0;
let deleting = false;

function typingAnimation() {

    const text = "ConvertX";

    if (!deleting) {

        typingIndex++;

        document.getElementById(
            "typingText"
        ).textContent =
            text.substring(
                0,
                typingIndex
            );

        if (
            typingIndex >= text.length
        ) {

            deleting = true;

            setTimeout(
                typingAnimation,
                1200
            );

            return;
        }

    } else {

        typingIndex--;

        document.getElementById(
            "typingText"
        ).textContent =
            text.substring(
                0,
                typingIndex
            );

        if (
            typingIndex <= 0
        ) {
            deleting = false;
        }
    }

    setTimeout(
        typingAnimation,
        deleting ? 80 : 180
    );
}

typingAnimation();
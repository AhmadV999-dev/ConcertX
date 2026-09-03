"use strict";


/* =========================
   DOM
========================= */

const typeCards =
    document.querySelectorAll(".type-card");

const toolSection =
    document.getElementById("toolSection");

const selectedTypeText =
    document.getElementById("selectedTypeText");

const fileBox =
    document.getElementById("fileBox");

const emptyFile =
    document.getElementById("emptyFile");

const selectedFile =
    document.getElementById("selectedFile");

const fileInput =
    document.getElementById("fileInput");

const removeFile =
    document.getElementById("removeFile");

const preview =
    document.getElementById("preview");

const fileName =
    document.getElementById("fileName");

const fileSize =
    document.getElementById("fileSize");

const convertSection =
    document.getElementById("convertSection");

const formatGrid =
    document.getElementById("formatGrid");

const conversionText =
    document.getElementById("conversionText");

const convertButton =
    document.getElementById("convertButton");

const progressSection =
    document.getElementById("progressSection");

const progressText =
    document.getElementById("progressText");

const progressNumber =
    document.getElementById("progressNumber");

const progressBar =
    document.getElementById("progressBar");

const resultSection =
    document.getElementById("resultSection");

const resultName =
    document.getElementById("resultName");

const downloadButton =
    document.getElementById("downloadButton");

const phoneMode =
    document.getElementById("phoneMode");

const desktopMode =
    document.getElementById("desktopMode");

const themeButton =
    document.getElementById("themeButton");

const toast =
    document.getElementById("toast");


/* =========================
   STATE
========================= */

let selectedType = "";
let selectedFormat = "";

let currentFile = null;

let outputBlob = null;
let outputName = "";

let previewURL = null;

let toastTimer = null;


/* =========================
   FORMATS
========================= */

const formats = {

    picture: [
        "PNG",
        "JPG",
        "WEBP"
    ],

    sound: [
        "WAV"
    ],

    video: [
        "MP4"
    ]

};


/* =========================
   TOAST
========================= */

function showToast(message) {

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );
}


/* =========================
   FILE SIZE
========================= */

function formatBytes(bytes) {

    if (!Number.isFinite(bytes)) {
        return "0 B";
    }

    if (bytes === 0) {
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

    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );

    const value =
        bytes /
        Math.pow(
            1024,
            safeIndex
        );

    return (
        value.toFixed(
            safeIndex === 0
                ? 0
                : 2
        ) +
        " " +
        units[safeIndex]
    );
}


/* =========================
   WAIT
========================= */

function wait(ms) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                ms
            );

        }
    );
}


/* =========================
   PROGRESS
========================= */

function setProgress(
    percent,
    message
) {

    const value =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );

    if (progressBar) {
        progressBar.style.width =
            value + "%";
    }

    if (progressNumber) {
        progressNumber.textContent =
            Math.round(value) + "%";
    }

    if (
        progressText &&
        message
    ) {
        progressText.textContent =
            message;
    }
}


/* =========================
   RENAME FILE
========================= */

function renameFile(
    name,
    extension
) {

    const dot =
        name.lastIndexOf(".");

    const base =
        dot > 0
            ? name.substring(
                0,
                dot
            )
            : name;

    return (
        base +
        "." +
        extension.toLowerCase()
    );
}


/* =========================
   CHOOSE TYPE
========================= */

function chooseType(type) {

    selectedType = type;

    selectedFormat = "";

    outputBlob = null;
    outputName = "";

    typeCards.forEach(
        function (card) {

            card.classList.toggle(
                "selected",
                card.dataset.type === type
            );

        }
    );

    if (selectedTypeText) {

        if (type === "picture") {

            selectedTypeText.textContent =
                "Choose a picture";

        } else if (type === "sound") {

            selectedTypeText.textContent =
                "Choose a sound";

        } else {

            selectedTypeText.textContent =
                "Choose a video";
        }
    }

    if (toolSection) {
        toolSection.classList.remove(
            "hidden"
        );
    }

    resetFile();

    if (fileInput) {

        if (type === "picture") {

            fileInput.accept =
                "image/*";

        } else if (type === "sound") {

            fileInput.accept =
                "audio/*";

        } else {

            fileInput.accept =
                "video/*";
        }
    }

    createFormats();

    if (toolSection) {

        setTimeout(
            function () {

                toolSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            80
        );
    }
}


/* =========================
   TYPE BUTTONS
========================= */

typeCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function () {

                chooseType(
                    card.dataset.type
                );

            }
        );

    }
);


/* =========================
   RESET FILE
========================= */

function resetFile() {

    currentFile = null;

    selectedFormat = "";

    outputBlob = null;
    outputName = "";

    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );

        previewURL = null;
    }

    if (fileInput) {
        fileInput.value = "";
    }

    if (emptyFile) {
        emptyFile.classList.remove(
            "hidden"
        );
    }

    if (selectedFile) {
        selectedFile.classList.add(
            "hidden"
        );
    }

    if (preview) {
        preview.innerHTML = "";
    }

    if (fileName) {
        fileName.textContent =
            "File";
    }

    if (fileSize) {
        fileSize.textContent =
            "0 B";
    }

    if (convertSection) {
        convertSection.classList.add(
            "hidden"
        );
    }

    if (progressSection) {
        progressSection.classList.add(
            "hidden"
        );
    }

    if (resultSection) {
        resultSection.classList.add(
            "hidden"
        );
    }

    if (convertButton) {
        convertButton.disabled =
            true;
    }

    setProgress(
        0,
        "Preparing..."
    );
}


/* =========================
   VALIDATE FILE
========================= */

function isValidFile(file) {

    if (!file) {
        return false;
    }

    if (selectedType === "picture") {

        return file.type.startsWith(
            "image/"
        );
    }

    if (selectedType === "sound") {

        return file.type.startsWith(
            "audio/"
        );
    }

    if (selectedType === "video") {

        return file.type.startsWith(
            "video/"
        );
    }

    return false;
}


/* =========================
   FILE INPUT
========================= */

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function () {

            const file =
                fileInput.files &&
                fileInput.files[0];

            if (!file) {
                return;
            }

            if (!isValidFile(file)) {

                showToast(
                    "That file does not match the selected type."
                );

                fileInput.value = "";

                return;
            }

            showSelectedFile(file);

        }
    );
}


/* =========================
   SHOW SELECTED FILE
========================= */

function showSelectedFile(file) {

    currentFile = file;

    outputBlob = null;
    outputName = "";

    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );
    }

    previewURL =
        URL.createObjectURL(
            file
        );

    if (emptyFile) {
        emptyFile.classList.add(
            "hidden"
        );
    }

    if (selectedFile) {
        selectedFile.classList.remove(
            "hidden"
        );
    }

    if (fileName) {
        fileName.textContent =
            file.name;
    }

    if (fileSize) {
        fileSize.textContent =
            formatBytes(
                file.size
            );
    }

    if (preview) {

        preview.innerHTML = "";

        if (
            selectedType ===
            "picture"
        ) {

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                previewURL;

            image.alt =
                "Preview";

            preview.appendChild(
                image
            );

        } else if (
            selectedType ===
            "sound"
        ) {

            const audio =
                document.createElement(
                    "audio"
                );

            audio.controls = true;
            audio.preload =
                "metadata";

            audio.src =
                previewURL;

            preview.appendChild(
                audio
            );

        } else if (
            selectedType ===
            "video"
        ) {

            const video =
                document.createElement(
                    "video"
                );

            video.controls = true;
            video.playsInline = true;
            video.preload =
                "metadata";

            video.src =
                previewURL;

            preview.appendChild(
                video
            );
        }
    }

    if (convertSection) {
        convertSection.classList.remove(
            "hidden"
        );
    }

    if (convertButton) {
        convertButton.disabled =
            true;
    }

    if (conversionText) {
        conversionText.textContent =
            "Choose an output format";
    }

    if (resultSection) {
        resultSection.classList.add(
            "hidden"
        );
    }
}


/* =========================
   CREATE FORMAT BUTTONS
========================= */

function createFormats() {

    if (!formatGrid) {
        return;
    }

    formatGrid.innerHTML = "";

    selectedFormat = "";

    const list =
        formats[selectedType] || [];

    list.forEach(
        function (format) {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "format-button";

            button.textContent =
                format;

            button.addEventListener(
                "click",
                function () {

                    selectedFormat =
                        format;

                    formatGrid
                        .querySelectorAll(
                            ".format-button"
                        )
                        .forEach(
                            function (
                                item
                            ) {

                                item.classList.toggle(
                                    "selected",
                                    item === button
                                );

                            }
                        );

                    if (conversionText) {

                        conversionText.textContent =
                            "Output format: " +
                            format;
                    }

                    if (convertButton) {

                        convertButton.disabled =
                            !currentFile ||
                            !selectedFormat;
                    }

                }
            );

            formatGrid.appendChild(
                button
            );

        }
    );
}


/* =========================
   REMOVE FILE
========================= */

if (removeFile) {

    removeFile.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            resetFile();

        }
    );
}


/* =========================
   CONVERT BUTTON
========================= */

if (convertButton) {

    convertButton.addEventListener(
        "click",
        async function () {

            if (
                !currentFile ||
                !selectedFormat
            ) {

                showToast(
                    "Choose a file and format first."
                );

                return;
            }

            convertButton.disabled =
                true;

            if (progressSection) {

                progressSection.classList.remove(
                    "hidden"
                );
            }

            if (resultSection) {

                resultSection.classList.add(
                    "hidden"
                );
            }

            setProgress(
                5,
                "Preparing..."
            );

            try {

                await performConversion();

            } catch (error) {

                console.error(
                    error
                );

                if (progressSection) {

                    progressSection.classList.add(
                        "hidden"
                    );
                }

                convertButton.disabled =
                    false;

                showToast(
                    error.message ||
                    "Conversion failed."
                );
            }

        }
    );
}


/* =========================
   PERFORM CONVERSION
========================= */

async function performConversion() {

    if (selectedType === "picture") {

        await convertImage();

        return;
    }

    if (selectedType === "sound") {

        await convertAudioToWav();

        return;
    }

    if (selectedType === "video") {

        await convertVideo();

        return;
    }

    throw new Error(
        "Unknown conversion type."
    );
}


/* =========================
   IMAGE CONVERSION
========================= */

async function convertImage() {

    setProgress(
        15,
        "Loading picture..."
    );

    const image =
        new Image();

    image.src =
        URL.createObjectURL(
            currentFile
        );

    await new Promise(
        function (resolve, reject) {

            image.onload =
                resolve;

            image.onerror =
                function () {

                    reject(
                        new Error(
                            "Could not read the picture."
                        )
                    );

                };

        }
    );

    setProgress(
        40,
        "Processing picture..."
    );

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        image.naturalWidth;

    canvas.height =
        image.naturalHeight;

    const context =
        canvas.getContext(
            "2d"
        );

    if (!context) {

        throw new Error(
            "Canvas is not supported."
        );
    }

    context.drawImage(
        image,
        0,
        0
    );

    URL.revokeObjectURL(
        image.src
    );

    setProgress(
        70,
        "Creating output..."
    );

    let mimeType =
        "image/png";

    if (
        selectedFormat === "JPG"
    ) {

        mimeType =
            "image/jpeg";

    } else if (
        selectedFormat === "WEBP"
    ) {

        mimeType =
            "image/webp";
    }

    const blob =
        await new Promise(
            function (resolve) {

                canvas.toBlob(
                    resolve,
                    mimeType,
                    0.92
                );

            }
        );

    if (!blob) {

        throw new Error(
            "Your browser could not create the image."
        );
    }

    outputBlob =
        blob;

    outputName =
        renameFile(
            currentFile.name,
            selectedFormat
        );

    setProgress(
        100,
        "Done"
    );

    await finishConversion();
}


/* =========================
   AUDIO → WAV
========================= */

async function convertAudioToWav() {

    setProgress(
        15,
        "Reading audio..."
    );

    const arrayBuffer =
        await currentFile.arrayBuffer();

    setProgress(
        35,
        "Decoding audio..."
    );

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {

        throw new Error(
            "Audio conversion is not supported in this browser."
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

        throw new Error(
            "This audio format cannot be decoded by your browser."
        );

    } finally {

        if (
            context.close
        ) {

            try {
                await context.close();
            } catch (error) {
                console.warn(error);
            }

        }
    }

    setProgress(
        65,
        "Encoding WAV..."
    );

    outputBlob =
        encodeWAV(
            audioBuffer
        );

    outputName =
        renameFile(
            currentFile.name,
            "WAV"
        );

    setProgress(
        100,
        "Done"
    );

    await finishConversion();
}


/* =========================
   ENCODE WAV
========================= */

function encodeWAV(audioBuffer) {

    const channels =
        audioBuffer.numberOfChannels;

    const sampleRate =
        audioBuffer.sampleRate;

    const length =
        audioBuffer.length;

    const bytesPerSample =
        2;

    const blockAlign =
        channels *
        bytesPerSample;

    const dataSize =
        length *
        blockAlign;

    const buffer =
        new ArrayBuffer(
            44 + dataSize
        );

    const view =
        new DataView(
            buffer
        );

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
        sampleRate *
        blockAlign,
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
        let sample = 0;
        sample < length;
        sample++
    ) {

        for (
            let channel = 0;
            channel < channels;
            channel++
        ) {

            let value =
                channelData[
                    channel
                ][sample];

            value =
                Math.max(
                    -1,
                    Math.min(
                        1,
                        value
                    )
                );

            const intValue =
                value < 0
                    ? value * 0x8000
                    : value * 0x7fff;

            view.setInt16(
                offset,
                intValue,
                true
            );

            offset += 2;
        }
    }

    return new Blob(
        [buffer],
        {
            type:
                "audio/wav"
        }
    );
}


/* =========================
   WRITE STRING
========================= */

function writeString(
    view,
    offset,
    text
) {

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


/* =========================
   VIDEO
========================= */

async function convertVideo() {

    setProgress(
        35,
        "Checking video..."
    );

    const isMP4 =
        currentFile.type ===
            "video/mp4" ||
        /\.mp4$/i.test(
            currentFile.name
        );

    if (!isMP4) {

        throw new Error(
            "Browser-only ConvertX cannot transcode this video to MP4 yet."
        );
    }

    await wait(400);

    setProgress(
        75,
        "Preparing MP4..."
    );

    await wait(400);

    outputBlob =
        currentFile;

    outputName =
        renameFile(
            currentFile.name,
            "MP4"
        );

    setProgress(
        100,
        "Done"
    );

    await finishConversion();
}


/* =========================
   FINISH CONVERSION
========================= */

async function finishConversion() {

    await wait(250);

    if (progressSection) {

        progressSection.classList.add(
            "hidden"
        );
    }

    if (resultSection) {

        resultSection.classList.remove(
            "hidden"
        );
    }

    if (resultName) {

        resultName.textContent =
            outputName;
    }

    if (convertButton) {

        convertButton.disabled =
            false;
    }

    showToast(
        "Conversion complete."
    );
}


/* =========================
   DOWNLOAD
========================= */

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        function () {

            if (!outputBlob) {

                showToast(
                    "No converted file available."
                );

                return;
            }

            const url =
                URL.createObjectURL(
                    outputBlob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href =
                url;

            link.download =
                outputName ||
                "converted-file";

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                },
                1000
            );

        }
    );
}


/* =========================
   PHONE MODE
========================= */

if (phoneMode) {

    phoneMode.addEventListener(
        "click",
        function () {

            document.body.classList.add(
                "phone-mode"
            );

            document.body.classList.remove(
                "desktop-mode"
            );

            localStorage.setItem(
                "convertx-mode",
                "phone"
            );

            showToast(
                "Phone mode enabled."
            );

        }
    );
}


/* =========================
   DESKTOP MODE
========================= */

if (desktopMode) {

    desktopMode.addEventListener(
        "click",
        function () {

            document.body.classList.add(
                "desktop-mode"
            );

            document.body.classList.remove(
                "phone-mode"
            );

            localStorage.setItem(
                "convertx-mode",
                "desktop"
            );

            showToast(
                "Desktop mode enabled."
            );

        }
    );
}


/* =========================
   THEME
========================= */

if (themeButton) {

    themeButton.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "light-theme"
            );

            const isLight =
                document.body.classList.contains(
                    "light-theme"
                );

            themeButton.textContent =
                isLight
                    ? "🌙 Dark"
                    : "☀ Light";

            localStorage.setItem(
                "convertx-theme",
                isLight
                    ? "light"
                    : "dark"
            );

        }
    );
}


/* =========================
   RESTORE SETTINGS
========================= */

(function restoreSettings() {

    const savedTheme =
        localStorage.getItem(
            "convertx-theme"
        );

    const savedMode =
        localStorage.getItem(
            "convertx-mode"
        );


    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-theme"
        );

        if (themeButton) {

            themeButton.textContent =
                "🌙 Dark";
        }
    }


    if (
        savedMode === "phone"
    ) {

        document.body.classList.add(
            "phone-mode"
        );
    }


    if (
        savedMode === "desktop"
    ) {

        document.body.classList.add(
            "desktop-mode"
        );
    }

})();
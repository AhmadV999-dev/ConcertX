"use strict";

/* =========================
   DOM
========================= */

const typeCards = document.querySelectorAll(".type-card");

const toolSection = document.getElementById("toolSection");
const selectedTypeText =
    document.getElementById("selectedTypeText");

const fileBox = document.getElementById("fileBox");
const emptyFile = document.getElementById("emptyFile");
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
    picture: ["PNG", "JPG", "WEBP"],
    sound: ["WAV"],
    video: ["MP4"]
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

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================
   FILE SIZE
========================= */

function formatBytes(bytes) {

    if (!bytes || bytes <= 0) {
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
            Math.log(bytes) / Math.log(1024)
        );

    const safeIndex =
        Math.min(index, units.length - 1);

    const value =
        bytes /
        Math.pow(1024, safeIndex);

    return (
        value.toFixed(
            safeIndex === 0 ? 0 : 2
        ) +
        " " +
        units[safeIndex]
    );
}


/* =========================
   WAIT
========================= */

function wait(milliseconds) {

    return new Promise(function (resolve) {

        setTimeout(
            resolve,
            milliseconds
        );

    });
}


/* =========================
   PROGRESS
========================= */

function setProgress(percent, message) {

    const safePercent =
        Math.max(
            0,
            Math.min(100, percent)
        );

    if (progressBar) {
        progressBar.style.width =
            safePercent + "%";
    }

    if (progressNumber) {
        progressNumber.textContent =
            Math.round(safePercent) + "%";
    }

    if (progressText) {
        progressText.textContent =
            message;
    }
}


/* =========================
   RENAME FILE
========================= */

function renameFile(name, extension) {

    const dotIndex =
        name.lastIndexOf(".");

    let baseName = name;

    if (dotIndex > 0) {
        baseName =
            name.substring(0, dotIndex);
    }

    return (
        baseName +
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

    typeCards.forEach(function (card) {

        card.classList.toggle(
            "selected",
            card.dataset.type === type
        );

    });


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
        toolSection.classList.remove("hidden");
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


    setTimeout(function () {

        if (toolSection) {

            toolSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }, 80);
}


/* =========================
   TYPE BUTTONS
========================= */

typeCards.forEach(function (card) {

    card.addEventListener(
        "click",
        function () {

            const type =
                card.dataset.type;

            chooseType(type);
        }
    );

});


/* =========================
   RESET FILE
========================= */

function resetFile() {

    currentFile = null;

    outputBlob = null;
    outputName = "";

    selectedFormat = "";


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
        fileName.textContent = "File";
    }


    if (fileSize) {
        fileSize.textContent = "0 B";
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
        convertButton.disabled = true;
    }
}


/* =========================
   FILE VALIDATION
========================= */

function isValidFile(file) {

    if (!file) {
        return false;
    }


    if (selectedType === "picture") {

        return (
            file.type.startsWith("image/") ||
            /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(
                file.name
            )
        );

    }


    if (selectedType === "sound") {

        return (
            file.type.startsWith("audio/") ||
            /\.(mp3|wav|ogg|oga|m4a|aac|flac|webm)$/i.test(
                file.name
            )
        );

    }


    if (selectedType === "video") {

        return (
            file.type.startsWith("video/") ||
            /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(
                file.name
            )
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
                    "This file type is not supported here."
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
    selectedFormat = "";


    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );
    }


    previewURL =
        URL.createObjectURL(file);


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
            formatBytes(file.size);
    }


    if (preview) {

        preview.innerHTML = "";


        if (selectedType === "picture") {

            const image =
                document.createElement("img");

            image.src =
                previewURL;

            image.alt =
                "Preview";

            preview.appendChild(
                image
            );


        } else if (selectedType === "sound") {

            const audio =
                document.createElement("audio");

            audio.controls = true;
            audio.preload = "metadata";
            audio.src = previewURL;

            preview.appendChild(
                audio
            );


        } else if (selectedType === "video") {

            const video =
                document.createElement("video");

            video.controls = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.src = previewURL;

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

        convertButton.disabled = true;
    }


    if (conversionText) {

        conversionText.textContent =
            "Choose an output format";
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


    const availableFormats =
        formats[selectedType] || [];


    availableFormats.forEach(
        function (format) {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "format-button";

            button.textContent =
                format;


            button.addEventListener(
                "click",
                function () {

                    selectedFormat =
                        format;


                    const allButtons =
                        formatGrid.querySelectorAll(
                            ".format-button"
                        );


                    allButtons.forEach(
                        function (item) {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    if (conversionText) {

                        conversionText.textContent =
                            "Output format: " +
                            format;
                    }


                    if (convertButton) {

                        convertButton.disabled =
                            !currentFile;
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

            showToast(
                "File removed."
            );
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

            if (!currentFile) {

                showToast(
                    "Choose a file first."
                );

                return;
            }


            if (!selectedFormat) {

                showToast(
                    "Choose an output format."
                );

                return;
            }


            convertButton.disabled = true;


            if (resultSection) {

                resultSection.classList.add(
                    "hidden"
                );
            }


            if (progressSection) {

                progressSection.classList.remove(
                    "hidden"
                );
            }


            setProgress(
                0,
                "Preparing..."
            );


            try {

                await performConversion();

            } catch (error) {

                console.error(error);


                if (progressSection) {

                    progressSection.classList.add(
                        "hidden"
                    );
                }


                convertButton.disabled =
                    false;


                showToast(
                    error &&
                    error.message
                        ? error.message
                        : "Conversion failed."
                );
            }

        }
    );
}


/* =========================
   PERFORM CONVERSION
========================= */

async function performConversion() {

    if (
        selectedType === "picture"
    ) {

        await convertImage();

        return;
    }


    if (
        selectedType === "sound"
    ) {

        await convertAudioToWav();

        return;
    }


    if (
        selectedType === "video"
    ) {

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
        10,
        "Loading picture..."
    );


    const image =
        new Image();


    const imageURL =
        URL.createObjectURL(
            currentFile
        );


    image.src =
        imageURL;


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
        35,
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

        URL.revokeObjectURL(
            imageURL
        );

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
        imageURL
    );


    setProgress(
        65,
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
            "Could not create the image."
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
   AUDIO TO WAV
========================= */

async function convertAudioToWav() {

    setProgress(
        10,
        "Reading audio..."
    );


    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContextClass) {

        throw new Error(
            "Your browser does not support audio conversion."
        );
    }


    const audioContext =
        new AudioContextClass();


    try {

        setProgress(
            30,
            "Decoding audio..."
        );


        const arrayBuffer =
            await currentFile.arrayBuffer();


        const audioBuffer =
            await audioContext.decodeAudioData(
                arrayBuffer
            );


        setProgress(
            60,
            "Creating WAV..."
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

    } finally {

        try {

            await audioContext.close();

        } catch (error) {

            console.warn(
                "Audio context close failed",
                error
            );
        }
    }
}


/* =========================
   WAV ENCODER
========================= */

function encodeWAV(audioBuffer) {

    const channels =
        Math.min(
            audioBuffer.numberOfChannels,
            2
        );


    const sampleRate =
        audioBuffer.sampleRate;


    const length =
        audioBuffer.length;


    const blockAlign =
        channels * 2;


    const dataSize =
        length * blockAlign;


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


    let offset = 44;


    const leftChannel =
        audioBuffer.getChannelData(0);


    let rightChannel = null;


    if (channels === 2) {

        rightChannel =
            audioBuffer.getChannelData(1);
    }


    for (
        let i = 0;
        i < length;
        i++
    ) {

        let left =
            Math.max(
                -1,
                Math.min(
                    1,
                    leftChannel[i]
                )
            );


        left =
            left < 0
                ? left * 0x8000
                : left * 0x7fff;


        view.setInt16(
            offset,
            left,
            true
        );


        if (channels === 2) {

            let right =
                Math.max(
                    -1,
                    Math.min(
                        1,
                        rightChannel[i]
                    )
                );


            right =
                right < 0
                    ? right * 0x8000
                    : right * 0x7fff;


            view.setInt16(
                offset + 2,
                right,
                true
            );


            offset += 4;

        } else {

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


/* =========================
   WRITE STRING
========================= */

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


/* =========================
   VIDEO
========================= */

async function convertVideo() {

    const isMP4 =
        currentFile.type === "video/mp4" ||
        /\.mp4$/i.test(
            currentFile.name
        );


    if (!isMP4) {

        throw new Error(
            "Browser-only ConvertX cannot convert this video to MP4 yet."
        );
    }


    setProgress(
        40,
        "Preparing MP4..."
    );


    await wait(500);


    setProgress(
        80,
        "Finalizing..."
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
   FINISH
========================= */

async function finishConversion() {

    await wait(300);


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
        "Conversion complete!"
    );


    setTimeout(
        function () {

            if (resultSection) {

                resultSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        },
        100
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
                    "No file to download."
                );

                return;
            }


            const downloadURL =
                URL.createObjectURL(
                    outputBlob
                );


            const anchor =
                document.createElement(
                    "a"
                );


            anchor.href =
                downloadURL;


            anchor.download =
                outputName ||
                "converted-file";


            anchor.style.display =
                "none";


            document.body.appendChild(
                anchor
            );


            anchor.click();


            document.body.removeChild(
                anchor
            );


            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        downloadURL
                    );

                },
                1000
            );


            showToast(
                "Download started."
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

            document.body.classList.toggle(
                "phone-mode"
            );


            document.body.classList.remove(
                "desktop-mode"
            );


            const enabled =
                document.body.classList.contains(
                    "phone-mode"
                );


            localStorage.setItem(
                "convertx-mode",
                enabled
                    ? "phone"
                    : ""
            );


            showToast(
                enabled
                    ? "Phone mode enabled"
                    : "Phone mode disabled"
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

            document.body.classList.toggle(
                "desktop-mode"
            );


            document.body.classList.remove(
                "phone-mode"
            );


            const enabled =
                document.body.classList.contains(
                    "desktop-mode"
                );


            localStorage.setItem(
                "convertx-mode",
                enabled
                    ? "desktop"
                    : ""
            );


            showToast(
                enabled
                    ? "Desktop mode enabled"
                    : "Desktop mode disabled"
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
"use strict";

/* =========================
   CONVERTX
   COMPLETE SCRIPT
========================= */


/* =========================
   DOM ELEMENTS
========================= */

const typeCards =
    document.querySelectorAll(".type-card");

const toolSection =
    document.getElementById("toolSection");

const selectedTypeText =
    document.getElementById("selectedTypeText");

const fileInput =
    document.getElementById("fileInput");

const emptyFile =
    document.getElementById("emptyFile");

const selectedFile =
    document.getElementById("selectedFile");

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

const toast =
    document.getElementById("toast");

const phoneMode =
    document.getElementById("phoneMode");

const desktopMode =
    document.getElementById("desktopMode");

const themeButton =
    document.getElementById("themeButton");


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
   AVAILABLE FORMATS
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
   FORMAT BYTES
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

    const index = Math.min(
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        ),
        units.length - 1
    );

    return (
        (
            bytes /
            Math.pow(
                1024,
                index
            )
        ).toFixed(1) +
        " " +
        units[index]
    );
}


/* =========================
   WAIT
========================= */

function wait(milliseconds) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
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

    const value = Math.max(
        0,
        Math.min(
            100,
            percent
        )
    );

    if (progressNumber) {
        progressNumber.textContent =
            value + "%";
    }

    if (progressBar) {
        progressBar.style.width =
            value + "%";
    }

    if (progressText) {
        progressText.textContent =
            message;
    }
}


/* =========================
   RENAME FILE
========================= */

function renameFile(
    originalName,
    extension
) {

    const dot =
        originalName.lastIndexOf(".");

    const baseName =
        dot > 0
            ? originalName.substring(
                0,
                dot
            )
            : originalName;

    return (
        baseName +
        "." +
        extension
    );
}


/* =========================
   CHOOSE CONVERSION TYPE
========================= */

function chooseType(type) {

    selectedType = type;

    selectedFormat = "";

    typeCards.forEach(
        function (card) {

            card.classList.toggle(
                "selected",
                card.dataset.type === type
            );

        }
    );


    if (type === "picture") {

        selectedTypeText.textContent =
            "Picture file";

    } else if (type === "sound") {

        selectedTypeText.textContent =
            "Sound file";

    } else {

        selectedTypeText.textContent =
            "Video file";
    }


    toolSection.classList.remove(
        "hidden"
    );


    resetFile();


    /* =========================
       DYNAMIC FILE ACCEPT
    ========================= */

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


    createFormats();


    toolSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================
   TYPE CARD EVENTS
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

    outputBlob = null;

    outputName = "";

    selectedFormat = "";


    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );

        previewURL = null;
    }


    fileInput.value = "";


    emptyFile.classList.remove(
        "hidden"
    );

    selectedFile.classList.add(
        "hidden"
    );

    convertSection.classList.add(
        "hidden"
    );

    progressSection.classList.add(
        "hidden"
    );

    resultSection.classList.add(
        "hidden"
    );


    preview.innerHTML = "";

    fileName.textContent =
        "File";

    fileSize.textContent =
        "0 B";

    conversionText.textContent =
        "Choose an output format";

    convertButton.disabled =
        true;


    setProgress(
        0,
        "Preparing..."
    );
}


/* =========================
   FILE VALIDATION
========================= */

function isValidFile(file) {

    if (!file || !selectedType) {
        return false;
    }


    if (
        selectedType === "picture"
    ) {

        return file.type.startsWith(
            "image/"
        );
    }


    if (
        selectedType === "sound"
    ) {

        return file.type.startsWith(
            "audio/"
        );
    }


    if (
        selectedType === "video"
    ) {

        return file.type.startsWith(
            "video/"
        );
    }


    return false;
}


/* =========================
   FILE INPUT
========================= */

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
                "Please choose a valid " +
                selectedType +
                " file."
            );

            fileInput.value = "";

            return;
        }


        currentFile = file;

        outputBlob = null;

        outputName = "";


        showSelectedFile(
            file
        );


        createFormats();

    }
);


/* =========================
   SHOW SELECTED FILE
========================= */

function showSelectedFile(file) {

    emptyFile.classList.add(
        "hidden"
    );

    selectedFile.classList.remove(
        "hidden"
    );


    fileName.textContent =
        file.name;

    fileSize.textContent =
        formatBytes(
            file.size
        );


    preview.innerHTML = "";


    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );

        previewURL = null;
    }


    previewURL =
        URL.createObjectURL(
            file
        );


    /* =========================
       IMAGE
    ========================= */

    if (
        selectedType === "picture"
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


    /* =========================
       SOUND
    ========================= */

    } else if (
        selectedType === "sound"
    ) {

        const audio =
            document.createElement(
                "audio"
            );

        audio.controls = true;

        audio.preload = "metadata";

        audio.src =
            previewURL;

        preview.appendChild(
            audio
        );


    /* =========================
       VIDEO
    ========================= */

    } else if (
        selectedType === "video"
    ) {

        const video =
            document.createElement(
                "video"
            );

        video.controls = true;

        video.playsInline = true;

        video.preload = "metadata";

        video.src =
            previewURL;

        preview.appendChild(
            video
        );
    }


    convertSection.classList.remove(
        "hidden"
    );


    convertButton.disabled =
        true;


    conversionText.textContent =
        "Choose an output format";
}


/* =========================
   CREATE FORMAT BUTTONS
========================= */

function createFormats() {

    formatGrid.innerHTML = "";

    selectedFormat = "";


    if (!selectedType) {

        convertSection.classList.add(
            "hidden"
        );

        return;
    }


    const availableFormats =
        formats[selectedType] || [];


    availableFormats.forEach(
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
                            function (item) {

                                item.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    button.classList.add(
                        "selected"
                    );


                    conversionText.textContent =
                        "Convert to " +
                        format;


                    convertButton.disabled =
                        !currentFile;
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
                    "Please choose a file."
                );

                return;
            }


            if (!selectedFormat) {

                showToast(
                    "Choose an output format."
                );

                return;
            }


            convertButton.disabled =
                true;


            progressSection.classList.remove(
                "hidden"
            );


            resultSection.classList.add(
                "hidden"
            );


            try {

                setProgress(
                    10,
                    "Preparing..."
                );

                await wait(200);


                setProgress(
                    30,
                    "Reading file..."
                );

                await wait(200);


                const result =
                    await performConversion();


                setProgress(
                    80,
                    "Finishing..."
                );

                await wait(300);


                outputBlob =
                    result.blob;

                outputName =
                    result.name;


                setProgress(
                    100,
                    "Complete"
                );

                await wait(300);


                resultName.textContent =
                    outputName;


                resultSection.classList.remove(
                    "hidden"
                );


                showToast(
                    "Conversion complete."
                );


            } catch (error) {

                console.error(
                    "ConvertX error:",
                    error
                );


                progressSection.classList.add(
                    "hidden"
                );


                showToast(
                    error.message ||
                    "Conversion failed."
                );


            } finally {

                convertButton.disabled =
                    !currentFile ||
                    !selectedFormat;
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

        return await convertImage();
    }


    if (
        selectedType === "sound"
    ) {

        return await convertAudioToWav();
    }


    if (
        selectedType === "video"
    ) {

        return await convertVideo();
    }


    throw new Error(
        "Unknown file type."
    );
}


/* =========================
   IMAGE CONVERSION
========================= */

async function convertImage() {

    const image =
        new Image();


    const url =
        URL.createObjectURL(
            currentFile
        );


    try {

        await new Promise(
            function (resolve, reject) {

                image.onload =
                    resolve;


                image.onerror =
                    function () {

                        reject(
                            new Error(
                                "Could not read image."
                            )
                        );

                    };


                image.src =
                    url;
            }
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


        let mimeType =
            "image/png";

        let extension =
            "png";


        if (
            selectedFormat === "JPG"
        ) {

            mimeType =
                "image/jpeg";

            extension =
                "jpg";
        }


        if (
            selectedFormat === "WEBP"
        ) {

            mimeType =
                "image/webp";

            extension =
                "webp";
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
                "Image conversion failed."
            );
        }


        return {

            blob: blob,

            name: renameFile(
                currentFile.name,
                extension
            )

        };


    } finally {

        URL.revokeObjectURL(
            url
        );
    }
}


/* =========================
   AUDIO → WAV
========================= */

async function convertAudioToWav() {

    if (
        selectedFormat !== "WAV"
    ) {

        throw new Error(
            "Only WAV conversion is available."
        );
    }


    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContextClass) {

        throw new Error(
            "Audio conversion is not supported in this browser."
        );
    }


    const arrayBuffer =
        await currentFile.arrayBuffer();


    const audioContext =
        new AudioContextClass();


    try {

        const audioBuffer =
            await audioContext.decodeAudioData(
                arrayBuffer.slice(0)
            );


        const wavBuffer =
            encodeWAV(
                audioBuffer
            );


        const blob =
            new Blob(
                [wavBuffer],
                {
                    type: "audio/wav"
                }
            );


        return {

            blob: blob,

            name: renameFile(
                currentFile.name,
                "wav"
            )

        };


    } finally {

        if (
            audioContext.close
        ) {

            await audioContext.close();
        }
    }
}


/* =========================
   WAV ENCODER
========================= */

function encodeWAV(
    audioBuffer
) {

    const numberOfChannels =
        audioBuffer.numberOfChannels;

    const sampleRate =
        audioBuffer.sampleRate;

    const dataLength =
        audioBuffer.length *
        numberOfChannels *
        2;


    const buffer =
        new ArrayBuffer(
            44 +
            dataLength
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
        36 +
        dataLength,
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
        numberOfChannels,
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
        numberOfChannels *
        2,
        true
    );


    view.setUint16(
        32,
        numberOfCh
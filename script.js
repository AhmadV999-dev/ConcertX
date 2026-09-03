"use strict";

const typeCards = document.querySelectorAll(".type-card");

const toolSection = document.getElementById("toolSection");
const selectedTypeText = document.getElementById("selectedTypeText");

const fileInput = document.getElementById("fileInput");
const emptyFile = document.getElementById("emptyFile");
const selectedFile = document.getElementById("selectedFile");
const removeFile = document.getElementById("removeFile");

const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

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

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");

const progressNumber =
    document.getElementById("progressNumber");

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

const modeButton =
    document.getElementById("modeButton");

const toast =
    document.getElementById("toast");

const typingText =
    document.getElementById("typingText");


let selectedType = "";
let selectedFormat = "";
let currentFile = null;

let outputBlob = null;
let outputName = "";

let previewURL = null;
let toastTimer = null;


const formats = {
    picture: ["PNG", "JPG", "WEBP"],
    sound: ["WAV"],
    video: ["MP4"]
};


/* =========================
   TOAST
========================= */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================
   HELPERS
========================= */

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


function formatBytes(bytes) {

    if (bytes === 0) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    return (
        (bytes / Math.pow(1024, index))
            .toFixed(index === 0 ? 0 : 2)
        + " "
        + units[index]
    );
}


function setProgress(value, text) {

    value = Math.max(
        0,
        Math.min(100, value)
    );

    progressBar.style.width =
        value + "%";

    progressNumber.textContent =
        Math.round(value) + "%";

    progressText.textContent =
        text;
}


/* =========================
   CHOOSE TYPE
========================= */

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
        "Choose your " +
        names[type] +
        " file";


    if (type === "picture") {

        fileInput.accept =
            "image/*";

    } else if (type === "sound") {

        fileInput.accept =
            "audio/*";

    } else {

        fileInput.accept =
            "video/mp4";

    }


    resetFile();


    toolSection.classList.remove(
        "hidden"
    );


    setTimeout(() => {

        toolSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 80);
}


typeCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {
            chooseType(
                card.dataset.type
            );
        }
    );

});


/* =========================
   RESET FILE
========================= */

function resetFile() {

    currentFile = null;
    selectedFormat = null;

    outputBlob = null;
    outputName = "";


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

    formatGrid.innerHTML = "";


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

function validFile(file) {

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

        return (
            file.type === "video/mp4" ||
            file.name
                .toLowerCase()
                .endsWith(".mp4")
        );

    }


    return false;
}


/* =========================
   FILE PICKER
========================= */

fileInput.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files &&
            fileInput.files[0];


        if (!file) {
            return;
        }


        if (!selectedType) {

            showToast(
                "Choose a type first."
            );

            fileInput.value = "";

            return;
        }


        if (!validFile(file)) {

            showToast(
                "Wrong file type."
            );

            fileInput.value = "";

            return;
        }


        currentFile = file;

        selectedFormat = null;

        outputBlob = null;

        outputName = "";


        fileName.textContent =
            file.name;

        fileSize.textContent =
            formatBytes(file.size);


        emptyFile.classList.add(
            "hidden"
        );

        selectedFile.classList.remove(
            "hidden"
        );


        progressSection.classList.add(
            "hidden"
        );

        resultSection.classList.add(
            "hidden"
        );


        createPreview(file);

        createFormats();


        convertSection.classList.remove(
            "hidden"
        );


        convertButton.disabled =
            true;


        conversionText.textContent =
            "Choose an output format";
    }
);


/* =========================
   PREVIEW
========================= */

function createPreview(file) {

    preview.innerHTML = "";


    if (previewURL) {

        URL.revokeObjectURL(
            previewURL
        );

        previewURL = null;
    }


    if (selectedType === "picture") {

        previewURL =
            URL.createObjectURL(file);


        const img =
            document.createElement("img");


        img.src =
            previewURL;

        img.alt =
            "Preview";


        preview.appendChild(img);

        return;
    }


    if (selectedType === "sound") {

        preview.textContent =
            "🎵";

        return;
    }


    preview.textContent =
        "🎬";
}


/* =========================
   FORMAT BUTTONS
========================= */

function createFormats() {

    formatGrid.innerHTML = "";


    const list =
        formats[selectedType] || [];


    list.forEach(format => {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";

        button.className =
            "format-option";

        button.textContent =
            format;


        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                document
                    .querySelectorAll(
                        ".format-option"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                selectedFormat =
                    format;


                conversionText.textContent =
                    "Convert " +
                    selectedType +
                    " to " +
                    format;


                convertButton.disabled =
                    false;
            }
        );


        formatGrid.appendChild(
            button
        );

    });
}


/* =========================
   REMOVE
========================= */

removeFile.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        resetFile();
    }
);


/* =========================
   IMAGE CONVERSION
========================= */

async function convertPicture() {

    const url =
        URL.createObjectURL(
            currentFile
        );


    try {

        const image =
            new Image();


        image.src = url;


        await new Promise(
            (resolve, reject) => {

                image.onload =
                    resolve;

                image.onerror =
                    () => reject(
                        new Error(
                            "Could not read image."
                        )
                    );
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


        const ctx =
            canvas.getContext("2d");


        if (
            selectedFormat === "JPG"
        ) {

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


        let mime =
            "image/png";


        if (
            selectedFormat === "JPG"
        ) {

            mime =
                "image/jpeg";

        } else if (
            selectedFormat === "WEBP"
        ) {

            mime =
                "image/webp";
        }


        const blob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        mime,
                        0.92
                    );
                }
            );


        if (!blob) {

            throw new Error(
                "Image conversion failed."
            );
        }


        return blob;

    } finally {

        URL.revokeObjectURL(url);

    }
}


/* =========================
   AUDIO → WAV
========================= */

async function convertAudioToWav() {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {

        throw new Error(
            "Audio conversion is not supported."
        );
    }


    const context =
        new AudioContext();


    try {

        const data =
            await currentFile.arrayBuffer();


        const audio =
            await context.decodeAudioData(
                data
            );


        const channels =
            audio.numberOfChannels;

        const sampleRate =
            audio.sampleRate;

        const length =
            audio.length;

        const bytesPerSample =
            2;

        const dataSize =
            length *
            channels *
            bytesPerSample;


        const buffer =
            new ArrayBuffer(
                44 + dataSize
            );


        const view =
            new DataView(buffer);


        function writeText(
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


        writeText(0, "RIFF");

        view.setUint32(
            4,
            36 + dataSize,
            true
        );

        writeText(8, "WAVE");

        writeText(12, "fmt ");

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
            channels *
            bytesPerSample,
            true
        );

        view.setUint16(
            32,
            channels *
            bytesPerSample,
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
            dataSize,
            true
        );


        let offset = 44;


        const channelData = [];


        for (
            let channel = 0;
            channel < channels;
            channel++
        ) {

            channelData.push(
                audio.getChannelData(
                    channel
                )
            );
        }


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
                    channelData[
                        channel
                    ][i];


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
                type:
                    "audio/wav"
            }
        );

    } finally {

        await context.close();

    }
}


/* =========================
   CONVERSION
========================= */

async function performConversion() {

    if (!currentFile) {

        throw new Error(
            "Choose a file first."
        );
    }


    if (!selectedFormat) {

        throw new Error(
            "Choose an output format."
        );
    }


    if (
        selectedType ===
        "picture"
    ) {

        return await convertPicture();

    }


    if (
        selectedType ===
        "sound"
    ) {

        return await convertAudioToWav();

    }


    if (
        selectedType ===
        "video"
    ) {

        if (
            selectedFormat === "MP4" &&
            (
                currentFile.type ===
                    "video/mp4" ||
                currentFile.name
                    .toLowerCase()
                    .endsWith(".mp4")
            )
        ) {

            return currentFile;
        }


        throw new Error(
            "Video transcoding requires a codec engine."
        );
    }


    throw new Error(
        "Unsupported conversion."
    );
}


/* =========================
   CONVERT
========================= */

convertButton.addEventListener(
    "click",
    async event => {

        event.preventDefault();

        event.stopPropagation();


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
                5,
                "Reading file..."
            );

            await wait(150);


            setProgress(
                20,
                "Preparing..."
            );

            await wait(150);


            setProgress(
                35,
                "Processing..."
            );


            outputBlob =
                await performConversion();


            setProgress(
                70,
                "Creating file..."
            );

            await wait(180);


            setProgress(
                90,
                "Finishing..."
            );

            await wait(180);


            const baseName =
                currentFile.name.replace(
                    /\.[^/.]+$/,
                    ""
                );


            outputName =
                baseName +
                "." +
                selectedFormat.toLowerCase();


            resultName.textContent =
                outputName;


            setProgress(
                100,
                "Complete"
            );


            await wait(300);


            resultSection.classList.remove(
                "hidden"
            );


            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

        catch (error) {

            console.error(
                error
            );


            outputBlob =
                null;


            progressSection.classList.add(
                "hidden"
            );


            showToast(
                error.message ||
                "Conversion failed."
            );

        }

        finally {

            convertButton.disabled =
                !selectedFormat;

        }

    }
);


/* =========================
   DOWNLOAD
========================= */

downloadButton.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();


        if (
            !outputBlob ||
            !outputName
        ) {

            showToast(
                "No converted file."
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
            outputName;

        link.style.display =
            "none";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1500
        );

    }
);


/* =========================
   PHONE / DESKTOP
========================= */

function setDeviceMode(mode) {

    document.body.classList.remove(
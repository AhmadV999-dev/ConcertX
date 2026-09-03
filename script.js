document.addEventListener("DOMContentLoaded", () => {
    const conversionSelect = document.getElementById("conversionSelect");
    const categoryButtons = document.querySelectorAll(".category");
    const fileInput = document.getElementById("fileInput");
    const browseBtn = document.getElementById("browseBtn");
    const dropZone = document.getElementById("dropZone");
    const fileCard = document.getElementById("fileCard");
    const fileType = document.getElementById("fileType");
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");
    const removeBtn = document.getElementById("removeBtn");
    const convertBtn = document.getElementById("convertBtn");
    const previewBox = document.getElementById("previewBox");
    const previewImage = document.getElementById("previewImage");
    const progressBox = document.getElementById("progressBox");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const progressNumber = document.getElementById("progressNumber");
    const resultBox = document.getElementById("resultBox");
    const resultName = document.getElementById("resultName");
    const downloadBtn = document.getElementById("downloadBtn");
    const fileHint = document.getElementById("fileHint");
    const toast = document.getElementById("toast");

    let category = "image";
    let selectedFile = null;
    let outputBlob = null;
    let outputName = "";
    let downloadURL = null;
    let busy = false;

    const conversions = {
        image: [
            ["png-jpg", "PNG → JPG"],
            ["jpg-png", "JPG → PNG"],
            ["png-webp", "PNG → WEBP"],
            ["jpg-webp", "JPG → WEBP"],
            ["webp-png", "WEBP → PNG"],
            ["webp-jpg", "WEBP → JPG"]
        ],

        audio: [
            ["ogg-wav", "OGG → WAV"],
            ["mp3-wav", "MP3 → WAV"],
            ["m4a-wav", "M4A → WAV"],
            ["wav-wav", "WAV → WAV"]
        ],

        video: [
            ["video-wav", "Video → WAV"]
        ]
    };

    function toastMessage(message) {
        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastMessage.timer);

        toastMessage.timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    function updateConversionList() {
        conversionSelect.innerHTML = "";

        conversions[category].forEach(item => {
            const option = document.createElement("option");

            option.value = item[0];
            option.textContent = item[1];

            conversionSelect.appendChild(option);
        });

        updateAccept();
        reset();
    }

    function updateAccept() {
        const value = conversionSelect.value;

        if (category === "image") {
            if (value.startsWith("png")) {
                fileInput.accept = "image/png";
            } else if (value.startsWith("jpg")) {
                fileInput.accept = "image/jpeg";
            } else {
                fileInput.accept = "image/webp";
            }

            fileHint.textContent = "PNG, JPG or WEBP";
        }

        if (category === "audio") {
            fileInput.accept =
                "audio/ogg,audio/wav,audio/mpeg,audio/mp4,audio/x-m4a";

            fileHint.textContent =
                "OGG, WAV, MP3 or M4A";
        }

        if (category === "video") {
            fileInput.accept = "video/*";

            fileHint.textContent =
                "MP4, MOV or supported video";
        }
    }

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (busy) return;

            category = button.dataset.category;

            categoryButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            updateConversionList();
        });
    });

    conversionSelect.addEventListener("change", () => {
        updateAccept();
        reset();
    });

    browseBtn.addEventListener("click", event => {
        event.stopPropagation();

        if (!busy) {
            fileInput.click();
        }
    });

    dropZone.addEventListener("click", event => {
        if (event.target === browseBtn) return;

        if (!busy) {
            fileInput.click();
        }
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });

    dropZone.addEventListener("dragover", event => {
        event.preventDefault();

        if (!busy) {
            dropZone.classList.add("dragging");
        }
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragging");
    });

    dropZone.addEventListener("drop", event => {
        event.preventDefault();

        dropZone.classList.remove("dragging");

        if (busy) return;

        const file = event.dataTransfer.files[0];

        if (file) {
            handleFile(file);
        }
    });

    function handleFile(file) {
        if (!file) return;

        selectedFile = file;
        outputBlob = null;

        if (downloadURL) {
            URL.revokeObjectURL(downloadURL);
            downloadURL = null;
        }

        resultBox.classList.add("hidden");

        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);

        fileType.textContent =
            category === "image"
                ? "IMG"
                : category === "audio"
                    ? "AUD"
                    : "VID";

        fileCard.classList.remove("hidden");
        convertBtn.disabled = false;

        if (category === "image") {
            const url = URL.createObjectURL(file);

            previewImage.onload = () => {
                URL.revokeObjectURL(url);
            };

            previewImage.src = url;

            previewBox.classList.remove("hidden");
        } else {
            previewBox.classList.add("hidden");
        }
    }

    removeBtn.addEventListener("click", event => {
        event.stopPropagation();

        if (!busy) {
            reset();
        }
    });

    function reset() {
        selectedFile = null;
        outputBlob = null;
        outputName = "";

        fileInput.value = "";

        fileCard.classList.add("hidden");
        previewBox.classList.add("hidden");
        progressBox.classList.add("hidden");
        resultBox.classList.add("hidden");

        convertBtn.disabled = true;

        if (downloadURL) {
            URL.revokeObjectURL(downloadURL);
            downloadURL = null;
        }

        progressBar.style.width = "0%";
        progressNumber.textContent = "0%";
        progressText.textContent = "Preparing...";
    }

    convertBtn.addEventListener("click", async () => {
        if (busy || !selectedFile) return;

        busy = true;
        convertBtn.disabled = true;

        progressBox.classList.remove("hidden");

        setProgress(5, "Preparing...");

        try {
            const conversion = conversionSelect.value;

            let result;

            if (category === "image") {
                result = await convertImage(
                    selectedFile,
                    conversion
                );
            } else if (category === "audio") {
                result = await convertAudio(
                    selectedFile
                );
            } else {
                result = await convertVideo(
                    selectedFile
                );
            }

            outputBlob = result.blob;
            outputName = result.name;

            resultName.textContent = outputName;

            setProgress(100, "Complete");

            setTimeout(() => {
                progressBox.classList.add("hidden");
                resultBox.classList.remove("hidden");
            }, 300);

        } catch (error) {
            console.error(error);

            progressBox.classList.add("hidden");

            toastMessage(
                error.message || "Conversion failed"
            );
        }

        busy = false;
        convertBtn.disabled = !selectedFile;
    });

    async function convertImage(file, conversion) {
        setProgress(20, "Loading image...");

        const image = new Image();
        const url = URL.createObjectURL(file);

        await new Promise((resolve, reject) => {
            image.onload = resolve;

            image.onerror = () => {
                reject(
                    new Error("Could not read image")
                );
            };

            image.src = url;
        });

        URL.revokeObjectURL(url);

        setProgress(45, "Converting image...");

        const canvas = document.createElement("canvas");

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error(
                "Canvas is not supported"
            );
        }

        const target = conversion.split("-")[1];

        if (target === "jpg") {
            ctx.fillStyle = "#ffffff";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }

        ctx.drawImage(image, 0, 0);

        const mime = {
            png: "image/png",
            jpg: "image/jpeg",
            webp: "image/webp"
        }[target];

        const blob = await new Promise(resolve => {
            canvas.toBlob(
                resolve,
                mime,
                target === "jpg" ? 0.92 : 0.9
            );
        });

        if (!blob) {
            throw new Error(
                "Could not create image"
            );
        }

        setProgress(90, "Finishing...");

        return {
            blob,
            name:
                cleanName(file.name) +
                "." +
                target
        };
    }

    async function convertAudio(file) {
        setProgress(15, "Loading audio...");

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            throw new Error(
                "Audio conversion is not supported"
            );
        }

        const context = new AudioContext();

        try {
            const buffer =
                await context.decodeAudioData(
                    await file.arrayBuffer()
                );

            setProgress(
                50,
                "Creating WAV..."
            );

            const wav =
                audioBufferToWav(buffer);

            setProgress(
                90,
                "Finishing..."
            );

            return {
                blob: new Blob(
                    [wav],
                    {
                        type: "audio/wav"
                    }
                ),

                name:
                    cleanName(file.name) +
                    ".wav"
            };

        } finally {
            try {
                await context.close();
            } catch (e) {}
        }
    }

    async function convertVideo(file) {
        setProgress(
            10,
            "Loading video..."
        );

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            throw new Error(
                "Audio conversion is not supported"
            );
        }

        const video =
            document.createElement("video");

        video.preload = "auto";
        video.playsInline = true;
        video.src =
            URL.createObjectURL(file);

        await new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;

            video.onerror = () => {
                reject(
                    new Error(
                        "Could not load video"
                    )
                );
            };
        });

        setProgress(
            30,
            "Preparing audio..."
        );

        const context =
            new AudioContext();

        const source =
            context.createMediaElementSource(
                video
            );

        const destination =
            context.createMediaStreamDestination();

        source.connect(destination);
        source.connect(context.destination);

        if (
            !window.MediaRecorder ||
            !MediaRecorder.isTypeSupported(
                "audio/ogg"
            )
        ) {
            throw new Error(
                "Direct OGG recording is not supported by this browser"
            );
        }

        const recorder =
            new MediaRecorder(
                destination.stream,
                {
                    mimeType: "audio/ogg"
                }
            );

        const chunks = [];

        recorder.ondataavailable = event => {
            if (event.data.size) {
                chunks.push(event.data);
            }
        };

        const finished =
            new Promise(resolve => {
                recorder.onstop = () => {
                    resolve(
                        new Blob(
                            chunks,
                            {
                                type: "audio/ogg"
                            }
                        )
                    );
                };
            });

        await context.resume();

        recorder.start();

        await video.play();

        await new Promise(resolve => {
            video.onended = resolve;
        });

        recorder.stop();

        const blob = await finished;

        source.disconnect();

        await context.close();

        URL.revokeObjectURL(video.src);

        setProgress(
            90,
            "Finishing..."
        );

        return {
            blob,
            name:
                cleanName(file.name) +
                ".ogg"
        };
    }

    function audioBufferToWav(buffer) {
        const channels =
            buffer.numberOfChannels;

        const sampleRate =
            buffer.sampleRate;

        const length =
            buffer.length *
            channels *
            2;

        const arrayBuffer =
            new ArrayBuffer(
                44 + length
            );

        const view =
            new DataView(arrayBuffer);

        writeString(view, 0, "RIFF");

        view.setUint32(
            4,
            36 + length,
            true
        );

        writeString(view, 8, "WAVE");
        writeString(view, 12, "fmt ");

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
            2,
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

        writeString(view, 36, "data");

        view.setUint32(
            40,
            length,
            true
        );

        let offset = 44;

        for (
            let i = 0;
            i < buffer.length;
            i++
        ) {
            for (
                let channel = 0;
                channel < channels;
                channel++
            ) {
                let sample =
                    buffer.getChannelData(
                        channel
                    )[i];

                sample =
                    Math.max(
                        -1,
                        Math.min(
                            1,
                            sample
                        )
                    );

                sample =
                    sample < 0
                        ? sample * 0x8000
                        : sample * 0x7fff;

                view.setInt16(
                    offset,
                    sample,
                    true
                );

                offset += 2;
            }
        }

        return arrayBuffer;
    }

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

    downloadBtn.addEventListener(
        "click",
        () => {
            if (!outputBlob) {
                toastMessage(
                    "Nothing to download"
                );
                return;
            }

            if (downloadURL) {
                URL.revokeObjectURL(
                    downloadURL
                );
            }

            downloadURL =
                URL.createObjectURL(
                    outputBlob
                );

            const link =
                document.createElement("a");

            link.href = downloadURL;
            link.download =
                outputName ||
                "converted-file";

            document.body.appendChild(link);

            link.click();

            link.remove();

            toastMessage(
                "Download started"
            );
        }
    );

    function setProgress(
        percent,
        text
    ) {
        const value =
            Math.round(
                Math.max(
                    0,
                    Math.min(
                        100,
                        percent
                    )
                )
            );

        progressBar.style.width =
            value + "%";

        progressNumber.textContent =
            value + "%";

        progressText.textContent =
            text;
    }

    function cleanName(name) {
        return name
            .replace(/\.[^/.]+$/, "")
            .replace(
                /[^a-zA-Z0-9._ -]/g,
                ""
            )
            .trim() ||
            "converted";
    }

    function formatBytes(bytes) {
        if (!bytes) return "0 Bytes";

        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];

        const index =
            Math.min(
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
            ).toFixed(2)
            .replace(/\.00$/, "") +
            " " +
            units[index]
        );
    }

    updateConversionList();
});

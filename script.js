document.addEventListener("DOMContentLoaded", () => {

    /* ================================
       ELEMENTS
    ================================= */

    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");

    const loginName = document.getElementById("loginName");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const userName = document.getElementById("userName");
    const avatar = document.getElementById("avatar");

    const tokenCount = document.getElementById("tokenCount");
    const bigTokenCount = document.getElementById("bigTokenCount");

    const modeButtons = document.querySelectorAll(".mode");
    const formatButtons = document.querySelectorAll(".format");

    const formatArea = document.getElementById("formatArea");
    const costLabel = document.getElementById("costLabel");
    const buttonCost = document.getElementById("buttonCost");

    const dropZone = document.getElementById("dropZone");
    const browseBtn = document.getElementById("browseBtn");
    const fileInput = document.getElementById("fileInput");

    const fileCard = document.getElementById("fileCard");
    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");
    const fileIcon = document.getElementById("fileIcon");
    const removeFile = document.getElementById("removeFile");

    const previewWrap = document.getElementById("previewWrap");
    const imagePreview = document.getElementById("imagePreview");

    const convertBtn = document.getElementById("convertBtn");

    const progressArea = document.getElementById("progressArea");
    const progressBar = document.getElementById("progressBar");
    const progressPercent = document.getElementById("progressPercent");
    const progressText = document.getElementById("progressText");

    const resultCard = document.getElementById("resultCard");
    const resultName = document.getElementById("resultName");
    const downloadBtn = document.getElementById("downloadBtn");

    const supportedText = document.getElementById("supportedText");
    const toast = document.getElementById("toast");


    /* ================================
       STATE
    ================================= */

    let currentMode = "photo";
    let currentFormat = "png";
    let selectedFile = null;
    let convertedBlob = null;
    let convertedName = "";
    let downloadURL = null;
    let converting = false;


    const COSTS = {
        photo: 5,
        video: 10
    };


    /* ================================
       TOKENS
       NEW USERS START WITH 100
    ================================= */

    let savedTokens =
        localStorage.getItem("convertx_tokens");

    let tokens =
        savedTokens === null
            ? 100
            : Number(savedTokens);


    if (
        !Number.isFinite(tokens) ||
        tokens < 0
    ) {
        tokens = 100;
    }


    localStorage.setItem(
        "convertx_tokens",
        String(tokens)
    );


    function updateTokens() {

        if (tokenCount) {
            tokenCount.textContent =
                tokens;
        }

        if (bigTokenCount) {
            bigTokenCount.textContent =
                tokens;
        }

        localStorage.setItem(
            "convertx_tokens",
            String(tokens)
        );
    }


    /* ================================
       TOAST
    ================================= */

    let toastTimer;


    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }


    /* ================================
       PROFILE
    ================================= */

    function getDisplayName(email) {

        if (!email) {
            return "Demo";
        }

        let name =
            email
                .split("@")[0]
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    ""
                );

        if (!name) {
            return "Demo";
        }

        return (
            name.charAt(0).toUpperCase() +
            name.slice(1)
        );
    }


    function openApp(email) {

        email =
            String(email || "").trim();


        if (!email) {
            email = "demo@gmail.com";
        }


        const name =
            getDisplayName(email);


        localStorage.setItem(
            "convertx_fake_email",
            email
        );


        localStorage.setItem(
            "convertx_fake_name",
            name
        );


        if (userName) {
            userName.textContent = name;
        }


        if (avatar) {
            avatar.textContent =
                name.charAt(0).toUpperCase();
        }


        if (loginScreen) {
            loginScreen.classList.add("hidden");
        }


        if (app) {
            app.classList.remove("hidden");
        }


        updateTokens();
    }


    /* ================================
       LOGIN
    ================================= */

    if (loginBtn) {

        loginBtn.onclick = () => {

            openApp(
                loginName
                    ? loginName.value
                    : ""
            );

        };
    }


    if (loginName) {

        loginName.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    openApp(
                        loginName.value
                    );
                }

            }
        );
    }


    /* ================================
       AUTO LOGIN
    ================================= */

    const savedEmail =
        localStorage.getItem(
            "convertx_fake_email"
        );


    if (savedEmail) {

        openApp(savedEmail);

    } else {

        if (loginScreen) {
            loginScreen.classList.remove(
                "hidden"
            );
        }

        if (app) {
            app.classList.add("hidden");
        }
    }


    /* ================================
       LOGOUT
    ================================= */

    if (logoutBtn) {

        logoutBtn.onclick = () => {

            localStorage.removeItem(
                "convertx_fake_email"
            );

            localStorage.removeItem(
                "convertx_fake_name"
            );


            if (app) {
                app.classList.add("hidden");
            }


            if (loginScreen) {
                loginScreen.classList.remove(
                    "hidden"
                );
            }


            if (loginName) {
                loginName.value = "";
                loginName.focus();
            }


            resetFile();
        };
    }


    /* ================================
       MODE
    ================================= */

    modeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (converting) return;


                modeButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add("active");


                currentMode =
                    button.dataset.mode ||
                    "photo";


                resetFile();

                updateConverterUI();
            }
        );
    });


    /* ================================
       FORMAT
    ================================= */

    formatButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    currentMode !== "photo"
                ) {
                    return;
                }


                formatButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add("active");


                currentFormat =
                    button.dataset.format ||
                    "png";
            }
        );
    });


    /* ================================
       CONVERTER UI
    ================================= */

    function updateConverterUI() {

        const cost =
            COSTS[currentMode];


        if (costLabel) {
            costLabel.textContent =
                `${cost} Tokens`;
        }


        if (buttonCost) {
            buttonCost.textContent =
                cost;
        }


        if (currentMode === "photo") {

            formatArea.classList.remove(
                "hidden"
            );


            supportedText.textContent =
                "JPG or PNG · Max 50MB";


            fileInput.accept =
                "image/jpeg,image/png";

        } else {

            formatArea.classList.add(
                "hidden"
            );


            supportedText.textContent =
                "MP4, WebM or MOV · Max 200MB";


            fileInput.accept =
                "video/*";
        }
    }


    /* ================================
       BROWSE
    ================================= */

    browseBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (!converting) {
                fileInput.click();
            }
        }
    );


    dropZone.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    "#browseBtn"
                )
            ) {
                return;
            }


            if (!converting) {
                fileInput.click();
            }
        }
    );


    fileInput.addEventListener(
        "change",
        () => {

            if (
                fileInput.files &&
                fileInput.files.length > 0
            ) {

                handleFile(
                    fileInput.files[0]
                );
            }
        }
    );


    /* ================================
       DRAG DROP
    ================================= */

    dropZone.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            if (!converting) {
                dropZone.classList.add(
                    "dragging"
                );
            }
        }
    );


    dropZone.addEventListener(
        "dragleave",
        () => {

            dropZone.classList.remove(
                "dragging"
            );
        }
    );


    dropZone.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            dropZone.classList.remove(
                "dragging"
            );


            if (converting) return;


            const files =
                event.dataTransfer.files;


            if (
                files &&
                files.length > 0
            ) {

                handleFile(files[0]);
            }
        }
    );


    /* ================================
       HANDLE FILE
    ================================= */

    function handleFile(file) {

        if (!file) return;


        const maxSize =
            currentMode === "photo"
                ? 50 * 1024 * 1024
                : 200 * 1024 * 1024;


        if (file.size > maxSize) {

            showToast(
                currentMode === "photo"
                    ? "Photo is bigger than 50MB"
                    : "Video is bigger than 200MB"
            );

            return;
        }


        if (
            currentMode === "photo" &&
            ![
                "image/jpeg",
                "image/png"
            ].includes(file.type)
        ) {

            showToast(
                "Choose a JPG or PNG file"
            );

            return;
        }


        if (
            currentMode === "video" &&
            !file.type.startsWith("video/")
        ) {

            showToast(
                "Choose a video file"
            );

            return;
        }


        selectedFile = file;

        convertedBlob = null;

        convertedName = "";


        if (downloadURL) {

            URL.revokeObjectURL(
                downloadURL
            );

            downloadURL = null;
        }


        fileName.textContent =
            file.name;


        fileSize.textContent =
            formatBytes(file.size);


        fileIcon.textContent =
            currentMode === "photo"
                ? "IMG"
                : "VID";


        fileCard.classList.remove(
            "hidden"
        );


        convertBtn.disabled = false;


        resultCard.classList.add(
            "hidden"
        );


        if (currentMode === "photo") {

            const reader =
                new FileReader();


            reader.onload = event => {

                imagePreview.src =
                    event.target.result;


                previewWrap.classList.remove(
                    "hidden"
                );
            };


            reader.readAsDataURL(file);

        } else {

            previewWrap.classList.add(
                "hidden"
            );
        }
    }


    /* ================================
       REMOVE FILE
    ================================= */

    removeFile.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (!converting) {
                resetFile();
            }
        }
    );


    function resetFile() {

        selectedFile = null;

        convertedBlob = null;

        convertedName = "";


        fileInput.value = "";


        fileCard.classList.add(
            "hidden"
        );


        previewWrap.classList.add(
            "hidden"
        );


        progressArea.classList.add(
            "hidden"
        );


        resultCard.classList.add(
            "hidden"
        );


        convertBtn.disabled = true;


        setProgress(
            0,
            "Preparing..."
        );


        if (downloadURL) {

            URL.revokeObjectURL(
                downloadURL
            );

            downloadURL = null;
        }
    }


    /* ================================
       CONVERT
    ================================= */

    convertBtn.addEventListener(
        "click",
        async () => {

            if (converting) return;


            if (!selectedFile) {

                showToast(
                    "Choose a file first"
                );

                return;
            }


            const cost =
                COSTS[currentMode];


            if (tokens < cost) {

                showToast(
                    `Not enough tokens · Need ${cost}`
                );

                return;
            }


            converting = true;

            convertBtn.disabled = true;


            progressArea.classList.remove(
                "hidden"
            );


            setProgress(
                5,
                "Preparing..."
            );


            try {

                let result;


                if (
                    currentMode === "photo"
                ) {

                    result =
                        await convertImage(
                            selectedFile,
                            currentFormat
                        );

                } else {

                    result =
                        await videoToAudio(
                            selectedFile
                        );
                }


                if (
                    !result ||
                    !result.blob
                ) {

                    throw new Error(
                        "Conversion failed"
                    );
                }


                /* REAL TOKEN CHARGE */

                tokens =
                    tokens - cost;


                updateTokens();


                convertedBlob =
                    result.blob;


                convertedName =
                    result.name;


                resultName.textContent =
                    convertedName;


                setProgress(
                    100,
                    "Complete"
                );


                setTimeout(
                    () => {

                        progressArea.classList.add(
                            "hidden"
                        );


                        resultCard.classList.remove(
                            "hidden"
                        );


                        showToast(
                            `Success · ${cost} tokens charged`
                        );

                    },
                    400
                );


            } catch (error) {

                console.error(error);


                progressArea.classList.add(
                    "hidden"
                );


                showToast(
                    error.message ||
                    "Conversion failed"
                );

            } finally {

                converting = false;


                convertBtn.disabled =
                    !selectedFile;
            }

        }
    );


    /* ================================
       IMAGE CONVERTER
    ================================= */

    function convertImage(
        file,
        format
    ) {

        return new Promise(
            (resolve, reject) => {

                const img =
                    new Image();


                const url =
                    URL.createObjectURL(file);


                img.onload = () => {

                    try {

                        URL.revokeObjectURL(
                            url
                        );


                        setProgress(
                            30,
                            "Reading image..."
                        );


                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        canvas.width =
                            img.naturalWidth;


                        canvas.height =
                            img.naturalHeight;


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );


                        if (!ctx) {

                            throw new Error(
                                "Canvas unavailable"
                            );
                        }


                        if (format === "jpg") {

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
                            img,
                            0,
                            0
                        );


                        setProgress(
                            65,
                            "Converting..."
                        );


                        const type =
                            format === "jpg"
                                ? "image/jpeg"
                                : "image/png";


                        canvas.toBlob(
                            blob => {

                                if (!blob) {

                                    reject(
                                        new Error(
                                            "Could not create image"
                                        )
                                    );

                                    return;
                                }


                                setProgress(
                                    90,
                                    "Finishing..."
                                );


                                resolve({

                                    blob: blob,

                                    name:
                                        `${cleanName(file.name)}.${format}`

                                });

                            },
                            type,
                            format === "jpg"
                                ? 0.92
                                : undefined
                        );


                    } catch (error) {

                        URL.revokeObjectURL(
                            url
                        );

                        reject(error);
                    }
                };


                img.onerror = () => {

                    URL.revokeObjectURL(
                        url
                    );


                    reject(
                        new Error(
                            "Could not read image"
                        )
                    );
                };


                img.src = url;
            }
        );
    }


    /* ================================
       VIDEO → VOICE
    ================================= */

    async function videoToAudio(file) {

        if (
            typeof MediaRecorder ===
            "undefined"
        ) {

            throw new Error(
                "Your browser does not support audio export"
            );
        }


        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {

            throw new Error(
                "Audio conversion is not supported"
            );
        }


        setProgress(
            10,
            "Loading video..."
        );


        const video =
            document.createElement("video");


        video.preload = "auto";
        video.playsInline = true;
        video.muted = false;


        const videoURL =
            URL.createObjectURL(file);


        video.src = videoURL;


        try {

            await waitForVideo(video);


            setProgress(
                25,
                "Preparing audio..."
            );


            const audioContext =
                new AudioContext();


            if (
                audioContext.state ===
                "suspended"
            ) {

                await audioContext.resume();
            }


            const source =
                audioContext
                    .createMediaElementSource(
                        video
                    );


            const destination =
                audioContext
                    .createMediaStreamDestination();


            source.connect(destination);

            source.connect(
                audioContext.destination
            );


            const mime =
                MediaRecorder.isTypeSupported(
                    "audio/webm;codecs=opus"
                )
                    ? "audio/webm;codecs=opus"
                    : "audio/webm";


            const recorder =
                new MediaRecorder(
                    destination.stream,
                    {
                        mimeType: mime
                    }
                );


            const chunks = [];


            recorder.ondataavailable =
                event => {

                    if (
                        event.data &&
                        event.data.size
                    ) {

                        chunks.push(
                            event.data
                        );
                    }
                };


            const finished =
                new Promise(
                    (resolve, reject) => {

                        recorder.onstop =
                            () => {

                                resolve(
                                    new Blob(
                                        chunks,
                                        {
                                            type: mime
                                        }
                                    )
                                );
                            };


                        recorder.onerror =
                            () => {

                                reject(
                                    new Error(
                                        "Audio recording failed"
                                    )
                                );
                            };
                    }
                );


            const duration =
                Number.isFinite(
                    video.duration
                )
                    ? video.duration
                    : 0;


            await video.play();


            recorder.start();


            setProgress(
                30,
                "Extracting audio..."
            );


            const timer =
                setInterval(
                    () => {

                        if (duration > 0) {

                            const percent =
                                30 +
                                (
                                    video.currentTime /
                                    duration
                                ) * 60;


                            setProgress(
                                Math.min(
                                    90,
                                    percent
                                ),
                                "Extracting audio..."
                            );
                        }

                    },
                    250
                );


            await new Promise(
                (resolve, reject) => {

                    video.onended =
                        resolve;


                    video.onerror =
                        () => {

                            reject(
                                new Error(
                                    "Video playback failed"
                                )
                            );
                        };
                }
            );


            clearInterval(timer);


            if (
                recorder.state !==
                "inactive"
            ) {

                recorder.stop();
            }


            const blob =
                await finished;


            source.disconnect();


            try {
                await audioContext.close();
            } catch (e) {}


            setProgress(
                95,
                "Creating voice file..."
            );


            return {

                blob: blob,

                name:
                    `${cleanName(file.name)}-voice.webm`
            };


        } finally {

            video.pause();

            video.removeAttribute("src");

            video.load();

            URL.revokeObjectURL(
                videoURL
            );
        }
    }


    /* ================================
       WAIT VIDEO
    ================================= */

    function waitForVideo(video) {

        return new Promise(
            (resolve, reject) => {

                if (
                    video.readyState >= 1
                ) {

                    resolve();

                    return;
                }


                const timeout =
                    setTimeout(
                        () => {

                            reject(
                                new Error(
                                    "Video loading timed out"
                                )
                            );

                        },
                        15000
                    );


                video.onloadedmetadata =
                    () => {

                        clearTimeout(timeout);

                        resolve();
                    };


                video.onerror =
                    () => {

                        clearTimeout(timeout);

                        reject(
                            new Error(
                                "Could not load video"
                            )
                        );
                    };
            }
        );
    }


    /* ================================
       DOWNLOAD
    ================================= */

    downloadBtn.addEventListener(
        "click",
        () => {

            if (!convertedBlob) {

                showToast(
                    "No converted file"
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
                    convertedBlob
                );


            const link =
                document.createElement("a");


            link.href =
                downloadURL;


            link.download =
                convertedName ||
                "converted-file";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            showToast(
                "Download started"
            );
        }
    );


    /* ================================
       HELPERS
    ================================= */

    function cleanName(name) {

        return String(name || "")
            .replace(
                /\.[^/.]+$/,
                ""
            )
            .replace(
                /[^a-zA-Z0-9._ -]/g,
                ""
            )
            .trim() ||
            "converted";
    }


    function formatBytes(bytes) {

        if (!bytes) {
            return "0 Bytes";
        }


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
            parseFloat(
                (
                    bytes /
                    Math.pow(
                        1024,
                        index
                    )
                ).toFixed(2)
            ) +
            " " +
            units[index]
        );
    }


    function setProgress(
        percent,
        text
    ) {

        percent =
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
            `${percent}%`;


        progressPercent.textContent =
            `${percent}%`;


        progressText.textContent =
            text;
    }


    /* ================================
       START
    ================================= */

    updateConverterUI();

    updateTokens();

});

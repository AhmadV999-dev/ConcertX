/* =========================================
   CONVERTX
   LOCAL BROWSER CONVERTER
   No Firebase
   No real Google login
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
    ====================================== */

    const loginScreen =
        document.getElementById("loginScreen");

    const app =
        document.getElementById("app");

    const loginName =
        document.getElementById("loginName");

    const loginBtn =
        document.getElementById("loginBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const userName =
        document.getElementById("userName");

    const avatar =
        document.getElementById("avatar");

    const tokenCount =
        document.getElementById("tokenCount");

    const bigTokenCount =
        document.getElementById("bigTokenCount");

    const modeButtons =
        document.querySelectorAll(".mode");

    const formatButtons =
        document.querySelectorAll(".format");

    const formatArea =
        document.getElementById("formatArea");

    const costLabel =
        document.getElementById("costLabel");

    const buttonCost =
        document.getElementById("buttonCost");

    const dropZone =
        document.getElementById("dropZone");

    const fileInput =
        document.getElementById("fileInput");

    const browseBtn =
        document.getElementById("browseBtn");

    const fileCard =
        document.getElementById("fileCard");

    const fileName =
        document.getElementById("fileName");

    const fileSize =
        document.getElementById("fileSize");

    const fileIcon =
        document.getElementById("fileIcon");

    const removeFile =
        document.getElementById("removeFile");

    const previewWrap =
        document.getElementById("previewWrap");

    const imagePreview =
        document.getElementById("imagePreview");

    const convertBtn =
        document.getElementById("convertBtn");

    const progressArea =
        document.getElementById("progressArea");

    const progressBar =
        document.getElementById("progressBar");

    const progressPercent =
        document.getElementById("progressPercent");

    const progressText =
        document.getElementById("progressText");

    const resultCard =
        document.getElementById("resultCard");

    const resultName =
        document.getElementById("resultName");

    const downloadBtn =
        document.getElementById("downloadBtn");

    const supportedText =
        document.getElementById("supportedText");

    const toast =
        document.getElementById("toast");


    /* =====================================
       STATE
    ====================================== */

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


    /* =====================================
       TOKENS
    ====================================== */

let savedTokens = localStorage.getItem("convertx_tokens");

let tokens = savedTokens === null
    ? 100
    : Number(savedTokens);

if (!Number.isFinite(tokens) || tokens < 0) {
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


    /* =====================================
       TOAST
    ====================================== */

    let toastTimer = null;


    function showToast(message) {

        if (!toast) return;

        toast.textContent =
            message;

        toast.classList.add(
            "show"
        );

        clearTimeout(
            toastTimer
        );

        toastTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2500);
    }


    /* =====================================
       PROFILE
    ====================================== */

    function getDisplayName(value) {

        value =
            String(value || "")
                .trim();


        if (!value) {
            return "Demo";
        }


        if (value.includes("@")) {

            value =
                value.split("@")[0];
        }


        value =
            value.replace(
                /[^a-zA-Z0-9._-]/g,
                ""
            );


        if (!value) {
            return "Demo";
        }


        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    }


    function openApp(value) {

        const email =
            String(value || "")
                .trim() ||
            "demo@gmail.com";


        const name =
            getDisplayName(email);


        /*
           This is only a local demo profile.
           Nothing is sent to Google.
        */

        localStorage.setItem(
            "convertx_fake_email",
            email
        );

        localStorage.setItem(
            "convertx_fake_name",
            name
        );


        if (userName) {
            userName.textContent =
                name;
        }


        if (avatar) {
            avatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();
        }


        if (loginScreen) {
            loginScreen.classList.add(
                "hidden"
            );
        }


        if (app) {
            app.classList.remove(
                "hidden"
            );
        }


        updateTokens();
    }


    /* =====================================
       LOGIN
    ====================================== */

    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            () => {

                openApp(
                    loginName
                        ? loginName.value
                        : ""
                );

            }
        );
    }


    if (loginName) {

        loginName.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    openApp(
                        loginName.value
                    );
                }

            }
        );
    }


    /* =====================================
       AUTO LOGIN
    ====================================== */

    const savedEmail =
        localStorage.getItem(
            "convertx_fake_email"
        );


    if (savedEmail) {

        openApp(
            savedEmail
        );

    } else {

        if (loginScreen) {
            loginScreen.classList.remove(
                "hidden"
            );
        }

        if (app) {
            app.classList.add(
                "hidden"
            );
        }
    }


    /* =====================================
       LOGOUT
    ====================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "convertx_fake_email"
                );

                localStorage.removeItem(
                    "convertx_fake_name"
                );


                if (app) {
                    app.classList.add(
                        "hidden"
                    );
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

            }
        );
    }


    /* =====================================
       MODE BUTTONS
    ====================================== */

    modeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (converting) {
                    return;
                }


                modeButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add(
                    "active"
                );


                currentMode =
                    button.dataset.mode ||
                    "photo";


                resetFile();

                updateConverterUI();
            }
        );

    });


    /* =====================================
       UPDATE UI
    ====================================== */

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


        if (
            currentMode === "photo"
        ) {

            if (formatArea) {
                formatArea.classList.remove(
                    "hidden"
                );
            }


            if (supportedText) {

                supportedText.textContent =
                    "JPG or PNG · Max 50MB";
            }


            if (fileInput) {

                fileInput.accept =
                    "image/jpeg,image/png";
            }

        } else {

            if (formatArea) {
                formatArea.classList.add(
                    "hidden"
                );
            }


            if (supportedText) {

                supportedText.textContent =
                    "MP4, WebM or MOV · Max 200MB";
            }


            if (fileInput) {

                fileInput.accept =
                    "video/*";
            }
        }
    }


    /* =====================================
       FORMAT BUTTONS
    ====================================== */

    formatButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (currentMode !== "photo") {
                    return;
                }


                formatButtons.forEach(
                    item => {
                        item.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add(
                    "active"
                );


                currentFormat =
                    button.dataset.format ||
                    "png";
            }
        );

    });


    /* =====================================
       BROWSE
    ====================================== */

    if (browseBtn) {

        browseBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                if (!converting) {
                    fileInput.click();
                }

            }
        );
    }


    if (dropZone) {

        dropZone.addEventListener(
            "click",
            event => {

                if (
                    event.target === browseBtn ||
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
    }


    if (fileInput) {

        fileInput.addEventListener(
            "change",
            () => {

                if (
                    fileInput.files &&
                    fileInput.files.length
                ) {

                    handleFile(
                        fileInput.files[0]
                    );
                }

            }
        );
    }


    /* =====================================
       DRAG & DROP
    ====================================== */

    if (dropZone) {

        [
            "dragenter",
            "dragover"
        ].forEach(
            eventName => {

                dropZone.addEventListener(
                    eventName,
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        if (!converting) {

                            dropZone.classList.add(
                                "dragging"
                            );
                        }

                    }
                );

            }
        );


        [
            "dragleave",
            "drop"
        ].forEach(
            eventName => {

                dropZone.addEventListener(
                    eventName,
                    event => {

                        event.preventDefault();
                        event.stopPropagation();

                        dropZone.classList.remove(
                            "dragging"
                        );

                    }
                );

            }
        );


        dropZone.addEventListener(
            "drop",
            event => {

                if (converting) {
                    return;
                }


                const files =
                    event.dataTransfer.files;


                if (
                    files &&
                    files.length
                ) {

                    handleFile(
                        files[0]
                    );
                }

            }
        );
    }


    /* =====================================
       HANDLE FILE
    ====================================== */

    function handleFile(file) {

        if (!file) {
            return;
        }


        const maxSize =
            currentMode === "photo"
                ? 50 * 1024 * 1024
                : 200 * 1024 * 1024;


        if (file.size > maxSize) {

            showToast(
                currentMode === "photo"
                    ? "Photo is bigger than 50MB."
                    : "Video is bigger than 200MB."
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
                "Please choose a JPG or PNG image."
            );

            return;
        }


        if (
            currentMode === "video" &&
            !file.type.startsWith(
                "video/"
            )
        ) {

            showToast(
                "Please choose a video file."
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
            formatBytes(
                file.size
            );


        fileIcon.textContent =
            currentMode === "photo"
                ? "IMG"
                : "VID";


        fileCard.classList.remove(
            "hidden"
        );


        convertBtn.disabled =
            false;


        resultCard.classList.add(
            "hidden"
        );


        progressArea.classList.add(
            "hidden"
        );


        if (
            currentMode === "photo"
        ) {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    imagePreview.src =
                        event.target.result;

                    previewWrap.classList.remove(
                        "hidden"
                    );
                };


            reader.onerror =
                () => {

                    previewWrap.classList.add(
                        "hidden"
                    );

                    showToast(
                        "Could not preview image."
                    );
                };


            reader.readAsDataURL(
                file
            );

        } else {

            previewWrap.classList.add(
                "hidden"
            );
        }
    }


    /* =====================================
       REMOVE FILE
    ====================================== */

    if (removeFile) {

        removeFile.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                if (!converting) {
                    resetFile();
                }

            }
        );
    }


    function resetFile() {

        selectedFile = null;

        convertedBlob = null;

        convertedName = "";


        if (fileInput) {
            fileInput.value = "";
        }


        if (fileCard) {
            fileCard.classList.add(
                "hidden"
            );
        }


        if (previewWrap) {
            previewWrap.classList.add(
                "hidden"
            );
        }


        if (resultCard) {
            resultCard.classList.add(
                "hidden"
            );
        }


        if (progressArea) {
            progressArea.classList.add(
                "hidden"
            );
        }


        if (convertBtn) {
            convertBtn.disabled = true;
        }


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


    /* =====================================
       CONVERT BUTTON
    ====================================== */

    if (convertBtn) {

        convertBtn.addEventListener(
            "click",
            async () => {

                if (converting) {
                    return;
                }


                if (!selectedFile) {

                    showToast(
                        "Choose a file first."
                    );

                    return;
                }


                const cost =
                    COSTS[currentMode];


                if (tokens < cost) {

                    showToast(
                        `You need ${cost} tokens.`
                    );

                    return;
                }


                converting = true;

                convertBtn.disabled =
                    true;


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
                           

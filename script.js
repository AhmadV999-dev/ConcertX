document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // ELEMENTS
    // =========================================

    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");

    const loginName = document.getElementById("loginName");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const userName = document.getElementById("userName");
    const avatar = document.getElementById("avatar");

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


    // =========================================
    // STATE
    // =========================================

    let currentMode = "photo";
    let currentFormat = "png";

    let selectedFile = null;

    let convertedBlob = null;
    let convertedName = "";

    let downloadURL = null;

    let converting = false;

    let toastTimer = null;


    // =========================================
    // TOAST
    // =========================================

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }


    // =========================================
    // LOGIN
    // =========================================

    function getName(email) {

        if (!email) {
            return "Demo";
        }

        const name = email
            .split("@")[0]
            .trim();

        if (!name) {
            return "Demo";
        }

        return (
            name.charAt(0).toUpperCase() +
            name.slice(1)
        );
    }


    function login() {

        let email = loginName
            ? loginName.value.trim()
            : "";

        if (!email) {
            email = "demo@gmail.com";
        }

        const name = getName(email);

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
    }


    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            login
        );
    }


    if (loginName) {

        loginName.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    login();
                }
            }
        );
    }


    // =========================================
    // AUTO LOGIN
    // =========================================

    const savedEmail = localStorage.getItem(
        "convertx_fake_email"
    );

    const savedName = localStorage.getItem(
        "convertx_fake_name"
    );

    if (savedEmail) {

        if (loginName) {
            loginName.value = savedEmail;
        }

        if (userName) {
            userName.textContent =
                savedName || getName(savedEmail);
        }

        if (avatar) {
            const name =
                savedName || getName(savedEmail);

            avatar.textContent =
                name.charAt(0).toUpperCase();
        }

        if (loginScreen) {
            loginScreen.classList.add("hidden");
        }

        if (app) {
            app.classList.remove("hidden");
        }

    } else {

        if (loginScreen) {
            loginScreen.classList.remove("hidden");
        }

        if (app) {
            app.classList.add("hidden");
        }
    }


    // =========================================
    // LOGOUT
    // =========================================

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
                    app.classList.add("hidden");
                }

                if (loginScreen) {
                    loginScreen.classList.remove(
                        "hidden"
                    );
                }

                if (loginName) {
                    loginName.value = "";
                }

                resetFile();
            }
        );
    }


    // =========================================
    // MODE BUTTONS
    // =========================================

    modeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (converting) {
                    return;
                }

                modeButtons.forEach(item => {
                    item.classList.remove(
                        "active"
                    );
                });

                button.classList.add("active");

                currentMode =
                    button.dataset.mode ||
                    "photo";

                resetFile();

                updateConverterUI();
            }
        );
    });


    // =========================================
    // FORMAT BUTTONS
    // =========================================

    formatButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    converting ||
                    currentMode !== "photo"
                ) {
                    return;
                }

                formatButtons.forEach(item => {
                    item.classList.remove(
                        "active"
                    );
                });

                button.classList.add("active");

                currentFormat =
                    button.dataset.format ||
                    "png";

                resetResult();
            }
        );
    });


    // =========================================
    // CONVERTER UI
    // =========================================

    function updateConverterUI() {

        if (currentMode === "photo") {

            if (formatArea) {
                formatArea.classList.remove(
                    "hidden"
                );
            }

            if (costLabel) {
                costLabel.textContent =
                    "Free";
            }

            if (buttonCost) {
                buttonCost.textContent =
                    "Free";
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

            if (costLabel) {
                costLabel.textContent =
                    "Free";
            }

            if (buttonCost) {
                buttonCost.textContent =
                    "Free";
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


    // =========================================
    // BROWSE
    // =========================================

    if (browseBtn) {

        browseBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                if (
                    !converting &&
                    fileInput
                ) {
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
                    event.target.closest(
                        "#browseBtn"
                    )
                ) {
                    return;
                }

                if (
                    !converting &&
                    fileInput
                ) {
                    fileInput.click();
                }
            }
        );


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

                if (converting) {
                    return;
                }

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
    }


    // =========================================
    // FILE INPUT
    // =========================================

    if (fileInput) {

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
    }


    // =========================================
    // HANDLE FILE
    // =========================================

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
                "Choose JPG or PNG"
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

        resetResult();


        if (fileName) {
            fileName.textContent =
                file.name;
        }


        if (fileSize) {
            fileSize.textContent =
                formatBytes(file.size);
        }


        if (fileIcon) {
            fileIcon.textContent =
                currentMode === "photo"
                    ? "IMG"
                    : "VID";
        }


        if (fileCard) {
            fileCard.classList.remove(
                "hidden"
            );
        }


        if (convertBtn) {
            convertBtn.disabled = false;
        }


        if (
            currentMode === "photo"
        ) {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    if (!imagePreview) {
                        return;
                    }

                    imagePreview.src =
                        event.target.result;

                    if (previewWrap) {
                        previewWrap.classList.remove(
                            "hidden"
                        );
                    }
                };


            reader.onerror =
                () => {

                    if (previewWrap) {
                        previewWrap.classList.add(
                            "hidden"
                        );
                    }

                    showToast(
                        "Could not preview image"
                    );
                };


            reader.readAsDataURL(file);

        } else {

            if (previewWrap) {
                previewWrap.classList.add(
                    "hidden"
                );
            }
        }
    }


    // =========================================
    // REMOVE FILE
    // =========================================

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


    function resetResult() {

        convertedBlob = null;
        convertedName = "";

        if (resultCard) {
            resultCard.classList.add(
                "hidden"
            );
        }

        if (downloadURL) {

            URL.revokeObjectURL(
                downloadURL
            );

            downloadURL = null;
        }
    }


    function resetFile() {

        selectedFile = null;

        resetResult();


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
    }


    // =========================================
    // CONVERT BUTTON
    // =========================================

    if (convertBtn) {

        convertBtn.addEventListener(
            "click",
            async () => {

                if (converting) {
                    return;
                }


                if (!selectedFile) {

                    showToast(
                        "Choose a file first"
                    );

                    return;
                }


                converting = true;

                convertBtn.disabled = true;


                if (progressArea) {
                    progressArea.classList.remove(
                        "hidden"
                    );
                }


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


                    convertedBlob =
                        result.blob;

                    convertedName =
                        result.name;


                    if (resultName) {
                        resultName.textContent =
                            convertedName;
                    }


                    setProgress(
                        100,
                        "Complete"
                    );


                    setTimeout(
                        () => {

                            if (progressArea) {
                                progressArea.classList.add(
                                    "hidden"
                                );
                            }

                            if (resultCard) {
                                resultCard.classList.remove(
                                    "hidden"
                                );
                            }

                            showToast(
                                "Conversion complete"
                            );

                        },
                        400
                    );


                } catch (error) {

                    console.error(
                        "ConvertX error:",
                        error
                    );


                    if (progressArea) {
                        progressArea.classList.add(
                            "hidden"
                        );
                    }


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
    }


    // =========================================
    // IMAGE CONVERSION
    // =========================================

    function convertImage(
        file,
        format
    ) {

        return new Promise(
            (resolve, reject) => {

                const img =
                    new Image();

                const objectURL =
     

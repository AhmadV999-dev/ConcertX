"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const mainScreen = document.getElementById("mainScreen");
    const finalScreen = document.getElementById("finalScreen");

    const message = document.getElementById("message");

    const noButton = document.getElementById("noButton");
    const yesButton = document.getElementById("yesButton");


    // Khmer messages
    const messages = [
        "ចុចខុសមែន",
        "ចុចច្រឡំដៃ",
        "សាកចុចម្ដងទៀតមើល",
        "ប៉ុនម៉ងចុច Yes ទៅ"
    ];


    let noClicks = 0;

    // Starting sizes
    let noWidth = 105;
    let noHeight = 52;

    let yesWidth = 105;
    let yesHeight = 52;


    // Keep No button in the same place
    noButton.style.position = "relative";


    // Prevent button dragging
    noButton.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });

    yesButton.addEventListener("dragstart", (event) => {
        event.preventDefault();
    });


    // Make No smaller and Yes bigger
    function resizeButtons() {

        // No gets smaller
        noWidth = Math.max(
            52,
            noWidth * 0.82
        );

        noHeight = Math.max(
            38,
            noHeight * 0.88
        );


        noButton.style.width = `${noWidth}px`;
        noButton.style.height = `${noHeight}px`;

        noButton.style.minWidth = `${noWidth}px`;
        noButton.style.minHeight = `${noHeight}px`;


        // Yes gets bigger
        yesWidth = Math.min(
            window.innerWidth * 0.55,
            yesWidth * 1.15
        );

        yesHeight = Math.min(
            90,
            yesHeight * 1.08
        );


        yesButton.style.width = `${yesWidth}px`;
        yesButton.style.height = `${yesHeight}px`;

        yesButton.style.minWidth = `${yesWidth}px`;
        yesButton.style.minHeight = `${yesHeight}px`;
    }


    // Change the Khmer message
    function updateMessage() {

        const index = Math.min(
            noClicks - 1,
            messages.length - 1
        );


        // Hide old message
        message.classList.remove("show");


        // Restart animation
        void message.offsetWidth;


        // Show new message
        message.textContent = messages[index];

        message.classList.add("show");
    }


    // =========================
    // NO BUTTON
    // =========================

    noButton.addEventListener("pointerdown", (event) => {

        event.preventDefault();

        // Count No clicks
        noClicks++;


        // Change message immediately
        updateMessage();


        // Resize buttons
        resizeButtons();

        /*
            IMPORTANT:
            There is NO random position code here.
            The No button stays where it started.
        */
    });


    // Prevent duplicate click behavior
    noButton.addEventListener("click", (event) => {
        event.preventDefault();
    });


    // =========================
    // YES BUTTON
    // =========================

    function acceptLove() {

        // Disable old buttons
        noButton.disabled = true;
        yesButton.disabled = true;


        // Hide main GUI
        mainScreen.classList.add("hidden");


        // Show final GUI
        finalScreen.classList.remove("hidden");

        finalScreen.style.pointerEvents = "auto";
    }


    yesButton.addEventListener("pointerdown", (event) => {

        event.preventDefault();

        acceptLove();
    });


    // Prevent duplicate click behavior
    yesButton.addEventListener("click", (event) => {
        event.preventDefault();
    });


    // =========================
    // INITIAL STATE
    // =========================

    noButton.style.width = "105px";
    noButton.style.height = "52px";

    yesButton.style.width = "105px";
    yesButton.style.height = "52px";

});

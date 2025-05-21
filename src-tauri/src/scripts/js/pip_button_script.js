// Also try to inject on DOMContentLoaded in case the element is present early
document.addEventListener("DOMContentLoaded", () => {
    injectPipButton(); // Keep the initial injection attempt

    // Use a MutationObserver to watch for the top controls element
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                // Check if the top controls element is now in the DOM
                const topControls = document.querySelector(
                    '[class^="AudioVideoFullPlayer-topBar"]',
                );
                if (topControls) {
                    injectPipButton();
                }
            }
        }
    });

    // Start observing the body for changes in its children
    observer.observe(document.body, { childList: true, subtree: true });


});

window.addEventListener("toggle-pip", () => {
    // Check if the top controls element exists before trying to find the button
    const topControls = document.querySelector(
        '[class^="AudioVideoFullPlayer-topBar"]',
    );
    if (topControls) {
        const pipButton = document.getElementById("pip-button");
        if (pipButton) {
            console.log("pipButton", "found");
            pipButton.style.display =
                localStorage.getItem("pipState") === "true" ? "" : "none";
        } else {
            console.warn("pipButton", "notfound");
        }
    } else {
        console.error("Top controls element not found on storage change.");
    }
});

// This script injects a Picture-in-Picture button into the video player controls.
function injectPipButton() {
    // Read current PiP state from local storage, default to 'true' if not set
    const currentPipState = localStorage.getItem("pipState");
    const isPipEnabled = currentPipState === null ? true : currentPipState === "true";

    // Find the top controls overlay element
    const topControls = document.querySelector('[class^="AudioVideoFullPlayer-topBar"]');

    if (topControls && !document.getElementById("pip-button")) {
        // Check if button already exists
        // Create the Picture-in-Picture button
        const pipButton = document.createElement("button");
        pipButton.textContent = "enter picture in picture mode";
        pipButton.id = "pip-button"; // Add an ID for easier styling/referencing

        // Basic styling to position the button (can be improved with CSS)
        pipButton.style.position = "absolute";
        pipButton.style.top = "50%";
        pipButton.style.left = "50%";
        pipButton.style.transform = "translate(-50%, -50%)";
        pipButton.style.zIndex = "10"; // Ensure it's above other controls
        pipButton.style.padding = "10px";
        pipButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        pipButton.style.color = "white";
        pipButton.style.border = "none";
        pipButton.style.cursor = "pointer";
        pipButton.style.borderRadius = "5px";

        // Add event listener to trigger PiP (will need to implement the actual PiP logic)
        pipButton.addEventListener("click", () => {
            const ev = new Event("toggle-pip")
            document.dispatchEvent(ev);
        });

        // Inject the button into the top controls overlay
        topControls.style.position = "relative"; // Ensure the parent is positioned for absolute positioning
        topControls.appendChild(pipButton);
        console.log("Picture-in-Picture button injected.");
    } else if (!topControls) {
        console.log("Top controls element not found yet.");
    }

    // Hide the button if PiP is disabled
    const pipButton = document.getElementById("pip-button");
    if (pipButton) {
        pipButton.style.display =
            localStorage.getItem("pipState") === "true" ? "" : "none";
        console.debug(
            "PiP button display state set based on local storage:",
            localStorage.getItem("pipState") === "true",
        );
    }
}


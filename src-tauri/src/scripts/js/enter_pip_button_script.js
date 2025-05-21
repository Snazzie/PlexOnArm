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

document.addEventListener("pipChanged", (event) => {

    const pipButton = document.getElementById("enter-pip-button");
    if (pipButton) {
        console.log("pipButton", "found");
        const pipState = event.detail.value;
        console.warn(pipState)
        console.log("pip-state", pipState)
        pipButton.style.display = pipState === true ? "none" : "unset";
    } else {
        console.error("pipButton", "notfound");
    }
});

// This script injects a Picture-in-Picture button into the video player controls.
function injectPipButton() {
    // Find the top controls overlay element
    const topControls = document.querySelector('[class^="AudioVideoFullPlayer-topBar"]');

    if (topControls && !document.getElementById("enter-pip-button")) {
        // Check if button already exists
        // Create the Picture-in-Picture button
        const pipButton = document.createElement("button");
        pipButton.textContent = "Enter Picture In Picture";
        pipButton.id = "enter-pip-button"; // Add an ID for easier styling/referencing

        // Basic styling to position the button (can be improved with CSS)
        Object.assign(pipButton.style, {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: "10", // Ensure it's above other controls
            padding: "20px", // Updated padding
            backgroundColor: "rgba(0, 0, 0, 0.7)", // Match overlay buttons
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px", // Match overlay buttons
            transition: 'opacity 0.3s ease-in-out, background-color 0.2s ease-in-out', // Match overlay buttons
            fontSize: '12px', // Match overlay buttons
            fontFamily: 'Arial, sans-serif', // Match overlay buttons
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', // Match overlay buttons
            userSelect: 'none' // Match overlay buttons
        });

        // Add hover effect
        pipButton.addEventListener("mouseover", () => {
            pipButton.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; // Lighten background on hover
            pipButton.style.border = "1px solid rgba(255, 255, 255, 0.5)"; // Add a subtle border
        });

        pipButton.addEventListener("mouseout", () => {
            pipButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; // Revert background
            pipButton.style.border = "none"; // Remove border
        });

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

}


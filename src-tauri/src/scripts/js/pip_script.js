// Add keyboard shortcut listener for Alt+P (toggle PiP)
document.addEventListener('keydown', (event) => {
    // Check if Alt key is pressed and P key is pressed
    if (event.altKey && event.key === 'p') {
        event.preventDefault(); // Prevent default browser behavior
        console.debug('Alt+P shortcut detected for PiP toggle');

        // Check if we're on the initial screen by looking for the confirmation container
        const isOnInitialScreen = document.querySelector('.confirmation-container') !== null;

        // Only proceed if we're NOT on the initial screen
        if (isOnInitialScreen) {
            console.debug('Ignoring Alt+P on initial screen');
            return;
        }

        try {
            if (window.__TAURI_INTERNALS__) {
                // Safely get the current window label
                let windowLabel = null;
                try {
                    // Check if metadata and currentWindow exist
                    if (window.__TAURI_INTERNALS__.metadata &&
                        window.__TAURI_INTERNALS__.metadata.currentWindow) {
                        windowLabel = window.__TAURI_INTERNALS__.metadata.currentWindow.label;
                    } else {
                        console.debug('Window metadata not available for PiP toggle, using null window label');
                    }
                } catch (metadataErr) {
                    console.warn('Could not access window metadata for PiP toggle:', metadataErr);
                }

                // Invoke the toggle_pip command
                window.__TAURI_INTERNALS__.invoke('toggle_pip', {
                    windowLabel: windowLabel
                });
                console.debug('Invoked toggle_pip for window:', windowLabel);
            } else {
                console.error('__TAURI_INTERNALS__ is not available');
            }
        } catch (e) {
            console.error('Error invoking toggle_pip:', e);
        }
    }
});

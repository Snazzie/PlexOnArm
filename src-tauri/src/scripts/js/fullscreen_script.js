// Add a fullscreen change event listener to the document
document.addEventListener('fullscreenchange', (event) => {
    // Check if the document is in fullscreen mode
    const isFullscreen = document.fullscreenElement !== null;
    console.debug('Fullscreen event detected!', event);
    console.debug('Fullscreen state:', isFullscreen);
    console.debug('Fullscreen element:', document.fullscreenElement);

    // Send a message to the Tauri app using the invoke system
    try {
        if (window.__TAURI_INTERNALS__) {
            // Safely get the current window label
            let windowLabel = null;
            try {
                // Check if metadata and currentWindow exist
                if (window.__TAURI_INTERNALS__.metadata?.currentWindow) {
                    windowLabel = window.__TAURI_INTERNALS__.metadata.currentWindow.label;
                    console.debug('Current window label:', windowLabel);
                } else {
                    console.debug('Window metadata not available for fullscreen event, using null window label');
                }
            } catch (metadataErr) {
                console.warn('Could not access window metadata for fullscreen event:', metadataErr);
            }

            // Directly invoke the toggle_fullscreen command with window label
            window.__TAURI_INTERNALS__.invoke('toggle_fullscreen', {
                isFullscreen: isFullscreen,
                windowLabel: windowLabel
            });
            console.debug('Invoked toggle_fullscreen with state:', isFullscreen, 'for window:', windowLabel);
        } else {
            console.error('__TAURI_INTERNALS__ is not available');
        }
    } catch (e) {
        console.error('Error invoking toggle_fullscreen:', e);
    }
});

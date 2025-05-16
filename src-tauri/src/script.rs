pub const INIT_SCRIPT: &str = r#"
// Add a fullscreen change event listener to the document
    document.addEventListener('fullscreenchange', function(event) {
    // Check if the document is in fullscreen mode
    const isFullscreen = document.fullscreenElement !== null;
    console.log('Fullscreen event detected!', event);
    console.log('Fullscreen state:', isFullscreen);
    console.log('Fullscreen element:', document.fullscreenElement);

    // Send a message to the Tauri app using the invoke system
    try {
        if (window.__TAURI_INTERNALS__) {
        // Get the current window label
        const windowLabel = window.__TAURI_INTERNALS__.metadata.currentWindow.label;
        console.log('Current window label:', windowLabel);

        // Directly invoke the toggle_fullscreen command with window label
        window.__TAURI_INTERNALS__.invoke('toggle_fullscreen', {
            isFullscreen: isFullscreen,
            windowLabel: windowLabel
        });
        console.log('Invoked toggle_fullscreen with state:', isFullscreen, 'for window:', windowLabel);
        } else {
        console.error('__TAURI_INTERNALS__ is not available');
        }
    } catch (e) {
        console.error('Error invoking toggle_fullscreen:', e);
    }
    });

    console.log('Plex fullscreen event listener injected');
"#;

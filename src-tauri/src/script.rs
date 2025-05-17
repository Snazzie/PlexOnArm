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
            // Safely get the current window label
            let windowLabel = null;
            try {
                // Check if metadata and currentWindow exist
                if (window.__TAURI_INTERNALS__.metadata &&
                    window.__TAURI_INTERNALS__.metadata.currentWindow) {
                    windowLabel = window.__TAURI_INTERNALS__.metadata.currentWindow.label;
                    console.log('Current window label:', windowLabel);
                } else {
                    console.log('Window metadata not available for fullscreen event, using null window label');
                }
            } catch (metadataErr) {
                console.warn('Could not access window metadata for fullscreen event:', metadataErr);
            }

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

    // Add keyboard shortcut listeners for zoom control
    document.addEventListener('keydown', function(event) {
        // Check if Ctrl key is pressed
        if (event.ctrlKey) {
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
                            console.log('Window metadata not available for keyboard shortcut, using null window label');
                        }
                    } catch (metadataErr) {
                        console.warn('Could not access window metadata for keyboard shortcut:', metadataErr);
                    }

                    // Check for Ctrl + Plus (zoom in)
                    if (event.key === '+' || event.key === '=' || event.keyCode === 107 || event.keyCode === 187) {
                        event.preventDefault(); // Prevent default browser zoom
                        console.log('Zoom in shortcut detected');

                        // Invoke the adjust_zoom command with zoom_in=true
                        window.__TAURI_INTERNALS__.invoke('adjust_zoom', {
                            zoomIn: true,
                            windowLabel: windowLabel
                        });
                        console.log('Invoked adjust_zoom with zoom in for window:', windowLabel);
                    }

                    // Check for Ctrl + Minus (zoom out)
                    else if (event.key === '-' || event.keyCode === 109 || event.keyCode === 189) {
                        event.preventDefault(); // Prevent default browser zoom
                        console.log('Zoom out shortcut detected');

                        // Invoke the adjust_zoom command with zoom_in=false
                        window.__TAURI_INTERNALS__.invoke('adjust_zoom', {
                            zoomIn: false,
                            windowLabel: windowLabel
                        });
                        console.log('Invoked adjust_zoom with zoom out for window:', windowLabel);
                    }
                } else {
                    console.error('__TAURI_INTERNALS__ is not available');
                }
            } catch (e) {
                console.error('Error invoking adjust_zoom:', e);
            }
        }
    });

    // Add keyboard shortcut listener for Alt+P (toggle PiP)
    document.addEventListener('keydown', function(event) {
        // Check if Alt key is pressed and P key is pressed
        if (event.altKey && event.key === 'p') {
            event.preventDefault(); // Prevent default browser behavior
            console.log('Alt+P shortcut detected for PiP toggle');

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
                            console.log('Window metadata not available for PiP toggle, using null window label');
                        }
                    } catch (metadataErr) {
                        console.warn('Could not access window metadata for PiP toggle:', metadataErr);
                    }

                    // Invoke the toggle_pip command
                    window.__TAURI_INTERNALS__.invoke('toggle_pip', {
                        windowLabel: windowLabel
                    });
                    console.log('Invoked toggle_pip for window:', windowLabel);
                } else {
                    console.error('__TAURI_INTERNALS__ is not available');
                }
            } catch (e) {
                console.error('Error invoking toggle_pip:', e);
            }
        }
    });

    console.log('Plex event listeners injected (fullscreen, zoom and PiP)');

    // Apply the saved zoom level when the window loads
    if (window.__TAURI_INTERNALS__) {
        try {
            // Safely get the current window label
            let windowLabel = null;
            try {
                // Check if metadata and currentWindow exist
                if (window.__TAURI_INTERNALS__.metadata &&
                    window.__TAURI_INTERNALS__.metadata.currentWindow) {
                    windowLabel = window.__TAURI_INTERNALS__.metadata.currentWindow.label;
                    console.log('Initializing zoom level for window:', windowLabel);
                } else {
                    console.log('Window metadata not available, using null window label');
                }
            } catch (metadataErr) {
                console.warn('Could not access window metadata:', metadataErr);
            }

            // Create a function to apply the saved zoom level
            const applyZoomLevel = () => {
                // Invoke a special command to get the current zoom level and apply it
                window.__TAURI_INTERNALS__.invoke('get_saved_zoom_level', {
                    windowLabel: windowLabel
                }).then(zoomLevel => {
                    console.log('Retrieved saved zoom level:', zoomLevel);
                }).catch(err => {
                    console.error('Error getting saved zoom level:', err);
                });
            };

            // Apply zoom level when the document is fully loaded
            if (document.readyState === 'complete') {
                applyZoomLevel();
            } else {
                window.addEventListener('load', applyZoomLevel);
            }
        } catch (e) {
            console.error('Error initializing zoom level:', e);
        }
    }
"#;

const overlay = null;
let isPipMode = false;

// References to UI elements
let exitButton = null;
let dragButton = null;
let enterPipButton = null;

// Add a function to get the current PIP state from Tauri
async function getPipStateFromTauri() {
    try {
        if (window.__TAURI_INTERNALS__?.invoke) {
            const isPip = await window.__TAURI_INTERNALS__.invoke('is_pip_active');
            console.debug('Got PIP state from Tauri:', isPip);
            return isPip;
        }
    } catch (err) {
        console.error('Error getting PIP state from Tauri:', err);
    }
    // Return false if Tauri invoke fails
    return false;
}

// Also try to inject on DOMContentLoaded in case the element is present early
document.addEventListener("DOMContentLoaded", async () => {
    // Get initial PIP state from Tauri
    isPipMode = await getPipStateFromTauri();
    injectPipControls();

    // Use a MutationObserver to watch for the top controls element
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                // Check if the top controls element is now in the DOM
                const topControls = document.querySelector(
                    '[class^="AudioVideoFullPlayer-topBar"]',
                );
                if (topControls) {
                    console.debug('Top controls element added, injecting pip controls');

                    injectPipControls();
                }
            }
        }
    });

    // Start observing the body for changes in its children
    observer.observe(document.body, { childList: true, subtree: true });
});

function createButtonStyles(element) {
    Object.assign(element.style, {
        position: 'absolute',
        padding: '5px 10px',
        borderRadius: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: '10001',
        opacity: '1',
        transition: 'background-color 0.2s ease-in-out',
        pointerEvents: 'auto',
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
        userSelect: 'none'
    });
}

function injectPipControls() {
    const topControls = document.querySelector('[class^="AudioVideoFullPlayer-topBar"]');
    if (!topControls) {
        console.warn('Plex Top controls element not found, not injecting pip controls');
        return;
    }

    // Create PIP button if it doesn't exist
    if (!enterPipButton) {
        enterPipButton = document.createElement('div');
        enterPipButton.id = 'enter-pip-button';
        createButtonStyles(enterPipButton);
        enterPipButton.style.top = '50%';
        enterPipButton.style.left = '50%';
        enterPipButton.style.transform = 'translate(-50%, -50%)';

        enterPipButton.textContent = 'Enter Picture-in-Picture mode';

        enterPipButton.addEventListener('mouseover', () => {
            enterPipButton.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            enterPipButton.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.5)';
        });

        enterPipButton.addEventListener('mouseout', () => {
            enterPipButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            enterPipButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        });

        enterPipButton.addEventListener('click', () => {
            const ev = new Event('toggle-pip');
            document.dispatchEvent(ev);
        });

        topControls.appendChild(enterPipButton);
    }

    // Create exit button if it doesn't exist
    if (!exitButton) {
        exitButton = document.createElement('div');
        exitButton.id = 'pip-exit-button';
        createButtonStyles(exitButton);
        exitButton.style.top = '50%';
        exitButton.style.left = '10px';
        exitButton.style.transform = 'translateY(-50%)';

        const icon = document.createElement('span');
        icon.style.marginRight = '5px';
        icon.style.fontSize = '14px';
        icon.style.fontWeight = 'bold';
        icon.style.userSelect = 'none';
        icon.innerHTML = '✕';

        const text = document.createElement('span');
        text.style.userSelect = 'none';
        text.textContent = 'Exit Picture in Picture';

        exitButton.appendChild(icon);
        exitButton.appendChild(text);
        exitButton.title = 'Exit Picture-in-Picture mode';

        exitButton.addEventListener('mouseover', () => {
            exitButton.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
            exitButton.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.5)';
        });

        exitButton.addEventListener('mouseout', () => {
            exitButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            exitButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        });

        exitButton.addEventListener('click', (e) => {
            e.stopPropagation();
            console.debug('Exit PIP button clicked');
            const ev = new Event('toggle-pip');
            document.dispatchEvent(ev);
            removePipControls();
        });

        topControls.appendChild(exitButton);
    }

    // Create drag button if it doesn't exist
    if (!dragButton) {
        dragButton = document.createElement('div');
        dragButton.id = 'pip-drag-button';
        createButtonStyles(dragButton);
        dragButton.style.top = '50%';
        dragButton.style.left = '50%';
        dragButton.style.transform = 'translate(-50%, -50%)';
        dragButton.textContent = 'Drag to move window';
        dragButton.style.cursor = 'grab';

        dragButton.addEventListener('mouseover', () => {
            dragButton.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            dragButton.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.5)';
        });

        dragButton.addEventListener('mouseout', () => {
            dragButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            dragButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        });

        dragButton.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                e.stopPropagation();
                dragButton.style.cursor = 'grabbing';

                try {
                    const windowLabel = window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label || 'main';
                    if (window.__TAURI_INTERNALS__?.invoke) {
                        console.debug('Starting window drag from drag button');
                        window.__TAURI_INTERNALS__.invoke('drag_window', {
                            windowLabel: windowLabel
                        });
                    }
                } catch (err) {
                    console.error('Error starting window drag:', err);
                }
            }
        });

        dragButton.addEventListener('mouseup', () => {
            dragButton.style.cursor = 'grab';
        });

        topControls.appendChild(dragButton);
    }

    // Set initial visibility based on PIP mode
    updateButtonVisibility();
}

function updateButtonVisibility() {
    if (enterPipButton) {
        enterPipButton.style.display = isPipMode ? 'none' : 'unset';
    }
    if (exitButton) {
        exitButton.style.display = isPipMode ? 'flex' : 'none';
    }
    if (dragButton) {
        dragButton.style.display = isPipMode ? 'flex' : 'none';
    }
}

function removePipControls() {
    // Remove the exit button
    if (exitButton) {
        exitButton.remove();
        exitButton = null;
    }

    // Remove the drag button
    if (dragButton) {
        dragButton.remove();
        dragButton = null;
    }

    // Don't remove the PIP button as we want it to persist
}

// Listen for PIP state changes
document.addEventListener('pipChanged', (event) => {
    isPipMode = event.detail.value;
    updateButtonVisibility();
});

// Listen for toggle-pip event
document.addEventListener('toggle-pip', async (event) => {
    const isOnInitialScreen = document.querySelector('.confirmation-container') !== null;
    if (isOnInitialScreen) {
        console.debug('Ignoring Alt+P on initial screen in overlay script');
        return;
    }

    // After toggle_pip is invoked in pip_script.js, get the actual state from Tauri
    setTimeout(async () => {
        isPipMode = await getPipStateFromTauri();

        if (isPipMode) {
            injectPipControls();
        } else {
            removePipControls();
        }

        updateButtonVisibility();
    }, 100); // Small delay to ensure toggle_pip has completed
});

const overlay = null;
let isPipMode = false;

// References to UI elements
let exitButton = null;
let dragButton = null;
let pipButton = null;

// Also try to inject on DOMContentLoaded in case the element is present early
document.addEventListener("DOMContentLoaded", () => {
    injectPipControls(); // Keep the initial injection attempt

    // Use a MutationObserver to watch for the top controls element
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
                // Check if the top controls element is now in the DOM
                const topControls = document.querySelector(
                    '[class^="AudioVideoFullPlayer-topBar"]',
                );
                if (topControls) {
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
        console.error('Top controls element not found');
        return;
    }

    // Create PIP button if it doesn't exist
    if (!pipButton) {
        pipButton = document.createElement('button');
        pipButton.id = 'enter-pip-button';
        pipButton.textContent = 'Enter Picture In Picture';
        createButtonStyles(pipButton);
        pipButton.style.top = '50%';
        pipButton.style.left = '50%';
        pipButton.style.transform = 'translate(-50%, -50%)';

        pipButton.addEventListener('mouseover', () => {
            pipButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            pipButton.style.border = '1px solid rgba(255, 255, 255, 0.5)';
        });

        pipButton.addEventListener('mouseout', () => {
            pipButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            pipButton.style.border = 'none';
        });

        pipButton.addEventListener('click', () => {
            const ev = new Event('toggle-pip');
            document.dispatchEvent(ev);
        });

        topControls.appendChild(pipButton);
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
    if (pipButton) {
        pipButton.style.display = isPipMode ? 'none' : 'unset';
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
document.addEventListener('toggle-pip', (event) => {
    const isOnInitialScreen = document.querySelector('.confirmation-container') !== null;
    if (isOnInitialScreen) {
        console.debug('Ignoring Alt+P on initial screen in overlay script');
        return;
    }

    isPipMode = !isPipMode;

    if (isPipMode) {
        injectPipControls();
    } else {
        removePipControls();
    }

    // Dispatch pipChanged event to sync with other components
    const pipChangedEvent = new CustomEvent('pipChanged', {
        detail: { value: isPipMode }
    });
    document.dispatchEvent(pipChangedEvent);
});
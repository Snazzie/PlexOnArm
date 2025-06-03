getPipStateFromTauri();

// Add function to get PIP state from Tauri
async function getPipStateFromTauri() {
  try {
    if (window.__TAURI_INTERNALS__?.invoke) {
      const isPip = await window.__TAURI_INTERNALS__.invoke('is_pip_active');
      console.info('Got PIP state from Tauri:', isPip);
      return isPip;
    }
  } catch (err) {
    console.error('Error getting PIP state from Tauri:', err);
  }
  // Return false if Tauri invoke fails
  return false;
}

document.addEventListener('keydown', (event) => {
    // Check if Alt key is pressed and P key is pressed
    if (event.altKey && event.key === 'p') {
        event.preventDefault(); // Prevent default browser behavior
        console.info('Alt+P shortcut detected for PiP toggle');

        const ev = new Event("toggle-pip")
        document.dispatchEvent(ev);
    }
});
document.addEventListener("toggle-pip", () => {
    onEvent();
})

async function onEvent() {
    // Check if we're on the initial screen by looking for the confirmation container
    const isOnInitialScreen = document.querySelector('.confirmation-container') !== null;

    // Only proceed if we're NOT on the initial screen
    if (isOnInitialScreen) {
        console.info('Ignoring toggle on initial screen');
        return;
    }
    
    // Get current state from Tauri instead of localStorage
    const isPipEnabled = await getPipStateFromTauri();
    
    // Toggle the state by invoking the Tauri command
    tryInvoke(!isPipEnabled);

    console.info('PiP state toggled:', !isPipEnabled);
    
    // Wait for the state to be updated in Tauri
    setTimeout(async () => {
        // Get the updated state from Tauri
        const newState = await getPipStateFromTauri();
        
        // Emit event with the verified state
        const pipChange = new CustomEvent("pipChanged", {
            detail: {
                value: newState,
            },
        });
        document.dispatchEvent(pipChange);
    }, 100);
}

function tryInvoke(value) {
    try {
        if (window.__TAURI_INTERNALS__) {
            // Safely get the current window label
            let windowLabel = null;
            try {
                // Check if metadata and currentWindow exist
                if (window.__TAURI_INTERNALS__.metadata?.currentWindow) {
                    windowLabel = window.__TAURI_INTERNALS__.metadata.currentWindow.label;
                } else {
                    console.info('Window metadata not available for PiP toggle, using null window label');
                }
            } catch (metadataErr) {
                console.warn('Could not access window metadata for PiP toggle:', metadataErr);
            }

            // Invoke the toggle_pip command
            window.__TAURI_INTERNALS__.invoke('toggle_pip', {
                windowLabel: windowLabel,
                value: value
            });

            console.debug('Invoked toggle_pip for window:', windowLabel);
        } else {
            console.error('__TAURI_INTERNALS__ is not available');
        }
    } catch (e) {
        console.error('Error invoking toggle_pip:', e);
    }
}

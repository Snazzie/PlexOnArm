pub const DRAGGABLE_OVERLAY_SCRIPT: &str = r#"

  let overlay = null;
  let isDragging = false;
  let isPipMode = false;

  function createDraggableOverlay() {
    if (overlay) {
      return; // Overlay already exists
    }

    overlay = document.createElement('div');
    overlay.id = 'draggable-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '9999'; // Ensure it's on top
    overlay.style.cursor = 'grab'; // Indicate it's draggable
    overlay.style.backgroundColor = 'transparent'; // Make it transparent
    overlay.style.pointerEvents = 'auto'; // Ensure it captures mouse events

    // Add event listeners for dragging
    overlay.addEventListener('mousedown', (e) => {
      // Only start dragging on left mouse button
      if (e.button === 0) {
        isDragging = true;
        overlay.style.cursor = 'grabbing';

        // Use a simple approach for window dragging
        try {
          // Get the current window label
          const windowLabel = window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label || 'main';

          // Use the drag_window command
          if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
            console.log('Starting window drag for window:', windowLabel);
            window.__TAURI_INTERNALS__.invoke('drag_window', {
              windowLabel: windowLabel
            });
          } else {
            console.warn('Tauri API not available for dragging');
          }
        } catch (err) {
          console.error('Error starting window drag:', err);
        }
      }
    });

    // Change cursor back when mouse is released
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (overlay) {
          overlay.style.cursor = 'grab';
        }
      }
    });

    // Add to document body
    document.body.appendChild(overlay);
    console.log('Draggable overlay created and attached to DOM');
  }

  function removeDraggableOverlay() {
    if (overlay) {
      // Clean up
      isDragging = false;
      overlay.remove();
      overlay = null;
      console.log('Draggable overlay removed from DOM');
    }
  }

  // Listen for Alt+P keyboard shortcut to toggle PiP mode
  document.addEventListener('keydown', function(event) {
    // Check if Alt key is pressed and P key is pressed
    if (event.altKey && event.key === 'p') {
      // Toggle PiP mode state
      isPipMode = !isPipMode;
      console.log('PiP mode toggled via Alt+P to:', isPipMode);

      // Toggle the draggable overlay
      if (isPipMode) {
        createDraggableOverlay();
      } else {
        removeDraggableOverlay();
      }
    }
  });

  // Also listen for the Tauri event for better synchronization
  // This ensures the overlay state stays in sync if PiP is toggled through other means
  try {
    if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.event && window.__TAURI_INTERNALS__.event.listen) {
      window.__TAURI_INTERNALS__.event.listen('pip-state-changed', (event) => {
        const state = event.payload;
        console.log('PiP state changed event received:', state);

        // Only update if the state is different from our current state
        if (state !== isPipMode) {
          isPipMode = state;

          if (isPipMode) {
            createDraggableOverlay();
          } else {
            removeDraggableOverlay();
          }
        }
      });
      console.log('Registered listener for pip-state-changed event');
    } else {
      console.warn('Tauri event API not available for PiP state change events');
    }
  } catch (e) {
    console.warn('Error setting up PiP state change listener:', e);
  }

  // Check PiP state on load
  try {
    if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
      window.__TAURI_INTERNALS__.invoke('is_pip_active')
        .then(state => {
          if (state) {
            console.log('PiP mode is active on script load');
            isPipMode = true;
            createDraggableOverlay();
          }
        })
        .catch(err => {
          console.warn('Failed to check PiP state on load:', err);
        });
    } else {
      console.warn('Tauri API not available to check PiP state');
    }
  } catch (e) {
    console.warn('Error checking initial PiP state:', e);
  }
"#;

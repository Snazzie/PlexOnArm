pub const DRAGGABLE_OVERLAY_SCRIPT: &str = r#"

  let overlay = null;
  let isPipMode = false;

  // References to UI elements
  let exitButton = null;
  let dragButton = null;

  function createDraggableOverlay() {
    if (overlay) {
      return; // Overlay already exists
    }

    // Create a container for our PIP controls (not for dragging)
    overlay = document.createElement('div');
    overlay.id = 'pip-controls-container';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '0';
    overlay.style.height = '0';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none'; // Container is click-through

    // Create exit button (initially hidden)
    exitButton = document.createElement('div');
    exitButton.id = 'pip-exit-button';
    exitButton.style.position = 'fixed'; // Use fixed instead of absolute
    exitButton.style.top = '5px';
    exitButton.style.left = '5px';
    exitButton.style.padding = '5px 10px';
    exitButton.style.borderRadius = '4px';
    exitButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    exitButton.style.color = 'white';
    exitButton.style.display = 'flex';
    exitButton.style.alignItems = 'center';
    exitButton.style.cursor = 'pointer';
    exitButton.style.zIndex = '10001'; // Higher than the overlay
    exitButton.style.opacity = '0'; // Start hidden
    exitButton.style.transition = 'opacity 0.2s ease-in-out, background-color 0.2s ease-in-out';
    exitButton.style.pointerEvents = 'auto'; // Always clickable
    exitButton.style.fontSize = '12px';
    exitButton.style.fontFamily = 'Arial, sans-serif';
    exitButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

    // Create icon and text elements
    const icon = document.createElement('span');
    icon.style.marginRight = '5px';
    icon.style.fontSize = '14px';
    icon.style.fontWeight = 'bold';
    icon.innerHTML = '✕';

    const text = document.createElement('span');
    text.textContent = 'Exit Picture in Picture';

    // Add icon and text to button
    exitButton.appendChild(icon);
    exitButton.appendChild(text);

    exitButton.title = 'Exit Picture-in-Picture mode';

    // Create drag button in the top middle
    dragButton = document.createElement('div');
    dragButton.id = 'pip-drag-button';
    dragButton.style.position = 'fixed';
    dragButton.style.top = '5px';
    dragButton.style.left = '50%';
    dragButton.style.transform = 'translateX(-50%)'; // Center horizontally
    dragButton.style.padding = '5px 10px';
    dragButton.style.borderRadius = '4px';
    dragButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    dragButton.style.color = 'white';
    dragButton.style.display = 'flex';
    dragButton.style.alignItems = 'center';
    dragButton.style.cursor = 'grab'; // Indicate it's draggable
    dragButton.style.zIndex = '10001';
    dragButton.style.opacity = '0'; // Start hidden
    dragButton.style.transition = 'opacity 0.2s ease-in-out, background-color 0.2s ease-in-out';
    dragButton.style.pointerEvents = 'auto'; // Always clickable
    dragButton.style.fontSize = '12px';
    dragButton.style.fontFamily = 'Arial, sans-serif';
    dragButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    dragButton.textContent = 'Drag to move window';

    // Add hover effect to the drag button
    dragButton.addEventListener('mouseover', () => {
      dragButton.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      dragButton.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.5)';
    });
    dragButton.addEventListener('mouseout', () => {
      dragButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      dragButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    });

    // Add mousedown handler for dragging
    dragButton.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        e.stopPropagation();
        dragButton.style.cursor = 'grabbing';

        // Start window dragging
        try {
          const windowLabel = window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label || 'main';

          if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
            console.log('Starting window drag from drag button');
            window.__TAURI_INTERNALS__.invoke('drag_window', {
              windowLabel: windowLabel
            });
          }
        } catch (err) {
          console.error('Error starting window drag:', err);
        }
      }
    });

    // Reset cursor on mouseup
    dragButton.addEventListener('mouseup', () => {
      dragButton.style.cursor = 'grab';
    });

    // Add hover effect to the button
    exitButton.addEventListener('mouseover', () => {
      exitButton.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
      exitButton.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.5)';
    });
    exitButton.addEventListener('mouseout', () => {
      exitButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      exitButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    });

    // Add click handler to exit PIP mode
    exitButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering drag
      console.log('Exit PIP button clicked');

      // Toggle PIP mode off
      isPipMode = false;

      // Invoke the toggle_pip command to exit PIP mode
      try {
        if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
          const windowLabel = window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label || 'main';
          window.__TAURI_INTERNALS__.invoke('toggle_pip', {
            windowLabel: windowLabel
          });
          console.log('Invoked toggle_pip to exit PIP mode');
        }
      } catch (err) {
        console.error('Error exiting PIP mode:', err);
      }

      // Remove the overlay
      removeDraggableOverlay();
    });

    // Set up hover detection to show/hide buttons
    mouseMoveForHoverHandler = (e) => {
      if (!isPipMode || !exitButton || !dragButton) return;

      // Get window dimensions
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      // Calculate the top 20% area
      const topAreaHeight = windowHeight * 0.2;

      // Check if mouse is within the top 20% area
      if (
        e.clientX >= 0 &&
        e.clientX <= windowWidth &&
        e.clientY >= 0 &&
        e.clientY <= topAreaHeight
      ) {
        // Mouse is over the top area
        exitButton.style.opacity = '1';
        dragButton.style.opacity = '1';
      } else {
        // Mouse is outside the top area
        exitButton.style.opacity = '0';
        dragButton.style.opacity = '0';
      }
    };

    // Add hover detection event listener
    document.addEventListener('mousemove', mouseMoveForHoverHandler);

    // Add elements to the DOM
    document.body.appendChild(overlay);
    document.body.appendChild(exitButton);
    document.body.appendChild(dragButton);

    console.log('PIP controls added to DOM');

    // We're using the drag button instead of global event listeners
    // No need to set up global drag event listeners

    console.log('Draggable overlay and exit button created and attached to DOM');
  }

  // Store event listener reference for cleanup
  let mouseMoveForHoverHandler = null;

  // We're not using global drag event listeners anymore

  function removeEventListeners() {
    // Only remove the hover detection event listener
    if (mouseMoveForHoverHandler) {
      document.removeEventListener('mousemove', mouseMoveForHoverHandler);
      mouseMoveForHoverHandler = null;
    }

    console.log('Hover detection event listener removed');
  }

  function removeDraggableOverlay() {
    // Remove event listeners
    removeEventListeners();

    // Remove the overlay
    if (overlay) {
      overlay.remove();
      overlay = null;
      console.log('Draggable overlay removed from DOM');
    }

    // Remove the exit button separately
    if (exitButton) {
      exitButton.remove();
      exitButton = null;
      console.log('Exit button removed from DOM');
    }

    // Remove the drag button separately
    if (dragButton) {
      dragButton.remove();
      dragButton = null;
      console.log('Drag button removed from DOM');
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

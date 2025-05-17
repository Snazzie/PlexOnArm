pub const DRAGGABLE_OVERLAY_SCRIPT: &str = r#"

  let overlay = null;
  let isDragging = false;
  let isPipMode = false;

  // Variables to track drag state
  let dragStartX = 0;
  let dragStartY = 0;
  let dragThreshold = 5; // Pixels to move before activating drag
  let mouseDownTime = 0;
  let isDragIntent = false;

  // Reference to exit button
  let exitButton = null;

  function createDraggableOverlay() {
    if (overlay) {
      return; // Overlay already exists
    }

    // Create main overlay
    overlay = document.createElement('div');
    overlay.id = 'draggable-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '9999'; // Ensure it's on top
    overlay.style.cursor = 'default'; // Default cursor
    overlay.style.backgroundColor = 'transparent'; // Make it transparent
    overlay.style.pointerEvents = 'none'; // Allow clicks to pass through by default

    // Create exit button (initially hidden)
    exitButton = document.createElement('div');
    exitButton.id = 'pip-exit-button';
    exitButton.style.position = 'absolute';
    exitButton.style.top = '5px';
    exitButton.style.left = '5px';
    exitButton.style.padding = '5px 10px';
    exitButton.style.borderRadius = '4px';
    exitButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    exitButton.style.color = 'white';
    exitButton.style.display = 'flex';
    exitButton.style.alignItems = 'center';
    exitButton.style.cursor = 'pointer';
    exitButton.style.zIndex = '10000'; // Above the overlay
    exitButton.style.opacity = '0'; // Start hidden
    exitButton.style.transition = 'opacity 0.2s ease-in-out';
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

    // Create a separate transparent div just for hover detection
    const hoverDetector = document.createElement('div');
    hoverDetector.style.position = 'fixed';
    hoverDetector.style.top = '0';
    hoverDetector.style.left = '0';
    hoverDetector.style.width = '100%';
    hoverDetector.style.height = '100%';
    hoverDetector.style.pointerEvents = 'none'; // Always click-through
    hoverDetector.style.backgroundColor = 'transparent';

    // Create handler for hover detection
    mouseMoveForHoverHandler = (e) => {
      if (!isPipMode || !overlay) return;

      // Get overlay bounds
      const rect = overlay.getBoundingClientRect();

      // Check if mouse is within overlay bounds
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        // Mouse is over the overlay
        if (exitButton) {
          exitButton.style.opacity = '1';
        }
      } else {
        // Mouse is outside the overlay
        if (exitButton) {
          exitButton.style.opacity = '0';
        }
      }
    };

    // Add hover detection to show/hide exit button
    document.addEventListener('mousemove', mouseMoveForHoverHandler);

    // Add elements to the DOM
    overlay.appendChild(exitButton);
    document.body.appendChild(overlay);

    // Set up event listeners for dragging
    setupEventListeners();

    console.log('Draggable overlay and exit button created and attached to DOM');
  }

  // Store event listener references for cleanup
  let mouseDownHandler = null;
  let mouseMoveHandler = null;
  let mouseUpHandler = null;
  let mouseMoveForHoverHandler = null;

  function setupEventListeners() {
    // Remove any existing listeners first
    removeEventListeners();

    // Create new handlers
    mouseDownHandler = (e) => {
      // Skip if we're clicking on the exit button
      if (e.target.id === 'pip-exit-button' || e.target.parentNode?.id === 'pip-exit-button') {
        return;
      }

      // Only track left mouse button
      if (e.button === 0 && isPipMode) {
        // Store initial position and time
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        mouseDownTime = Date.now();
        isDragIntent = false;
      }
    };

    mouseMoveHandler = (e) => {
      // Only process if we're in PiP mode and mouse is down
      if (isPipMode && Date.now() - mouseDownTime < 1000 && mouseDownTime > 0) {
        // Calculate distance moved
        const dx = Math.abs(e.clientX - dragStartX);
        const dy = Math.abs(e.clientY - dragStartY);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If moved more than threshold, it's a drag
        if (distance > dragThreshold && !isDragIntent) {
          isDragIntent = true;
          isDragging = true;

          // Only now capture pointer events for dragging
          if (overlay) {
            overlay.style.pointerEvents = 'auto';
            overlay.style.cursor = 'grabbing';
          }

          // Start window dragging
          try {
            const windowLabel = window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label || 'main';

            if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
              console.log('Starting window drag for window:', windowLabel);
              window.__TAURI_INTERNALS__.invoke('drag_window', {
                windowLabel: windowLabel
              });
            }
          } catch (err) {
            console.error('Error starting window drag:', err);
          }
        }
      }
    };

    mouseUpHandler = () => {
      // Reset all drag tracking variables
      mouseDownTime = 0;
      isDragIntent = false;

      if (isDragging) {
        isDragging = false;
        if (overlay) {
          overlay.style.cursor = 'default';
        }
      }

      // Always return to click-through mode
      if (overlay) {
        overlay.style.pointerEvents = 'none';
      }
    };

    // Add the event listeners
    document.addEventListener('mousedown', mouseDownHandler, true);
    document.addEventListener('mousemove', mouseMoveHandler, true);
    document.addEventListener('mouseup', mouseUpHandler, true);

    console.log('Event listeners for dragging set up');
  }

  function removeEventListeners() {
    // Remove event listeners if they exist
    if (mouseDownHandler) {
      document.removeEventListener('mousedown', mouseDownHandler, true);
      mouseDownHandler = null;
    }

    if (mouseMoveHandler) {
      document.removeEventListener('mousemove', mouseMoveHandler, true);
      mouseMoveHandler = null;
    }

    if (mouseUpHandler) {
      document.removeEventListener('mouseup', mouseUpHandler, true);
      mouseUpHandler = null;
    }

    if (mouseMoveForHoverHandler) {
      document.removeEventListener('mousemove', mouseMoveForHoverHandler);
      mouseMoveForHoverHandler = null;
    }

    console.log('Event listeners for dragging and hover removed');
  }

  function removeDraggableOverlay() {
    if (overlay) {
      // Clean up
      isDragging = false;
      mouseDownTime = 0;
      isDragIntent = false;

      // Remove event listeners
      removeEventListeners();

      // Clean up exit button reference
      exitButton = null;

      // Remove the overlay (which also removes the exit button since it's a child)
      overlay.remove();
      overlay = null;
      console.log('Draggable overlay and exit button removed from DOM');
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

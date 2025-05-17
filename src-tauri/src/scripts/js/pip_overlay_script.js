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
  exitButton.style.top = '10px';
  exitButton.style.left = '10px';
  exitButton.style.padding = '5px 10px';
  exitButton.style.borderRadius = '4px';
  exitButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  exitButton.style.color = 'white';
  exitButton.style.display = 'flex';
  exitButton.style.alignItems = 'center';
  exitButton.style.cursor = 'pointer';
  exitButton.style.zIndex = '10001'; // Higher than the overlay
  exitButton.style.opacity = '0'; // Start hidden
  exitButton.style.transition = 'opacity 0.3s ease-in-out, background-color 0.2s ease-in-out';
  exitButton.style.pointerEvents = 'auto'; // Always clickable
  exitButton.style.fontSize = '12px';
  exitButton.style.fontFamily = 'Arial, sans-serif';
  exitButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
  exitButton.style.userSelect = 'none'; // Prevent text selection

  // Create icon and text elements
  const icon = document.createElement('span');
  icon.style.marginRight = '5px';
  icon.style.fontSize = '14px';
  icon.style.fontWeight = 'bold';
  icon.style.userSelect = 'none'; // Prevent text selection
  icon.innerHTML = '✕';

  const text = document.createElement('span');
  text.style.userSelect = 'none'; // Prevent text selection
  text.textContent = 'Exit Picture in Picture';

  // Add icon and text to button
  exitButton.appendChild(icon);
  exitButton.appendChild(text);

  exitButton.title = 'Exit Picture-in-Picture mode';

  // Create drag button in the top middle
  dragButton = document.createElement('div');
  dragButton.id = 'pip-drag-button';
  dragButton.style.position = 'fixed';
  dragButton.style.top = '10px';
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
  dragButton.style.transition = 'opacity 0.3s ease-in-out, background-color 0.2s ease-in-out';
  dragButton.style.pointerEvents = 'auto'; // Always clickable
  dragButton.style.fontSize = '12px';
  dragButton.style.fontFamily = 'Arial, sans-serif';
  dragButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
  dragButton.style.userSelect = 'none'; // Prevent text selection
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
    console.debug('Exit PIP button clicked');

    // Toggle PIP mode off
    isPipMode = false;

    // Invoke the toggle_pip command to exit PIP mode
    try {
      if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
        const windowLabel = window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label || 'main';
        window.__TAURI_INTERNALS__.invoke('toggle_pip', {
          windowLabel: windowLabel
        });
        console.debug('Invoked toggle_pip to exit PIP mode');
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

    // Check if mouse is within the window bounds
    const isInWindow =
      e.clientX >= 0 &&
      e.clientX <= windowWidth &&
      e.clientY >= 0 &&
      e.clientY <= windowHeight;

    // Check if mouse is within the top 20% area
    const isInTopArea =
      e.clientX >= 0 &&
      e.clientX <= windowWidth &&
      e.clientY >= 0 &&
      e.clientY <= topAreaHeight;

    // Show controls if mouse is in top area
    if (isInTopArea) {
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

  // Add mouseout event listener to hide controls when mouse leaves the window
  mouseOutHandler = (e) => {
    // Check if the mouse has left the document/window
    if (e.relatedTarget === null || e.relatedTarget.nodeName === 'HTML') {
      exitButton.style.opacity = '0';
      dragButton.style.opacity = '0';
      console.debug('Mouse left window, hiding PIP controls');
    }
  };
  document.addEventListener('mouseout', mouseOutHandler);

  // Add mouseleave event listener to the window
  mouseLeaveHandler = () => {
    exitButton.style.opacity = '0';
    dragButton.style.opacity = '0';
    console.debug('Mouse left window (mouseleave), hiding PIP controls');
  };
  window.addEventListener('mouseleave', mouseLeaveHandler);

  // Add elements to the DOM
  document.body.appendChild(overlay);
  document.body.appendChild(exitButton);
  document.body.appendChild(dragButton);

  console.debug('PIP controls added to DOM');

  // We're using the drag button instead of global event listeners
  // No need to set up global drag event listeners

  console.debug('Draggable overlay and exit button created and attached to DOM');
}

// Store event listener references for cleanup
let mouseMoveForHoverHandler = null;
let mouseOutHandler = null;
let mouseLeaveHandler = null;

// We're not using global drag event listeners anymore

function removeEventListeners() {
  // Remove the hover detection event listener
  if (mouseMoveForHoverHandler) {
    document.removeEventListener('mousemove', mouseMoveForHoverHandler);
    mouseMoveForHoverHandler = null;
  }

  // Remove the mouseout event listener
  if (mouseOutHandler) {
    document.removeEventListener('mouseout', mouseOutHandler);
    mouseOutHandler = null;
  }

  // Remove the mouseleave event listener
  if (mouseLeaveHandler) {
    window.removeEventListener('mouseleave', mouseLeaveHandler);
    mouseLeaveHandler = null;
  }

  console.debug('All event listeners removed');
}

function removeDraggableOverlay() {
  // Remove event listeners
  removeEventListeners();

  // Remove the overlay
  if (overlay) {
    overlay.remove();
    overlay = null;
    console.debug('Draggable overlay removed from DOM');
  }

  // Remove the exit button separately
  if (exitButton) {
    exitButton.remove();
    exitButton = null;
    console.debug('Exit button removed from DOM');
  }

  // Remove the drag button separately
  if (dragButton) {
    dragButton.remove();
    dragButton = null;
    console.debug('Drag button removed from DOM');
  }
}

// Listen for Alt+P keyboard shortcut to toggle PiP mode
document.addEventListener('keydown', (event) => {
  // Check if Alt key is pressed and P key is pressed
  if (event.altKey && event.key === 'p') {
    // Check if we're on the initial screen by looking for the confirmation container
    const isOnInitialScreen = document.querySelector('.confirmation-container') !== null;

    // Only proceed if we're NOT on the initial screen
    if (isOnInitialScreen) {
      console.debug('Ignoring Alt+P on initial screen in overlay script');
      return;
    }

    // Toggle PiP mode state
    isPipMode = !isPipMode;
    console.debug('PiP mode toggled via Alt+P to:', isPipMode);

    // Toggle the draggable overlay
    if (isPipMode) {
      createDraggableOverlay();
    } else {
      removeDraggableOverlay();
    }
  }
});

// Check PiP state on load
try {
  if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
    // First check if we're on the initial screen
    const isOnInitialScreen = document.querySelector('.confirmation-container') !== null;

    // If we're on the initial screen, make sure PiP is disabled
    if (isOnInitialScreen) {
      console.debug('On initial screen, ensuring PiP is disabled');
      if (isPipMode) {
        isPipMode = false;
        removeDraggableOverlay();

        // Reset the PiP state in the backend
        window.__TAURI_INTERNALS__.invoke('toggle_pip', {
          windowLabel: window.__TAURI_INTERNALS__?.metadata?.currentWindow?.label || 'main'
        }).catch(err => {
          console.warn('Failed to reset PiP state on initial screen:', err);
        });
      }
    } else {
      // Only check and restore PiP state if we're not on the initial screen
      window.__TAURI_INTERNALS__.invoke('is_pip_active')
        .then(state => {
          if (state) {
            console.debug('PiP mode is active on script load');
            isPipMode = true;
            createDraggableOverlay();
          }
        })
        .catch(err => {
          console.warn('Failed to check PiP state on load:', err);
        });
    }
  } else {
    console.warn('Tauri API not available to check PiP state');
  }
} catch (e) {
  console.warn('Error checking initial PiP state:', e);
}

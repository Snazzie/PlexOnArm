const overlay = null;
let isPipMode = false;

// References to UI elements
let exitButton = null;
let dragButton = null;


// Also try to inject on DOMContentLoaded in case the element is present early
document.addEventListener("DOMContentLoaded", () => {
  injectPipButton(); // Keep the initial injection attempt

  // Use a MutationObserver to watch for the top controls element
  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Check if the top controls element is now in the DOM
        const topControls = document.querySelector(
          '[class^="AudioVideoFullPlayer-topBar"]',
        );
        if (topControls) {
          injectPipButton();
        }
      }
    }
  });

  // Start observing the body for changes in its children
  observer.observe(document.body, { childList: true, subtree: true });


});


function createPipControls() {
  if (overlay) {
    return; // Overlay already exists
  }

  // Get the top controls element
  const topControls = document.querySelector('[class^="AudioVideoFullPlayer-topBar"]');
  if (!topControls) {
    console.error('Top controls element not found');
    return;
  }

  // Create exit button (initially hidden)
  exitButton = document.createElement('div');
  exitButton.id = 'pip-exit-button';
  exitButton.style.position = 'absolute';
  exitButton.style.top = '50%';
  exitButton.style.left = '10px';
  exitButton.style.transform = 'translateY(-50%)';
  exitButton.style.padding = '5px 10px';
  exitButton.style.borderRadius = '4px';
  exitButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  exitButton.style.color = 'white';
  exitButton.style.display = 'flex';
  exitButton.style.alignItems = 'center';
  exitButton.style.cursor = 'pointer';
  exitButton.style.zIndex = '10001'; // Higher than the overlay
  exitButton.style.opacity = '1';
  exitButton.style.transition = 'background-color 0.2s ease-in-out';
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
  dragButton.style.position = 'absolute';
  dragButton.style.top = '50%';
  dragButton.style.left = '50%';
  dragButton.style.transform = 'translate(-50%, -50%)'; // Center both axes
  dragButton.style.padding = '5px 10px';
  dragButton.style.borderRadius = '4px';
  dragButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  dragButton.style.color = 'white';
  dragButton.style.display = 'flex';
  dragButton.style.alignItems = 'center';
  dragButton.style.cursor = 'grab'; // Indicate it's draggable
  dragButton.style.zIndex = '10001';
  dragButton.style.opacity = '1';
  dragButton.style.transition = 'background-color 0.2s ease-in-out';
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

    const ev = new Event("toggle-pip")
    document.dispatchEvent(ev);
    // Remove the overlay
    removePipControls();
  });

  // Controls are now always visible in PIP mode

  // Add elements to the top controls
  topControls.appendChild(exitButton);
  topControls.appendChild(dragButton);

  console.debug('PIP controls added to DOM');

  // We're using the drag button instead of global event listeners
  // No need to set up global drag event listeners

  console.debug('Draggable overlay and exit button created and attached to DOM');
}

// Store event listener references for cleanup
const mouseMoveForHoverHandler = null;
const mouseOutHandler = null;
const mouseLeaveHandler = null;

// We're not using global drag event listeners anymore

function removeEventListeners() {
  // No event listeners to remove now
  console.debug('No event listeners to remove');
}

function removePipControls() {
  // Remove event listeners
  removeEventListeners();

  // Remove the exit button
  if (exitButton) {
    exitButton.remove();
    exitButton = null;
    console.debug('Exit button removed from DOM');
  }

  // Remove the drag button
  if (dragButton) {
    dragButton.remove();
    dragButton = null;
    console.debug('Drag button removed from DOM');
  }
}

// Listen for Alt+P keyboard shortcut to toggle PiP mode
document.addEventListener('toggle-pip', (event) => {
  // Check if Alt key is pressed and P key is pressed
  // Check if we're on the initial screen by looking for the confirmation container
  const isOnInitialScreen = document.querySelector('.confirmation-container') !== null;

  // Only proceed if we're NOT on the initial screen
  if (isOnInitialScreen) {
    console.debug('Ignoring Alt+P on initial screen in overlay script');
    return;
  }

  // Toggle PiP mode state
  isPipMode = !isPipMode;

  // Toggle the draggable overlay
  if (isPipMode) {
    createPipControls();
  } else {
    removePipControls();
  }

  // Dispatch pipChanged event to sync with other components
  const pipChangedEvent = new CustomEvent("pipChanged", {
    detail: { value: isPipMode }
  });
  document.dispatchEvent(pipChangedEvent);
});

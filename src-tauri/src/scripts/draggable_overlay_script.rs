pub const DRAGGABLE_OVERLAY_SCRIPT: &str = r#"

  let overlay = null;

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

    // Add event listener for dragging
    overlay.addEventListener('mousedown', () => {
      window.__TAURI_INTERNALS__.window.appWindow.startDragging();
    });

    document.body.appendChild(overlay);
  }

  function removeDraggableOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  window.__TAURI_INTERNALS__.event.listen('pip-state-change', (event) => {
    const state = event.payload; // Assuming payload is a boolean indicating PiP state
    if (state) {
      createDraggableOverlay();
    } else {
      removeDraggableOverlay();
    }
  });
"#;

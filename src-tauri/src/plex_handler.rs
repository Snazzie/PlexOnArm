use tauri::{Manager, Runtime, Window};

// Command to toggle fullscreen state of a window
#[tauri::command]
pub fn toggle_fullscreen<R: Runtime>(window: Window<R>, fullscreen: bool) {
    // Set the window to fullscreen or exit fullscreen based on the parameter
    if let Err(e) = window.set_fullscreen(fullscreen) {
        eprintln!("Failed to set fullscreen state: {}", e);
    }
}

// Command to check if a window is in fullscreen mode
#[tauri::command]
pub fn is_fullscreen<R: Runtime>(window: Window<R>) -> Result<bool, String> {
    window
        .is_fullscreen()
        .map_err(|e| format!("Failed to get fullscreen state: {}", e))
}

// Command to listen for fullscreen events from the webview
#[tauri::command]
pub fn register_fullscreen_listener<R: Runtime>(window: Window<R>) {
    // This function sets up a listener for fullscreen events
    // The actual implementation will be in the frontend JavaScript
    println!("Registered fullscreen listener for window: {}", window.label());
}

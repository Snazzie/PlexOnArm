use tauri::{AppHandle, Runtime};

use crate::handlers::common::get_window_by_label;

// Command to start dragging a window
#[tauri::command]
pub fn drag_window<R: Runtime>(
    app_handle: AppHandle<R>,
    window_label: Option<String>,
) -> Result<(), String> {
    println!("Starting window drag for window: {:?}", window_label);

    // Get the window by label or fall back to default windows
    let window = get_window_by_label(&app_handle, window_label)?;

    // Start dragging the window
    window
        .start_dragging()
        .map_err(|e| format!("Failed to start dragging: {}", e))
}

// Alternative command for window dragging (for compatibility)
#[tauri::command]
pub fn start_dragging<R: Runtime>(
    app_handle: AppHandle<R>,
    window_label: Option<String>,
) -> Result<(), String> {
    // Just call the drag_window function
    drag_window(app_handle, window_label)
}

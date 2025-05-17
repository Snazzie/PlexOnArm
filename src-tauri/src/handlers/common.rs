use serde_json::json;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_store::StoreExt;

// Constants
pub const SETTINGS_FILENAME: &str = "plex_settings.json";
pub const ZOOM_LEVEL_KEY: &str = "zoom_level";

// Function to save zoom level to the store
pub fn save_zoom_level<R: Runtime>(
    app_handle: AppHandle<R>,
    zoom_level: f64,
) -> Result<(), String> {
    // Get the store
    let store = app_handle
        .store(SETTINGS_FILENAME)
        .map_err(|e| format!("Failed to get store: {}", e))?;

    // Save the zoom level
    store.set(ZOOM_LEVEL_KEY, json!(zoom_level));

    // Save the store to disk
    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(())
}

// Function to load zoom level from the store
pub fn load_zoom_level<R: Runtime>(app_handle: AppHandle<R>) -> Result<f64, String> {
    // Get the store
    let store = app_handle
        .store(SETTINGS_FILENAME)
        .map_err(|e| format!("Failed to get store: {}", e))?;

    // Try to get the zoom level
    match store.get(ZOOM_LEVEL_KEY) {
        Some(value) => {
            // Try to convert the value to f64
            match value.as_f64() {
                Some(zoom) => Ok(zoom),
                None => {
                    eprintln!("Stored zoom level is not a valid number");
                    Ok(1.0) // Default to 1.0 if the value is not a valid number
                }
            }
        }
        None => {
            println!("No zoom level found in store, using default");
            Ok(1.0) // Default to 1.0 if no value is found
        }
    }
}

// Helper function to get a window by label or fall back to default windows
pub fn get_window_by_label<R: Runtime>(
    app_handle: &AppHandle<R>,
    window_label: Option<String>,
) -> Result<tauri::WebviewWindow<R>, String> {
    let window = if let Some(label) = window_label {
        app_handle.get_webview_window(&label)
    } else {
        None
    }
    .or_else(|| app_handle.get_webview_window("main"))
    .or_else(|| app_handle.get_webview_window("plex-webview"))
    .or_else(|| {
        // Get the first window if specific windows not found
        let windows = app_handle.webview_windows();
        if !windows.is_empty() {
            windows.values().next().cloned()
        } else {
            None
        }
    })
    .ok_or_else(|| "No window found".to_string())?;

    Ok(window)
}

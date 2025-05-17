use tauri::{AppHandle, Emitter, Runtime};

use crate::handlers::common::{get_window_by_label, load_zoom_level, save_zoom_level};

// Function to initialize zoom level from settings
pub fn init_zoom_level<R: Runtime>(app_handle: &AppHandle<R>) -> Result<(), String> {
    println!("Initializing zoom level from settings");

    // Load the zoom level from the store
    match load_zoom_level(app_handle.clone()) {
        Ok(level) => {
            println!("Loaded zoom level from settings: {}", level);
            // Get the window by label or fall back to default windows
            let window = get_window_by_label(app_handle, None)?;
            // Apply the zoom level to the window
            window
                .set_zoom(level)
                .map_err(|e| format!("Failed to set initial zoom level: {}", e))?;
            Ok(())
        }
        Err(e) => {
            eprintln!("Failed to load zoom level from settings: {}", e);
            Err(e)
        }
    }
}

// Command to get the saved zoom level and apply it to a window
#[tauri::command]
pub fn get_saved_zoom_level<R: Runtime>(
    app_handle: AppHandle<R>,
    window_label: Option<String>,
) -> Result<f64, String> {
    println!("Getting saved zoom level for window: {:?}", window_label);

    // Load the zoom level from the store
    let zoom_level = load_zoom_level(app_handle.clone())?;
    println!("Loaded zoom level: {}", zoom_level);

    // Get the window by label or fall back to default windows
    let window = get_window_by_label(&app_handle, window_label)?;

    // Apply the zoom level to the window
    let zoom_result = window.set_zoom(zoom_level);

    // Handle the result
    match zoom_result {
        Ok(_) => {
            println!("Successfully applied saved zoom level: {}", zoom_level);
            Ok(zoom_level)
        }
        Err(e) => {
            let error_msg = format!("Failed to apply saved zoom level: {}", e);
            eprintln!("{}", error_msg);
            Err(error_msg)
        }
    }
}

// Command to adjust zoom level of a window
#[tauri::command]
pub fn adjust_zoom<R: Runtime>(
    app_handle: AppHandle<R>,
    zoom_in: bool,
    window_label: Option<String>,
) -> Result<f64, String> {
    println!(
        "Adjusting zoom level: {} for window: {:?}",
        if zoom_in { "in" } else { "out" },
        window_label
    );

    // Get the window by label or fall back to default windows
    let window = get_window_by_label(&app_handle, window_label)?;

    // Load current zoom level
    let mut zoom_level = load_zoom_level(app_handle.clone())?;

    // Adjust zoom level (increase or decrease by 0.1)
    if zoom_in {
        zoom_level = (zoom_level + 0.1).min(2.0); // Max zoom: 2.0 (200%)
    } else {
        zoom_level = (zoom_level - 0.1).max(0.5); // Min zoom: 0.5 (50%)
    }

    println!("New zoom level: {}", zoom_level);

    // Try to set zoom level
    let zoom_result = window.set_zoom(zoom_level);

    // Handle the result
    match zoom_result {
        Ok(_) => {
            println!("Successfully set zoom level to: {}", zoom_level);

            // Save the zoom level to the store
            match save_zoom_level(app_handle.clone(), zoom_level) {
                Ok(_) => {
                    println!("Zoom level saved to settings");
                }
                Err(e) => {
                    eprintln!("Failed to save zoom level: {}", e);
                }
            }

            // Emit event with the new zoom level
            if let Err(e) = app_handle.emit("zoom-level-changed", zoom_level) {
                eprintln!("Failed to emit zoom-level-changed event: {}", e);
            }

            Ok(zoom_level)
        }
        Err(e) => {
            let error_msg = format!("Failed to set zoom level: {}", e);
            eprintln!("{}", error_msg);
            Err(error_msg)
        }
    }
}

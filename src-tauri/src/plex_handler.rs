use tauri::{AppHandle, Listener, Manager, Runtime, State, Window};

// Command to toggle fullscreen state of a window
#[tauri::command]
pub fn toggle_fullscreen<R: Runtime>(
    app_handle: AppHandle<R>,
    is_fullscreen: bool,
    window_label: Option<String>,
) -> Result<(), String> {
    println!(
        "Setting fullscreen state to: {} for window: {:?}",
        is_fullscreen, window_label
    );

    // Try to get the specific window that emitted the event, or fall back to default windows
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

    // Try to set fullscreen state
    let fullscreen_result = window.set_fullscreen(is_fullscreen);

    // Handle the result
    match fullscreen_result {
        Ok(_) => {
            println!("Successfully set fullscreen state to: {}", is_fullscreen);
            Ok(())
        }
        Err(e) => {
            // If setting fullscreen failed, try maximizing instead
            let error_msg = format!(
                "Failed to set fullscreen state: {}. Trying maximize instead.",
                e
            );
            eprintln!("{}", error_msg);

            // Try to maximize/unmaximize as a fallback
            if is_fullscreen {
                match window.maximize() {
                    Ok(_) => {
                        println!("Successfully maximized window as fallback");
                        Ok(())
                    }
                    Err(e) => {
                        let error_msg = format!("Failed to maximize window: {}", e);
                        eprintln!("{}", error_msg);
                        Err(error_msg)
                    }
                }
            } else {
                match window.unmaximize() {
                    Ok(_) => {
                        println!("Successfully unmaximized window as fallback");
                        Ok(())
                    }
                    Err(e) => {
                        let error_msg = format!("Failed to unmaximize window: {}", e);
                        eprintln!("{}", error_msg);
                        Err(error_msg)
                    }
                }
            }
        }
    }
}

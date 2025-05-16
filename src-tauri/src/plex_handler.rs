use tauri::{Listener, Manager, Runtime, Window};

// Command to toggle fullscreen state of a window
#[tauri::command]
pub fn toggle_fullscreen<R: Runtime>(window: Window<R>, isFullscreen: bool) -> Result<(), String> {
    println!("Setting fullscreen state to: {}", isFullscreen);

    // Try to set fullscreen state
    let fullscreen_result = if isFullscreen {
        // First try to set fullscreen
        window.set_fullscreen(true)
    } else {
        // If not fullscreen, exit fullscreen
        window.set_fullscreen(false)
    };

    // Handle the result
    match fullscreen_result {
        Ok(_) => {
            println!("Successfully set fullscreen state to: {}", isFullscreen);
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
            if isFullscreen {
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

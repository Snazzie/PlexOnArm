use once_cell::sync::Lazy;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Manager, Runtime, Window};

static IS_PIP: Lazy<AtomicBool> = Lazy::new(|| AtomicBool::new(false));

#[tauri::command]
pub fn toggle_pip<R: Runtime>(
    app_handle: AppHandle<R>,
    window_label: Option<String>,
) -> Result<bool, String> {
    let window = app_handle
        .get_webview_window(window_label.as_deref().unwrap_or("main"))
        .ok_or("Window not found")?;

    let is_pip = IS_PIP.load(Ordering::Relaxed);

    if is_pip {
        // Restore normal view
        window
            .set_size(tauri::Size::Logical(tauri::LogicalSize {
                width: 800.0,
                height: 600.0,
            }))
            .map_err(|e| format!("Failed to restore size: {}", e))?;
        window
            .set_position(tauri::Position::Logical(tauri::LogicalPosition {
                x: 0.0,
                y: 0.0,
            }))
            .map_err(|e| format!("Failed to restore position: {}", e))?;
        window
            .set_decorations(true)
            .map_err(|e| format!("Failed to show decorations: {}", e))?;
        window
            .show()
            .map_err(|e| format!("Failed to show window: {}", e))?;
        window
            .set_focus()
            .map_err(|e| format!("Failed to focus window: {}", e))?;
    } else {
        // Enter PIP mode
        let monitor = window
            .current_monitor()
            .map_err(|e| format!("Failed to get monitor: {}", e))?
            .ok_or("No monitor found")?;

        use tauri::{PhysicalPosition, PhysicalSize};

        let screen_size = *monitor.size(); // Dereference to get owned PhysicalSize
        let pip_width = (screen_size.width as f64 * 0.3) as i32;
        let pip_height = (screen_size.height as f64 * 0.3) as i32;
        let pip_size = PhysicalSize {
            width: pip_width as u32,
            height: pip_height as u32,
        };

        window
            .set_size(pip_size)
            .map_err(|e| format!("Failed to set PIP size: {}", e))?;

        window
            .set_position(tauri::Position::Physical(PhysicalPosition {
                x: (screen_size.width as i32 - pip_width - 20).max(0), // Right edge with 20px margin
                y: (screen_size.height as i32 - pip_height - 20).max(0), // Bottom edge with 20px margin
            }))
            .map_err(|e| format!("Failed to set PIP position: {}", e))?;

        let _ = window.set_always_on_top(true);
        window
            .set_decorations(false)
            .map_err(|e| format!("Failed to hide decorations: {}", e))?;
        window
            .show()
            .map_err(|e| format!("Failed to show window: {}", e))?;
        window
            .set_focus()
            .map_err(|e| format!("Failed to focus window: {}", e))?;
    }

    IS_PIP.store(!is_pip, Ordering::Relaxed);
    Ok(!is_pip)
}

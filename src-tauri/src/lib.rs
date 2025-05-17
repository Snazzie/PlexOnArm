mod handlers;
mod scripts;

use handlers::{adjust_zoom, get_saved_zoom_level, toggle_fullscreen, toggle_pip};

use scripts::script::init_script;
#[cfg(any(target_os = "macos", windows, target_os = "linux"))]
use tauri_plugin_window_state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build());

    // Add window state plugin on desktop platforms with custom configuration
    // Disable automatic window state restoration to prevent maximized state on startup
    #[cfg(any(target_os = "macos", windows, target_os = "linux"))]
    {
        builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());
    }

    builder
        .invoke_handler(tauri::generate_handler![
            toggle_fullscreen,
            adjust_zoom,
            get_saved_zoom_level,
            toggle_pip
        ])
        // Use the initialization script for all webviews
        .append_invoke_initialization_script(init_script())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod plex_handler;

use plex_handler::toggle_fullscreen;
mod script;

#[cfg(any(target_os = "macos", windows, target_os = "linux"))]
use tauri_plugin_window_state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Fullscreen event listener scrip
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build());

    // Add window state plugin on desktop platforms
    #[cfg(any(target_os = "macos", windows, target_os = "linux"))]
    {
        builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());
    }

    builder
        .invoke_handler(tauri::generate_handler![toggle_fullscreen,])
        // Use the initialization script for all webviews
        .append_invoke_initialization_script(script::INIT_SCRIPT)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

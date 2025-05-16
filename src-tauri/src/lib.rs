// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod plex_handler;

use plex_handler::{is_fullscreen, register_fullscreen_listener, toggle_fullscreen};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            toggle_fullscreen,
            is_fullscreen,
            register_fullscreen_listener
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

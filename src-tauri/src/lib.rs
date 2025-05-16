use tauri::{Listener, Manager, Window};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap(); // Assuming the window label is "main"
            window.eval("document.addEventListener('fullscreenchange', () => { const isFullscreen = !!document.fullscreenElement; window.__TAURI__.emit('fullscreen-changed', { isFullscreen }); });")
                .map_err(|e| e.to_string())?;

            let window_ = window.clone();
            window.listen("fullscreen-changed", move |event| {
                if let Some(payload) = event.payload() {
                    if let Ok(data) = serde_json::from_str::<serde_json::Value>(payload) {
                        if let Some(is_fullscreen) = data["isFullscreen"].as_bool() {
                            let _ = window_.set_decorations(!is_fullscreen); // Invert logic: fullscreen means no decorations
                        }
                    }
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

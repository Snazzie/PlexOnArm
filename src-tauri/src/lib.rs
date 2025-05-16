// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod plex_handler;

use plex_handler::toggle_fullscreen;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Fullscreen event listener script
    let init_script = "
      // Add a fullscreen change event listener to the document
      document.addEventListener('fullscreenchange', function(event) {
        // Check if the document is in fullscreen mode
        const isFullscreen = document.fullscreenElement !== null;
        console.log('Fullscreen event detected!', event);
        console.log('Fullscreen state:', isFullscreen);
        console.log('Fullscreen element:', document.fullscreenElement);

        // Send a message to the Tauri app using the event system
        try {
          if (window.__TAURI_INTERNALS__) {
            // Fixed: Pass isFullscreen as a direct parameter, not nested in message
            window.__TAURI_INTERNALS__.invoke('toggle_fullscreen', { 
              isFullscreen: isFullscreen 
            });
            console.log('Emitted fullscreenchange event with state:', isFullscreen);
          } else {
            console.error('__TAURI_INTERNALS__ is not available');
          }
        } catch (e) {
          console.error('Error emitting fullscreen event:', e);
        }
      });

      console.log('Plex fullscreen event listener injected');
    ";
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![toggle_fullscreen,])
        // Setup hook to inject the script into any new webview window
        .setup(|_app| {
            println!("Tauri application setup complete.");
            Ok(())
        })
        // Use the initialization script for all webviews
        .append_invoke_initialization_script(init_script)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

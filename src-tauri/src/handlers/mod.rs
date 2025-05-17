// Re-export all commands and functions from the module
mod common;
mod toggle_fullscreen;
mod zoom;

// Re-export the public functions
pub use toggle_fullscreen::toggle_fullscreen;
pub use zoom::{adjust_zoom, get_saved_zoom_level, init_zoom_level};

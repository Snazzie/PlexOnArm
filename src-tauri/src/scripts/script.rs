// The constants are now directly available from the parent module
use super::{BRIGHTNESS_SCRIPT, FULLSCREEN_SCRIPT, PIP_CONTROLS_SCRIPT, PIP_SCRIPT, ZOOM_SCRIPT};

pub fn init_script() -> String {
    format!(
        "{}{}{}{}{}{}",
        FULLSCREEN_SCRIPT,
        ZOOM_SCRIPT,
        PIP_SCRIPT,
        PIP_CONTROLS_SCRIPT,
        BRIGHTNESS_SCRIPT,
        r#"
    console.log('Plex event listeners injected (fullscreen, zoom, PiP, draggable overlay, brightness, and PiP button)');
"#
    )
}

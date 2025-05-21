// The constants are now directly available from the parent module
use super::{
    BRIGHTNESS_SCRIPT, FULLSCREEN_SCRIPT, PIP_BUTTON_SCRIPT, PIP_OVERLAY_SCRIPT, PIP_SCRIPT,
    ZOOM_SCRIPT,
};

pub fn init_script() -> String {
    format!(
        "{}{}{}{}{}{}{}",
        FULLSCREEN_SCRIPT,
        ZOOM_SCRIPT,
        PIP_SCRIPT,
        PIP_OVERLAY_SCRIPT,
        BRIGHTNESS_SCRIPT,
        PIP_BUTTON_SCRIPT,
        r#"
    console.log('Plex event listeners injected (fullscreen, zoom, PiP, draggable overlay, brightness, and PiP button)');
"#
    )
}

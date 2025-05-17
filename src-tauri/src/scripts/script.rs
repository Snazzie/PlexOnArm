// The constants are now directly available from the parent module
use super::{FULLSCREEN_SCRIPT, PIP_OVERLAY_SCRIPT, PIP_SCRIPT, ZOOM_SCRIPT};

pub fn init_script() -> String {
    format!(
        "{}{}{}{}{}",
        FULLSCREEN_SCRIPT,
        ZOOM_SCRIPT,
        PIP_SCRIPT,
        PIP_OVERLAY_SCRIPT,
        r#"
    console.log('Plex event listeners injected (fullscreen, zoom, PiP, and draggable overlay)');
"#
    )
}

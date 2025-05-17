use super::{
    fullscreen_script::FULLSCREEN_SCRIPT, pip_overlay_script::PIP_OVERLAY_SCRIPT,
    pip_script::PIP_SCRIPT, zoom_script::ZOOM_SCRIPT,
};

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

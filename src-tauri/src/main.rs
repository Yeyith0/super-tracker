// Hides the extra console window in release builds on Windows. Do not remove.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        // Remembers window size, position and maximized state between launches.
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // Opens external links in the default browser.
        .plugin(tauri_plugin_opener::init())
        // Signed auto-updates from GitHub releases, restart after installing.
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        // Version policy and content channel downloads (scope in capabilities/default.json).
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                fit_to_monitor(&window);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Super Tracker");
}

/// The default window (1440x900) is larger than small laptop screens such as 1366x768.
/// If the window does not fit the monitor's work area, maximize it instead of letting it overflow.
fn fit_to_monitor(window: &tauri::WebviewWindow) {
    let (Ok(Some(monitor)), Ok(size)) = (window.current_monitor(), window.outer_size()) else {
        return;
    };
    let area = monitor.work_area().size;
    if size.width > area.width || size.height > area.height {
        let _ = window.maximize();
    }
}

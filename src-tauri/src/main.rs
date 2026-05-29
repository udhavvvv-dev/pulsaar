#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use sysinfo::{Components, System};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[derive(Serialize, Clone)]
struct ProcessInfo { name: String, cpu: f32 }

#[derive(Serialize, Clone)]
struct Metrics {
    cpu: f64, gpu: f64, ram_used: f64, ram_total: f64,
    cpu_temp: f64, top_apps: Vec<ProcessInfo>, platform: String,
}

#[tauri::command]
fn get_metrics() -> Metrics {
    let mut sys = System::new_all();
    sys.refresh_all();
    let cpu = sys.global_cpu_info().cpu_usage() as f64;
    let ram_used = sys.used_memory() as f64 / 1_073_741_824.0;
    let ram_total = sys.total_memory() as f64 / 1_073_741_824.0;
    let components = Components::new_with_refreshed_list();
    let cpu_temp = components.iter()
        .find(|c| { let l = c.label().to_lowercase(); l.contains("cpu")||l.contains("core")||l.contains("tdie") })
        .map(|c| c.temperature() as f64).unwrap_or(0.0);
    let mut processes: Vec<ProcessInfo> = sys.processes().values()
        .map(|p| ProcessInfo { name: p.name().to_string(), cpu: p.cpu_usage() }).collect();
    processes.sort_by(|a,b| b.cpu.partial_cmp(&a.cpu).unwrap());
    let top_apps = processes.into_iter().filter(|p| p.cpu>0.5).take(4).collect();
    Metrics { cpu, gpu:0.0, ram_used, ram_total, cpu_temp, top_apps, platform: std::env::consts::OS.to_string() }
}

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn hide_window(app: tauri::AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        win.hide().ok();
    }
}

fn show_window(app: &tauri::AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        win.show().ok();
        win.unminimize().ok();
        win.set_focus().ok();
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_metrics, close_app, hide_window])
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Show Pulsar", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Pulsar", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("Pulsar — Click to show/hide")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => show_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event {
                        show_window(tray.app_handle());
                    }
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

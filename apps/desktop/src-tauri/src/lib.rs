use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub path: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
    pub tags: Vec<String>,
    pub metadata: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotesData {
    pub notes: Vec<Note>,
}

fn get_notes_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    let notes_dir = app_dir.join("notes");
    
    if !notes_dir.exists() {
        fs::create_dir_all(&notes_dir).map_err(|e| e.to_string())?;
    }
    
    Ok(notes_dir)
}

fn get_notes_index_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let notes_dir = get_notes_path(app_handle)?;
    Ok(notes_dir.join("notes.json"))
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_notes_directory(app_handle: tauri::AppHandle) -> Result<String, String> {
    let notes_dir = get_notes_path(&app_handle)?;
    notes_dir.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Failed to convert path to string".to_string())
}

#[tauri::command]
fn load_notes(app_handle: tauri::AppHandle) -> Result<Vec<Note>, String> {
    let index_path = get_notes_index_path(&app_handle)?;
    
    if !index_path.exists() {
        return Ok(vec![]);
    }
    
    let content = fs::read_to_string(&index_path)
        .map_err(|e| format!("Failed to read notes index: {}", e))?;
    
    let data: NotesData = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse notes: {}", e))?;
    
    Ok(data.notes)
}

#[tauri::command]
fn save_notes(app_handle: tauri::AppHandle, notes: Vec<Note>) -> Result<(), String> {
    let index_path = get_notes_index_path(&app_handle)?;
    
    let data = NotesData { notes };
    
    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize notes: {}", e))?;
    
    fs::write(&index_path, content)
        .map_err(|e| format!("Failed to write notes: {}", e))?;
    
    log::info!("Saved {} notes to {:?}", notes.len(), index_path);
    Ok(())
}

#[tauri::command]
fn export_note_to_file(app_handle: tauri::AppHandle, note: Note) -> Result<String, String> {
    let notes_dir = get_notes_path(&app_handle)?;
    let filename = format!("{}.md", note.id);
    let file_path = notes_dir.join(&filename);
    
    let content = format!("# {}\n\n{}", note.title, note.content);
    
    fs::write(&file_path, content)
        .map_err(|e| format!("Failed to export note: {}", e))?;
    
    file_path.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Failed to convert path to string".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    log::info!("Starting Notes App...");

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            log::info!("Application setup complete");
            
            let notes_dir = app.path().app_data_dir()
                .map(|dir| dir.join("notes"))
                .ok();
            
            if let Some(ref dir) = notes_dir {
                if !dir.exists() {
                    if let Err(e) = fs::create_dir_all(dir) {
                        log::error!("Failed to create notes directory: {}", e);
                    } else {
                        log::info!("Created notes directory at {:?}", dir);
                    }
                }
            }
            
            let _ = app.get_webview_window("main");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            get_notes_directory,
            load_notes,
            save_notes,
            export_note_to_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

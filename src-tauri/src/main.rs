#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::Serialize;
use std::{fs, path::PathBuf};
use chrono::{DateTime, Local};

#[derive(Serialize)]
struct FileEntry {
  name: String,
  ext: Option<String>,
  size: u64,
  modified: String,
  is_dir: bool,
  path: String,
}

/// Generic directory lister
#[tauri::command]
fn list_path(dir_path: String) -> Result<Vec<FileEntry>, String> {
  println!("📂 list_path called with: `{}`", dir_path);
  let p = PathBuf::from(&dir_path);

  if !p.exists() {
    return Err(format!("Path `{}` does not exist", dir_path));
  }
  if !p.is_dir() {
    return Err(format!("Path `{}` is not a directory", dir_path));
  }

  let mut entries = Vec::new();
  for entry in fs::read_dir(&p).map_err(|e| e.to_string())? {
    let entry = entry.map_err(|e| e.to_string())?;
    let path = entry.path();
    let meta = entry.metadata().map_err(|e| e.to_string())?;

    let name = entry.file_name().to_string_lossy().into_owned();
    let ext = path.extension().and_then(|s| s.to_str()).map(String::from);
    let size = meta.len();
    let modified_dt: DateTime<Local> = meta
      .modified()
      .map_err(|e| e.to_string())?
      .into();
    let modified = modified_dt.format("%Y-%m-%d %H:%M:%S").to_string();
    let is_dir = meta.is_dir();
    let path_str = path.to_string_lossy().to_string();

    entries.push(FileEntry {
      name,
      ext,
      size,
      modified,
      is_dir,
      path: path_str,
    });
  }

  Ok(entries)
}

/// Read a UTF-8 text file from any path
#[tauri::command]
fn read_text(path: String) -> Result<String, String> {
  println!("📄 read_text called with path: {}", path);
  let p = PathBuf::from(path);
  fs::read_to_string(&p).map_err(|e| {
    eprintln!("🔴 read_text failed for {:?}: {}", p, e);
    e.to_string()
  })
}

/// Rename a file inside a named folder under home
#[tauri::command]
fn rename_file(folder: String, old: String, new: String) -> Result<bool, String> {
  let mut base = dirs::home_dir().ok_or("home directory not found")?;
  base.push(&folder);

  let mut old_path = base.clone();
  old_path.push(&old);
  let mut new_path = base;
  new_path.push(&new);

  fs::rename(&old_path, &new_path).map_err(|e| e.to_string())?;
  Ok(true)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      list_path,
      read_text,
      rename_file
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

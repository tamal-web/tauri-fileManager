import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLocation } from "react-router-dom";
import { cn } from "./lib/utils";
import { convertFileSrc } from "@tauri-apps/api/core";
import { renderAsync } from "docx-preview";

interface FileEntry {
  name: string;
  ext?: string;
  size: number;
  modified: string;
  is_dir?: boolean;
  path: string;
}

export default function DynamicPage() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [currentDir, setCurrentDir] = useState<string>(
    `/Users/tamal/${pageName}`
  );
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const viewerRef = useRef(null);
  const [hiddenFiles] = useState(false); // Set to true to show hidden files

  // console.log("Current page name:", pageName);
  // console.log("Current directory:", currentDir);

  // Set the current directory based on the page name
  useEffect(() => {
    setCurrentDir(`/Users/tamal/${pageName}`);
  }, [location.pathname, pageName]);

  // Handle key press for renaming
  // This listens for the "r" key to rename the selected file
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" && selectedFile) {
        setRenaming(selectedFile.name);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedFile]);

  // Load text content when selectedFile changes
  useEffect(() => {
    if (!selectedFile) {
      setTextContent("");
      return;
    }
    if (selectedFile.ext === "txt" || selectedFile.ext === "rtf") {
      invoke<string>("read_text", { path: selectedFile.path })
        .then((content) => {
          console.log("📍 read_text content:", content);
          return setTextContent(content);
        })
        .catch((e) => {
          console.error("📍 read_text failed", e);
          setTextContent("Unable to load file");
        });
    } else {
      setTextContent("");
    }
  }, [selectedFile]);

  // Load files when the page changes or currentDir changes
  useEffect(() => {
    invoke<FileEntry[]>("list_path", { dirPath: currentDir })
      .then((raw) => {
        const sorted = raw.sort((a, b) => {
          const da = new Date(a.modified).getTime();
          const db = new Date(b.modified).getTime();
          return db - da;
        });
        setFiles(sorted);
      })
      .catch(() => {
        setFiles([]);
        return console.error;
      });
  }, [pageName, currentDir]);

  // Load DOCX files
  useEffect(() => {
    if (!selectedFile) return;
    if (selectedFile.ext !== "docx") return;
    const docxUrl = convertFileSrc(selectedFile.path);
    // 2. Fetch it as an ArrayBuffer
    if (viewerRef && viewerRef.current) {
      fetch(docxUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((arrayBuffer) =>
          renderAsync(arrayBuffer, viewerRef.current!, undefined, {
            ignoreWidth: true,
            ignoreHeight: true,
            ignoreFonts: false,
            // inWrapper: true,
            renderHeaders: true,
          })
        )
        .catch((err) => {
          console.error("Failed to load DOCX:", err);
        });
    }
  }, [selectedFile]);

  const finishRename = async (newName: string) => {
    if (selectedFile && newName && newName !== selectedFile.name) {
      try {
        await invoke("rename_file", {
          folder: pageName,
          old: selectedFile.name,
          new: newName,
        });
        const updated = await invoke<FileEntry[]>("list_path", {
          dirPath: currentDir,
        });
        console.log("📍 Updated files after rename:", updated);
        setFiles(updated);
      } catch (err) {
        console.error("rename failed", err);
      }
    }
    setRenaming(null);
  };
  const onRenameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement).value;
    if (e.key === "Enter") finishRename(val);
    if (e.key === "Escape") setRenaming(null);
  };

  return (
    <SidebarInset className="overflow-y-hidden">
      <div className="w-full border-b-1 px-2 py-2 flex items-center justify-start gap-[0.2rem]">
        <SidebarTrigger />
        <h2 className="text-[1.1rem]">{pageName}</h2>
      </div>
      <div className="h-full flex flex-row w-full">
        <main className="overflow-y-auto flex-1">
          <div className="p-4">
            <h1 className="text-2xl mb-4">{pageName}</h1>
            <div className="flex flex-col">
              {files.map((f) => {
                const isSelected = f.name === selectedFile?.name;
                return (
                  <button
                    key={f.name}
                    onClick={() => {
                      setSelectedFile(f);
                      setRenaming(null);
                    }}
                    className={cn(
                      "flex w-full p-2 border-b text-left",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                      !hiddenFiles && f.name.startsWith(".") && "hidden"
                    )}
                  >
                    <div className="w-1/4 flex">
                      {renaming === f.name ? (
                        <input
                          className="w-full bg-transparent focus:outline-none"
                          defaultValue={f.name}
                          autoFocus
                          onBlur={(e) => finishRename(e.currentTarget.value)}
                          onKeyDown={onRenameKey}
                        />
                      ) : (
                        <span className="flex-1 overflow-x-hidden w-full overflow-wrap-break-word block break-words">
                          {f.name}
                        </span>
                      )}
                    </div>
                    <div className="w-1/6">{f.ext || "-"}</div>
                    <div className="w-1/6">{(f.size / 1024).toFixed(1)} KB</div>
                    <div className="w-1/4">{f.modified}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
        <aside className="w-[20rem] h-full bg-gray-400 relative">
          <h2>{selectedFile?.name}</h2>
          {selectedFile && (
            <div className="w-full relative h-full">
              {(selectedFile.ext === "png" ||
                selectedFile.ext === "jpg" ||
                selectedFile.ext === "jpeg" ||
                selectedFile.ext === "gif" ||
                selectedFile.ext === "bmp" ||
                selectedFile.ext === "webp") && (
                <>
                  <img
                    src={convertFileSrc(selectedFile.path)}
                    alt="selectedFile"
                  />
                </>
              )}
              {selectedFile.ext === "pdf" && (
                <div className="w-full">
                  <iframe
                    src={convertFileSrc(selectedFile.path)}
                    title="PDF Preview"
                    style={{ width: "100%", height: "600px", border: "none" }}
                  />
                </div>
              )}
              {selectedFile.ext === "txt" && (
                <>
                  <div className="w-full">
                    <pre className="p-4 bg-white text-black">{textContent}</pre>
                  </div>
                </>
              )}
              {selectedFile.ext === "docx" && (
                <div className="w-full h-full flex flex-row flex-1">
                  <div
                    ref={viewerRef}
                    className="relative text-start flex flex-col items-center justify-start overflow-y-auto! overflow-x-auto! h-full flex-1 max-h-[26rem] m-2"
                  />
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
      {/* </main> */}
    </SidebarInset>
  );
}

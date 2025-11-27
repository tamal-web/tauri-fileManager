import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface FileEntry {
  name: string;
  ext?: string;
  size: number;
  modified: string;
}

export default function Page(props: {
  pageFunction: string;
  pageName: string;
}) {
  const [files, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    invoke<FileEntry[]>(props.pageFunction).then(setFiles).catch(console.error);
  }, [props.pageFunction]);

  return (
    <div className="h-full flex flex-row w-full">
      <main className="overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl mb-4">{props.pageName}</h1>
          <div className="flex flex-col">
            {files.map((f) => (
              <div key={f.name} className="flex p-2 border-b">
                <div className="w-1/4">{f.name}</div>
                <div className="w-1/6">{f.ext || "-"}</div>
                <div className="w-1/6">{(f.size / 1024).toFixed(1)} KB</div>
                <div className="w-1/4">{f.modified}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

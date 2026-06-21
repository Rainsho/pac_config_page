'use client';

import { useRef, useState, useCallback } from 'react';

interface UploadZoneProps {
  onUploaded: () => void;
}

export function UploadZone({ onUploaded }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState(false);

  const uploadFile = useCallback(
    (file: File) => {
      return new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploads((prev) => ({ ...prev, [file.name]: e.loaded / e.total }));
          }
        });
        xhr.addEventListener('load', () => {
          setUploads((prev) => {
            const next = { ...prev };
            delete next[file.name];
            return next;
          });
          onUploaded();
          resolve();
        });
        xhr.addEventListener('error', () => {
          setUploads((prev) => {
            const next = { ...prev };
            delete next[file.name];
            return next;
          });
          resolve();
        });
        xhr.open('POST', '/api/fs/upload');
        const fd = new FormData();
        fd.append('file', file);
        xhr.send(fd);
      });
    },
    [onUploaded],
  );

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    for (let i = 0; i < fileList.length; i++) {
      uploadFile(fileList[i]);
    }
  }

  const uploadEntries = Object.entries(uploads);

  return (
    <div className="mb-3">
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-gray-400">Click or drag file to this area to upload</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadEntries.length > 0 && (
        <div className="mt-2 rounded border p-2">
          {uploadEntries.map(([file, percent]) => (
            <div key={file} className="mb-1">
              <div className="mb-0.5 text-xs text-gray-500">UPLOADING {file}</div>
              <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${percent * 100}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-400">
                {percent >= 1 ? '100%' : `${(percent * 100).toFixed(2)}%`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

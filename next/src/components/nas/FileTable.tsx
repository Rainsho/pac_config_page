'use client';

interface FileInfo {
  name: string;
  path: string;
  size: number;
}

function fmtBytes(bytes: number): string {
  if (Number.isNaN(bytes)) return String(bytes);
  if (bytes < 1024) return `${bytes} B`;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

function shorterText(str: string, len = 32): string {
  if (str.length < len) return str;
  const key = (/S\d+E\d+/i.exec(str) || '') && /S\d+E\d+/i.exec(str)?.[0];
  const fix = key ? ~~(len / 2) - 6 : ~~(len / 2) - 2;
  const pre = str.substring(0, fix);
  const sub = str.substring(str.length - fix);
  return [pre, sub].some((x) => x.includes(key || '')) ? `${pre}....${sub}` : `${pre}...${key || ''}...${sub}`;
}

interface FileTableProps {
  files: FileInfo[];
  uploaded: string[];
  selectedFiles: string[];
  onSelect: (paths: string[]) => void;
  onRename: (path: string, name: string) => void;
  onDelete: (path: string) => void;
  onPersist: (path: string) => void;
  onDump: (path: string) => void;
  onVideo: (path: string) => void;
}

export function FileTable({
  files,
  uploaded,
  selectedFiles,
  onSelect,
  onRename,
  onDelete,
  onPersist,
  onDump,
  onVideo,
}: FileTableProps) {
  const allSelected = files.length > 0 && selectedFiles.length === files.length;

  function toggleAll() {
    if (allSelected) {
      onSelect([]);
    } else {
      onSelect(files.map((f) => f.path));
    }
  }

  function toggleOne(path: string) {
    if (selectedFiles.includes(path)) {
      onSelect(selectedFiles.filter((p) => p !== path));
    } else {
      onSelect([...selectedFiles, path]);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="w-8 px-2 py-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4"
              />
            </th>
            <th className="px-2 py-2 font-medium">name</th>
            <th className="px-2 py-2 font-medium">path</th>
            <th className="px-2 py-2 text-right font-medium">size</th>
            <th className="px-2 py-2 text-center font-medium">opt</th>
          </tr>
        </thead>
        <tbody>
          {files.map(({ name, path, size }) => (
            <tr key={path} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(path)}
                  onChange={() => toggleOne(path)}
                  className="cursor-pointer h-4 w-4"
                />
              </td>
              <td className="max-w-[200px] truncate px-2 py-2" title={name}>
                <a href={`/nas/${path}`} className="text-blue-600 hover:underline">
                  {shorterText(name)}
                </a>
              </td>
              <td className="max-w-[200px] truncate px-2 py-2" title={path}>
                {shorterText(path)}
              </td>
              <td className="px-2 py-2 text-right">{fmtBytes(size)}</td>
              <td className="px-2 py-2">
                <div className="flex justify-center gap-1">
                  <button
                    onClick={() => onRename(path, name)}
                    className="cursor-pointer rounded px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
                    title="Rename"
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => onVideo(path)}
                    disabled={!/\.mp4$/.test(name)}
                    className="cursor-pointer rounded px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                    title="Play"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => onDelete(path)}
                    className="cursor-pointer rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-100"
                    title="Delete"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => onPersist(path)}
                    disabled={uploaded.includes(name)}
                    className="cursor-pointer rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100 disabled:opacity-30"
                    title="Persist"
                  >
                    ☁
                  </button>
                  <button
                    onClick={() => onDump(path)}
                    disabled={!path.startsWith('TDDOWNLOAD')}
                    className="cursor-pointer rounded px-2 py-0.5 text-xs text-green-600 hover:bg-green-100 disabled:opacity-30"
                    title="Dump"
                  >
                    ↻
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {files.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-400">
                No files
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

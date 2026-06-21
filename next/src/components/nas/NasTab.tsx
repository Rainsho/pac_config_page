'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileTable } from './FileTable';
import { UploadZone } from './UploadZone';
import { ProgressBar } from './ProgressBar';
import { VideoModal } from './VideoModal';
import { useSSE } from '@/hooks/useSSE';
import { apiFetch } from '@/hooks/useAuth';

interface FileInfo {
  name: string;
  path: string;
  size: number;
}

interface DiskInfo {
  available: number;
  total: number;
}

interface QueueItem {
  id: string;
  file?: string;
  state: string;
  time?: string;
}

function fmtBytes(bytes: number, prec = 3): string {
  if (Number.isNaN(bytes)) return String(bytes);
  if (bytes < 1024) return `${bytes} B`;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(prec)} ${sizes[i]}`;
}

function api(method: string, url: string, body?: unknown) {
  return apiFetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function NasTab() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [disk, setDisk] = useState<DiskInfo>({ available: 0, total: 0 });
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [persistFile, setPersistFile] = useState('');
  const [persistPercent, setPersistPercent] = useState(0);
  const [cancel, setCancel] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const syncData = useCallback(async () => {
    const [filesRes, diskRes, queueRes] = await Promise.all([
      fetch('/api/fs/file').then((r) => r.json()),
      fetch('/api/fs/disk').then((r) => r.json()),
      fetch('/api/fs/queue').then((r) => r.json()),
    ]);
    setFiles(filesRes);
    setDisk(diskRes);
    setQueue(queueRes);
  }, []);

  useEffect(() => {
    syncData();
  }, [syncData]);

  useSSE({
    progress: (data: any) => {
      setPersistFile(data.file);
      setPersistPercent(data.percent);
    },
    done: (data: any) => {
      setQueue((prev) => [...prev, data]);
    },
  });

  async function handleRename(path: string, name: string) {
    const newName = prompt('New name:', name);
    if (newName && newName !== name) {
      await api('PUT', '/api/fs/file', { path, name: newName });
      syncData();
    }
  }

  async function handleDelete(path: string) {
    if (!confirm(`Delete ${path}?`)) return;
    await api('DELETE', '/api/fs/file', { path });
    syncData();
  }

  async function handlePurge() {
    if (!confirm('Purge all files?')) return;
    await api('DELETE', '/api/fs/file', { purge: true });
    syncData();
  }

  async function handlePersist(path: string) {
    if (!confirm(`Persist ${path}?`)) return;
    setPersistFile(path.split('/').pop() || '');
    setPersistPercent(0);
    setCancel(false);
    const res = await api('PUT', '/api/fs/ftpd', { path });
    const { desc } = await res.json();
    if (desc) alert(desc);
  }

  async function handleCancel() {
    await api('DELETE', '/api/fs/ftpd', { fileName: persistFile });
    setCancel(true);
  }

  async function handleDump(path: string) {
    await api('POST', '/api/fs/dump', { path });
    syncData();
  }

  async function handleBatchDelete() {
    if (!confirm(`Delete [${selectedFiles.join(', ')}]?`)) return;
    await Promise.all(
      selectedFiles.map((path) => api('DELETE', '/api/fs/file', { path })),
    );
    setSelectedFiles([]);
    syncData();
  }

  async function handleBatchPersist() {
    if (!confirm(`Persist [${selectedFiles.join(', ')}]?`)) return;
    await Promise.all(
      selectedFiles.map((path) => api('PUT', '/api/fs/ftpd', { path })),
    );
    setSelectedFiles([]);
  }

  function handleVideo(path: string) {
    setVideoSrc(`/nas/${path}`);
    setShowVideo(true);
  }

  const uploaded = queue.filter((x) => x.state === 'done');
  const diskStr = disk.available
    ? ` (${fmtBytes(disk.available, 2)}/${fmtBytes(disk.total, 2)})`
    : '';

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Nexus File System{diskStr}</h2>
        <div className="flex gap-2">
          <button
            onClick={syncData}
            className="cursor-pointer rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
          >
            sync
          </button>
          <button
            onClick={handlePurge}
            className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
          >
            purge
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={selectedFiles.length === 0}
            className="cursor-pointer rounded bg-gray-500 px-3 py-1.5 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
          >
            delete
          </button>
          <button
            onClick={handleBatchPersist}
            disabled={selectedFiles.length === 0}
            className="cursor-pointer rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600 disabled:opacity-50"
          >
            persist
          </button>
        </div>
      </div>

      {uploaded.length > 0 && (
        <div className="mb-3 rounded border p-2">
          <div className="mb-1 text-xs font-medium text-gray-500">UPLOADED</div>
          {uploaded.map((item) => (
            <div key={item.id} className="text-sm">
              <span className="text-gray-400">time </span>
              <span className="mr-4">{item.time}</span>
              <span className="text-gray-400">file </span>
              <span>{item.id}</span>
            </div>
          ))}
        </div>
      )}

      {persistFile && (
        <ProgressBar
          file={persistFile}
          percent={persistPercent}
          cancel={cancel}
          onCancel={handleCancel}
        />
      )}

      <UploadZone onUploaded={syncData} />

      <FileTable
        files={files}
        uploaded={uploaded.map((x) => x.id)}
        selectedFiles={selectedFiles}
        onSelect={setSelectedFiles}
        onRename={handleRename}
        onDelete={handleDelete}
        onPersist={handlePersist}
        onDump={handleDump}
        onVideo={handleVideo}
      />

      {showVideo && <VideoModal src={videoSrc} onClose={() => setShowVideo(false)} />}
    </div>
  );
}

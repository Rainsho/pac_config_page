'use client';

interface ProgressBarProps {
  file: string;
  percent: number;
  cancel: boolean;
  onCancel: () => void;
}

export function ProgressBar({ file, percent, cancel, onCancel }: ProgressBarProps) {
  const pct = percent * 100;

  return (
    <div className="mb-3 rounded border p-2">
      <div className="mb-1 text-xs font-medium text-gray-500">UPLOADING {file}</div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          onClick={onCancel}
          disabled={!percent || percent >= 1 || cancel}
          className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-full text-xs text-gray-400 hover:bg-gray-200 disabled:opacity-30"
        >
          ✕
        </button>
      </div>
      <div className="text-right text-xs text-gray-400">
        {pct >= 100 ? '100%' : `${pct.toFixed(2)}%`}
      </div>
    </div>
  );
}

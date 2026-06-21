'use client';

import { useState, useEffect, useCallback } from 'react';

interface IpRecord {
  s: string;
  t: string;
  i: string;
}

function isIP(str: string): boolean {
  return /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(str);
}

export function InfoTab() {
  const [info, setInfo] = useState<IpRecord[]>([]);

  const fetchInfo = useCallback(async (all = false) => {
    const url = all ? '/api/sd/info?all=true' : '/api/sd/info';
    const res = await fetch(url);
    const data = await res.json();
    setInfo(data);
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Nexus IP Tracer</h2>
        <div className="flex gap-2">
          <button
            onClick={() => fetchInfo(false)}
            className="cursor-pointer rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
          >
            update
          </button>
          <button
            onClick={() => fetchInfo(true)}
            className="cursor-pointer rounded bg-gray-500 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
          >
            flush
          </button>
        </div>
      </div>

      <div className="rounded border">
        {info.length === 0 && (
          <div className="py-8 text-center text-gray-400">No records</div>
        )}
        {info.map(({ s, t, i }) => (
          <div
            key={`${s}-${t}`}
            className="flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-100 px-4 py-2 text-sm last:border-b-0"
          >
            <span>
              <span className="font-medium text-blue-600">start </span>
              <span>{s}</span>
            </span>
            <span>
              <span className="font-medium text-blue-600">end </span>
              <span>{t}</span>
            </span>
            <span>
              <span className={`font-medium ${isIP(i) ? 'text-green-600' : 'text-red-500'}`}>
                {isIP(i) ? 'ip ' : 'error '}
              </span>
              <span>{i}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoModalProps {
  src: string;
  onClose: () => void;
}

export function VideoModal({ src, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      autoplay: true,
      controls: true,
      playbackRates: [0.5, 0.8, 1, 1.2, 2],
      sources: [{ src, type: 'video/mp4' }],
    });

    return () => {
      playerRef.current?.dispose();
    };
  }, [src]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-[90%] max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div data-vjs-player>
          <video ref={videoRef} className="video-js vjs-big-play-centered" />
        </div>
      </div>
    </div>
  );
}

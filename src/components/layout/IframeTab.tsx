'use client';

interface IframeTabProps {
  src: string;
  title: string;
}

export function IframeTab({ src, title }: IframeTabProps) {
  return (
    <iframe
      title={title}
      className="w-full border-none"
      style={{ height: 'calc(100vh - 100px)' }}
      src={src}
    />
  );
}


import React from 'react';

export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h3l2-2h6l2 2h3v16H4V4zm8 11.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 6.5 12 6.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
  </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z" />
  </svg>
);

export const ActivityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const HandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.31 9.25c-.98-2.31-3.12-3.8-5.56-3.8-1.55 0-2.97.64-4 1.69-.15-.39-.33-.76-.53-1.11C8.75 5.09 7.9 4.5 7 4.5c-1.1 0-2 .9-2 2 0 .34.09.67.24.96-.34.42-.64.88-.88 1.38C4.13 9.4 4 9.94 4 10.5c0 2.29 1.54 4.24 3.65 4.86.31.09.63.14.95.14.86 0 1.66-.35 2.24-.93.58.58 1.38.93 2.24.93.88 0 1.7-.36 2.28-1 .31.81 1.05 1.4 1.94 1.4.28 0 .55-.07.8-.19 1.47-.72 2.4-2.34 2.19-4.04-.12-.95-.62-1.78-1.28-2.42zm-12.26 3c-.23 0-.45-.04-.66-.12-.99-.29-1.7-1.23-1.7-2.28 0-.41.09-.81.25-1.18.23.63.58 1.2 1.01 1.69.59.69 1.43 1.1 2.35 1.1.23 0 .45-.03.66-.08.15.52.05 1.1-.28 1.54-.39.51-1 .83-1.63.83zm4.5-2.58c-.62.62-1.45.98-2.34.98-.38 0-.75-.07-1.11-.2-.84-1.2-1.02-2.74-.5-4.21.52-1.47 1.69-2.64 3.16-3.16.59-.2 1.22-.15 1.78.13.29.14.56.32.8.52-1.03.82-1.78 2.02-1.79 3.36v.58zm4.7-1.11c-.59-.69-1.43-1.1-2.35-1.1-.34 0-.67.06-.98.17-1.12 1.3-1.21 3.19-.28 4.65.25.4.58.72.98 1 .23 0 .45-.03.66-.08.97-.28 1.69-1.17 1.7-2.18 0-.45-.14-.88-.4-1.24-.16-.23-.35-.45-.53-.62z"/>
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.4 16.6 4.8 12l1.4-1.4 3.2 3.2 7.2-7.2 1.4 1.4-8.6 8.6Z M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Z"/>
    </svg>
);

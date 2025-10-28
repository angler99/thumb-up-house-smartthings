
import React from 'react';

export const BulbOnIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path fill="#fef08a" d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" style={{filter: 'url(#glow)'}} />
    <path fill="#fef08a" d="M9 19v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1z"/>
  </svg>
);


export const BulbOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7zM12 4a5 5 0 0 1 5 5c0 1.54-.71 2.92-1.83 3.86l-.17.14V16H9v-3l-.17-.14A4.99 4.99 0 0 1 7 9a5 5 0 0 1 5-5z"/>
      <path d="M9 19v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1z"/>
    </svg>
);

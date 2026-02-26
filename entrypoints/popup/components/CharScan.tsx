import React from 'react';

interface CharScanProps {
  text: string;
  className?: string;
}

export const CharScan: React.FC<CharScanProps> = ({ text, className = '' }) => {
  const chars = text.split('');

  return (
    <span className="char-scan-container">
      {chars.map((char, index) => (
        <span
          key={index}
          className={`char-scan-item ${className}`}
          style={{ '--char-index': index } as React.CSSProperties}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

import { useRef, useEffect, useState, useCallback } from 'react';
import { GlitchText } from './GlitchText';

interface GlowCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function GlowCard({ title, children, className = '', loading }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [pathData, setPathData] = useState({ d: '', perimeter: 0, width: 0, height: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const calculatePath = useCallback(() => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (w <= 0 || h <= 0) return;

    let titleEnd = 0;
    if (titleRef.current) {
      titleEnd = 1 + titleRef.current.offsetLeft + titleRef.current.offsetWidth;
    }

    const startX = titleEnd > 0 ? titleEnd : 0.5;
    const x1 = startX;
    const y1 = 0.5;
    const x2 = w - 0.5;
    const y2 = h - 0.5;

    let d: string;
    if (titleEnd > 0) {
      d = `M${x1},${y1} L${x2},${y1} L${x2},${y2} L0.5,${y2} L0.5,${y1} L${x1},${y1} Z`;
    } else {
      d = `M${x1},${y1} L${x2},${y1} L${x2},${y2} L0.5,${y2} L0.5,${y1} Z`;
    }

    const perimeter = 2 * (w - 1) + 2 * (h - 1);
    setPathData({ d, perimeter, width: w, height: h });
  }, []);

  useEffect(() => {
    calculatePath();

    const resizeObserver = new ResizeObserver(() => {
      calculatePath();
    });

    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculatePath]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      ref={cardRef}
      className={`widget-glow bg-[var(--color-bg)] border border-[var(--color-border)] mt-[10px] ${loading ? 'opacity-50' : ''} ${className}`}
      style={{ '--perimeter': pathData.perimeter } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="widget-title-bar">
        <div ref={titleRef} className="widget-title">
          <GlitchText
            text={title}
            autoPlay={false}
            onHover={false}
            externalTrigger={isHovering}
          />
        </div>
      </div>

      <div className="widget-glow-border">
        <svg
          viewBox={`0 0 ${pathData.width} ${pathData.height}`}
          preserveAspectRatio="none"
        >
          <path d={pathData.d} />
        </svg>
      </div>

      <div className="widget-content">
        {children}
      </div>
    </div>
  );
}

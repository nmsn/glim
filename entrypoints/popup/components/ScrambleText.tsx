import React, { useState, useRef, useCallback, useEffect } from 'react';

const SCRAMBLE_CHARS = '!@#$%^&*_+-=[]{}|;:<>?/~';
const SCRAMBLE_CHARS_CN = '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏';

function isAllChinese(text: string): boolean {
  return /^[\u4e00-\u9fa5]+$/.test(text);
}

interface ScrambleTextProps {
  text: string;
  className?: string;
  onHover?: boolean;
  autoPlay?: boolean;
  externalTrigger?: boolean;
  onScrambleStart?: () => void;
  onScrambleEnd?: () => void;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className = '',
  onHover = true,
  autoPlay = false,
  externalTrigger = false,
  onScrambleStart,
  onScrambleEnd
}) => {
  const [displayText, setDisplayText] = useState(text);
  const isHovering = useRef(false);
  const scrambleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPlayedOnce = useRef(false);
  const prevExternalTrigger = useRef(false);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const scramble = useCallback(() => {
    let tick = 0;
    const maxTicks = text.length;
    const chars = isAllChinese(text) ? SCRAMBLE_CHARS_CN : SCRAMBLE_CHARS;
    const run = () => {
      if (((!onHover || !isHovering.current) && !autoPlay && !externalTrigger) || tick >= maxTicks) {
        setDisplayText(text);
        onScrambleEnd?.();
        return;
      }
      tick++;
      setDisplayText(
        text.split('').map((ch, i) =>
          i < tick ? ch : chars[Math.floor(Math.random() * chars.length)]
        ).join('')
      );
      scrambleTimer.current = setTimeout(run, 40);
    };
    run();
  }, [text, onScrambleEnd, onHover, autoPlay, externalTrigger]);

  useEffect(() => {
    if (autoPlay && !hasPlayedOnce.current) {
      hasPlayedOnce.current = true;
      onScrambleStart?.();
      scramble();
    }
  }, [autoPlay, scramble, onScrambleStart]);

  useEffect(() => {
    if (externalTrigger && !prevExternalTrigger.current) {
      onScrambleStart?.();
      scramble();
    }
    prevExternalTrigger.current = externalTrigger;
  }, [externalTrigger, scramble, onScrambleStart]);

  const handleEnter = () => {
    if (!onHover) return;
    isHovering.current = true;
    onScrambleStart?.();
    scramble();
  };

  const handleLeave = () => {
    if (!onHover) return;
    isHovering.current = false;
    if (scrambleTimer.current) clearTimeout(scrambleTimer.current);
    setDisplayText(text);
    onScrambleEnd?.();
  };

  return (
    <div
      className={className}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {displayText}
    </div>
  );
};

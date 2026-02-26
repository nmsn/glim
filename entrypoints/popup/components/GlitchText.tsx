import React, { useState, useRef, useCallback, useEffect } from 'react';

const GLITCH_CHARS = '!@#$%^&*_+-=[]{}|;:<>?/~';

interface GlitchTextProps {
  text: string;
  className?: string;
  onHover?: boolean;
  autoPlay?: boolean;
  externalTrigger?: boolean;
  onGlitchStart?: () => void;
  onGlitchEnd?: () => void;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  className = '',
  onHover = true,
  autoPlay = false,
  externalTrigger = false,
  onGlitchStart,
  onGlitchEnd
}) => {
  const [displayText, setDisplayText] = useState(text);
  const isHovering = useRef(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPlayedOnce = useRef(false);
  const prevExternalTrigger = useRef(false);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const scramble = useCallback(() => {
    let tick = 0;
    const maxTicks = text.length;
    const run = () => {
      if (((!onHover || !isHovering.current) && !autoPlay && !externalTrigger) || tick >= maxTicks) {
        setDisplayText(text);
        onGlitchEnd?.();
        return;
      }
      tick++;
      setDisplayText(
        text.split('').map((ch, i) =>
          i < tick ? ch : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        ).join('')
      );
      glitchTimer.current = setTimeout(run, 40);
    };
    run();
  }, [text, onGlitchEnd, onHover, autoPlay, externalTrigger]);

  useEffect(() => {
    if (autoPlay && !hasPlayedOnce.current) {
      hasPlayedOnce.current = true;
      onGlitchStart?.();
      scramble();
    }
  }, [autoPlay, scramble, onGlitchStart]);

  useEffect(() => {
    if (externalTrigger && !prevExternalTrigger.current) {
      onGlitchStart?.();
      scramble();
    }
    prevExternalTrigger.current = externalTrigger;
  }, [externalTrigger, scramble, onGlitchStart]);

  const handleEnter = () => {
    if (!onHover) return;
    isHovering.current = true;
    onGlitchStart?.();
    scramble();
  };

  const handleLeave = () => {
    if (!onHover) return;
    isHovering.current = false;
    if (glitchTimer.current) clearTimeout(glitchTimer.current);
    setDisplayText(text);
    onGlitchEnd?.();
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

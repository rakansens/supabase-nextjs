"use client";

import React, { useEffect, useState } from 'react';

interface TypingAnimationProps {
  text: string;
  onComplete?: () => void;
  speed?: number;
}

export function TypingAnimation({ text, onComplete, speed = 30 }: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
        timeoutId = setTimeout(typeNextChar, speed);
      } else if (onComplete) {
        onComplete();
      }
    };

    timeoutId = setTimeout(typeNextChar, speed);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, speed, onComplete]);

  return (
    <div className="whitespace-pre-wrap font-mono">
      {displayText}
      {displayText.length < text.length && (
        <span className="animate-pulse">▊</span>
      )}
    </div>
  );
}
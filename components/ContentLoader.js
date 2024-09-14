import React, { useEffect, useRef, useMemo } from 'react';

const sizeMap = {
  sm: { className: "w-4 h-4", strokeWidth: 2 },
  md: { className: "w-8 h-8", strokeWidth: 3 },
  lg: { className: "w-12 h-12", strokeWidth: 4 },
  xl: { className: "w-16 h-16", strokeWidth: 5 },
};

const ContentLoader = ({ size = 'md', duration = 5000, onComplete, className = '' }) => {
  const circleRef = useRef(null);
  const spinnerRef = useRef(null);
  const { className: sizeClassName, strokeWidth } = useMemo(() => sizeMap[size] || sizeMap.md, [size]);

  useEffect(() => {
    const startColor = Math.floor(Math.random() * 256);
    const reverse = Math.random() < 0.5;
    const spread = 10;
    let index = 0;
    const speed = 1;
    let start;
    let animationFrame;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      // Renk güncellemesi
      if (circleRef.current) {
        const hue = reverse
          ? 255 - (((index / spread) + startColor) % 255)
          : ((index / spread) + startColor) % 255;
        circleRef.current.style.stroke = `hsl(${hue}, 100%, 50%)`;
        index += speed;
      }

      // Dönme animasyonu
      if (spinnerRef.current) {
        const rotation = (progress / 1000) * 360; // 1 saniyede 360 derece dön
        spinnerRef.current.style.transform = `rotate(${rotation}deg)`;
      }

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration, onComplete]);

  return (
    <div className={`${className}`}>
      <svg 
        className={sizeClassName}
        viewBox="0 0 50 50"
        ref={spinnerRef}
      >
        <circle
          ref={circleRef}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="80, 200"
        />
      </svg>
    </div>
  );
};

export default React.memo(ContentLoader);
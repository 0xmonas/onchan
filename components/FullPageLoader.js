import React, { useEffect, useRef } from 'react';

const FullPageLoader = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    let startColor = Math.floor(Math.random() * 256);
    let reverse = Math.random() < 0.5;
    let spread = 10;
    let index = 0;
    let speed = 1;

    const updateColor = () => {
      if (!svgRef.current) return;
      
      const paths = svgRef.current.querySelectorAll('.logo-main');
      paths.forEach((path, i) => {
        const color = i * 50;
        const hue = reverse
          ? 255 - (((color / spread) + startColor + index) % 255)
          : (((color / spread) + startColor) + index) % 255;
        path.setAttribute('fill', `hsl(${hue}, 100%, 50%)`);
      });

      index += speed;
      requestAnimationFrame(updateColor);
    };

    updateColor();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background bg-opacity-75">
      <div className="relative w-24 h-24">
        <svg
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-full h-full"
        >
          <path className="logo-main" d="m8.4,14.4c-3.3,0 -6,-1.1 -6,-2.4s2.7,-2.4 6,-2.4s6,1.1 6,2.4c0,-4 -3.3,-7.2 -7.2,-7.2s-7.2,3.3 -7.2,7.2s3.3,7.2 7.2,7.2s7.2,-3.3 7.2,-7.2c0,1.3 -2.7,2.4 -6,2.4z" />
          <path className="logo-main" d="m14.4,12c0,4 2.2,7.2 4.8,7.2s3.9,-2.1 4.5,-4.9c-0.6,0 -1.4,0.1 -2.2,0.1c-4,0 -7.1,-1.1 -7.1,-2.4z" />
          <path className="logo-main" d="m21.5,9.6c0.7,0 1.4,0 2.2,0.1c-0.6,-2.9 -2.4,-4.9 -4.5,-4.9s-4.8,3.2 -4.8,7.2c0,-1.3 3.1,-2.4 7.1,-2.4z" />
        </svg>
      </div>
    </div>
  );
};

export default FullPageLoader;
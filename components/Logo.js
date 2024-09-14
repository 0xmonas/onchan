// components/Logo.js
import React from 'react';

const Logo = ({ className, isDarkMode }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <style>
        {`
          .logo-main { fill: ${isDarkMode ? 'currentColor' : '#0031ff'}; stroke: none; }
          .logo-circle { fill: ${isDarkMode ? 'black' : 'white'}; stroke: none; }
          svg:hover .logo-circle { fill: ${isDarkMode ? 'white' : 'black'}; }
        `}
      </style>
      <path className="logo-main" d="m8.4,14.4c-3.3,0 -6,-1.1 -6,-2.4s2.7,-2.4 6,-2.4s6,1.1 6,2.4c0,-4 -3.3,-7.2 -7.2,-7.2s-7.2,3.3 -7.2,7.2s3.3,7.2 7.2,7.2s7.2,-3.3 7.2,-7.2c0,1.3 -2.7,2.4 -6,2.4z" />
      <circle className="logo-circle" r="2.4" cy="12" cx="8.4" />
      <path className="logo-main" d="m14.4,12c0,4 2.2,7.2 4.8,7.2s3.9,-2.1 4.5,-4.9c-0.6,0 -1.4,0.1 -2.2,0.1c-4,0 -7.1,-1.1 -7.1,-2.4z" />
      <path className="logo-main" d="m21.5,9.6c0.7,0 1.4,0 2.2,0.1c-0.6,-2.9 -2.4,-4.9 -4.5,-4.9s-4.8,3.2 -4.8,7.2c0,-1.3 3.1,-2.4 7.1,-2.4z" />
      <circle className="logo-circle" r="2.4" cy="12" cx="21.5"/>
    </svg>
  );

export default Logo;
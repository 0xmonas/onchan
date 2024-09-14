import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { generateColorFromAddress } from '@/lib/utils';

export default function UserAvatar({ user, size = 'default' }) {
  const backgroundColor = generateColorFromAddress(user.address, true);
  const avatarColor = generateColorFromAddress(user.address, false);

  const avatarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" shape-rendering="crispEdges">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${backgroundColor}" />
          <stop offset="100%" stop-color="${avatarColor}" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#avatarGradient)"/>
      <g fill="${avatarColor}">
        <rect x="50" y="50" width="20" height="10"/>
        <rect x="80" y="50" width="20" height="10"/>
        <rect x="40" y="60" width="70" height="10"/>
        <rect x="30" y="70" width="20" height="10"/>
        <rect x="100" y="70" width="10" height="10"/>
        <rect x="30" y="80" width="70" height="10"/>
        <rect x="20" y="90" width="30" height="10"/>
        <rect x="20" y="100" width="70" height="10"/>
      </g>
      <rect x="50" y="70" width="10" height="10" fill="#fff"/>
      <rect x="70" y="70" width="10" height="10" fill="#fff"/>
      <rect x="80" y="70" width="10" height="10" fill="#fff"/>
      <rect x="60" y="70" width="10" height="10" fill="#000"/>
      <rect x="90" y="70" width="10" height="10" fill="#000"/>
      <rect x="50" y="90" width="50" height="10" fill="#b71c1c"/>
      <rect x="20" y="110" width="70" height="10" fill="#3150fe"/>
    </svg>
  `;

  const sizeClasses = {
    small: 'w-8 h-8 rounded-full',
    default: 'w-12 h-12 sm:w-16 sm:h-16 rounded-xl',
    large: 'h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-xl',
  };

  const avatarSize = sizeClasses[size] || sizeClasses.default;

  return (
    <Avatar className={`${avatarSize} transition-transform duration-300 ease-in-out hover:scale-105 overflow-hidden`}>
      <AvatarImage 
        src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`} 
        alt={`${user.username}'s avatar`} 
      />
      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
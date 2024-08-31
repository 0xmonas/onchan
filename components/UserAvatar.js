import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { generateColorFromAddress } from '@/lib/utils';

export default function UserAvatar({ user, size = 'default' }) {
  const backgroundColor = generateColorFromAddress(user.address, true);
  const avatarColor = generateColorFromAddress(user.address, false);

  const avatarSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" shape-rendering="crispEdges">
      <rect width="120" height="120" fill="${backgroundColor}"/>
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
    small: 'w-8 h-8',
    default: 'w-12 h-12 sm:w-16 sm:h-16',
    large: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const avatarSize = sizeClasses[size] || sizeClasses.default;

  return (
    <Avatar className={`${avatarSize} border rounded-full overflow-hidden`}>
      <AvatarImage 
        src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`} 
        alt={`${user.username}'s avatar`} 
        width={80}
        height={80}
      />
      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
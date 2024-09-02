import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {ExternalLink, Clock, BookOpen, Users, UserPlus } from "lucide-react";
import Link from 'next/link';
import { generateColorFromAddress } from '@/lib/utils';
import CustomCheckIcon from './CustomCheckIcon';


const UserCard = memo(function UserCard({ user, isCurrentUser, isFollowing, onFollowToggle, isDarkMode }) {
  const etherscanUrl = `https://etherscan.io/address/${user.address}`;
  const backgroundColor = generateColorFromAddress(user.address, true);
  const avatarColor = generateColorFromAddress(user.address, false);

  const getLevelBadge = (level) => {
    const variants = {
      "0": "bg-gradient-to-r from-gray-400 to-gray-600 text-white",
      "1": "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
      "2": "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
    };
    const labels = { "0": "newbie", "1": "anon", "2": "based" };
    
    if (level === -1) return null;
    
    return <Badge className={`${variants[level]} font-semibold px-2 py-0.5 text-xs rounded-full`}>{labels[level]}</Badge>;
  };

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

  const buttonClasses = `px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-colors duration-200 font-semibold text-xs sm:text-sm ${
    isDarkMode 
      ? "bg-secondary text-secondary-foreground hover:bg-gray-700" 
      : "bg-primary text-primary-foreground hover:bg-gray-200"
  }`;

  return (
    <Card className={`w-full max-w-2xl ${isDarkMode ? "bg-black" : "bg-white"} rounded-md shadow-sm`}>
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
          <Avatar className="h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-xl transition-transform duration-300 ease-in-out hover:scale-105">
            <AvatarImage 
              src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`} 
              alt={`${user.username}'s avatar`} 
            />
            <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2 sm:space-y-3 text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 mb-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>{user.username}</h2>
                    <CustomCheckIcon  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  {!isCurrentUser && (
                    <button 
                      className={`${buttonClasses} sm:hidden ml-2`}
                      onClick={onFollowToggle}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
  {user.level !== -1 && getLevelBadge(user.level)}
  <Link href={etherscanUrl} target="_blank" rel="noopener noreferrer" className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"} transition-colors`}>
    {user.address.slice(0, 6)}...{user.address.slice(-4)}
    <ExternalLink className="inline-block ml-1 h-3 w-3" />
  </Link>
</div>
              </div>
              {!isCurrentUser && (
                <button 
                  className={`${buttonClasses} hidden sm:inline-flex sm:self-start sm:mt-0.5 sm:py-2 sm:px-4`}
                  onClick={onFollowToggle}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
            <p className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{user.bio}</p>
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              {[
                { icon: Clock, label: `Joined ${new Date(Number(user.registrationTimestamp) * 1000).toLocaleDateString()}` },
                { icon: BookOpen, label: `${user.entryCount} Entries` },
                { icon: UserPlus, label: `${user.followingCount} Following` },
                { icon: Users, label: `${user.followersCount} Followers` },
              ].map((item, index) => (
                <div key={index} className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

export default UserCard;
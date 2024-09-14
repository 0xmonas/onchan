import React, { memo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLinkIcon, Pencil1Icon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import Link from 'next/link';
import CustomCheckIcon from './CustomCheckIcon';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import UserAvatar from './UserAvatar';

const UserCard = memo(function UserCard({ user, isCurrentUser, isFollowing, onFollowToggle, onEditProfile, isDarkMode }) {
  const etherscanUrl = `https://etherscan.io/address/${user.address}`;

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

  const buttonClasses = `px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-colors duration-200 font-semibold text-xs sm:text-sm ${
    isDarkMode 
      ? "bg-white text-black hover:bg-gray-200" 
      : "bg-primary text-primary-foreground hover:bg-gray-200"
  }`;

  return (
    <Card className={`w-full max-w-2xl ${isDarkMode ? "bg-black" : "bg-white"} rounded-md shadow-sm`}>
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
          <UserAvatar user={user} size="large" />
          <div className="flex-1 space-y-2 sm:space-y-3 text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 mb-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>{user.username}</h2>
                    <CustomCheckIcon  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {user.level !== -1 && getLevelBadge(user.level)}
                  <Link href={etherscanUrl} target="_blank" rel="noopener noreferrer" className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"} transition-colors`}>
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    <ExternalLinkIcon className="inline-block ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {!isCurrentUser && (
                  <Button 
                    className={`${buttonClasses} sm:py-2 sm:px-4`}
                    onClick={onFollowToggle}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
                {isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`p-0 h-auto font-normal ${isDarkMode ? "text-gray-400" : "text-[#0031ff]"} hover:bg-transparent flex items-center`}
                      >
                        <DotsHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
                      <DropdownMenuItem onClick={onEditProfile} className="flex items-center space-x-2 px-4 py-2 hover:bg-opacity-80">
                        <Pencil1Icon className="w-4 h-4 mt-[1px]" />
                        <span className="text-xs sm:text-sm leading-none">Edit Profile</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <p className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{user.bio}</p>
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              {[
                { label: `Joined ${new Date(Number(user.registrationTimestamp) * 1000).toLocaleDateString()}` },
                { label: `${user.entryCount} Entries` },
                { label: `${user.followingCount} Following` },
                { label: `${user.followersCount} Followers` },
              ].map((item, index) => (
                <div key={index} className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
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
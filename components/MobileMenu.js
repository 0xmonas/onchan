// components/MobileMenu.js
import React from 'react';
import Link from 'next/link';
import { SunIcon, MoonIcon, BellIcon, PersonIcon, RocketIcon } from "@radix-ui/react-icons";
import ConnectWalletButton from './ConnectWalletButton';
import { useHeaderLogic } from '../hooks/useHeaderLogic';

export default function MobileMenu({ isOpen, onClose }) {
  const {
    isDarkMode,
    toggleDarkMode,
    isConnected,
    currentUser,
    account
  } = useHeaderLogic();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 md:hidden z-50">
      <div className={`${isDarkMode ? "bg-black" : "bg-white"} border-t border-border`}>
        <div className="p-6 space-y-6">
          <button
            onClick={() => {
              toggleDarkMode();
              onClose();
            }}
            className="w-full text-left p-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            {isDarkMode ? <SunIcon className="w-7 h-7 mr-3" /> : <MoonIcon className="w-7 h-7 mr-3" />}
            <span className="text-xl">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <Link 
            href="/"
            onClick={onClose}
            className="block w-full text-left p-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xl flex items-center"
          >
            <RocketIcon className="w-7 h-7 mr-3" /> <span className="text-xl">Today</span>
          </Link>
          <button
            onClick={onClose}
            className="w-full text-left p-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
            aria-label="Notifications"
          >
            <BellIcon className="w-7 h-7 mr-3" /> <span className="text-xl">Notifications</span>
          </button>
          {isConnected && (
            <Link 
              href={currentUser?.username ? `/profile/${currentUser.username}` : `/profile/${account}`}
              onClick={onClose}
              className="block w-full text-left p-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
            >
              <PersonIcon className="w-7 h-7 mr-3" /> <span className="text-xl">Profile</span>
            </Link>
          )}
          <div className="pt-6">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </div>
  );
}
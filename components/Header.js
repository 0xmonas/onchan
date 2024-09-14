import React, { useState, useContext } from 'react';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { useDarkMode } from '../contexts/DarkModeContext';
import { UserContext } from '../contexts/UserContext';
import SearchBar from './SearchBar';
import { MagnifyingGlassIcon, HamburgerMenuIcon, SunIcon, MoonIcon, BellIcon, PersonIcon } from "@radix-ui/react-icons";
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import Link from 'next/link';
import ConnectWalletButton from './ConnectWalletButton';

export default function Header({ isMobile, className, onMenuToggle }) {
  const { user, authenticated } = usePrivyWeb3();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { currentUser } = useContext(UserContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const account = user?.wallet?.address;
  const isConnected = authenticated;

  const handleSearch = (query) => {
    console.log("Search query:", query);
    // Implement search functionality here
  };

  const handleMenuToggle = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    onMenuToggle(newMenuState);
  };
  
  return (
    <header className={`relative border-b border-border transition-all sticky top-0 z-50 duration-300 ${className}`}>
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-[75px] relative">
        <div className="flex items-center space-x-4 w-1/4">
          <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Logo className="w-10 h-10" isDarkMode={isDarkMode} />
          </Link>
        </div>
        <div className="flex justify-center w-1/2 relative">
          <div className="w-full max-w-xl">
            <SearchBar 
              onSearch={handleSearch} 
              isMobile={isMobile}
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              className="h-full"
              inputClassName="h-10 text-sm"
              placeholder="Search @users, titles, #entries"
            />
          </div>
        </div>
        {!isMobile ? (
          <div className="flex items-center justify-end space-x-3 sm:space-x-4 w-1/4 relative">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            
            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="w-6 h-6" />
            </button>
            
            {isConnected && (
              <Link 
                href={currentUser?.username ? `/profile/${currentUser.username}` : `/profile/${account}`}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="View profile"
              >
                <PersonIcon  className="w-6 h-6" />
              </Link>
            )}
            
            <ConnectWalletButton />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle search"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>

            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              <HamburgerMenuIcon className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {isMobile && (
        <MobileMenu 
          isOpen={isMenuOpen}
          onClose={handleMenuToggle}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isConnected={isConnected}
          currentUser={currentUser}
          account={account}
        />
      )}
    </header>
  );
}
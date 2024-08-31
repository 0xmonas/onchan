import Link from 'next/link';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import ConnectWalletButton from './ConnectWalletButton';
import SearchBar from './SearchBar';
import { Search, User, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { user, authenticated } = usePrivyWeb3();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { currentUser } = useContext(UserContext);
  const [blurAmount, setBlurAmount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const account = user?.wallet?.address;
  const isConnected = authenticated;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScroll = 200;
      const newBlurAmount = Math.min(8, (scrollPosition / maxScroll) * 8);
      setBlurAmount(newBlurAmount);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`${isDarkMode ? "bg-black/80" : "bg-card/80"} text-card-foreground border-b border-border sticky top-0 z-10 transition-all duration-300 backdrop-blur-[8px]`}
      style={{ 
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`
      }}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
        <Link href="/" className="flex items-center">
          <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 29.5" className="h-8 w-auto sm:h-10">
              <path d="M7.5,14.7h0C3.4,14.7.2,17.9.2,22v6.2c0,.6.5,1.1,1.1,1.1h1.5c.6,0,1.1-.5,1.1-1.1v-6.2c0-2,1.6-3.6,3.6-3.6h0c2,0,3.6,1.6,3.6,3.6v6.2c0,.6.5,1.1,1.1,1.1h1.5c.6,0,1.1-.5,1.1-1.1v-6.2c0-4-3.3-7.3-7.3-7.3Z" fill="currentColor"/>
              <path d="M17.1,22.2h0c0,4,3.3,7.3,7.3,7.3h6.2c.6,0,1.1-.5,1.1-1.1v-1.5c0-.6-.5-1.1-1.1-1.1h-6.2c-2,0-3.6-1.6-3.6-3.6h0c0-2,1.6-3.6,3.6-3.6h6.2c.6,0,1.1-.5,1.1-1.1v-1.5c0-.6-.5-1.1-1.1-1.1h-6.2c-4,0-7.3,3.3-7.3,7.3Z" fill="currentColor"/>
              <path d="M73.5,14.7h0c-4,0-7.3,3.3-7.3,7.3v6.2c0,.6.5,1.1,1.1,1.1h1.5c.6,0,1.1-.5,1.1-1.1v-6.2c0-2,1.6-3.6,3.6-3.6h0c2,0,3.6,1.6,3.6,3.6v6.2c0,.6.5,1.1,1.1,1.1h1.5c.6,0,1.1-.5,1.1-1.1v-6.2c0-4-3.3-7.3-7.3-7.3Z" fill="currentColor"/>
              <path d="M40.9,14.7h0c-4,0-7.3,3.3-7.3,7.3v6.2c0,.6.5,1.1,1.1,1.1h1.5c.6,0,1.1-.5,1.1-1.1v-6.2c0-2,1.6-3.6,3.6-3.6h0c2,0,3.6,1.6,3.6,3.6v6.2c0,.6.5,1.1,1.1,1.1h1.5c.6,0,1.1-.5,1.1-1.1v-6.2c0-4-3.3-7.3-7.3-7.3Z" fill="currentColor"/>
              <path d="M7.5,0C3.4,0,.1,3.3.1,7.3s3.3,7.3,7.3,7.3,7.3-3.3,7.3-7.3S11.5,0,7.5,0ZM7.5,10.9c-2,0-3.6-1.6-3.6-3.6s1.6-3.6,3.6-3.6,3.6,1.6,3.6,3.6-1.6,3.6-3.6,3.6Z" fill="currentColor"/>
              <path d="M62.2,16.4c1.2,1,1.8,2.6,1.8,4.7v7.1c0,.5-.4,1-1,1h-1.9c-.5,0-1-.4-1-1v-.8c-.8,1.3-2.2,2-4.3,2s-2-.2-2.8-.6c-.8-.4-1.4-.9-1.8-1.5-.4-.7-.6-1.4-.6-2.2,0-1.3.5-2.4,1.5-3.1,1-.8,2.5-1.1,4.6-1.1h2.2c.9,0,1.3-1.1.7-1.7l-.4-.3c-.5-.5-1.4-.7-2.5-.7s-1.5.1-2.2.4c-.4.1-.7.3-1,.4-.5.3-1.1,0-1.3-.4l-.5-1c-.3-.6-.1-1.2.4-1.5s1.2-.6,1.9-.7c1.1-.3,2.2-.4,3.3-.4,2.2,0,3.9.5,5.1,1.6ZM58.7,26.2c.5-.3.8-.7,1.1-1.2s0-.3,0-.5h0c0-.7-.5-1.2-1.2-1.2h-1.6c-1.7,0-2.5.6-2.5,1.7s.2.9.6,1.3c.4.3,1,.5,1.7.5s1.3-.2,1.9-.5Z" fill="currentColor"/>
              <rect x="33.6" y="8.5" width="3.7" height="20.8" rx="1" ry="1" fill="currentColor"/>
              </svg>
        </Link>
        
        <div className="hidden md:flex flex-grow mx-8">
          <SearchBar />
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-5">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle search"
          >
            <Search size={24} />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="24" height="24">
                    <path className="cls-1" d="M10,1.7v1.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7px"/>
                    <path className="cls-1" d="M10,16.7v1.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7px"/>
                    <path className="cls-1" d="M4.1,4.1l1.2,1.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7px"/>
                    <path className="cls-1" d="M14.7,14.7l1.2,1.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7px"/>
                    <path className="cls-1" d="M1.7,10h1.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7px"/>
                    <path className="cls-1" d="M16.7,10h1.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7px"/>
                    <path className="cls-1" d="M5.3,14.7l-1.2,1.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7px"/>
                    <path className="cls-1" d="M15.9,4.1l-1.2,1.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.7px"/>
                    <path d="M10,5c-2.7,0-5,2.2-5,5s2.2,5,5,5,5-2.2,5-5-2.2-5-5-5ZM10,12.4c-1.3,0-2.4-1.1-2.4-2.4s1.1-2.4,2.4-2.4,2.4,1.1,2.4,2.4-1.1,2.4-2.4,2.4Z" fill="currentColor"/>
                    </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="24" height="24">
                  <path d="M10,1.7c-2.3,2.3-2.3,6,0,8.3,2.3,2.3,6,2.3,8.3,0,0,4.6-3.7,8.3-8.3,8.3S1.7,14.6,1.7,10,5.4,1.7,10,1.7Z" fill="currentColor"/>
                  </svg>
            )}
          </button>
          
          {isConnected && currentUser && (
            <Link 
              href={`/profile/${currentUser.username || account}`} 
              className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="View profile"
            >
              <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M12,12.5h0c-2.7,0-5,2.2-5,5v4.2c0,.4.3.8.8.8h1c.4,0,.8-.3.8-.8v-4.2c0-1.4,1.1-2.5,2.5-2.5h0c1.4,0,2.5,1.1,2.5,2.5v4.2c0,.4.3.8.8.8h1c.4,0,.8-.3.8-.8v-4.2c0-2.7-2.2-5-5-5Z" fill="currentColor"/>
                <path d="M12,2.5c-2.7,0-5,2.2-5,5s2.2,5,5,5,5-2.2,5-5-2.2-5-5-5ZM12,9.9c-1.3,0-2.4-1.1-2.4-2.4s1.1-2.4,2.4-2.4,2.4,1.1,2.4,2.4-1.1,2.4-2.4,2.4Z" fill="currentColor"/>
              </svg>
            </Link>
          )}
          
          <ConnectWalletButton />
        </div>
      </div>
      {isSearchOpen && (
        <div className="md:hidden px-4 py-3">
          <SearchBar />
        </div>
      )}
    </header>
  );
}
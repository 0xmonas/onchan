import Link from 'next/link';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import ConnectWalletButton from './ConnectWalletButton';
import SearchBar from './SearchBar';
import { Search } from 'lucide-react';

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
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center group">
          <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.3 20" className="h-8 w-auto sm:h-10 md:h-6 lg:h-6" >
  <style>
                {`
                  .logo-main { fill: ${isDarkMode ? 'currentColor' : '#0031ff'}; }
                  .logo-circle { fill: ${isDarkMode ? 'black' : 'white'}; }
                  .group:hover .logo-circle { fill: ${isDarkMode ? 'currentColor' : 'black'}; }
                `}
              </style>
<path className="logo-main" d="M11.7,13.3c-4.6,0-8.3-1.5-8.3-3.3s3.7-3.3,8.3-3.3,8.3,1.5,8.3,3.3C20,4.5,15.5,0,10,0S0,4.5,0,10s4.5,10,10,10,10-4.5,10-10c0,1.8-3.7,3.3-8.3,3.3h0Z"/>
<circle className="logo-circle" cx="11.7" cy="10" r="3.3"/>
<path className="logo-main" d="M20,10c0,5.5,3,10,6.6,10s5.4-2.9,6.3-6.8c-.9,0-1.9.2-3,.2-5.5,0-9.9-1.5-9.9-3.3h0Z"/>
<path className="logo-main" d="M29.9,6.7c1,0,2,0,3,.2-.9-4-3.4-6.8-6.3-6.8s-6.6,4.5-6.6,10c0-1.8,4.4-3.3,9.9-3.3h0Z"/>
<circle className="logo-circle" cx="29.9" cy="10" r="3.3"/>
</svg>
          </Link>
        </div>
        
        <div className="hidden md:flex flex-grow mx-8">
          <SearchBar />
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle search"
          >
            <Search className="w-6 h-6" />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-6 h-6">
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-6 h-6">
                <path d="M10,1.7c-2.3,2.3-2.3,6,0,8.3,2.3,2.3,6,2.3,8.3,0,0,4.6-3.7,8.3-8.3,8.3S1.7,14.6,1.7,10,5.4,1.7,10,1.7Z" fill="currentColor"/>
              </svg>
            )}
          </button>
          
          {isConnected && (
            <Link 
              href={currentUser?.username ? `/profile/${currentUser.username}` : `/profile/${account}`}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="View profile"
            >
<svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="w-6 h-6" ><path d="M9.9,10h0c-2.7,0-5,2.2-5,5v4.2c0,.4.3.8.8.8h1c.4,0,.8-.3.8-.8v-4.2c0-1.4,1.1-2.5,2.5-2.5h0c1.4,0,2.5,1.1,2.5,2.5v4.2c0,.4.3.8.8.8h1c.4,0,.8-.3.8-.8v-4.2c0-2.7-2.2-5-5-5h-.2Z"fill="currentColor"></path><path d="M9.9,0c-2.7,0-5,2.2-5,5s2.2,5,5,5,5-2.2,5-5S12.7,0,9.9,0ZM9.9,7.4c-1.3,0-2.4-1.1-2.4-2.4s1.1-2.4,2.4-2.4,2.4,1.1,2.4,2.4-1.1,2.4-2.4,2.4Z"fill="currentColor"></path></svg>
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
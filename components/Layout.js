import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLoading } from '../contexts/LoadingContext';
import { cn } from '../lib/utils';
import FullPageLoader from './FullPageLoader';

export default function Layout({ children, fontHeading, fontBody }) {
  const { isDarkMode } = useDarkMode();
  const { isLoading } = useLoading();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const headerBackgroundClass = isDarkMode ? 'bg-black' : 'bg-card';
  const footerBackgroundClass = isDarkMode ? 'bg-black' : 'bg-card';
  const mainBackgroundClass = isDarkMode
    ? 'bg-black text-white'
    : 'bg-gray-100 text-gray-800';

  return (
    <>
      {isLoading && <FullPageLoader />}
      <div
        className={cn(
          'min-h-screen flex flex-col',
          isDarkMode ? 'bg-black' : 'bg-gray-100',
          fontHeading.variable,
          fontBody.variable
        )}
      >
        <Header
          isMobile={isMobile}
          className={headerBackgroundClass}
          onMenuToggle={setIsMenuOpen}
        />
        <div className={cn('flex-grow flex flex-col', mainBackgroundClass)}>
          <div className="flex-grow flex flex-col md:flex-row w-full max-w-[1280px] mx-auto py-2 sm:py-3 px-4 sm:px-6">
            {/* Trending */}
            {!isMobile && (
              <div className="md:w-1/4 lg:w-1/5 mb-2 sm:mb-3 md:mb-0 flex-shrink-0">
                <Sidebar position="left" className="w-full" />
              </div>
            )}
            {/* Main */}
            <main
              className={cn(
                'w-full md:flex-grow md:px-4 xl:px-6',
                'antialiased'
              )}
            >
              {children}
            </main>
            {/* Ads */}
            {!isMobile && (
              <div className="md:w-1/4 lg:w-1/5 mt-2 sm:mt-3 md:mt-0 flex-shrink-0">
                <Sidebar position="right" className="w-full" />
              </div>
            )}
          </div>
        </div>
        {(!isMobile || !isMenuOpen) && (
          <Footer className={footerBackgroundClass} />
        )}
      </div>
    </>
  );
}
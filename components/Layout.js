import React, { useState, useEffect, useRef } from 'react';
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useDarkMode } from '../contexts/DarkModeContext'
import { cn } from '../lib/utils'

export default function Layout({ children, fontHeading, fontBody }) {
  const { isDarkMode } = useDarkMode()
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Adjust this breakpoint as needed
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left
        setShowRightSidebar(true);
        setShowLeftSidebar(false);
      } else {
        // Swipe right
        setShowLeftSidebar(true);
        setShowRightSidebar(false);
      }
    }

    touchStartX.current = null;
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-black text-white" : "bg-gray-100 text-gray-800"} ${isDarkMode ? "dark" : ""}`}>
      <Header />
      <div className="flex-grow container mx-auto flex flex-col lg:flex-row py-2 sm:py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row w-full pt-2 sm:pt-3 relative">
          {/* Left Sidebar */}
          <div 
            className={`lg:w-1/4 absolute lg:relative left-0 top-0 h-full transition-transform duration-300 ease-in-out ${
              isMobile ? (showLeftSidebar ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
            } lg:translate-x-0 z-10`}
          >
            <Sidebar position="left" className="w-full mb-2 sm:mb-3 lg:mb-0" />
          </div>

          {/* Main Content */}
          <main 
            ref={mainContentRef}
            className={cn(
              'w-full lg:w-2/4 lg:px-4 xl:px-6',
              'antialiased',
              fontHeading.variable,
              fontBody.variable
            )}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          >
            {children}
          </main>

          {/* Right Sidebar */}
          <div 
            className={`lg:w-1/4 absolute lg:relative right-0 top-0 h-full transition-transform duration-300 ease-in-out ${
              isMobile ? (showRightSidebar ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'
            } lg:translate-x-0 z-10`}
          >
            <Sidebar position="right" className="w-full mt-2 sm:mt-3 lg:mt-0" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
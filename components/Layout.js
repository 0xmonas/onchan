import React, { useState, useEffect } from 'react';
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useDarkMode } from '../contexts/DarkModeContext'
import { cn } from '../lib/utils'

export default function Layout({ children, fontHeading, fontBody }) {
  const { isDarkMode } = useDarkMode()
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px breakpoint for mobile
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-black text-white" : "bg-gray-100 text-gray-800"} ${isDarkMode ? "dark" : ""}`}>
      <Header />
      <div className="flex-grow container mx-auto flex flex-col md:flex-row py-2 sm:py-3 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row w-full pt-2 sm:pt-3 relative max-w-[1280px] mx-auto">
          {/* Left Sidebar */}
          {!isMobile && (
            <div className="md:w-64 mb-2 sm:mb-3 md:mb-0 flex-shrink-0">
              <Sidebar position="left" className="w-full" />
            </div>
          )}

          {/* Main Content */}
          <main 
            className={cn(
              'w-full md:flex-grow md:px-4 xl:px-6 max-w-[760px]',
              'antialiased',
              fontHeading.variable,
              fontBody.variable
            )}
          >
            {children}
          </main>

          {/* Right Sidebar */}
          {!isMobile && (
            <div className="md:w-64 mt-2 sm:mt-3 md:mt-0 flex-shrink-0">
              <Sidebar position="right" className="w-full" />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
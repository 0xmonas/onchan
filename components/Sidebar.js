import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPopularTitles } from '../services/titleService';
import { useDarkMode } from '../contexts/DarkModeContext';
import ContentLoader from './ContentLoader';

export default function Sidebar({ position, className }) {
  const [popularTitles, setPopularTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useDarkMode();
  
  const fetchPopularTitles = useCallback(async () => {
    try {
      const titles = await getPopularTitles();
      setPopularTitles(titles.filter(title => parseInt(title.entryCount) > 0));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching popular titles:', err);
      setError('Failed to load popular titles');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (position === 'left') {
      fetchPopularTitles();
      
      const intervalId = setInterval(fetchPopularTitles, 30000);

      return () => clearInterval(intervalId);
    }
  }, [position, fetchPopularTitles]);

  if (position === 'right') {
    const ads = [
      { src: '/nft.jpg', alt: 'NFT 1' },
      { src: '/nft1.gif', alt: 'NFT 2' },
      { src: '/nft2.png', alt: 'NFT 3' },
    ];
  
    return (
      <aside className={`${className} ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
        <div className="space-y-3 sm:space-y-4 px-4 sm:px-0 lg:pl-4 xl:pl-6 pt-4 sm:pt-6">
          {ads.map((ad, index) => (
            <div key={index} className={`${isDarkMode ? "bg-black border secondary" : "bg-white"} p-2 sm:p-4 rounded-md w-full sm:w-40 md:w-44 lg:w-48 h-40 sm:h-40 md:h-44 lg:h-48`}>
              <Image
                src={ad.src}
                alt={ad.alt}
                width={300}
                height={300}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${className} ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
       <div className="px-4 sm:px-0 lg:pr-4 xl:pr-6 pt-4 sm:pt-6"> 
        <h2 className={`font-bold text-base sm:text-lg mb-3 sm:mb-4 ${isDarkMode ? "text-[#0031ff]" : "text-[#0031ff]"}`}>trending</h2>
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <ContentLoader 
              size="md" 
              duration={5000} 
              onComplete={() => {
                if (popularTitles.length === 0) {
                  fetchPopularTitles();
                }
              }} 
            />
          </div>
        ) : error ? (
          <p className="text-sm sm:text-base text-red-500">{error}</p>
        ) : (
          <ul className="space-y-1 sm:space-y-2">
            {popularTitles
              .sort((a, b) => b.entryCount - a.entryCount)
              .map((title) => (
                <li key={title.id} className="flex justify-between text-sm sm:text-base">
                  <Link href={`/title/${title.id}`}>
                    <span className={isDarkMode ? "text-gray-300" : "text-gray-800"}>{title.name}</span>
                  </Link>
                  <span className="text-[#0031ff]">{title.entryCount}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </aside>
  );  
}
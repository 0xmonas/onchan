import { useEffect, useState } from 'react';
import { getRandomTitles, getTitleEntries } from '../services/titleService';
import Link from 'next/link';
import { useDarkMode } from '../contexts/DarkModeContext';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import EntryCard from '../components/EntryCard';
import { getUsernameByAddress } from '../services/entryService';
import { Button } from "@/components/ui/button";

export default function Home() {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useDarkMode();
  const { isConnected } = usePrivyWeb3();
  
  useEffect(() => {
    async function fetchTitles() {
      try {
        console.log('Fetching titles...');
        setLoading(true);
        const randomTitles = await getRandomTitles(5);  // 5 rastgele başlık al
        console.log('Random titles:', randomTitles);
        const titlesWithEntries = await Promise.all(
          randomTitles.map(async (title) => {
            const entries = await getTitleEntries(title.id, 1, 3);  // Her başlık için 3 entry al
            const entriesWithUsernames = await Promise.all(
              entries.map(async (entry) => {
                const authorUsername = await getUsernameByAddress(entry.author);
                return { ...entry, authorUsername };
              })
            );
            return {
              ...title,
              entries: entriesWithUsernames
            };
          })
        );
        console.log('Titles with entries:', titlesWithEntries);
        setTitles(titlesWithEntries);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching titles:", err);
        setError("Failed to load titles. Please try again later.");
        setLoading(false);
      }
    }
    fetchTitles();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-screen-lg">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h2 className={`font-bold text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>Today</h2>
          <Link href="/create-title">
            <Button
              variant="outline"
              className={`text-sm sm:text-base px-2 py-1 sm:px-4 sm:py-2 transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-white hover:bg-gray-500 text-[#0031ff]" 
                  : "bg-white hover:bg-gray-300 text-[#0031ff]"
              }`}
            >
              Create +
            </Button>
          </Link>
        </div>
        {titles.length > 0 ? (
          titles.map((title) => (
            <div key={title.id} className="space-y-2 sm:space-y-4">
              <Link href={`/title/${title.id}`}>
                <h3 className={`font-bold text-base sm:text-lg ${isDarkMode ? "text-[#0031ff]" : "text-gray-800"}`}>{title.name}</h3>
              </Link>
              <div className="space-y-2 sm:space-y-4">
                {title.entries.map((entry) => (
                  <EntryCard 
                    key={entry.id} 
                    entry={entry} 
                    type="home" 
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm sm:text-base">No titles available at the moment. Please check back later.</p>
        )}
        {!isConnected && (
          <p className={`mt-2 sm:mt-4 text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Connect your wallet to access full features
          </p>
        )}
      </div>
    </div>
  );
}
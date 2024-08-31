import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getEntry } from '../../services/entryService';
import EntryCard from '../../components/EntryCard';
import { useDarkMode } from '../../contexts/DarkModeContext';

export default function EntryPage() {
  const router = useRouter();
  const { entryId } = router.query;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    async function fetchEntry() {
      if (entryId) {
        try {
          const entryData = await getEntry(entryId);
          setEntry(entryData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching entry:', err);
          setError('Failed to load entry');
          setLoading(false);
        }
      }
    }
    fetchEntry();
  }, [entryId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;
  if (!entry) return <div className="p-4">Entry not found</div>;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-screen-md">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h1 className={`font-bold text-base sm:text-lg ${isDarkMode ? "text-[#0000ff]" : "text-gray-800"}`}>
            Entry #{entryId}
          </h1>
        </div>
        <div className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
          <EntryCard entry={entry} type="single" isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}
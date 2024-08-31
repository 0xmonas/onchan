import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { searchTitlesAndUsers } from '../services/searchService';
import TitleCard from '../components/TitleCard';
import UserCard from '../components/UserCard';
import Layout from '../components/Layout';

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState({ titles: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const performSearch = useCallback(async () => {
    if (q) {
      setIsLoading(true);
      try {
        const searchResults = await searchTitlesAndUsers(q, page);
        setResults(prevResults => ({
          titles: [...prevResults.titles, ...searchResults.titles],
          users: [...prevResults.users, ...searchResults.users],
        }));
        setHasMore(searchResults.users.length === 10 || searchResults.titles.length === 10);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [q, page]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 break-words">Search Results for &quot;{q}&quot;</h1>
        {isLoading && page === 1 ? (
          <p className="text-sm sm:text-base">Loading...</p>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {results.users.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Users</h2>
                <div className="space-y-3 sm:space-y-4">
                  {results.users.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </div>
            )}
            {results.titles.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Titles</h2>
                <div className="space-y-3 sm:space-y-4">
                  {results.titles.map(title => (
                    <TitleCard key={title.id} title={title} />
                  ))}
                </div>
              </div>
            )}
            {results.users.length === 0 && results.titles.length === 0 && (
              <p className="text-sm sm:text-base">No results found.</p>
            )}
            {hasMore && (
              <button 
                onClick={loadMore} 
                className="mt-4 px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded text-sm sm:text-base transition-colors duration-200 hover:bg-blue-600"
              >
                Load More
              </button>
            )}
            {isLoading && page > 1 && <p className="text-sm sm:text-base mt-4">Loading more...</p>}
          </div>
        )}
      </div>
    </Layout>
  );
}
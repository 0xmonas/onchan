import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useContext } from 'react';
import { getTitle, getTitleEntries, deleteTitle, changeTitleName } from '../../services/titleService';
import { addEntry, getUsernameByAddress } from '../../services/entryService';
import EntryCard from '../../components/EntryCard';
import AddEntryForm from '../../components/AddEntryForm';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { usePrivyWeb3 } from '../../contexts/PrivyWeb3Context';
import { UserContext } from '../../contexts/UserContext';
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function TitlePage() {
  const router = useRouter();
  const { titleIdOrName } = router.query;
  const [title, setTitle] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isContractOwner, setIsContractOwner] = useState(false);
  const { isDarkMode } = useDarkMode();
  const { user, authenticated, login, contract } = usePrivyWeb3();
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { currentUser } = useContext(UserContext);
  const isRegistered = currentUser && currentUser.username;

  const account = user?.wallet?.address;
  const isConnected = authenticated;

  const fetchData = useCallback(async () => {
    if (titleIdOrName) {  // Changed this condition
      try {
        setLoading(true);
        const titleData = await getTitle(titleIdOrName);
        
        if (titleData.id === '0') {
          setError('This title has been deleted.');
          setLoading(false);
          return;
        }
        
        setTitle(titleData);

        // Check contract owner only if contract is available
        if (contract) {
          const contractOwner = await contract.owner();
          setIsContractOwner(account && account.toLowerCase() === contractOwner.toLowerCase());
        }

        const entriesData = await getTitleEntries(titleData.id, page, 10);
  const entriesWithUsernames = await Promise.all(entriesData.filter(entry => !entry.isDeleted).map(async (entry) => {
    const authorUsername = await getUsernameByAddress(entry.author);
    return { ...entry, authorUsername };
  }));
  setEntries(entriesWithUsernames);
        setHasMore(entriesWithUsernames.length === 10);
        setTotalPages(Math.ceil(titleData.totalEntries / 10));
        setLoading(false);
        
        if (titleData.slug !== titleIdOrName) {
          router.replace(`/title/${titleData.slug}?page=${page}`, undefined, { shallow: true });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load title data. Please check your connection and try again.');
        setLoading(false);
      }
    }
  }, [titleIdOrName, account, page, router, contract]);

  useEffect(() => {
    if (titleIdOrName) {
      fetchData();
    }
  }, [fetchData, titleIdOrName]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    router.push(`/title/${title.slug}?page=${newPage}`, undefined, { shallow: true });
  };

  const handleAddEntry = useCallback(async (content) => {
    if (!isConnected) {
      alert('Please connect your wallet to add an entry.');
      await login();
      return;
    }
    try {
      const newEntry = await addEntry(title.id, content);
      const authorUsername = await getUsernameByAddress(newEntry.author);
      setEntries(prevEntries => [...prevEntries, { ...newEntry, authorUsername }]);
      
      fetchData();
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Failed to add entry. Please check your wallet connection and try again.');
    }
  }, [isConnected, title, login, fetchData]);

  const handleEntryUpdate = useCallback((updatedEntry) => {
    setEntries(prevEntries => 
      prevEntries.filter(entry => 
        entry.id !== updatedEntry.id || !updatedEntry.isDeleted
      ).map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    fetchData();
  }, [fetchData]);

  const handleDeleteTitle = async () => {
    if (!isContractOwner) {
      alert('Only the contract owner can delete this title.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this title? All entries will be deleted as well.')) {
      try {
        await deleteTitle(title.id);
        router.push('/');
      } catch (error) {
        console.error('Error deleting title:', error);
        alert('Failed to delete title. ' + error.message);
      }
    }
  };

  const handleChangeTitleName = async () => {
    if (!isContractOwner) {
      alert('Only the contract owner can change the title name.');
      return;
    }
    const newName = prompt('Enter new title name:');
    if (newName && newName !== title.name) {
      try {
        await changeTitleName(title.id, newName);
        setTitle({ ...title, name: newName });
      } catch (error) {
        console.error('Error changing title name:', error);
        alert('Failed to change title name. Please try again.');
      }
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;
  if (!title || title.id === '0') return <div className="p-4">Title not found or has been deleted</div>;

  return (
    <div className={`container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-screen-lg ${isDarkMode ? "text-gray-300 text-white" : "bg-gray-100 text-gray-800"}`}>
      <main className="space-y-4 sm:space-y-6">
        <h1 className={`font-bold text-base sm:text-lg ${isDarkMode ? "text-[#0031ff]" : "text-gray-800"}`}>{title?.name}</h1>
        {isContractOwner && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button 
              onClick={handleChangeTitleName} 
              className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded ${isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"}`}
            >
              Change Title Name
            </button>
            <button 
              onClick={handleDeleteTitle} 
              className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded ${isDarkMode ? "bg-red-600 text-white" : "bg-red-500 text-white"}`}
            >
              Delete Title
            </button>
          </div>
        )}
        <div className="space-y-4 sm:space-y-6">
          {entries.map((entry) => (
            <EntryCard 
              key={entry.id} 
              entry={entry} 
              type="title" 
              isDarkMode={isDarkMode}
              onEntryUpdate={handleEntryUpdate}
            />
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 sm:space-x-4 mt-4">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className={`p-1 sm:p-2 rounded ${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"} ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
              <span className="text-sm sm:text-base">{page} / {totalPages}</span>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className={`p-1 sm:p-2 rounded ${isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"} ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
              >
                <ChevronRightIcon className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </div>
          )}
          {isConnected && isRegistered ? (
            <AddEntryForm onSubmit={handleAddEntry} titleId={title?.id.toString()} />
          ) : (
            <p className={`mt-4 text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Connect your wallet to access full features
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
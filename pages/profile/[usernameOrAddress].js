import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useContext, useMemo } from 'react';
import EntryCard from '../../components/EntryCard';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { usePrivyWeb3 } from '../../contexts/PrivyWeb3Context';
import { UserContext } from '../../contexts/UserContext';
import UserCard from '../../components/UserCard';
import { BadgeCheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { getUserProfile, getUserEntries, followUser, unfollowUser, isFollowing as checkIsFollowing, getFollowingCount, getFollowersCount, getActiveEntryCount } from '../../services/userService';
import { getUsernameByAddress } from '../../services/entryService';
import RegisterPage from '../register';

export default function ProfilePage() {
  const router = useRouter();
  const { usernameOrAddress } = router.query;
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useDarkMode();
  const { user: currentUser, authenticated, login } = usePrivyWeb3();
  const { setCurrentUser } = useContext(UserContext);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const account = currentUser?.wallet?.address;
  const isConnected = authenticated;

  const checkIsCurrentUser = useCallback((userAddress) => {
    return isConnected && account && (account.toLowerCase() === userAddress.toLowerCase() || usernameOrAddress === currentUser?.username);
  }, [isConnected, account, usernameOrAddress, currentUser]);
  
  const fetchData = useCallback(async () => {
    if (usernameOrAddress) {
      try {
        setLoading(true);
        let userProfile;
        if (!usernameOrAddress || usernameOrAddress === 'me') {
          if (!currentUser) {
            setError('Please connect your wallet to view your profile');
            setLoading(false);
            return;
          }
          userProfile = await getUserProfile(currentUser.wallet.address);
        } else {
          userProfile = await getUserProfile(usernameOrAddress);
        }
        if (userProfile) {
          userProfile.level = calculateUserLevel(userProfile.entryCount);
          
          setUser(userProfile);
          setError(null);
          
          // Sunucu tarafında sıralanmış ve sayfalanmış verileri al
          const { entries: userEntries, totalPages: totalEntryPages } = await getUserEntries(userProfile.address, page, 6);
          
          console.log('Fetched user entries:', userEntries);
          
          const entriesWithUsernames = await Promise.all(
            userEntries.map(async (entry) => {
              const authorUsername = await getUsernameByAddress(entry.author);
              return { 
                ...entry, 
                authorUsername,
                creationDate: new Date(Number(entry.creationTimestamp) * 1000)
              };
            })
          );
          
          setEntries(entriesWithUsernames);
          setTotalPages(totalEntryPages);
  
          if (isConnected && currentUser?.wallet?.address) {
            const currentUserStatus = checkIsCurrentUser(userProfile.address);
            setIsCurrentUser(currentUserStatus);
            if (!currentUserStatus) {
              const followingStatus = await checkIsFollowing(currentUser.wallet.address, userProfile.address);
              setIsFollowing(followingStatus);
            }
          }
        } else {
          if (isConnected && currentUser?.wallet?.address && checkIsCurrentUser(usernameOrAddress)) {
            setIsCurrentUser(true);
            setError('User not registered');
          } else {
            setError('User not found');
          }
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load user data');
        if (isConnected && currentUser?.wallet?.address) {
          setIsCurrentUser(checkIsCurrentUser(usernameOrAddress));
        }
      } finally {
        setLoading(false);
      }
    }
  }, [usernameOrAddress, isConnected, currentUser, checkIsCurrentUser, page]);

  
  useEffect(() => {
    if (usernameOrAddress) {
      fetchData();
    }
  }, [fetchData, usernameOrAddress, currentUser]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    router.push(`/profile/${usernameOrAddress}?page=${newPage}`, undefined, { shallow: true });
  }, [router, usernameOrAddress]);

  const handleRegisterSuccess = useCallback(() => {
    router.reload();
  }, [router]);

  const handleFollowToggle = useCallback(async () => {
    if (!isConnected) {
      alert('Please connect your wallet to follow/unfollow.');
      await login();
      return;
    }
    try {
      const newFollowingStatus = !isFollowing;
      if (newFollowingStatus) {
        await followUser(user.address);
      } else {
        await unfollowUser(user.address);
      }
      setIsFollowing(newFollowingStatus);
      const newFollowingCount = await getFollowingCount(account);
      const newFollowersCount = await getFollowersCount(user.address);
      setUser(prevUser => ({...prevUser, followersCount: newFollowersCount}));
      setCurrentUser(prevCurrentUser => ({
        ...prevCurrentUser,
        followingCount: newFollowingCount
      }));
    } catch (error) {
      console.error('Error toggling follow status:', error);
      alert('Failed to update follow status. ' + error.message);
    }
  }, [isConnected, isFollowing, user, account, setCurrentUser, login]);

  const handleEntryUpdate = useCallback((updatedEntry) => {
    setEntries(prevEntries => 
      prevEntries.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    fetchData();
  }, [fetchData]);

  const memoizedUserCard = useMemo(() => (
    <UserCard 
      user={user}
      isCurrentUser={isCurrentUser}
      isFollowing={isFollowing}
      onFollowToggle={handleFollowToggle}
      isDarkMode={isDarkMode}
      BadgeCheckIcon={BadgeCheckIcon}
    />
  ), [user, isCurrentUser, isFollowing, handleFollowToggle, isDarkMode]);

  if (loading) return <div className="p-4">Loading...</div>;
  if ((error === 'User not found' || error === 'User not registered') && isCurrentUser) {
    return <RegisterPage onRegisterSuccess={handleRegisterSuccess} />;
  }
  if (error) return <div className="p-4">Error: {error}</div>;
  if (!user) return <div className="p-4">User not found</div>;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-screen-lg">
      <div className="space-y-4 sm:space-y-6">
        {memoizedUserCard}
        {entries.map((entry) => (
          <EntryCard 
            key={entry.id} 
            entry={entry} 
            type="profile" 
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
      </div>
    </div>
  );
}

function calculateUserLevel(entryCount) {
  if (entryCount >= 100) return 2; // Based
  if (entryCount >= 50) return 1;  // Anon
  if (entryCount >= 10) return 0;  // Newbie
  return -1;
}
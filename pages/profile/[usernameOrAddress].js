import { useRouter } from 'next/router';
import { useEffect, useState, useCallback, useContext, useMemo } from 'react';
import EntryCard from '../../components/EntryCard';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { usePrivyWeb3 } from '../../contexts/PrivyWeb3Context';
import { UserContext } from '../../contexts/UserContext';
import UserCard from '../../components/UserCard';
import { CheckCircledIcon, ChevronLeftIcon, ChevronRightIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { getUserProfile, getUserEntries, followUser, unfollowUser, isFollowing as checkIsFollowing, getFollowingCount, getFollowersCount, getActiveEntryCount, updateProfile } from '../../services/userService';
import { getUsernameByAddress } from '../../services/entryService';
import RegisterPage from '../register';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ContentLoader from '../../components/ContentLoader';

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
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');

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

  const handleEditProfile = useCallback(() => {
    setEditUsername(user.username);
    setEditBio(user.bio);
    setShowEditProfileModal(true);
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile(editUsername, editBio);
      setUser(updatedUser);
      setShowEditProfileModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

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
      onEditProfile={handleEditProfile}
      isDarkMode={isDarkMode}
      CheckCircledIcon={CheckCircledIcon}
    />
  ), [user, isCurrentUser, isFollowing, handleFollowToggle, handleEditProfile, isDarkMode]);

  if (loading) return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-screen-lg">
      <ContentLoader 
        size="md" 
        duration={3000} 
        className="mt-4 ml-4" // Sol üst köşeye yerleştirmek için margin ekliyoruz
      />
    </div>
  );

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
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={() => setShowEditProfileModal(false)}></div>
          <Card className="relative w-full max-w-sm sm:max-w-md rounded-2xl shadow-lg" style={{ backgroundColor: '#ffffff' }}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <div className="flex items-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mr-2" 
                       style={{ backgroundColor: '#000000' }}>
                    <Pencil1Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span style={{ color: '#404040' }} className="text-sm sm:text-base">Edit Profile</span>
                </div>
              </div>
              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                        isDarkMode 
                          ? 'bg-white text-black border-gray-700 placeholder-gray-500' 
                          : 'bg-white text-black border-gray-300 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
                        isDarkMode 
                          ? 'bg-white text-black border-gray-700 placeholder-gray-500' 
                          : 'bg-white text-black border-gray-300 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200"
                    style={{ backgroundColor: '#404040', color: '#ffffff' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
  
  function calculateUserLevel(entryCount) {
    if (entryCount >= 100) return 2; // Based
    if (entryCount >= 50) return 1;  // Anon
    if (entryCount >= 10) return 0;  // Newbie
    return -1;
  }
}
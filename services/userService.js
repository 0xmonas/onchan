import { getContract, callContractFunction, getSigner } from './contractService';
import { ethers } from 'ethers';

const MAX_USERNAME_LENGTH = 15;
const MAX_BIO_LENGTH = 160;

export const getUserProfile = async (usernameOrAddress) => {
  try {
    console.log('Getting contract...');
    const contract = await getContract();
    console.log('Contract obtained, fetching user profile for:', usernameOrAddress);
    
    let user;
    if (ethers.isAddress(usernameOrAddress)) {
      console.log('Fetching user by address');
      const userBasic = await callContractFunction('usersBasic', usernameOrAddress);
      const userStats = await callContractFunction('usersStats', usernameOrAddress);
      console.log('User data from contract:', userBasic, userStats);

      const activeEntryCount = await getActiveEntryCount(usernameOrAddress);

      user = {
        id: userBasic.id.toString(),
        address: usernameOrAddress,
        username: userBasic.username,
        bio: userBasic.bio,
        level: parseInt(userBasic.level.toString(), 10),
        entryCount: activeEntryCount,
        registrationTimestamp: userBasic.registrationTimestamp.toString(),
        followingCount: userStats.followingCount.toString(),
        followersCount: userStats.followersCount.toString(),
      };
    } else {
      console.log('Fetching user by username');
      try {
        const result = await callContractFunction('getUserByUsername', usernameOrAddress);
        if (result && result[0] !== '0') {
          const userBasic = await callContractFunction('usersBasic', result[1]);
          const userStats = await callContractFunction('usersStats', result[1]);
          const activeEntryCount = await getActiveEntryCount(result[1]);
          user = {
            id: result[0].toString(),
            address: result[1],
            username: usernameOrAddress,
            bio: userBasic.bio,
            level: parseInt(result[2].toString(), 10),
            entryCount: activeEntryCount,
            registrationTimestamp: result[3].toString(),
            followingCount: result[4].toString(),
            followersCount: result[5].toString(),
          };
        } else {
          console.log('User not found');
          return null;
        }
      } catch (error) {
        console.error('Error fetching user by username:', error);
        return null;
      }
    }

    console.log('Processed user data:', user);
    
    if (!user || !user.id || user.id === '0') {
      console.log('User not found or not registered');
      return null;
    }

    user.level = calculateUserLevel(user.entryCount);

    console.log('Final user data with calculated level:', user);

    return user;
  } catch (error) {
    console.error('Detailed error in getUserProfile:', error);
    return null;
  }
};

function calculateUserLevel(entryCount) {
  const count = parseInt(entryCount, 10);
  if (count >= 100) return 2;
  if (count >= 50) return 1;
  if (count >= 10) return 0;
  return -1;
}

export const registerUser = async (username, bio, captchaToken) => {
  try {
    if (username.length > MAX_USERNAME_LENGTH) {
      throw new Error(`Username must be ${MAX_USERNAME_LENGTH} characters or less.`);
    }
    if (bio.length > MAX_BIO_LENGTH) {
      throw new Error(`Bio must be ${MAX_BIO_LENGTH} characters or less.`);
    }

    // CAPTCHA doğrulama
    // const captchaResponse = await fetch('/api/verifyCaptcha', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ captchaToken })
    // });

    // if (!captchaResponse.ok) {
    //   const errorData = await captchaResponse.json();
    //   throw new Error(errorData.message || 'CAPTCHA verification failed');
    // }

    console.log('Registering user:', username, bio);
    const contract = await getContract();
    const signer = await getSigner();
    
    if (!signer) {
      throw new Error('Signer is not available. Please connect your wallet.');
    }

    const contractWithSigner = contract.connect(signer);
    
    const isAvailable = await contractWithSigner.isUsernameAvailable(username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    const registrationFee = await contract.getRegistrationFee();
    console.log('Registration fee:', ethers.formatEther(registrationFee), 'ETH');

    const gasLimit = 500000;

    const tx = await contractWithSigner.register(username, bio, {
      value: registrationFee,
      gasLimit: gasLimit,
    });
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.transactionHash);
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }

    const userProfile = await getUserProfile(username);
    console.log('User profile after registration:', userProfile);
    
    return userProfile;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const updateProfile = async (newUsername, newBio) => {
  try {
    if (newUsername.length > MAX_USERNAME_LENGTH) {
      throw new Error(`Username must be ${MAX_USERNAME_LENGTH} characters or less.`);
    }
    if (newBio.length > MAX_BIO_LENGTH) {
      throw new Error(`Bio must be ${MAX_BIO_LENGTH} characters or less.`);
    }

    const tx = await callContractFunction('updateProfile', newUsername, newBio);
    await tx.wait();
    return getUserProfile(newUsername);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getUserEntries = async (userAddress, page = 1, perPage = 10) => {
  try {
    if (!userAddress || !ethers.isAddress(userAddress)) {
      console.error('Invalid user address:', userAddress);
      return [];
    }

    console.log('Fetching entries for:', userAddress);

    const entryIds = await callContractFunction('getUserEntriesPaginated', userAddress, page, perPage);
    const entries = [];
    for (let entryId of entryIds) {
      try {
        const entry = await callContractFunction('entries', entryId);
        const title = await callContractFunction('titles', entry.titleId);
        
        if (title.id.toString() !== '0' && !entry.isDeleted) {
          entries.push(formatEntryData(entry, entryId, title.name));
        }
      } catch (error) {
        console.error(`Error fetching entry ${entryId} for user ${userAddress}:`, error);
      }
    }

    console.log('Formatted user entries:', entries);
    return entries;
  } catch (error) {
    console.error('Error fetching user entries:', error);
    return [];
  }
};

const formatEntryData = (entry, entryId, titleName) => {
  return {
    id: entryId.toString(),
    titleId: entry.titleId.toString(),
    titleName: titleName,
    author: entry.author,
    content: entry.content,
    likes: entry.likes.toString(),
    dislikes: entry.dislikes.toString(),
    creationTimestamp: entry.creationTimestamp.toString(),
    isDeleted: entry.isDeleted,
    isEdited: entry.isEdited,
  };
};

export const followUser = async (userToFollow) => {
  try {
    console.log('Following user:', userToFollow);
    const tx = await callContractFunction('followUser', userToFollow);
    await tx.wait();
    console.log('Follow transaction confirmed');
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userToUnfollow) => {
  try {
    console.log('Unfollowing user:', userToUnfollow);
    const tx = await callContractFunction('unfollowUser', userToUnfollow);
    await tx.wait();
    console.log('Unfollow transaction confirmed');
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const isFollowing = async (follower, followed) => {
  try {
    return await callContractFunction('isFollowing', follower, followed);
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

export const getFollowingCount = async (userAddress) => {
  try {
    console.log('Fetching following count for:', userAddress);
    const count = await callContractFunction('getFollowingCount', userAddress);
    console.log('Following count:', count.toString());
    return Number(count);
  } catch (error) {
    console.error('Error fetching following count:', error);
    return 0;
  }
};

export const getFollowersCount = async (userAddress) => {
  try {
    console.log('Fetching followers count for:', userAddress);
    const count = await callContractFunction('getFollowersCount', userAddress);
    console.log('Followers count:', count.toString());
    return Number(count);
  } catch (error) {
    console.error('Error fetching followers count:', error);
    return 0;
  }
};

export const getUsernameByAddress = async (address) => {
  try {
    const userBasic = await callContractFunction('usersBasic', address);
    return userBasic.username;
  } catch (error) {
    console.error('Error getting username by address:', error);
    return address; // Fallback to address if username can't be fetched
  }
};

export const getActiveEntryCount = async (userAddress) => {
  try {
    const entryIds = await callContractFunction('getUserEntriesPaginated', userAddress, 1, 1000);
    let activeCount = 0;
    for (let entryId of entryIds) {
      const entry = await callContractFunction('entries', entryId);
      if (!entry.isDeleted) {
        const title = await callContractFunction('titles', entry.titleId);
        if (title.id.toString() !== '0') {
          activeCount++;
        }
      }
    }
    console.log(`Active entry count for ${userAddress}: ${activeCount}`);
    return activeCount;
  } catch (error) {
    console.error('Error getting active entry count:', error);
    return 0;
  }
};
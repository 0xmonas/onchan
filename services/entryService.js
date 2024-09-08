import { getContract, callContractFunction, getSigner } from './contractService';
import { ethers } from 'ethers';

export const getEntry = async (entryId) => {
  try {
    console.log('Fetching entry:', entryId);
    const entry = await callContractFunction('entries', BigInt(entryId));
    
    // Başlığın hala var olup olmadığını kontrol et
    const title = await callContractFunction('titles', entry.titleId);
    if (title.id.toString() === '0' || entry.isDeleted) {
      throw new Error('Entry belongs to a deleted title or is deleted');
    }
    
    const authorUsername = await getUsernameByAddress(entry.author);
    return {
      id: entryId,
      titleId: entry.titleId.toString(),
      author: entry.author,
      authorUsername: authorUsername,
      content: entry.content,
      likes: entry.likes.toString(),
      dislikes: entry.dislikes.toString(),
      creationTimestamp: entry.creationTimestamp.toString(),
      isDeleted: entry.isDeleted,
      isEdited: entry.isEdited,
    };
  } catch (error) {
    console.error('Error fetching entry:', error);
    throw error;
  }
};

export const addEntry = async (titleId, content) => {
  try {
    console.log('Adding entry:', { titleId, content });
    const contract = await getContract();
    console.log('Contract obtained:', contract.address);

    const signer = await getSigner();
    if (!signer) {
      throw new Error('Signer is not available. Please connect your wallet.');
    }
    const userAddress = await signer.getAddress();

    const freeDailyEntries = await contract.FREE_DAILY_ENTRIES();
    const userDailyEntryCount = await contract.getUserDailyEntryCount(userAddress);

    let entryFee = await contract.entryFee();
    if (userDailyEntryCount >= freeDailyEntries) {
      const additionalFee = await contract.additionalEntryFee();
      entryFee = entryFee.add(additionalFee);
    }
    console.log('Entry fee:', ethers.formatEther(entryFee), 'ETH');

    const tx = await callContractFunction('addEntry', BigInt(titleId), content, {
      value: entryFee,
    });
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction receipt:', receipt);

    if (receipt.status === 0) {
      throw new Error('Transaction failed');
    }

    const event = receipt.logs
      .filter(log => log.fragment && log.fragment.name === 'EntryAdded')
      .map(log => log.args)[0];

    if (event) {
      console.log('EntryAdded event:', event);
      const authorUsername = await getUsernameByAddress(event.author);
      return {
        id: event.entryId.toString(),
        titleId: event.titleId.toString(),
        author: event.author,
        authorUsername: authorUsername,
        content: content,
        creationTimestamp: event.creationTimestamp.toString(),
        likes: '0',
        dislikes: '0',
      };
    } else {
      throw new Error('EntryAdded event not found');
    }
  } catch (error) {
    console.error('Detailed error in addEntry:', error);
    throw error;
  }
};

export const editEntry = async (entryId, newContent) => {
  try {
    console.log('Editing entry:', { entryId, newContent });
    const tx = await callContractFunction('editEntry', BigInt(entryId), newContent);
    const receipt = await tx.wait();
    console.log('Entry edited, transaction receipt:', receipt);
    return true;
  } catch (error) {
    console.error('Error editing entry:', error);
    throw error;
  }
};

export const deleteEntry = async (entryId) => {
  try {
    console.log('Deleting entry:', entryId);
    const tx = await callContractFunction('deleteEntry', BigInt(entryId));
    const receipt = await tx.wait();
    console.log('Entry deleted, transaction receipt:', receipt);
    return true;
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

export const likeEntry = async (entryId) => {
  try {
    console.log('Liking entry:', entryId);
    const tx = await callContractFunction('likeEntry', BigInt(entryId));
    const receipt = await tx.wait();
    console.log('Entry liked, transaction receipt:', receipt);
    return true;
  } catch (error) {
    console.error('Error liking entry:', error);
    throw error;
  }
};

export const dislikeEntry = async (entryId) => {
  try {
    console.log('Disliking entry:', entryId);
    const tx = await callContractFunction('dislikeEntry', BigInt(entryId));
    const receipt = await tx.wait();
    console.log('Entry disliked, transaction receipt:', receipt);
    return true;
  } catch (error) {
    console.error('Error disliking entry:', error);
    throw error;
  }
};

export const removeReaction = async (entryId) => {
  try {
    console.log('Removing reaction from entry:', entryId);
    const tx = await callContractFunction('removeReaction', BigInt(entryId));
    const receipt = await tx.wait();
    console.log('Reaction removed, transaction receipt:', receipt);
    return true;
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
};

export const getUserReaction = async (userAddress, entryId) => {
  try {
    const reaction = await callContractFunction('getUserReaction', userAddress, BigInt(entryId));
    return reaction;
  } catch (error) {
    console.error('Error getting user reaction:', error);
    throw error;
  }
};

export const getUserDailyEntryCount = async (address) => {
  try {
    const contract = await getContract();
    return await contract.getUserDailyEntryCount(address);
  } catch (error) {
    console.error('Error getting user daily entry count:', error);
    throw error;
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

export const deleteEntryByOwner = async (entryId) => {
  try {
    console.log('Deleting entry by owner:', entryId);
    const tx = await callContractFunction('deleteEntryByOwner', BigInt(entryId));
    const receipt = await tx.wait();
    console.log('Entry deleted by owner, transaction receipt:', receipt);
    return true;
  } catch (error) {
    console.error('Error deleting entry by owner:', error);
    throw error;
  }
};

export const getTitleEntriesPaginated = async (titleId, page, perPage) => {
  try {
    console.log('Fetching paginated entries for title:', titleId, 'Page:', page, 'PerPage:', perPage);
    const entryIds = await callContractFunction('getTitleEntriesPaginated', BigInt(titleId), page, perPage);
    console.log('Paginated Entry IDs:', entryIds);
    
    const entries = await Promise.all(
      entryIds.map(async (entryId) => {
        try {
          const entry = await callContractFunction('entries', entryId);
          if (!entry.isDeleted) {
            return formatEntryData(entry, entryId);
          }
        } catch (error) {
          console.error(`Error fetching entry ${entryId} for title ${titleId}:`, error);
        }
        return null;
      })
    );

    const validEntries = entries.filter(entry => entry !== null);
    console.log('Valid paginated entries:', validEntries);
    return validEntries;
  } catch (error) {
    console.error('Error fetching paginated title entries:', error);
    return [];
  }
};

const formatEntryData = (entry, entryId) => {
  return {
    id: entryId.toString(),
    titleId: entry.titleId.toString(),
    author: entry.author,
    content: entry.content,
    likes: entry.likes.toString(),
    dislikes: entry.dislikes.toString(),
    creationTimestamp: entry.creationTimestamp.toString(),
    isDeleted: entry.isDeleted,
    isEdited: entry.isEdited,
  };
};
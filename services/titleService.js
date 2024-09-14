import { getContract, callContractFunction, getSigner } from './contractService';
import { addEntry } from './entryService';
import { ethers } from 'ethers';

export const getTitle = async (titleIdOrSlug) => {
  try {
    console.log('Fetching title:', titleIdOrSlug);
    let titleId;
    if (titleIdOrSlug.includes('--')) {
      titleId = titleIdOrSlug.split('--')[1];
    } else {
      titleId = titleIdOrSlug;
    }
    
    const title = await callContractFunction('titles', BigInt(titleId));
    if (title.id.toString() === '0') {
      throw new Error('Title not found or has been deleted');
    }
    return {
      id: titleId.toString(),
      name: title.name,
      slug: `${title.name.toLowerCase().replace(/\s+/g, '-')}--${titleId}`,
      creator: title.creator,
      totalEntries: title.totalEntries.toString(),
      totalLikes: title.totalLikes.toString(),
      creationTimestamp: title.creationTimestamp.toString(),
    };
  } catch (error) {
    console.error('Error fetching title:', error);
    throw error;
  }
};

export const getRandomTitles = async (count = 5) => {
  try {
    console.log('Fetching random titles...');
    const randomTitleIds = await callContractFunction('getRandomTitles', count);
    console.log('Random Title IDs:', randomTitleIds);

    const randomTitles = await Promise.all(
      randomTitleIds.map(async (id) => {
        try {
          console.log(`Fetching title with ID: ${id}`);
          const title = await callContractFunction('titles', id);
          console.log(`Title ${id}:`, title);
          if (title.id.toString() === '0') return null;
          return {
            id: id.toString(),
            name: title.name,
            totalEntries: title.totalEntries.toString(),
            totalLikes: title.totalLikes.toString(),
            creationTimestamp: title.creationTimestamp.toString(),
          };
        } catch (error) {
          console.error(`Error fetching title ${id}:`, error);
          return null;
        }
      })
    );

    return randomTitles.filter(title => title !== null);
  } catch (error) {
    console.error('Error fetching random titles:', error);
    throw error;
  }
};

export const getPopularTitles = async (count = 20) => {
  try {
    console.log('Fetching popular titles...');
    const [titleIds, entryCounts] = await callContractFunction('getTopTwentyPopularTitles', true);
    const popularTitles = await Promise.all(
      titleIds.slice(0, count).map(async (id, index) => {
        if (id.toString() === '0') return null;
        try {
          const title = await callContractFunction('titles', id);
          if (title.id.toString() === '0') return null;
          return {
            id: id.toString(),
            name: title.name,
            entryCount: entryCounts[index].toString(),
            totalLikes: title.totalLikes.toString(),
          };
        } catch (error) {
          console.error(`Error fetching popular title ${id}:`, error);
          return null;
        }
      })
    );
    return popularTitles.filter(title => title !== null && parseInt(title.entryCount) > 0);
  } catch (error) {
    console.error('Error fetching popular titles:', error);
    return [];
  }
};

export const createTitle = async (name, firstEntry) => {
  try {
    console.log('Creating title:', name);
    const contract = await getContract();
    console.log('Contract obtained:', contract.address);
    
    const isTitleAvailable = await callContractFunction('isTitleNameAvailable', name);
    if (!isTitleAvailable) {
      throw new Error('Title name is already taken');
    }

    const signer = await getSigner();
    if (!signer) {
      throw new Error('Signer is not available. Please connect your wallet.');
    }
    const userAddress = await signer.getAddress();

    const freeDailyTitles = await contract.FREE_DAILY_TITLES();
    const userDailyTitleCount = await contract.getUserDailyTitleCount(userAddress);
    
    const baseFee = await contract.titleCreationFee();
    const additionalFee = await contract.additionalTitleFee();
    const requiredFee = userDailyTitleCount >= freeDailyTitles
      ? BigInt(baseFee) + BigInt(additionalFee)
      : BigInt(baseFee);
    console.log('Required fee:', ethers.formatEther(requiredFee));

    const options = { value: requiredFee };
    console.log('Options for createTitle:', options);

    const tx = await callContractFunction('createTitle', name, options);
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction receipt:', receipt);

    const event = receipt.logs
      .filter(log => log.fragment && log.fragment.name === 'TitleCreated')
      .map(log => log.args)[0];

    if (event) {
      const titleId = event.titleId.toString();
      console.log('Title created with ID:', titleId);
      
      if (firstEntry) {
        await addEntry(titleId, firstEntry);
      }
      return {
        id: titleId,
        slug: `${name.toLowerCase().replace(/\s+/g, '-')}--${titleId}`
      };
    } else {
      throw new Error('TitleCreated event not found');
    }
  } catch (error) {
    console.error('Detailed error in createTitle:', error);
    throw error;
  }
};

export const getTitleEntries = async (titleId, page = 1, perPage = 10) => {
  try {
    console.log('Fetching entries for title:', titleId);
    const [entryIds, totalEntryCount] = await callContractFunction('getTitleEntriesPaginated', BigInt(titleId), page, perPage);
    console.log('Entry IDs:', entryIds, 'Total Entry Count:', totalEntryCount);
    
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
    console.log('Valid entries:', validEntries);
    return { entries: validEntries, totalEntries: Number(totalEntryCount) };
  } catch (error) {
    console.error('Error fetching title entries:', error);
    return { entries: [], totalEntries: 0 };
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

export const isTitleNameAvailable = async (titleName) => {
  try {
    console.log('Checking title name availability:', titleName);
    return await callContractFunction('isTitleNameAvailable', titleName);
  } catch (error) {
    console.error('Error checking title name availability:', error);
    throw error;
  }
};

export const getUserDailyTitleCount = async (address) => {
  try {
    return await callContractFunction('getUserDailyTitleCount', address);
  } catch (error) {
    console.error('Error getting user daily title count:', error);
    throw error;
  }
};

export const deleteTitle = async (titleId) => {
  try {
    console.log('Deleting title:', titleId);
    const tx = await callContractFunction('deleteTitle', BigInt(titleId));
    const receipt = await tx.wait();
    console.log('Title deleted, transaction receipt:', receipt);
    
    const titleDeletionDetailsEvent = receipt.logs
      .filter(log => log.fragment && log.fragment.name === 'TitleDeletionDetails')
      .map(log => log.args)[0];

    if (titleDeletionDetailsEvent) {
      console.log('Title deletion details:', {
        titleId: titleDeletionDetailsEvent.titleId.toString(),
        deletedEntries: titleDeletionDetailsEvent.deletedEntries.toString(),
        remainingEntries: titleDeletionDetailsEvent.remainingEntries.toString()
      });
    }

    await updatePopularTitles();
    await updatePlatformStats();
    return true;
  } catch (error) {
    console.error('Error deleting title:', error);
    throw error;
  }
};

export const changeTitleName = async (titleId, newName) => {
  try {
    console.log('Changing title name:', { titleId, newName });
    const tx = await callContractFunction('changeTitleName', BigInt(titleId), newName);
    const receipt = await tx.wait();
    console.log('Title name changed, transaction receipt:', receipt);
    return true;
  } catch (error) {
    console.error('Error changing title name:', error);
    throw error;
  }
};

const updatePopularTitles = async () => {
  // Bu fonksiyonu uygulamanızın state yönetim sistemine göre uyarlayın
  console.log('Updating popular titles...');
  // Örnek: global state'i güncelleyen bir fonksiyon çağırın
  // await updateGlobalPopularTitles();
};

const updatePlatformStats = async () => {
  // Bu fonksiyonu uygulamanızın state yönetim sistemine göre uyarlayın
  console.log('Updating platform stats...');
  // Örnek: global state'i güncelleyen bir fonksiyon çağırın
  // await updateGlobalPlatformStats();
};
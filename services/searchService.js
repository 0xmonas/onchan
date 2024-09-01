import { callContractFunction, formatBigNumbers } from './contractService';
import { ethers } from 'ethers';

export const searchSuggestions = async (query, page = 1, perPage = 10) => {
  const suggestions = [];

  try {
    console.log("searchSuggestions called with query:", query);

    if (ethers.isAddress(query)) {
      try {
        const userBasic = await callContractFunction('usersBasic', query);
        if (userBasic && userBasic.username) {
          suggestions.push({
            type: 'user',
            text: `@${userBasic.username}`,
            username: userBasic.username,
            id: userBasic.id.toString(),
            address: query,
            level: userBasic.level.toString()
          });
        }
      } catch (error) {
        console.error('Error searching user by address:', error);
      }
    }

    if (!query.includes(' ') && !query.startsWith('#')) {
      const username = query.startsWith('@') ? query.slice(1) : query;
      console.log("Searching users with:", username);
      try {
        const userResult = await callContractFunction('getUserByUsername', username);
        if (userResult && userResult[0] !== '0') {
          suggestions.push({
            type: 'user',
            text: `@${username}`,
            username: username,
            id: userResult[0].toString(),
            address: userResult[1],
            level: userResult[2].toString()
          });
        } else {
          const userResults = await callContractFunction('searchUsers', username, page, perPage);
          userResults.forEach(user => {
            suggestions.push({
              type: 'user',
              text: `@${user.username}`,
              username: user.username,
              id: user.id.toString(),
              level: user.level.toString()
            });
          });
        }
        console.log("Processed user suggestions:", suggestions);
      } catch (error) {
        console.error('Detailed error in searching users:', error);
      }

      if (suggestions.length === 0) {
        suggestions.push({
          type: 'registerUser',
          text: `Register as @${username}`
        });
      }
    }

    try {
      const titleResults = await searchTitles(query, 10);
      console.log("Title search results:", titleResults);
      
      if (titleResults && titleResults.length > 0) {
        suggestions.push(...titleResults.map(title => ({
          type: 'title',
          text: title.name,
          id: title.id.toString(),
          totalEntries: title.totalEntries.toString()
        })));
      }
    } catch (error) {
      console.error('Detailed error in searching titles:', error);
    }

    if (!suggestions.some(s => s.type === 'title')) {
      const isTitleAvailable = await callContractFunction('isTitleNameAvailable', query);
      if (isTitleAvailable) {
        suggestions.push({
          type: 'createTitle',
          text: `Create title: "${query}"`
        });
      }
    }

    if (query.startsWith('#')) {
      const entryId = query.slice(1);
      if (!isNaN(entryId)) {
        try {
          const entry = await callContractFunction('entries', entryId);
          console.log("Entry search result:", entry);
          if (entry && entry.id.toString() !== '0') {
            suggestions.push({
              type: 'entry',
              text: `Entry #${entryId}`,
              id: entryId
            });
          }
        } catch (error) {
          console.error('Error searching entry:', error);
        }
      }
    }

    console.log("Final suggestions:", suggestions);
    return suggestions;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
};

export const searchTitles = async (query, limit = 10) => {
  try {
    const titleCounter = await callContractFunction('titleCounter');
    console.log("Title counter:", titleCounter);
    const titles = [];
    for (let i = 1; i <= Math.min(Number(titleCounter), limit); i++) {
      const title = await callContractFunction('titles', i);
      if (title.name.toLowerCase().includes(query.toLowerCase())) {
        titles.push(formatBigNumbers({
          id: i,
          name: title.name,
          totalEntries: title.totalEntries,
          totalLikes: title.totalLikes,
        }));
      }
    }
    console.log("Filtered title search results:", titles);
    return titles;
  } catch (error) {
    console.error('Error searching titles:', error);
    return [];
  }
};

export const searchTitlesAndUsers = async (query, page = 1, perPage = 10) => {
  try {
    const titleResults = await searchTitles(query, 10);
    let userResults = [];
    
    if (!query.includes(' ')) {
      try {
        const userResult = await callContractFunction('getUserByUsername', query);
        if (userResult && userResult[0] !== '0') {
          userResults.push(userResult);
        }
      } catch (error) {
        console.error('Error searching user:', error);
      }
    }

    return {
      titles: titleResults,
      users: userResults.map(user => ({
        id: user[0].toString(),
        username: user[1],
        level: user[2].toString(),
      })),
    };
  } catch (error) {
    console.error('Error in searchTitlesAndUsers:', error);
    return { titles: [], users: [] };
  }
};
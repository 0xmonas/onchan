import React, { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { ethers } from 'ethers';
import { getUserDailyEntryCount } from '../services/entryService';
import { getContract } from '../services/contractService';
import { searchTitles } from '../services/searchService';
import { Loader2, Pen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const MAX_ENTRY_LENGTH = 1000;

const AddEntryForm = ({ onSubmit, titleId }) => {
  const [content, setContent] = useState('');
  const { isDarkMode } = useDarkMode();
  const { authenticated, user } = usePrivyWeb3();
  const [entryFee, setEntryFee] = useState('0');
  const [dailyEntryCount, setDailyEntryCount] = useState(0);
  const [freeDailyEntries, setFreeDailyEntries] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showMintCard, setShowMintCard] = useState(false);

  const fetchData = useCallback(async () => {
    if (authenticated && user?.wallet?.address) {
      try {
        const contract = await getContract();
        const baseFee = await contract.entryFee();
        const additionalFee = await contract.additionalEntryFee();
        setEntryFee(ethers.formatEther(BigInt(baseFee) + BigInt(additionalFee)));
        
        const count = await getUserDailyEntryCount(user.wallet.address);
        setDailyEntryCount(count);
        
        const freeEntries = await contract.FREE_DAILY_ENTRIES();
        setFreeDailyEntries(Number(freeEntries));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }, [authenticated, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authenticated) {
      alert('Please connect your wallet to add an entry.');
      return;
    }
    if (content.length > MAX_ENTRY_LENGTH) {
      alert(`Entry must be ${MAX_ENTRY_LENGTH} characters or less.`);
      return;
    }
    setShowMintCard(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsCancelled(false);
    try {
      const processedContent = await processContent(content);
      await onSubmit(processedContent);
      setContent('');
      await fetchData();
      setShowMintCard(false);
    } catch (error) {
      console.error('Error submitting entry:', error);
      alert('Failed to submit entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) {
      setIsLoading(false);
      setIsCancelled(true);
    }
    setShowMintCard(false);
  };

  const processContent = async (text) => {
    const regex = /$$see:([^)]+)$$/g;
    let match;
    let lastIndex = 0;
    let result = '';

    while ((match = regex.exec(text)) !== null) {
      result += text.slice(lastIndex, match.index);
      const searchQuery = match[1].trim();
      const titles = await searchTitles(searchQuery, 1);
      if (titles.length > 0) {
        const titleSlug = `${titles[0].name.toLowerCase().replace(/\s+/g, '-')}--${titles[0].id}`;
        result += `(see:[${searchQuery}](/title/${titleSlug}))`;
      } else {
        result += match[0];
      }
      lastIndex = regex.lastIndex;
    }

    result += text.slice(lastIndex);
    return result;
  };

  const handleSeeClick = () => {
    if (content.length + 6 <= MAX_ENTRY_LENGTH) {
      setContent(content + ' (see:)');
    } else {
      alert(`Adding (see:) would exceed the ${MAX_ENTRY_LENGTH} character limit.`);
    }
  };

  const calculateFee = () => {
    if (dailyEntryCount < freeDailyEntries) {
      return '0';
    }
    return entryFee;
  };

  const characterCount = content.length;
  const progress = (characterCount / MAX_ENTRY_LENGTH) * 100;
  const strokeDasharray = 2 * Math.PI * 10;
  const strokeDashoffset = strokeDasharray * ((100 - progress) / 100);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className={`p-3 sm:p-4 rounded-md shadow-sm relative ${isDarkMode ? "bg-black border border-secondary" : "bg-white border border-card"}`}>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="1) what?"
          required
          className={`w-full p-3 sm:p-4 rounded-md border text-sm sm:text-base ${
            isDarkMode 
              ? "bg-black text-gray-200 placeholder-gray-400 border border-secondary" 
              : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
          }`}
          rows={3}
          maxLength={MAX_ENTRY_LENGTH}
        />
        <div className="flex flex-wrap justify-between items-center mt-2 gap-2 text-xs sm:text-sm">
          <Button
            type="button"
            onClick={handleSeeClick}
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md transition-colors duration-200 font-semibold text-xs sm:text-sm ${
              isDarkMode 
                ? "bg-secondary text-secondary-foreground hover:bg-gray-700" 
                : "bg-primary text-primary-foreground hover:bg-gray-200"
            }`}
          >
            (see:)
          </Button>
          <div className="flex items-center space-x-2">
            <div className="relative w-4 h-4 sm:w-5 sm:h-5">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke={isDarkMode ? "#4B5563" : "#D1D5DB"}
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke={progress <= 100 ? (isDarkMode ? "#3B82F6" : "#2563EB") : "#EF4444"}
                  strokeWidth="2"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 12 12)"
                />
              </svg>
            </div>
            <span className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {characterCount}/{MAX_ENTRY_LENGTH}
            </span>
          </div>
          <span className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Daily: {dailyEntryCount}/{freeDailyEntries}
          </span>
          <span className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Fee: {calculateFee()} ETH
          </span>
          <Button
            type="submit"
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md transition-colors duration-200 font-semibold text-xs sm:text-sm ${
              isDarkMode 
                ? "bg-secondary text-secondary-foreground hover:bg-gray-700" 
                : "bg-primary text-primary-foreground hover:bg-gray-200"
            }`}
          >
            Add {dailyEntryCount >= freeDailyEntries ? '(Fee)' : ''}
          </Button>
        </div>
      </form>
      {showMintCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xs sm:max-w-sm bg-white rounded-lg shadow-lg">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <Pen className="h-3 w-3 text-blue-500" />
                  </div>
                  <span className="text-gray-600 text-sm sm:text-base">Mint fee</span>
                </div>
                <span className="text-gray-800 font-medium text-sm sm:text-base">{calculateFee()} ETH</span>
              </div>
              <Button 
                className="w-full bg-black text-white hover:bg-gray-800 transition-colors text-sm sm:text-base py-2 sm:py-3"
                onClick={handleConfirm}
              >
                Mint Entry
              </Button>
              <Button
                className="mt-2 w-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm sm:text-base py-2 sm:py-3"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddEntryForm;
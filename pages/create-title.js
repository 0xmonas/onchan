import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { createTitle, getUserDailyTitleCount } from '../services/titleService';
import { useDarkMode } from '../contexts/DarkModeContext';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { getContract } from '../services/contractService';
import { Loader2 } from 'lucide-react';
import { addEntry } from '../services/entryService';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ethers } from 'ethers';

export default function CreateTitlePage() {
  const [titleName, setTitleName] = useState('');
  const [firstEntry, setFirstEntry] = useState('');
  const [error, setError] = useState(null);
  const [dailyTitleCount, setDailyTitleCount] = useState(0);
  const [freeDailyTitles, setFreeDailyTitles] = useState(5);
  const [stage, setStage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [titleFee, setTitleFee] = useState('0');
  const [isConfirming, setIsConfirming] = useState(false);
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { user, authenticated } = usePrivyWeb3();

  const account = user?.wallet?.address;
  const isConnected = authenticated;

  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && account) {
        try {
          const contract = await getContract();
          const count = await getUserDailyTitleCount(account);
          setDailyTitleCount(count);
          const freeTitles = await contract.FREE_DAILY_TITLES();
          setFreeDailyTitles(Number(freeTitles));
          const fee = await contract.titleCreationFee();
          setTitleFee(ethers.formatEther(fee));
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch data. Please try again.');
        }
      }
    };
    fetchData();

    if (router.query.name) {
      setTitleName(decodeURIComponent(router.query.name));
    }
  }, [isConnected, account, router.query.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setError('Please connect your wallet to create a title.');
      return;
    }
    setShowConfirmation(true);
    setStage(1);
    setIsConfirming(false);
  };

  const handleCreate = () => {
    setIsConfirming(true);
    handleConfirm();
  };

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    setIsCancelled(false);
    try {
      const newTitle = await createTitle(titleName);
      console.log('Title created:', newTitle);
      
      setStage(2);
      
      if (firstEntry && newTitle.id) {
        const newEntry = await addEntry(newTitle.id, firstEntry);
        console.log('First entry added:', newEntry);
      }
      
      router.push(`/title/${newTitle.slug}`);
    } catch (error) {
      console.error('Error in title creation process:', error);
      setError('Failed to create title: ' + error.message);
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  }, [titleName, firstEntry, router]);

  const handleCancel = () => {
    setIsLoading(false);
    setIsCancelled(true);
    setShowConfirmation(false);
    setStage(1);
    setIsConfirming(false);
  };

  const buttonClasses = `w-full px-4 py-2 rounded-md transition-colors duration-200 font-semibold text-sm sm:text-base ${
    isDarkMode 
      ? "bg-secondary text-secondary-foreground hover:bg-gray-700" 
      : "bg-primary text-primary-foreground hover:bg-gray-200"
  }`;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-screen-lg">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h2 className={`font-bold text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>Create Title</h2>
        </div>
        <div className={`${isDarkMode ? "bg-black border secondary" : "bg-white"} p-4 sm:p-6 rounded-lg shadow-md`}>
          {error && <p className="text-red-500 mb-2 sm:mb-4 text-sm sm:text-base">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-2 sm:space-y-4">
            <div className="w-full space-y-2">
              <input
                type="text"
                value={titleName}
                onChange={(e) => setTitleName(e.target.value)}
                placeholder="Enter title name" required
                className={`mt-2 sm:mt-4 border rounded-md px-4 sm:px-6 py-2 sm:py-3 w-full text-sm sm:text-base ${
                  isDarkMode ? "bg-black border-secondary text-white placeholder-gray-400" : "border-gray-300 placeholder-gray-400"
                }`}
              />
              <textarea
                value={firstEntry}
                onChange={(e) => setFirstEntry(e.target.value)}
                placeholder="Enter first entry"
                required
                rows={4}
                className={`mt-2 sm:mt-4 border rounded-md px-4 sm:px-6 py-2 sm:py-3 w-full text-sm sm:text-base ${
                  isDarkMode ? "bg-black border-secondary text-white placeholder-gray-400" : "border-gray-300 placeholder-gray-400"
                }`}
              />
              <Button
                type="submit"
                className={buttonClasses}
              >
                Create Title {dailyTitleCount >= freeDailyTitles ? '(Fee Required)' : ''}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-72 sm:w-80 rounded-2xl shadow-lg" style={{ backgroundColor: '#ffffff' }}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <div className="flex items-center">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mr-2`} 
                       style={{ backgroundColor: stage === 1 ? '#000000' : '#E0E0E0', color: stage === 1 ? '#ffffff' : '#000000' }}>
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mr-2`}
                       style={{ backgroundColor: stage === 2 ? '#000000' : '#E0E0E0', color: stage === 2 ? '#ffffff' : '#000000' }}>
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <span style={{ color: '#404040' }} className="text-sm sm:text-base">
                    {stage === 1 ? 'Creation Fee' : 'Entry fee'}
                  </span>
                </div>
                <span style={{ color: '#000000' }} className="font-medium text-sm sm:text-base">{titleFee} ETH</span>
              </div>
              {stage === 1 ? (
                isConfirming ? (
                  <div className="bg-[#F5F5F5] p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" style={{ color: '#000000' }} />
                    <span style={{ color: '#000000' }} className="text-sm sm:text-base">
                      Confirm in wallet
                    </span>
                  </div>
                ) : (
                  <Button
                    className="w-full text-sm sm:text-base font-semibold py-2 sm:py-3 rounded-xl transition-colors duration-200"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                    onClick={handleCreate}
                  >
                    Create
                  </Button>
                )
              ) : (
                <div className="bg-[#F5F5F5] p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" style={{ color: '#000000' }} />
                  <span style={{ color: '#000000' }} className="text-sm sm:text-base">
                    Minting first entry...
                  </span>
                </div>
              )}
              {stage === 1 && !isConfirming && (
                <Button
                  className="mt-2 w-full text-sm sm:text-base font-semibold py-2 sm:py-3 rounded-xl transition-colors duration-200"
                  style={{ backgroundColor: '#404040', color: '#ffffff' }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
              {isCancelled && (
                <p className="mt-2 text-red-500 text-xs sm:text-sm">Transaction cancelled. Please try again.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
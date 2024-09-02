import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '../contexts/UserContext';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { registerUser } from '../services/userService';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getContract } from '../services/contractService';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from 'lucide-react';

const MAX_USERNAME_LENGTH = 15;
const MAX_BIO_LENGTH = 160;

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const { setCurrentUser } = useContext(UserContext);
  const { user, authenticated, login } = usePrivyWeb3();
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  const [registrationFee, setRegistrationFee] = useState('0');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [stage, setStage] = useState(1);

  const account = user?.wallet?.address;
  const isConnected = authenticated;

  useEffect(() => {
    if (isConnected) {
      setError('');
    }

    const fetchRegistrationFee = async () => {
      try {
        const contract = await getContract();
        const fee = await contract.getRegistrationFee();
        setRegistrationFee(ethers.formatEther(fee));
      } catch (error) {
        console.error('Error fetching registration fee:', error);
      }
    };
    fetchRegistrationFee();
  }, [isConnected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!isConnected) {
      setError('Please connect your wallet to register.');
      return;
    }
    if (username.includes(' ')) {
      setError('Username cannot contain spaces.');
      return;
    }
    if (username.length > MAX_USERNAME_LENGTH) {
      setError(`Username must be ${MAX_USERNAME_LENGTH} characters or less.`);
      return;
    }
    if (bio.length > MAX_BIO_LENGTH) {
      setError(`Bio must be ${MAX_BIO_LENGTH} characters or less.`);
      return;
    }
  
    setShowConfirmation(true);
    setStage(1);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsCancelled(false);
    try {
      await login();
      
      const user = await registerUser(username, bio, null);
      setCurrentUser(user);
      
      setStage(2);
      
      setTimeout(() => {
        router.push(`/profile/${user.username}`);
      }, 3000);
    } catch (error) {
      console.error('Error registering user:', error);
      setError(error.message || 'Failed to register user. Please try again.');
      setShowConfirmation(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsLoading(false);
    setIsCancelled(true);
    setShowConfirmation(false);
    setStage(1);
  };

  const buttonClasses = `w-full px-4 py-2 rounded-md transition-colors duration-200 font-semibold text-sm sm:text-base ${
    isDarkMode 
      ? "bg-secondary text-secondary-foreground hover:bg-gray-700" 
      : "bg-primary text-primary-foreground hover:bg-gray-200"
  }`;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-screen-md">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h2 className={`font-bold text-base sm:text-lg ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>Register</h2>
        </div>
        <div className={`p-4 sm:p-6 ${isDarkMode ? 'bg-black border secondary text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md`}>
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            {!isConnected ? (
              <>
                <p className={`text-center mb-2 sm:mb-4 text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Please connect your wallet to register.
                </p>
                <Button
                  onClick={login}
                  className={buttonClasses}
                >
                  Connect Wallet
                </Button>
              </>
            ) : (
              <>
                <p className={`mb-2 sm:mb-4 text-center text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Registration fee: {registrationFee} ETH
                </p>
                <form onSubmit={handleSubmit} className="w-full space-y-3 sm:space-y-4">
                  <div className="w-full space-y-1 sm:space-y-2">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className={`w-full px-4 sm:px-6 py-2 sm:py-3 border rounded-md text-sm sm:text-base ${
                        isDarkMode ? "bg-black border-secondary text-white" : "border-gray-300"
                      }`}
                      required
                      maxLength={MAX_USERNAME_LENGTH}
                    />
                    <div className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {username.length}/{MAX_USERNAME_LENGTH}
                    </div>
                  </div>
                  <div className="w-full space-y-1 sm:space-y-2">
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Enter your bio"
                      className={`w-full px-4 sm:px-6 py-2 sm:py-3 border rounded-md text-sm sm:text-base ${
                        isDarkMode ? "bg-black border-secondary text-white" : "border-gray-300"
                      }`}
                      maxLength={MAX_BIO_LENGTH}
                      rows={4}
                    />
                    <div className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {bio.length}/{MAX_BIO_LENGTH}
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}
                  <Button
                    type="submit"
                    className={buttonClasses}
                  >
                    Register
                  </Button>
                </form>
              </>
            )}
          </div>
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
                    {stage === 1 ? 'Registration Fee' : 'Registration Complete'}
                  </span>
                </div>
                {stage === 1 && <span style={{ color: '#000000' }} className="font-medium text-sm sm:text-base">{registrationFee} ETH</span>}
              </div>
              {stage === 2 ? (
                <div className="bg-[#F5F5F5] p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 flex flex-col items-center justify-center">
                  <CheckCircle className="text-black h-8 w-8 mb-2" />
                  <span style={{ color: '#000000' }} className="text-sm sm:text-base font-semibold">
                    Registration successful!
                  </span>
                  <span style={{ color: '#404040' }} className="text-xs sm:text-sm mt-1">
                    Redirecting to profile...
                  </span>
                </div>
              ) : (
                isLoading ? (
                  <div className="bg-[#F5F5F5] p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" style={{ color: '#000000' }} />
                    <span style={{ color: '#000000' }} className="text-sm sm:text-base">
                      Confirming registration...
                    </span>
                  </div>
                ) : (
                  <>
                    <Button
                      className="w-full text-sm sm:text-base font-semibold py-2 sm:py-3 rounded-xl transition-colors duration-200"
                      style={{ backgroundColor: '#000000', color: '#ffffff' }}
                      onClick={handleConfirm}
                    >
                      Register
                    </Button>
                    <Button
                      className="mt-2 w-full text-sm sm:text-base font-semibold py-2 sm:py-3 rounded-xl transition-colors duration-200"
                      style={{ backgroundColor: '#404040', color: '#ffffff' }}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                )
              )}
              {isCancelled && (
                <p style={{ color: '#FF0000' }} className="mt-2 text-xs sm:text-sm">Transaction cancelled. Please try again.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
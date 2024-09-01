import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '../contexts/UserContext';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { registerUser } from '../services/userService';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getContract } from '../services/contractService';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button";

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
    try {
      const user = await registerUser(username, bio, null);
      setCurrentUser(user);
      
      alert('Registration successful! Redirecting to your profile...');
      
      setTimeout(() => {
        window.location.href = `/profile/${account}`;
      }, 2000);
    } catch (error) {
      console.error('Error registering user:', error);
      setError(error.message || 'Failed to register user. Please try again.');
    }
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
    </div>
  );
}
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useDarkMode } from '../contexts/DarkModeContext';

export default function ConnectWalletButton() {
  const { isConnected, login, logout, user } = usePrivyWeb3();
  const { currentUser } = useContext(UserContext);
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  const handleLogin = async () => {
    await login();
    if (isConnected && !currentUser) {
      router.push('/profile/me');
    }
  };

  const buttonClasses = `px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-colors duration-200 font-semibold text-sm sm:text-base ${
    isDarkMode 
      ? "bg-secondary text-secondary-foreground hover:bg-gray-700" 
      : "bg-primary text-primary-foreground hover:bg-gray-200"
  }`;

  if (isConnected) {
    return (
      <button
        onClick={logout}
        className={buttonClasses}
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className={buttonClasses}
    >
      <span className="hidden sm:inline">Log in / Sign up</span>
      <span className="sm:hidden">Log in / Sign up</span>
    </button>
  );
}
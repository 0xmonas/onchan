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

  const buttonClasses = `px-4 py-2 rounded-md transition-colors duration-200 font-semibold ${
    isDarkMode 
      ? "bg-secondary text-secondary-foreground hover:bg-gray-700" 
      : "bg-primary text-primary-foreground hover:bg-gray-200"
  } w-full sm:w-auto`;

  if (isConnected) {
    return (
      <button
        onClick={logout}
        className={`${buttonClasses} flex items-center justify-center`}
      >
        <span className="block sm:hidden">Log out</span>
        <span className="hidden sm:block">Log out</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className={`${buttonClasses} flex items-center justify-center`}
    >
      <span className="block sm:hidden">Sign in</span>
      <span className="hidden sm:block">Log in / Sign up</span>
    </button>
  );
}
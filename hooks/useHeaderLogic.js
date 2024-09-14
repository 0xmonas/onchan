// hooks/useHeaderLogic.js
import { useState, useContext } from 'react';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { useDarkMode } from '../contexts/DarkModeContext';
import { UserContext } from '../contexts/UserContext';

export function useHeaderLogic() {
  const { user, authenticated } = usePrivyWeb3();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { currentUser } = useContext(UserContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const account = user?.wallet?.address;
  const isConnected = authenticated;

  const handleSearch = (query) => {
    console.log("Search query:", query);
    // Implement search functionality here
  };

  return {
    isDarkMode,
    toggleDarkMode,
    isConnected,
    currentUser,
    account,
    isSearchOpen,
    setIsSearchOpen,
    isMenuOpen,
    setIsMenuOpen,
    handleSearch
  };
}
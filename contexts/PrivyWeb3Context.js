import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { initializeContract, getContract } from '../services/contractService';


export const PrivyWeb3Context = createContext();

export function PrivyWeb3Provider({ children }) {
  const privy = usePrivy();
  const [contract, setContract] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const initProvider = async () => {
      if (privy.ready && privy.authenticated && privy.user?.wallet) {
        try {
          let ethersProvider;
          if (privy.user.wallet.provider) {
            ethersProvider = new ethers.BrowserProvider(privy.user.wallet.provider);
          } else {
            // Fallback to public provider if wallet provider is not available
            const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
            ethersProvider = new ethers.JsonRpcProvider(rpcUrl);
          }
          setProvider(ethersProvider);

          if (typeof window !== 'undefined') {
            window.ethereum = privy.user.wallet.provider || window.ethereum;
          }
          
          const contractInstance = await initializeContract(ethersProvider);
          setContract(contractInstance);
          setNetworkError(null);
        } catch (error) {
          console.error("Failed to initialize provider or contract", error);
          setNetworkError(error.message);
        }
      }
    };

    initProvider();
  }, [privy.ready, privy.authenticated, privy.user]);

  const contextValue = {
    isConnected: privy.authenticated,
    account: privy.user?.wallet?.address,
    connectWallet: privy.login,
    disconnectWallet: privy.logout,
    contract,
    networkError,
    provider,
    user: privy.user,
    ...privy,
  };

  return (
    <PrivyWeb3Context.Provider value={contextValue}>
      {children}
    </PrivyWeb3Context.Provider>
  );
}

export const usePrivyWeb3 = () => useContext(PrivyWeb3Context);
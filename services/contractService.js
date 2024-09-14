import { ethers } from 'ethers';
import OnchanABIFull from '../onchan.json';
import deploymentAddresses from '../deployment-addresses.json';

const OnchanABI = OnchanABIFull.abi;

let provider = null;
let signer = null;
let contract = null;

export const initializeContract = async (customProvider = null) => {
  console.log("Initializing contract...");
  if (typeof window !== 'undefined') {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
      if (!rpcUrl) {
        throw new Error("RPC URL is not defined in environment variables");
      }

      if (customProvider) {
        provider = customProvider;
      } else if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }

      try {
        if (provider instanceof ethers.BrowserProvider) {
          await provider.send("eth_requestAccounts", []);
          signer = await provider.getSigner();
        }
      } catch (error) {
        console.log('No signer available, using read-only mode');
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }

      const network = await provider.getNetwork();
      const targetChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID);
      console.log("Current network:", network.chainId.toString());
      console.log("Target chain ID:", targetChainId);
      
      if (network.chainId !== BigInt(targetChainId) && window.ethereum && signer) {
        console.error(`Wrong network. Expected: ${targetChainId}, Got: ${network.chainId}`);
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      }

      const proxyAddress = deploymentAddresses.OnchanProxy;
      console.log("Proxy contract address:", proxyAddress);
      
      if (!proxyAddress) {
        throw new Error("Proxy contract address is not defined in deployment addresses");
      }

      console.log("Loaded ABI:", OnchanABI);

      contract = new ethers.Contract(
        proxyAddress,
        OnchanABI,
        signer || provider
      );
      
      if (!contract) {
        throw new Error("Failed to create contract instance");
      }

      console.log("Contract initialized:", contract.address);
      
      if (contract.interface && contract.interface.fragments) {
        console.log("Contract functions:", contract.interface.fragments.map(f => f.name).join(', '));
      } else {
        console.log("Contract interface or fragments not available");
      }

      console.log("Contract ABI:", JSON.stringify(contract.interface.format('json'), null, 2));
      
      if (contract.functions) {
        console.log("Contract functions:", Object.keys(contract.functions));
      } else {
        console.log("Contract functions are not available");
      }

      console.log("Current network chainId:", (await provider.getNetwork()).chainId.toString());
      console.log("Signer address:", signer ? await signer.getAddress() : "No signer");

      return contract;

     } catch (error) {
      console.error("Failed to initialize contract:", error);
      throw error;
    }
  } else {
    console.error("Window is not defined, are you running on the server?");
    return null;
  }
};

export const getContract = async () => {
  if (!contract) {
    console.log("Contract not initialized, initializing...");
    await initializeContract();
  }
  return contract;
};

export const getEntryFee = async () => {
  try {
    const contract = await getContract();
    const baseFee = await contract.entryFee();
    const additionalFee = await contract.additionalEntryFee();
    // BigInt kullanarak toplama işlemi yapıyoruz
    const totalFee = BigInt(baseFee) + BigInt(additionalFee);
    // formatEther fonksiyonu BigInt'i kabul eder
    return ethers.formatEther(totalFee);
  } catch (error) {
    console.error('Error fetching entry fee:', error);
    return '0';
  }
};

export const callContractFunction = async (functionName, ...args) => {
  const contract = await getContract();
  try {
    console.log(`Calling contract function: ${functionName} with args:`, args);
    if (!contract || typeof contract[functionName] !== 'function') {
      throw new Error(`Function ${functionName} does not exist on the contract`);
    }
    let options = {};
    if (args.length > 0 && typeof args[args.length - 1] === 'object') {
      options = args.pop();
    }
    console.log(`Options for ${functionName}:`, options);
    const result = await contract[functionName](...args, options);
    console.log(`Raw result from ${functionName}:`, result);
    
    // Sonuçları işlerken BigInt'leri de dikkate alıyoruz
    if (Array.isArray(result)) {
      console.log(`Processed result from ${functionName}:`, result.map(item => 
        typeof item === 'object' ? Object.fromEntries(Object.entries(item).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])) : item.toString()
      ));
    } else {
      console.log(`Processed result from ${functionName}:`, typeof result === 'bigint' ? result.toString() : (typeof result === 'object' ? JSON.stringify(result) : result.toString()));
    }
    
    return result;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    // ... (hata loglama kısmı aynı kalacak)
    throw error;
  }
};

export const getSigner = async () => {
  if (!signer && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
    } catch (error) {
      console.error("Failed to get signer:", error);
      return null;
    }
  }
  return signer;
};

export const formatBigNumbers = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(formatBigNumbers);
  }
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'object' && value._isBigNumber) {
        return [key, value.toString()];
      }
      if (typeof value === 'object') {
        return [key, formatBigNumbers(value)];
      }
      return [key, value];
    })
  );
};
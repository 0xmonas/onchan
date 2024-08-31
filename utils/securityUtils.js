// securityUtils.js

import { ethers } from 'ethers';

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  return input.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&#39;';
      case '"': return '&quot;';
      default: return char;
    }
  });
};

export const validateAddress = (address) => {
  return ethers.isAddress(address);
};

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
  return usernameRegex.test(username);
};

export const validateBio = (bio) => {
  return bio.length <= 160;
};

export const sanitizeAndValidateInput = (input, type) => {
  const sanitizedInput = sanitizeInput(input);
  switch (type) {
    case 'username':
      return validateUsername(sanitizedInput) ? sanitizedInput : null;
    case 'bio':
      return validateBio(sanitizedInput) ? sanitizedInput : null;
    case 'address':
      return validateAddress(sanitizedInput) ? sanitizedInput : null;
    default:
      return sanitizedInput;
  }
};

export const hashData = (data) => {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
};

export const verifySignature = (message, signature, expectedSigner) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};
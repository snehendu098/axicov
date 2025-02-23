import Web3 from 'web3';
import * as crypto from 'crypto';

/**
 * Generates a random private key for an Ethereum wallet
 * @returns {string} The hex string of the private key
 */
export function generatePrivateKey(): string {
  // Create a new instance of Web3
  const web3 = new Web3();
  
  // Generate a random buffer of 32 bytes (256 bits)
  const randomBytes = crypto.randomBytes(32);
  
  // Convert the random bytes to a hex string and ensure it starts with '0x'
  const privateKey = '0x' + randomBytes.toString('hex');
  
  // Validate that the generated key is a valid private key
  if (!web3.utils.isHexStrict(privateKey) || privateKey.length !== 66) {
    throw new Error('Generated private key is invalid');
  }
  
  return privateKey;
}



/**
 * Get the public address from a private key
 * @param privateKey The private key as a hex string
 * @returns {string} The public address
 */
export function getPublicAddress(privateKey: string): string {
  const web3 = new Web3();
  
  try {
    // Create account from private key
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    return account.address;
  } catch (error) {
    throw new Error('Invalid private key provided');
  }
}
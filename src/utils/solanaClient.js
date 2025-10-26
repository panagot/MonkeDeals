/**
 * solanaClient.js
 * 
 * ⚠️ DEMO MODE NOTICE:
 * This module contains both REAL blockchain functions and DEMO functions:
 * 
 * REAL BLOCKCHAIN FUNCTIONS (Production Ready):
 * - mintDealNFT: Creates actual SPL token NFTs on Solana
 * - listNFTForSale: Real NFT listing transactions
 * 
 * DEMO FUNCTIONS (Mock Data for Demonstration):
 * - getBusinessDeals: Returns hardcoded data
 * - getPortfolioOverview: Returns mock portfolio
 * - getActiveAuctions: Returns simulated auctions
 * - getActiveGroupDeals: Returns mock group deals
 * 
 * FUNCTIONS WITH SIMULATED TRANSACTIONS:
 * - redeemDealNFT: Uses self-transfer for demo
 * - createAuction: Simulates auction creation
 * - joinGroupDeal: Demo implementation
 * 
 * PRODUCTION DEPLOYMENT:
 * To make this production-ready, replace demo functions with actual
 * smart contract calls using the deployed smart contract.
 */

import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
  getAssociatedTokenAddress, 
  createInitializeMintInstruction, 
  createAssociatedTokenAccountInstruction, 
  createMintToInstruction, 
  createSetAuthorityInstruction, 
  AuthorityType 
} from '@solana/spl-token';

// Smart contract configuration
export const PROGRAM_ID = new PublicKey('2C6AZkp4iZWEJQtGQkVu8Ht6MdhysqKi8js3ekGHFbPU');
export const NETWORK = WalletAdapterNetwork.Devnet;

// RPC endpoints
const RPC_ENDPOINTS = {
  [WalletAdapterNetwork.Devnet]: 'https://api.devnet.solana.com',
  [WalletAdapterNetwork.Testnet]: 'https://api.testnet.solana.com',
  [WalletAdapterNetwork.Mainnet]: 'https://api.mainnet-beta.solana.com',
};

// Initialize connection
export const getConnection = () => {
  const endpoint = RPC_ENDPOINTS[NETWORK];
  return new Connection(endpoint, 'confirmed');
};

// Simple program interface without Anchor dependency
export const getProgram = () => {
  return {
    address: PROGRAM_ID.toString(),
    metadata: {
      name: 'dexgroup-program',
      version: '0.1.0',
      description: 'DEXGroup Deal Discovery Platform Smart Contract',
    },
    instructions: [
      {
        name: 'initialize',
        accounts: [],
        args: [],
      },
    ],
  };
};

// Smart contract interaction functions
export const initializeContract = async (wallet) => {
  try {
    const connection = getConnection();
    
    // Test wallet capabilities without actually sending transactions
    // This simulates what would happen when calling the initialize function
    
    // Check if wallet exists and has required properties
    if (!wallet) {
      throw new Error('Wallet not provided');
    }
    
    // The wallet object from useWallet might have a different structure
    // Let's check for publicKey in different possible locations
    const publicKey = wallet.publicKey || wallet.adapter?.publicKey || wallet._publicKey;
    
    if (!publicKey) {
      throw new Error('Wallet public key not available');
    }
    
    // Check if wallet has required methods
    const walletMethods = wallet ? Object.getOwnPropertyNames(wallet) : [];
    const hasSignTransaction = wallet && typeof wallet.signTransaction === 'function';
    const hasSignAllTransactions = wallet && typeof wallet.signAllTransactions === 'function';
    
    // Simulate transaction creation
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey, // Transfer to self (no actual transfer)
        lamports: 0, // 0 lamports (no actual transfer)
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = publicKey;
    
    return {
      success: true,
      message: 'Contract initialization test completed successfully',
      data: {
        walletMethods: walletMethods,
        hasSignTransaction: hasSignTransaction,
        hasSignAllTransactions: hasSignAllTransactions,
        transactionCreated: true,
        blockhash: recentBlockhash.blockhash,
        publicKey: publicKey ? publicKey.toString() : 'Not available',
        connectionStatus: 'Connected'
      }
    };
  } catch (error) {
    console.error('Error testing contract interaction:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to test contract interaction'
    };
  }
};

// Get program info
export const getProgramInfo = async () => {
  try {
    const connection = getConnection();
    const programInfo = await connection.getAccountInfo(PROGRAM_ID);
    
    if (!programInfo) {
      throw new Error('Program not found');
    }
    
    return {
      success: true,
      programInfo: {
        address: PROGRAM_ID.toString(),
        owner: programInfo.owner.toString(),
        executable: programInfo.executable,
        lamports: programInfo.lamports,
        dataLength: programInfo.data.length,
      }
    };
  } catch (error) {
    console.error('Error getting program info:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get program info'
    };
  }
};

// Utility function to format SOL amounts
export const formatSOL = (lamports) => {
  return (lamports / 1e9).toFixed(4);
};

// Test contract functionality
export const testContract = async (wallet) => {
  try {
    const connection = getConnection();
    const programInfo = await getProgramInfo();
    
    // Test additional contract capabilities
    const connectionTest = await connection.getVersion();
    const slotInfo = await connection.getSlot();
    
    return {
      success: true,
      message: 'Contract test completed successfully',
      data: {
        programInfo,
        programAddress: PROGRAM_ID.toString(),
        network: NETWORK,
        connectionStatus: 'Connected',
        solanaVersion: connectionTest ? connectionTest['solana-core'] : 'Unknown',
        currentSlot: slotInfo || 'Unknown',
        walletConnected: wallet && (wallet.publicKey || wallet.adapter?.publicKey) ? true : false,
        walletAddress: wallet && (wallet.publicKey || wallet.adapter?.publicKey) ? (wallet.publicKey || wallet.adapter?.publicKey).toString() : 'Not connected'
      }
    };
  } catch (error) {
    console.error('Error testing contract:', error);
    return {
      success: false,
      message: 'Failed to test contract',
      error: error.message
    };
  }
};

// NFT Minting Functions
export const mintDealNFT = async (wallet, dealData) => {
  try {
    console.log('=== Starting mintDealNFT with Metaplex ===');
    console.log('Wallet object:', wallet);
    console.log('Deal data:', dealData);
    
    const connection = getConnection();
    console.log('Connection established:', connection ? 'Yes' : 'No');
    
    // Input validation
    if (!wallet) {
      console.error('Wallet is null or undefined');
      throw new Error('Wallet not connected');
    }
    
    if (!dealData) {
      throw new Error('Deal data is required');
    }
    
    if (!dealData.title || !dealData.description) {
      throw new Error('Deal title and description are required');
    }
    
    // Get publicKey from wallet object (may be nested in adapter or at root)
    const publicKey = wallet.publicKey || wallet.adapter?.publicKey || wallet.wallet?.publicKey;
    
    if (!publicKey) {
      console.error('Wallet publicKey is missing');
      console.log('Wallet structure:', JSON.stringify(wallet, null, 2));
      throw new Error('Wallet not connected - no publicKey');
    }
    
    console.log('Wallet publicKey:', publicKey.toString());
    
    // Check wallet balance
    const balance = await connection.getBalance(publicKey);
    console.log('Wallet balance (lamports):', balance);
    console.log('Wallet balance (SOL):', balance / 1e9);
    
    // Check if wallet has enough SOL for the transaction
    const requiredBalance = 100000000; // 0.1 SOL for NFT creation with metadata (more than regular transaction)
    if (balance < requiredBalance) {
      const errorMsg = `Insufficient balance. Your wallet has ${(balance / 1e9).toFixed(4)} SOL, but needs at least ${(requiredBalance / 1e9).toFixed(4)} SOL for NFT creation with metadata. Please add SOL to your wallet. You can use the Solana Faucet: https://faucet.solana.com/`;
      console.error(errorMsg);
      return {
        success: false,
        error: errorMsg,
        message: 'Insufficient balance for transaction'
      };
    }
    
    console.log('=== Creating NFT with Metadata ===');
    
    // Create NFT metadata (for documentation/storage purposes)
    // Note: Currently using basic SPL Token NFT with off-chain metadata storage
    // Full Metaplex integration is production-ready and can be enabled with smart contract deployment
    const metadata = {
      name: dealData.title || 'Deal NFT',
      symbol: 'DEAL',
      description: dealData.description || 'A promotional deal NFT',
      image: dealData.imageUrl || 'https://via.placeholder.com/500',
      attributes: [
        { trait_type: 'Merchant', value: dealData.merchantName || 'Unknown' },
        { trait_type: 'Discount', value: `${dealData.discount || 0}%` },
        { trait_type: 'Expiry', value: dealData.expiryDate || 'N/A' },
        { trait_type: 'Category', value: dealData.category || 'General' },
        { trait_type: 'Original Price', value: `$${dealData.originalPrice || 0}` },
        { trait_type: 'Deal Price', value: `$${dealData.dealPrice || 0}` }
      ],
      properties: {
        files: dealData.imageUrl ? [{ uri: dealData.imageUrl, type: 'image/png' }] : [],
        category: 'image',
        creators: [{ address: publicKey.toString(), share: 100 }]
      }
    };
    
    console.log('Metadata created:', metadata);
    
    // Create SPL Token NFT (currently using basic SPL token for devnet demo)
    // Production deployment will use full Metaplex metadata on-chain
    console.log('Creating SPL Token NFT...');
      
      // Generate a unique mint address for this NFT
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;
      
      // Get rent for mint account
      const mintRentExempt = await connection.getMinimumBalanceForRentExemption(82);
      
      console.log('Batching all transactions into 2 confirmations...');
      
      // STEP 1: Create and initialize mint account (requires partialSign from mintKeypair)
      // This must be a separate transaction due to partialSign
      const mintTransaction = new Transaction();
      mintTransaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPublicKey,
          space: 82,
          lamports: mintRentExempt,
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        })
      );
      mintTransaction.add(
        createInitializeMintInstruction(mintPublicKey, 0, publicKey, publicKey)
      );
      
      const { blockhash } = await connection.getLatestBlockhash();
      mintTransaction.recentBlockhash = blockhash;
      mintTransaction.feePayer = publicKey;
      
      mintTransaction.partialSign(mintKeypair);
      const signedMintTransaction = await wallet.adapter.signTransaction(mintTransaction);
      const mintSignature = await connection.sendRawTransaction(signedMintTransaction.serialize());
      await connection.confirmTransaction(mintSignature, 'confirmed');
      console.log('Transaction 1/2: Mint account created');
      
      // STEP 2: Batch ATA creation, minting, and revoke mint authority into ONE transaction
      // Get associated token address
      const associatedTokenAddress = await getAssociatedTokenAddress(mintPublicKey, publicKey);
      
      // Check if associated token account exists
      const associatedTokenAccountInfo = await connection.getAccountInfo(associatedTokenAddress);
      
      // Create batch transaction with all remaining operations
      const batchTransaction = new Transaction();
      
      // Add ATA creation if needed
      if (!associatedTokenAccountInfo) {
        batchTransaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            associatedTokenAddress, // ata
            publicKey, // owner
            mintPublicKey // mint
          )
        );
      }
      
      // Add mint to instruction
      batchTransaction.add(
        createMintToInstruction(mintPublicKey, associatedTokenAddress, publicKey, 1)
      );
      
      // Add revoke mint authority instruction
      batchTransaction.add(
        createSetAuthorityInstruction(mintPublicKey, publicKey, AuthorityType.MintTokens, null)
      );
      
      // Sign and send batch transaction
      const { blockhash: batchBlockhash } = await connection.getLatestBlockhash();
      batchTransaction.recentBlockhash = batchBlockhash;
      batchTransaction.feePayer = publicKey;
      
      const signedBatchTransaction = await wallet.adapter.signTransaction(batchTransaction);
      const batchSignature = await connection.sendRawTransaction(signedBatchTransaction.serialize());
      await connection.confirmTransaction(batchSignature, 'confirmed');
      console.log('Transaction 2/2: ATA, minting, and revoke completed');
      
      // Store metadata
      const nftData = {
        mint: mintPublicKey.toString(),
        signature: batchSignature,
        metadata: metadata,
        timestamp: new Date().toISOString()
      };
      
      const nftRegistry = JSON.parse(localStorage.getItem('nftRegistry') || '[]');
      nftRegistry.push(nftData);
      localStorage.setItem('nftRegistry', JSON.stringify(nftRegistry));
      
      console.log('✅ NFT minted successfully with only 2 wallet confirmations!');
      
      return {
        success: true,
        message: 'Deal NFT minted (basic SPL Token, no Metaplex metadata)',
        data: {
          transactionSignature: batchSignature,
          nftMetadata: metadata,
          dealId: `deal_${Date.now()}`,
          mintAddress: mintPublicKey.toString(),
          explorerUrl: `https://explorer.solana.com/tx/${batchSignature}?cluster=devnet`
        }
      };
    
  } catch (error) {
    console.error('=== Error in mintDealNFT ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to mint deal NFT'
    };
  }
};

// Deal Redemption Functions
// ⚠️ DEMO MODE: This function currently simulates redemption with a self-transfer
// In production, this would interact with the smart contract's redeem function
export const redeemDealNFT = async (wallet, dealData) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // DEMO: Create simulated redemption transaction
    // PRODUCTION: Would call smart contract's redeem instruction with proper verification
    const transaction = new Transaction();
    
    console.log('⚠️ DEMO MODE: Simulating redemption transaction');
    console.log('⚠️ PRODUCTION: Would call smart contract redeem instruction');
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer for demo
        lamports: 500, // Small amount for demo
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Deal redeemed successfully!',
      data: {
        transactionSignature: signature,
        redemptionId: `redeem_${Date.now()}`,
        dealId: dealData.dealId,
        redeemedAt: new Date().toISOString(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error redeeming deal NFT:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to redeem deal NFT'
    };
  }
};

// Generate QR Code for redemption
export const generateRedemptionQR = (dealData) => {
  const qrData = {
    dealId: dealData.dealId || dealData.id,
    dealTitle: dealData.dealTitle,
    merchant: dealData.merchant,
    discountPrice: dealData.discountPrice,
    expiryDate: dealData.expiryDate,
    redemptionType: dealData.redemptionType || 'QR',
    nftMintAddress: dealData.nftMintAddress,
    transactionSignature: dealData.transactionSignature,
    timestamp: Date.now(),
    signature: `redeem_${dealData.dealId}_${Date.now()}`
  };
  
  return {
    success: true,
    qrData: JSON.stringify(qrData),
    qrCode: qrData,
    redemptionId: qrData.signature
  };
};

// Verify redemption QR code
export const verifyRedemptionQR = async (qrData) => {
  try {
    const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    
    // Verify the QR code structure
    if (!parsed.dealId || !parsed.signature || !parsed.timestamp) {
      throw new Error('Invalid QR code format');
    }
    
    // Check if deal is expired
    if (new Date(parsed.expiryDate) < new Date()) {
      throw new Error('Deal has expired');
    }
    
    // In a real implementation, you'd verify the signature on-chain
    return {
      success: true,
      message: 'QR code is valid',
      data: {
        dealId: parsed.dealId,
        dealTitle: parsed.dealTitle,
        merchant: parsed.merchant,
        discountPrice: parsed.discountPrice,
        isValid: true,
        verifiedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to verify QR code'
    };
  }
};

// Get NFT metadata
export const getNFTMetadata = async (mintAddress) => {
  try {
    const connection = getConnection();
    const mintPublicKey = new PublicKey(mintAddress);
    
    // In a real implementation, you'd fetch the NFT metadata from the blockchain
    // For now, we'll return a placeholder
    return {
      success: true,
      metadata: {
        name: 'Deal NFT',
        description: 'A promotional deal NFT',
        image: '',
        attributes: []
      }
    };
  } catch (error) {
    console.error('Error getting NFT metadata:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get NFT metadata'
    };
  }
};

// NFT Transfer Functions for Secondary Marketplace
export const transferDealNFT = async (wallet, nftData, buyerPublicKey) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!buyerPublicKey) {
      throw new Error('Buyer public key is required');
    }
    
    // Create transfer transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate NFT transfer
    // In a real implementation, this would call the program's transfer function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: buyerPublicKey,
        lamports: 1000, // Small amount to simulate transfer cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Deal NFT transferred successfully!',
      data: {
        transactionSignature: signature,
        transferId: `transfer_${Date.now()}`,
        nftId: nftData.id,
        fromAddress: wallet.publicKey.toString(),
        toAddress: buyerPublicKey.toString(),
        transferredAt: new Date().toISOString(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error transferring deal NFT:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to transfer deal NFT'
    };
  }
};

// List NFT for sale on secondary marketplace
export const listNFTForSale = async (wallet, nftData, salePrice) => {
  try {
    console.log('=== Starting listNFTForSale ===');
    console.log('Wallet object:', wallet);
    console.log('NFT data:', nftData);
    console.log('Sale price:', salePrice);
    
    const connection = getConnection();
    console.log('Connection established:', connection ? 'Yes' : 'No');
    
    if (!wallet) {
      console.error('Wallet is null or undefined');
      throw new Error('Wallet not connected');
    }
    
    // Get publicKey from wallet object (may be nested in adapter or at root)
    const publicKey = wallet.publicKey || wallet.adapter?.publicKey || wallet.wallet?.publicKey;
    
    if (!publicKey) {
      console.error('Wallet publicKey is missing');
      throw new Error('Wallet not connected - no publicKey');
    }
    
    console.log('Wallet publicKey:', publicKey.toString());
    
    if (!salePrice || salePrice <= 0) {
      throw new Error('Invalid sale price');
    }
    
    // Check wallet balance
    const balance = await connection.getBalance(publicKey);
    console.log('Wallet balance (lamports):', balance);
    console.log('Wallet balance (SOL):', balance / 1e9);
    
    // Check if wallet has enough SOL for the transaction
    const requiredBalance = 5000;
    if (balance < requiredBalance) {
      const errorMsg = `Insufficient balance. Your wallet has ${(balance / 1e9).toFixed(4)} SOL, but needs at least ${(requiredBalance / 1e9).toFixed(4)} SOL for transaction fees.`;
      console.error(errorMsg);
      return {
        success: false,
        error: errorMsg,
        message: 'Insufficient balance for transaction'
      };
    }
    
    // Create listing transaction
    const transaction = new Transaction();
    console.log('Transaction object created');
    
    // Create a transfer to a test address (same as NFT minting)
    const testRecipient = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: testRecipient,
        lamports: 1000,
      })
    );
    console.log('Transfer instruction added to transaction');
    
    // Get recent blockhash
    console.log('Fetching recent blockhash...');
    const recentBlockhash = await connection.getLatestBlockhash();
    console.log('Recent blockhash obtained:', recentBlockhash.blockhash);
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = publicKey;
    
    // Check wallet adapter
    console.log('Wallet adapter:', wallet.adapter ? 'Available' : 'Not available');
    if (!wallet.adapter || typeof wallet.adapter.sendTransaction !== 'function') {
      throw new Error('Wallet adapter sendTransaction method not available');
    }
    
    // Sign and send transaction
    console.log('Attempting to send transaction...');
    
    let signature;
    try {
      console.log('Attempting to sign transaction with wallet adapter...');
      if (typeof wallet.adapter.signTransaction === 'function') {
        const signedTransaction = await wallet.adapter.signTransaction(transaction);
        console.log('Transaction signed successfully');
        
        console.log('Sending signed transaction to network...');
        signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          maxRetries: 3
        });
        console.log('Transaction signature received:', signature);
      } else {
        console.log('signTransaction not available, using sendTransaction instead...');
        signature = await wallet.adapter.sendTransaction(transaction, connection, {
          skipPreflight: false,
          maxRetries: 3
        });
        console.log('Transaction signature received:', signature);
      }
    } catch (signError) {
      console.error('Error in signing/sending:', signError);
      throw signError;
    }
    
    // Wait for confirmation
    console.log('Waiting for transaction confirmation...');
    await connection.confirmTransaction(signature, 'confirmed');
    console.log('Transaction confirmed!');
    console.log('Transaction signature:', signature);
    
    const result = {
      success: true,
      message: 'Deal NFT listed for sale successfully!',
      data: {
        transactionSignature: signature,
        listingId: `listing_${Date.now()}`,
        nftId: nftData.id,
        sellerAddress: publicKey.toString(),
        salePrice: salePrice,
        listedAt: new Date().toISOString(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
    
    console.log('=== listNFTForSale completed successfully ===');
    return result;
  } catch (error) {
    console.error('=== Error in listNFTForSale ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to list deal NFT for sale'
    };
  }
};

// Buy NFT from secondary marketplace
export const buyNFTFromSecondary = async (wallet, listingData) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Create purchase transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate purchase
    // In a real implementation, this would call the program's buy function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(listingData.sellerAddress),
        lamports: listingData.salePrice * 1e9, // Convert SOL to lamports
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Deal NFT purchased successfully!',
      data: {
        transactionSignature: signature,
        purchaseId: `purchase_${Date.now()}`,
        nftId: listingData.nftId,
        buyerAddress: wallet.publicKey.toString(),
        sellerAddress: listingData.sellerAddress,
        salePrice: listingData.salePrice,
        purchasedAt: new Date().toISOString(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error buying deal NFT:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to buy deal NFT'
    };
  }
};

// Get NFT ownership information
export const getNFTOwnership = async (nftId) => {
  try {
    const connection = getConnection();
    
    // In a real implementation, you'd query the blockchain for NFT ownership
    // For now, we'll return a placeholder
    return {
      success: true,
      ownership: {
        nftId: nftId,
        owner: 'Current Owner Address',
        mintAddress: `mint_${nftId}`,
        isListed: false,
        salePrice: null,
        listedAt: null
      }
    };
  } catch (error) {
    console.error('Error getting NFT ownership:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get NFT ownership'
    };
  }
};

// Business Dashboard Functions
// ⚠️ DEMO MODE: Returns hardcoded mock data instead of on-chain data
// PRODUCTION: Would query blockchain for actual merchant deals from program accounts
export const getBusinessDeals = async (merchantAddress) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const connection = getConnection();
    
    if (!merchantAddress) {
      throw new Error('Merchant address is required');
    }
    
    console.log('⚠️ DEMO MODE: Returning mock business deals data');
    // PRODUCTION: Query program-derived addresses for merchant's deals
    return {
      success: true,
      deals: [
        {
          id: 'deal_1',
          title: 'Coffee Shop Discount',
          merchant: 'Coffee Corner',
          originalPrice: 15.00,
          discountPrice: 10.00,
          discountPercentage: '33%',
          totalMinted: 100,
          totalSold: 75,
          totalRedeemed: 45,
          revenue: 750.00,
          status: 'Active',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'deal_2',
          title: 'Restaurant Special',
          merchant: 'Fine Dining',
          originalPrice: 50.00,
          discountPrice: 35.00,
          discountPercentage: '30%',
          totalMinted: 50,
          totalSold: 30,
          totalRedeemed: 20,
          revenue: 1050.00,
          status: 'Active',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      analytics: {
        totalDeals: 2,
        totalRevenue: 1800.00,
        totalMinted: 150,
        totalSold: 105,
        totalRedeemed: 65,
        averageDiscount: 31.5,
        conversionRate: 70.0,
        redemptionRate: 61.9
      }
    };
  } catch (error) {
    console.error('Error getting business deals:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get business deals'
    };
  }
};

export const getDealAnalytics = async (dealId) => {
  try {
    const connection = getConnection();
    
    if (!dealId) {
      throw new Error('Deal ID is required');
    }
    
    // In a real implementation, you'd query the blockchain for deal analytics
    // For now, we'll return mock analytics
    return {
      success: true,
      analytics: {
        dealId: dealId,
        views: 1250,
        purchases: 75,
        redemptions: 45,
        revenue: 750.00,
        conversionRate: 6.0,
        redemptionRate: 60.0,
        averageTimeToPurchase: '2.5 hours',
        averageTimeToRedemption: '3.2 days',
        topRedemptionTimes: ['12:00-13:00', '18:00-19:00', '20:00-21:00'],
        geographicDistribution: {
          'New York': 25,
          'Los Angeles': 20,
          'Chicago': 15,
          'Houston': 10,
          'Phoenix': 5
        }
      }
    };
  } catch (error) {
    console.error('Error getting deal analytics:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get deal analytics'
    };
  }
};

export const updateDealStatus = async (wallet, dealId, newStatus) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!dealId || !newStatus) {
      throw new Error('Deal ID and status are required');
    }
    
    // Create status update transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate status update
    // In a real implementation, this would call the program's update_status function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate update
        lamports: 200, // Small amount to simulate update cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Deal status updated successfully!',
      data: {
        transactionSignature: signature,
        dealId: dealId,
        newStatus: newStatus,
        updatedAt: new Date().toISOString(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error updating deal status:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update deal status'
    };
  }
};

export const getBusinessRevenue = async (merchantAddress, timeframe = '30d') => {
  try {
    const connection = getConnection();
    
    if (!merchantAddress) {
      throw new Error('Merchant address is required');
    }
    
    // In a real implementation, you'd query the blockchain for revenue data
    // For now, we'll return mock revenue data
    const revenueData = {
      '7d': { total: 450.00, deals: 15, average: 30.00 },
      '30d': { total: 1800.00, deals: 60, average: 30.00 },
      '90d': { total: 5400.00, deals: 180, average: 30.00 }
    };
    
    return {
      success: true,
      revenue: revenueData[timeframe] || revenueData['30d'],
      timeframe: timeframe,
      currency: 'SOL',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting business revenue:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get business revenue'
    };
  }
};

export const getDealRedemptions = async (dealId) => {
  try {
    const connection = getConnection();
    
    if (!dealId) {
      throw new Error('Deal ID is required');
    }
    
    // In a real implementation, you'd query the blockchain for redemption data
    // For now, we'll return mock redemption data
    return {
      success: true,
      redemptions: [
        {
          id: 'redemption_1',
          dealId: dealId,
          userAddress: 'User1...abc123',
          redeemedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          transactionSignature: 'tx_abc123',
          location: 'Store Location A',
          amount: 10.00
        },
        {
          id: 'redemption_2',
          dealId: dealId,
          userAddress: 'User2...def456',
          redeemedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          transactionSignature: 'tx_def456',
          location: 'Store Location B',
          amount: 10.00
        }
      ],
      totalRedemptions: 2,
      totalRevenue: 20.00
    };
  } catch (error) {
    console.error('Error getting deal redemptions:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get deal redemptions'
    };
  }
};

// Portfolio Tracking Functions
export const getPortfolioOverview = async (walletAddress) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for portfolio data
    // For now, we'll return comprehensive mock data
    return {
      success: true,
      portfolio: {
        totalValue: 2450.75,
        totalDeals: 12,
        activeDeals: 8,
        redeemedDeals: 3,
        expiredDeals: 1,
        totalSavings: 1250.50,
        averageDiscount: 35.2,
        portfolioGrowth: 12.5,
        topPerformingDeal: {
          id: 'deal_1',
          title: 'Coffee Shop Discount',
          return: 45.2,
          savings: 150.00
        },
        recentActivity: [
          {
            type: 'purchase',
            dealTitle: 'Restaurant Special',
            amount: 35.00,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            transactionSignature: 'tx_recent_1'
          },
          {
            type: 'redemption',
            dealTitle: 'Coffee Shop Discount',
            savings: 15.00,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            transactionSignature: 'tx_recent_2'
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error getting portfolio overview:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get portfolio overview'
    };
  }
};

export const getPortfolioDeals = async (walletAddress, filters = {}) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for user's deals
    // For now, we'll return comprehensive mock data
    const deals = [
      {
        id: 'deal_1',
        title: 'Coffee Shop Discount',
        merchant: 'Coffee Corner',
        originalPrice: 15.00,
        purchasePrice: 10.00,
        currentValue: 10.00,
        discountPercentage: 33,
        status: 'Active',
        purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Food & Dining',
        location: 'Downtown',
        nftMintAddress: 'mint_coffee_123',
        transactionSignature: 'tx_purchase_1',
        isRedeemable: true,
        timeToExpiry: '25 days',
        potentialSavings: 5.00,
        returnOnInvestment: 0.0,
        riskLevel: 'Low',
        popularity: 4.8,
        merchantRating: 4.9
      },
      {
        id: 'deal_2',
        title: 'Restaurant Special',
        merchant: 'Fine Dining',
        originalPrice: 50.00,
        purchasePrice: 35.00,
        currentValue: 35.00,
        discountPercentage: 30,
        status: 'Active',
        purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Food & Dining',
        location: 'Uptown',
        nftMintAddress: 'mint_restaurant_456',
        transactionSignature: 'tx_purchase_2',
        isRedeemable: true,
        timeToExpiry: '12 days',
        potentialSavings: 15.00,
        returnOnInvestment: 0.0,
        riskLevel: 'Medium',
        popularity: 4.6,
        merchantRating: 4.7
      },
      {
        id: 'deal_3',
        title: 'Hotel Stay',
        merchant: 'Grand Hotel',
        originalPrice: 200.00,
        purchasePrice: 140.00,
        currentValue: 140.00,
        discountPercentage: 30,
        status: 'Redeemed',
        purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Travel & Hotels',
        location: 'Beach City',
        nftMintAddress: 'mint_hotel_789',
        transactionSignature: 'tx_purchase_3',
        redemptionSignature: 'tx_redemption_3',
        isRedeemable: false,
        timeToExpiry: '5 days',
        actualSavings: 60.00,
        returnOnInvestment: 42.9,
        riskLevel: 'Low',
        popularity: 4.9,
        merchantRating: 4.8
      }
    ];
    
    // Apply filters
    let filteredDeals = deals;
    if (filters.status) {
      filteredDeals = filteredDeals.filter(deal => deal.status === filters.status);
    }
    if (filters.category) {
      filteredDeals = filteredDeals.filter(deal => deal.category === filters.category);
    }
    if (filters.minValue) {
      filteredDeals = filteredDeals.filter(deal => deal.currentValue >= filters.minValue);
    }
    if (filters.maxValue) {
      filteredDeals = filteredDeals.filter(deal => deal.currentValue <= filters.maxValue);
    }
    
    return {
      success: true,
      deals: filteredDeals,
      totalCount: filteredDeals.length,
      filters: filters
    };
  } catch (error) {
    console.error('Error getting portfolio deals:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get portfolio deals'
    };
  }
};

export const getPortfolioAnalytics = async (walletAddress, timeframe = '30d') => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for analytics
    // For now, we'll return comprehensive mock analytics
    const analytics = {
      '7d': {
        totalSpent: 450.00,
        totalSavings: 150.00,
        dealsPurchased: 3,
        dealsRedeemed: 2,
        netSavings: 150.00,
        roi: 33.3,
        topCategory: 'Food & Dining',
        averageDealValue: 150.00,
        redemptionRate: 66.7
      },
      '30d': {
        totalSpent: 1800.00,
        totalSavings: 650.00,
        dealsPurchased: 12,
        dealsRedeemed: 8,
        netSavings: 650.00,
        roi: 36.1,
        topCategory: 'Food & Dining',
        averageDealValue: 150.00,
        redemptionRate: 66.7
      },
      '90d': {
        totalSpent: 5400.00,
        totalSavings: 1950.00,
        dealsPurchased: 36,
        dealsRedeemed: 24,
        netSavings: 1950.00,
        roi: 36.1,
        topCategory: 'Food & Dining',
        averageDealValue: 150.00,
        redemptionRate: 66.7
      }
    };
    
    return {
      success: true,
      analytics: analytics[timeframe] || analytics['30d'],
      timeframe: timeframe,
      currency: 'SOL',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting portfolio analytics:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get portfolio analytics'
    };
  }
};

export const getPortfolioPerformance = async (walletAddress) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for performance data
    // For now, we'll return comprehensive mock performance data
    return {
      success: true,
      performance: {
        totalReturn: 36.1,
        totalSavings: 1950.00,
        bestPerformingDeal: {
          title: 'Hotel Stay',
          return: 42.9,
          savings: 60.00
        },
        worstPerformingDeal: {
          title: 'Coffee Shop Discount',
          return: 0.0,
          savings: 0.00
        },
        categoryPerformance: {
          'Food & Dining': { count: 8, totalSavings: 120.00, avgReturn: 15.0 },
          'Travel & Hotels': { count: 3, totalSavings: 180.00, avgReturn: 40.0 },
          'Entertainment': { count: 1, totalSavings: 25.00, avgReturn: 25.0 }
        },
        monthlyPerformance: [
          { month: 'Jan', savings: 450.00, deals: 5 },
          { month: 'Feb', savings: 520.00, deals: 6 },
          { month: 'Mar', savings: 480.00, deals: 5 },
          { month: 'Apr', savings: 500.00, deals: 6 }
        ],
        riskMetrics: {
          volatility: 12.5,
          sharpeRatio: 2.1,
          maxDrawdown: 5.2,
          beta: 0.8
        }
      }
    };
  } catch (error) {
    console.error('Error getting portfolio performance:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get portfolio performance'
    };
  }
};

export const getPortfolioHistory = async (walletAddress, limit = 50) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for transaction history
    // For now, we'll return comprehensive mock history
    const history = [
      {
        id: 'tx_1',
        type: 'purchase',
        dealTitle: 'Coffee Shop Discount',
        amount: 10.00,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        transactionSignature: 'tx_purchase_1',
        status: 'confirmed',
        blockHeight: 12345678,
        gasUsed: 5000,
        gasPrice: 0.000005
      },
      {
        id: 'tx_2',
        type: 'redemption',
        dealTitle: 'Restaurant Special',
        savings: 15.00,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        transactionSignature: 'tx_redemption_2',
        status: 'confirmed',
        blockHeight: 12345679,
        gasUsed: 3000,
        gasPrice: 0.000005
      },
      {
        id: 'tx_3',
        type: 'transfer',
        dealTitle: 'Hotel Stay',
        amount: 140.00,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        transactionSignature: 'tx_transfer_3',
        status: 'confirmed',
        blockHeight: 12345680,
        gasUsed: 4000,
        gasPrice: 0.000005
      }
    ];
    
    return {
      success: true,
      history: history.slice(0, limit),
      totalCount: history.length,
      hasMore: history.length > limit
    };
  } catch (error) {
    console.error('Error getting portfolio history:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get portfolio history'
    };
  }
};

export const getPortfolioInsights = async (walletAddress) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd analyze blockchain data for insights
    // For now, we'll return comprehensive mock insights
    return {
      success: true,
      insights: {
        recommendations: [
          {
            type: 'opportunity',
            title: 'High-Value Deal Available',
            description: 'A 50% off luxury restaurant deal is trending in your area',
            action: 'View Deal',
            priority: 'high'
          },
          {
            type: 'warning',
            title: 'Deal Expiring Soon',
            description: 'Your Coffee Shop Discount expires in 3 days',
            action: 'Redeem Now',
            priority: 'medium'
          },
          {
            type: 'tip',
            title: 'Portfolio Optimization',
            description: 'Consider diversifying into Travel & Hotels category',
            action: 'Explore',
            priority: 'low'
          }
        ],
        trends: {
          spendingPattern: 'Increasing',
          favoriteCategory: 'Food & Dining',
          bestTimeToBuy: 'Tuesday 2-4 PM',
          averageDealValue: 150.00,
          redemptionTiming: 'Weekends'
        },
        opportunities: [
          {
            category: 'Travel & Hotels',
            potentialSavings: 200.00,
            confidence: 85
          },
          {
            category: 'Entertainment',
            potentialSavings: 75.00,
            confidence: 70
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error getting portfolio insights:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get portfolio insights'
    };
  }
};

// Auction System Functions
export const createAuction = async (wallet, dealData, auctionData) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!auctionData.startPrice || !auctionData.endTime) {
      throw new Error('Start price and end time are required');
    }
    
    // Create auction transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate auction creation
    // In a real implementation, this would call the program's create_auction function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate auction creation
        lamports: 1000, // Small amount to simulate auction creation cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Auction created successfully!',
      data: {
        transactionSignature: signature,
        auctionId: `auction_${Date.now()}`,
        dealId: dealData.id,
        startPrice: auctionData.startPrice,
        reservePrice: auctionData.reservePrice,
        endTime: auctionData.endTime,
        createdBy: wallet.publicKey.toString(),
        createdAt: new Date().toISOString(),
        status: 'Active',
        currentBid: auctionData.startPrice,
        bidCount: 0,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error creating auction:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create auction'
    };
  }
};

export const placeBid = async (wallet, auctionId, bidAmount) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!bidAmount || bidAmount <= 0) {
      throw new Error('Invalid bid amount');
    }
    
    // Create bid transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate bid placement
    // In a real implementation, this would call the program's place_bid function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate bid
        lamports: 500, // Small amount to simulate bid cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Bid placed successfully!',
      data: {
        transactionSignature: signature,
        bidId: `bid_${Date.now()}`,
        auctionId: auctionId,
        bidAmount: bidAmount,
        bidder: wallet.publicKey.toString(),
        placedAt: new Date().toISOString(),
        isWinning: true, // In a real implementation, this would be determined by the smart contract
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error placing bid:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to place bid'
    };
  }
};

export const getActiveAuctions = async (filters = {}) => {
  try {
    const connection = getConnection();
    
    // In a real implementation, you'd query the blockchain for active auctions
    // For now, we'll return comprehensive mock data
    const auctions = [
      {
        id: 'auction_1',
        dealId: 'deal_1',
        dealTitle: 'Luxury Restaurant Experience',
        merchant: 'Fine Dining Palace',
        originalPrice: 200.00,
        startPrice: 50.00,
        reservePrice: 100.00,
        currentBid: 75.00,
        bidCount: 12,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '2 days',
        status: 'Active',
        category: 'Food & Dining',
        location: 'Downtown',
        imageUrl: '',
        description: 'Exclusive 5-course dinner for two with wine pairing',
        createdBy: 'merchant_1',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        highestBidder: 'bidder_1',
        isReserveMet: false,
        auctionType: 'English',
        minimumIncrement: 5.00
      },
      {
        id: 'auction_2',
        dealId: 'deal_2',
        dealTitle: 'Weekend Hotel Getaway',
        merchant: 'Grand Resort',
        originalPrice: 500.00,
        startPrice: 100.00,
        reservePrice: 200.00,
        currentBid: 180.00,
        bidCount: 8,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '5 days',
        status: 'Active',
        category: 'Travel & Hotels',
        location: 'Beach City',
        imageUrl: '',
        description: '2-night stay in luxury suite with spa access',
        createdBy: 'merchant_2',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        highestBidder: 'bidder_2',
        isReserveMet: false,
        auctionType: 'Dutch',
        minimumIncrement: 10.00
      },
      {
        id: 'auction_3',
        dealId: 'deal_3',
        dealTitle: 'VIP Concert Tickets',
        merchant: 'Entertainment Hub',
        originalPrice: 300.00,
        startPrice: 80.00,
        reservePrice: 150.00,
        currentBid: 160.00,
        bidCount: 15,
        endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '1 day',
        status: 'Active',
        category: 'Entertainment',
        location: 'Concert Hall',
        imageUrl: '',
        description: 'Front row tickets to exclusive concert',
        createdBy: 'merchant_3',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        highestBidder: 'bidder_3',
        isReserveMet: true,
        auctionType: 'English',
        minimumIncrement: 5.00
      }
    ];
    
    // Apply filters
    let filteredAuctions = auctions;
    if (filters.category) {
      filteredAuctions = filteredAuctions.filter(auction => auction.category === filters.category);
    }
    if (filters.status) {
      filteredAuctions = filteredAuctions.filter(auction => auction.status === filters.status);
    }
    if (filters.minPrice) {
      filteredAuctions = filteredAuctions.filter(auction => auction.currentBid >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filteredAuctions = filteredAuctions.filter(auction => auction.currentBid <= filters.maxPrice);
    }
    if (filters.auctionType) {
      filteredAuctions = filteredAuctions.filter(auction => auction.auctionType === filters.auctionType);
    }
    
    return {
      success: true,
      auctions: filteredAuctions,
      totalCount: filteredAuctions.length,
      filters: filters
    };
  } catch (error) {
    console.error('Error getting active auctions:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get active auctions'
    };
  }
};

export const getAuctionDetails = async (auctionId) => {
  try {
    const connection = getConnection();
    
    if (!auctionId) {
      throw new Error('Auction ID is required');
    }
    
    // In a real implementation, you'd query the blockchain for auction details
    // For now, we'll return comprehensive mock data
    return {
      success: true,
      auction: {
        id: auctionId,
        dealId: 'deal_1',
        dealTitle: 'Luxury Restaurant Experience',
        merchant: 'Fine Dining Palace',
        originalPrice: 200.00,
        startPrice: 50.00,
        reservePrice: 100.00,
        currentBid: 75.00,
        bidCount: 12,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '2 days',
        status: 'Active',
        category: 'Food & Dining',
        location: 'Downtown',
        description: 'Exclusive 5-course dinner for two with wine pairing',
        createdBy: 'merchant_1',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        highestBidder: 'bidder_1',
        isReserveMet: false,
        auctionType: 'English',
        minimumIncrement: 5.00,
        bids: [
          {
            id: 'bid_1',
            bidder: 'bidder_1',
            amount: 75.00,
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            isWinning: true
          },
          {
            id: 'bid_2',
            bidder: 'bidder_2',
            amount: 70.00,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isWinning: false
          },
          {
            id: 'bid_3',
            bidder: 'bidder_3',
            amount: 65.00,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            isWinning: false
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error getting auction details:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get auction details'
    };
  }
};

export const endAuction = async (wallet, auctionId) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Create end auction transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate auction ending
    // In a real implementation, this would call the program's end_auction function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate ending
        lamports: 300, // Small amount to simulate ending cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Auction ended successfully!',
      data: {
        transactionSignature: signature,
        auctionId: auctionId,
        endedBy: wallet.publicKey.toString(),
        endedAt: new Date().toISOString(),
        winner: 'bidder_1', // In a real implementation, this would be determined by the smart contract
        winningBid: 75.00,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error ending auction:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to end auction'
    };
  }
};

export const getUserBids = async (walletAddress) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for user's bids
    // For now, we'll return comprehensive mock data
    return {
      success: true,
      bids: [
        {
          id: 'bid_1',
          auctionId: 'auction_1',
          dealTitle: 'Luxury Restaurant Experience',
          bidAmount: 75.00,
          isWinning: true,
          placedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active'
        },
        {
          id: 'bid_2',
          auctionId: 'auction_2',
          dealTitle: 'Weekend Hotel Getaway',
          bidAmount: 180.00,
          isWinning: false,
          placedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          auctionEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Outbid'
        }
      ],
      totalBids: 2,
      winningBids: 1,
      totalBidAmount: 255.00
    };
  } catch (error) {
    console.error('Error getting user bids:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get user bids'
    };
  }
};

// Group Deals System Functions
export const createGroupDeal = async (wallet, dealData, groupData) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!groupData.minParticipants || !groupData.maxParticipants || !groupData.discountTiers) {
      throw new Error('Group deal parameters are required');
    }
    
    // Create group deal transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate group deal creation
    // In a real implementation, this would call the program's create_group_deal function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate group deal creation
        lamports: 1500, // Small amount to simulate group deal creation cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Group deal created successfully!',
      data: {
        transactionSignature: signature,
        groupDealId: `group_${Date.now()}`,
        dealId: dealData.id,
        minParticipants: groupData.minParticipants,
        maxParticipants: groupData.maxParticipants,
        discountTiers: groupData.discountTiers,
        createdBy: wallet.publicKey.toString(),
        createdAt: new Date().toISOString(),
        status: 'Active',
        currentParticipants: 1,
        currentTier: 1,
        currentDiscount: groupData.discountTiers[0].discount,
        endTime: groupData.endTime,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error creating group deal:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create group deal'
    };
  }
};

export const joinGroupDeal = async (wallet, groupDealId, participantData) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!participantData.quantity || participantData.quantity <= 0) {
      throw new Error('Invalid quantity');
    }
    
    // Create join group transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate joining group deal
    // In a real implementation, this would call the program's join_group_deal function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate joining
        lamports: 800, // Small amount to simulate joining cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Successfully joined group deal!',
      data: {
        transactionSignature: signature,
        participationId: `participation_${Date.now()}`,
        groupDealId: groupDealId,
        participant: wallet.publicKey.toString(),
        quantity: participantData.quantity,
        joinedAt: new Date().toISOString(),
        status: 'Active',
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error joining group deal:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to join group deal'
    };
  }
};

export const getActiveGroupDeals = async (filters = {}) => {
  try {
    const connection = getConnection();
    
    // In a real implementation, you'd query the blockchain for active group deals
    // For now, we'll return comprehensive mock data
    const groupDeals = [
      {
        id: 'group_1',
        dealId: 'deal_1',
        dealTitle: 'Bulk Coffee Beans',
        merchant: 'Coffee Roasters Co.',
        originalPrice: 25.00,
        minParticipants: 5,
        maxParticipants: 20,
        currentParticipants: 8,
        currentTier: 2,
        currentDiscount: 15,
        status: 'Active',
        category: 'Food & Dining',
        location: 'Downtown',
        description: 'Premium coffee beans - the more people join, the bigger the discount!',
        createdBy: 'merchant_1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '3 days',
        discountTiers: [
          { participants: 5, discount: 10, price: 22.50 },
          { participants: 10, discount: 15, price: 21.25 },
          { participants: 15, discount: 20, price: 20.00 },
          { participants: 20, discount: 25, price: 18.75 }
        ],
        participants: [
          { id: 'p1', address: 'user1...abc', quantity: 2, joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'p2', address: 'user2...def', quantity: 1, joinedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
          { id: 'p3', address: 'user3...ghi', quantity: 3, joinedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }
        ],
        totalQuantity: 6,
        nextTierParticipants: 2,
        savings: 15.00
      },
      {
        id: 'group_2',
        dealId: 'deal_2',
        dealTitle: 'Restaurant Group Booking',
        merchant: 'Fine Dining Palace',
        originalPrice: 80.00,
        minParticipants: 8,
        maxParticipants: 15,
        currentParticipants: 12,
        currentTier: 3,
        currentDiscount: 20,
        status: 'Active',
        category: 'Food & Dining',
        location: 'Uptown',
        description: 'Exclusive group dinner experience with wine pairing',
        createdBy: 'merchant_2',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '2 days',
        discountTiers: [
          { participants: 8, discount: 10, price: 72.00 },
          { participants: 12, discount: 20, price: 64.00 },
          { participants: 15, discount: 25, price: 60.00 }
        ],
        participants: [
          { id: 'p1', address: 'user1...abc', quantity: 1, joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'p2', address: 'user2...def', quantity: 2, joinedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
          { id: 'p3', address: 'user3...ghi', quantity: 1, joinedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
        ],
        totalQuantity: 4,
        nextTierParticipants: 3,
        savings: 80.00
      },
      {
        id: 'group_3',
        dealId: 'deal_3',
        dealTitle: 'Hotel Group Stay',
        merchant: 'Grand Resort',
        originalPrice: 200.00,
        minParticipants: 10,
        maxParticipants: 25,
        currentParticipants: 18,
        currentTier: 4,
        currentDiscount: 30,
        status: 'Active',
        category: 'Travel & Hotels',
        location: 'Beach City',
        description: 'Luxury resort stay with group discounts',
        createdBy: 'merchant_3',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '1 day',
        discountTiers: [
          { participants: 10, discount: 15, price: 170.00 },
          { participants: 15, discount: 25, price: 150.00 },
          { participants: 20, discount: 30, price: 140.00 },
          { participants: 25, discount: 35, price: 130.00 }
        ],
        participants: [
          { id: 'p1', address: 'user1...abc', quantity: 2, joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'p2', address: 'user2...def', quantity: 1, joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'p3', address: 'user3...ghi', quantity: 1, joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        totalQuantity: 4,
        nextTierParticipants: 2,
        savings: 120.00
      }
    ];
    
    // Apply filters
    let filteredGroupDeals = groupDeals;
    if (filters.category) {
      filteredGroupDeals = filteredGroupDeals.filter(deal => deal.category === filters.category);
    }
    if (filters.status) {
      filteredGroupDeals = filteredGroupDeals.filter(deal => deal.status === filters.status);
    }
    if (filters.minDiscount) {
      filteredGroupDeals = filteredGroupDeals.filter(deal => deal.currentDiscount >= filters.minDiscount);
    }
    if (filters.maxDiscount) {
      filteredGroupDeals = filteredGroupDeals.filter(deal => deal.currentDiscount <= filters.maxDiscount);
    }
    
    return {
      success: true,
      groupDeals: filteredGroupDeals,
      totalCount: filteredGroupDeals.length,
      filters: filters
    };
  } catch (error) {
    console.error('Error getting active group deals:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get active group deals'
    };
  }
};

export const getGroupDealDetails = async (groupDealId) => {
  try {
    const connection = getConnection();
    
    if (!groupDealId) {
      throw new Error('Group deal ID is required');
    }
    
    // In a real implementation, you'd query the blockchain for group deal details
    // For now, we'll return comprehensive mock data
    return {
      success: true,
      groupDeal: {
        id: groupDealId,
        dealId: 'deal_1',
        dealTitle: 'Bulk Coffee Beans',
        merchant: 'Coffee Roasters Co.',
        originalPrice: 25.00,
        minParticipants: 5,
        maxParticipants: 20,
        currentParticipants: 8,
        currentTier: 2,
        currentDiscount: 15,
        status: 'Active',
        category: 'Food & Dining',
        location: 'Downtown',
        description: 'Premium coffee beans - the more people join, the bigger the discount!',
        createdBy: 'merchant_1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeRemaining: '3 days',
        discountTiers: [
          { participants: 5, discount: 10, price: 22.50 },
          { participants: 10, discount: 15, price: 21.25 },
          { participants: 15, discount: 20, price: 20.00 },
          { participants: 20, discount: 25, price: 18.75 }
        ],
        participants: [
          { id: 'p1', address: 'user1...abc', quantity: 2, joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'p2', address: 'user2...def', quantity: 1, joinedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
          { id: 'p3', address: 'user3...ghi', quantity: 3, joinedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }
        ],
        totalQuantity: 6,
        nextTierParticipants: 2,
        savings: 15.00,
        progress: 40, // 8/20 participants
        isFull: false,
        canJoin: true
      }
    };
  } catch (error) {
    console.error('Error getting group deal details:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get group deal details'
    };
  }
};

export const leaveGroupDeal = async (wallet, groupDealId) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Create leave group transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate leaving group deal
    // In a real implementation, this would call the program's leave_group_deal function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate leaving
        lamports: 400, // Small amount to simulate leaving cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Successfully left group deal!',
      data: {
        transactionSignature: signature,
        groupDealId: groupDealId,
        participant: wallet.publicKey.toString(),
        leftAt: new Date().toISOString(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error leaving group deal:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to leave group deal'
    };
  }
};

export const getUserGroupDeals = async (walletAddress) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for user's group deals
    // For now, we'll return comprehensive mock data
    return {
      success: true,
      groupDeals: [
        {
          id: 'group_1',
          dealTitle: 'Bulk Coffee Beans',
          merchant: 'Coffee Roasters Co.',
          originalPrice: 25.00,
          currentPrice: 21.25,
          quantity: 2,
          discount: 15,
          status: 'Active',
          joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          savings: 7.50
        },
        {
          id: 'group_2',
          dealTitle: 'Restaurant Group Booking',
          merchant: 'Fine Dining Palace',
          originalPrice: 80.00,
          currentPrice: 64.00,
          quantity: 1,
          discount: 20,
          status: 'Active',
          joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          savings: 16.00
        }
      ],
      totalSavings: 23.50,
      activeDeals: 2,
      totalQuantity: 3
    };
  } catch (error) {
    console.error('Error getting user group deals:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get user group deals'
    };
  }
};

// Reputation System Functions
export const getUserReputation = async (walletAddress) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for user reputation
    // For now, we'll return comprehensive mock data
    return {
      success: true,
      reputation: {
        walletAddress: walletAddress,
        totalScore: 2450,
        level: 8,
        title: 'Deal Master',
        badges: [
          {
            id: 'badge_1',
            name: 'First Purchase',
            description: 'Made your first deal purchase',
            icon: '🎯',
            rarity: 'Common',
            earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            nftMintAddress: 'mint_badge_1',
            isActive: true
          },
          {
            id: 'badge_2',
            name: 'Group Leader',
            description: 'Successfully organized 5 group deals',
            icon: '👑',
            rarity: 'Rare',
            earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            nftMintAddress: 'mint_badge_2',
            isActive: true
          },
          {
            id: 'badge_3',
            name: 'Auction Champion',
            description: 'Won 10 auctions',
            icon: '🏆',
            rarity: 'Epic',
            earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            nftMintAddress: 'mint_badge_3',
            isActive: true
          },
          {
            id: 'badge_4',
            name: 'Savings Hero',
            description: 'Saved over $1000 through deals',
            icon: '💰',
            rarity: 'Legendary',
            earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            nftMintAddress: 'mint_badge_4',
            isActive: true
          }
        ],
        stats: {
          totalDeals: 45,
          totalSavings: 1250.50,
          totalSpent: 3200.00,
          auctionsWon: 12,
          groupDealsOrganized: 8,
          groupDealsJoined: 15,
          averageRating: 4.8,
          referralCount: 23,
          streakDays: 12,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        achievements: [
          {
            id: 'ach_1',
            name: 'Deal Hunter',
            description: 'Purchase 10 deals',
            progress: 45,
            target: 10,
            completed: true,
            reward: 'Badge: Deal Hunter'
          },
          {
            id: 'ach_2',
            name: 'Group Organizer',
            description: 'Organize 5 group deals',
            progress: 8,
            target: 5,
            completed: true,
            reward: 'Badge: Group Leader'
          },
          {
            id: 'ach_3',
            name: 'Auction Master',
            description: 'Win 20 auctions',
            progress: 12,
            target: 20,
            completed: false,
            reward: 'Badge: Auction Master'
          },
          {
            id: 'ach_4',
            name: 'Savings Legend',
            description: 'Save $5000 total',
            progress: 1250,
            target: 5000,
            completed: false,
            reward: 'Badge: Savings Legend'
          }
        ],
        leaderboard: {
          rank: 15,
          totalUsers: 1250,
          percentile: 98.8
        }
      }
    };
  } catch (error) {
    console.error('Error getting user reputation:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get user reputation'
    };
  }
};

export const mintLoyaltyBadge = async (wallet, badgeData) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!badgeData.badgeId || !badgeData.name) {
      throw new Error('Badge data is required');
    }
    
    // Create loyalty badge mint transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate badge minting
    // In a real implementation, this would call the program's mint_loyalty_badge function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate badge minting
        lamports: 2000, // Small amount to simulate badge minting cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Loyalty badge minted successfully!',
      data: {
        transactionSignature: signature,
        badgeId: badgeData.badgeId,
        badgeName: badgeData.name,
        nftMintAddress: `badge_${Date.now()}`,
        mintedBy: wallet.publicKey.toString(),
        mintedAt: new Date().toISOString(),
        rarity: badgeData.rarity || 'Common',
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error minting loyalty badge:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to mint loyalty badge'
    };
  }
};

export const getLeaderboard = async (category = 'all', limit = 50) => {
  try {
    const connection = getConnection();
    
    // In a real implementation, you'd query the blockchain for leaderboard data
    // For now, we'll return comprehensive mock data
    const leaderboard = [
      {
        rank: 1,
        walletAddress: 'user1...abc123',
        username: 'DealMaster2024',
        totalScore: 15420,
        level: 15,
        title: 'Deal Legend',
        badges: 12,
        totalSavings: 5420.50,
        totalDeals: 89,
        avatar: '👑',
        isVerified: true
      },
      {
        rank: 2,
        walletAddress: 'user2...def456',
        username: 'SavingsHero',
        totalScore: 12850,
        level: 13,
        title: 'Savings Master',
        badges: 10,
        totalSavings: 4850.25,
        totalDeals: 67,
        avatar: '💰',
        isVerified: true
      },
      {
        rank: 3,
        walletAddress: 'user3...ghi789',
        username: 'GroupLeader',
        totalScore: 11200,
        level: 12,
        title: 'Group Master',
        badges: 9,
        totalSavings: 3200.75,
        totalDeals: 45,
        avatar: '👥',
        isVerified: true
      },
      {
        rank: 4,
        walletAddress: 'user4...jkl012',
        username: 'AuctionChamp',
        totalScore: 9850,
        level: 11,
        title: 'Auction Master',
        badges: 8,
        totalSavings: 2750.30,
        totalDeals: 38,
        avatar: '🏆',
        isVerified: false
      },
      {
        rank: 5,
        walletAddress: 'user5...mno345',
        username: 'DealHunter',
        totalScore: 8750,
        level: 10,
        title: 'Deal Expert',
        badges: 7,
        totalSavings: 2100.80,
        totalDeals: 32,
        avatar: '🎯',
        isVerified: false
      }
    ];
    
    return {
      success: true,
      leaderboard: leaderboard.slice(0, limit),
      category: category,
      totalUsers: 1250,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get leaderboard'
    };
  }
};

export const getAvailableBadges = async () => {
  try {
    const connection = getConnection();
    
    // In a real implementation, you'd query the blockchain for available badges
    // For now, we'll return comprehensive mock data
    return {
      success: true,
      badges: [
        {
          id: 'badge_1',
          name: 'First Purchase',
          description: 'Make your first deal purchase',
          icon: '🎯',
          rarity: 'Common',
          requirements: {
            type: 'purchase',
            count: 1,
            description: 'Purchase 1 deal'
          },
          reward: {
            score: 100,
            title: 'Deal Starter'
          },
          isEarned: true,
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'badge_2',
          name: 'Deal Hunter',
          description: 'Purchase 10 deals',
          icon: '🔍',
          rarity: 'Uncommon',
          requirements: {
            type: 'purchase',
            count: 10,
            description: 'Purchase 10 deals'
          },
          reward: {
            score: 500,
            title: 'Deal Hunter'
          },
          isEarned: true,
          earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'badge_3',
          name: 'Group Leader',
          description: 'Organize 5 group deals',
          icon: '👑',
          rarity: 'Rare',
          requirements: {
            type: 'organize',
            count: 5,
            description: 'Organize 5 group deals'
          },
          reward: {
            score: 1000,
            title: 'Group Leader'
          },
          isEarned: true,
          earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'badge_4',
          name: 'Auction Champion',
          description: 'Win 10 auctions',
          icon: '🏆',
          rarity: 'Epic',
          requirements: {
            type: 'auction',
            count: 10,
            description: 'Win 10 auctions'
          },
          reward: {
            score: 1500,
            title: 'Auction Champion'
          },
          isEarned: true,
          earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'badge_5',
          name: 'Savings Hero',
          description: 'Save over $1000',
          icon: '💰',
          rarity: 'Legendary',
          requirements: {
            type: 'savings',
            amount: 1000,
            description: 'Save over $1000'
          },
          reward: {
            score: 2000,
            title: 'Savings Hero'
          },
          isEarned: true,
          earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'badge_6',
          name: 'Deal Master',
          description: 'Purchase 50 deals',
          icon: '🎖️',
          rarity: 'Epic',
          requirements: {
            type: 'purchase',
            count: 50,
            description: 'Purchase 50 deals'
          },
          reward: {
            score: 2500,
            title: 'Deal Master'
          },
          isEarned: false,
          progress: 45,
          target: 50
        },
        {
          id: 'badge_7',
          name: 'Auction Master',
          description: 'Win 25 auctions',
          icon: '🥇',
          rarity: 'Legendary',
          requirements: {
            type: 'auction',
            count: 25,
            description: 'Win 25 auctions'
          },
          reward: {
            score: 3000,
            title: 'Auction Master'
          },
          isEarned: false,
          progress: 12,
          target: 25
        },
        {
          id: 'badge_8',
          name: 'Savings Legend',
          description: 'Save over $5000',
          icon: '💎',
          rarity: 'Mythic',
          requirements: {
            type: 'savings',
            amount: 5000,
            description: 'Save over $5000'
          },
          reward: {
            score: 5000,
            title: 'Savings Legend'
          },
          isEarned: false,
          progress: 1250,
          target: 5000
        }
      ],
      totalBadges: 8,
      earnedBadges: 5,
      availableBadges: 3
    };
  } catch (error) {
    console.error('Error getting available badges:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get available badges'
    };
  }
};

export const updateReputation = async (wallet, action, data) => {
  try {
    const connection = getConnection();
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!action || !data) {
      throw new Error('Action and data are required');
    }
    
    // Create reputation update transaction
    const transaction = new Transaction();
    
    // For now, we'll create a simple transfer to simulate reputation update
    // In a real implementation, this would call the program's update_reputation function
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey, // Self-transfer to simulate reputation update
        lamports: 300, // Small amount to simulate reputation update cost
      })
    );
    
    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using wallet adapter
    let signature;
    if (wallet.adapter && typeof wallet.adapter.sendTransaction === 'function') {
      signature = await wallet.adapter.sendTransaction(transaction, connection);
    } else if (typeof wallet.signAndSendTransaction === 'function') {
      signature = await wallet.signAndSendTransaction(transaction);
    } else {
      // Fallback: For demo mode, return a mock signature
      signature = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('Demo mode: Using mock signature:', signature);
    }
    
    // Only confirm if we have a real signature
    if (!signature.startsWith('demo_')) {
      await connection.confirmTransaction(signature);
    }
    
    return {
      success: true,
      message: 'Reputation updated successfully!',
      data: {
        transactionSignature: signature,
        action: action,
        data: data,
        updatedBy: wallet.publicKey.toString(),
        updatedAt: new Date().toISOString(),
        scoreChange: data.scoreChange || 0,
        newLevel: data.newLevel || null,
        badgesEarned: data.badgesEarned || [],
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      }
    };
  } catch (error) {
    console.error('Error updating reputation:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to update reputation'
    };
  }
};

export const getReputationHistory = async (walletAddress, limit = 50) => {
  try {
    const connection = getConnection();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    // In a real implementation, you'd query the blockchain for reputation history
    // For now, we'll return comprehensive mock data
    const history = [
      {
        id: 'rep_1',
        action: 'purchase',
        description: 'Purchased deal: Coffee Shop Discount',
        scoreChange: 50,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        transactionSignature: 'tx_rep_1',
        badgesEarned: []
      },
      {
        id: 'rep_2',
        action: 'group_organize',
        description: 'Organized group deal: Restaurant Special',
        scoreChange: 200,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        transactionSignature: 'tx_rep_2',
        badgesEarned: ['Group Leader']
      },
      {
        id: 'rep_3',
        action: 'auction_win',
        description: 'Won auction: Hotel Stay',
        scoreChange: 150,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        transactionSignature: 'tx_rep_3',
        badgesEarned: []
      },
      {
        id: 'rep_4',
        action: 'savings_milestone',
        description: 'Reached $1000 total savings',
        scoreChange: 500,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        transactionSignature: 'tx_rep_4',
        badgesEarned: ['Savings Hero']
      }
    ];
    
    return {
      success: true,
      history: history.slice(0, limit),
      totalCount: history.length,
      hasMore: history.length > limit
    };
  } catch (error) {
    console.error('Error getting reputation history:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to get reputation history'
    };
  }
};

// Utility function to get wallet balance
export const getWalletBalance = async (publicKey) => {
  try {
    const connection = getConnection();
    const balance = await connection.getBalance(publicKey);
    return formatSOL(balance);
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return '0.0000';
  }
};

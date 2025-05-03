const { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const { 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID
} = require('@solana/spl-token');
const bs58 = require('bs58');

// Initialize Solana connection (using devnet for development)
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Load or create issuer keypair
let issuerKeypair;
try {
  // Try to load from environment variable
  const privateKey = process.env.ISSUER_PRIVATE_KEY;
  if (privateKey) {
    const decodedKey = bs58.decode(privateKey);
    issuerKeypair = Keypair.fromSecretKey(decodedKey);
  } else {
    // Generate new keypair if not found
    issuerKeypair = Keypair.generate();
    console.log('Generated new issuer keypair. Public key:', issuerKeypair.publicKey.toString());
    console.log('Private key (save this):', bs58.encode(issuerKeypair.secretKey));
  }
} catch (error) {
  console.error('Error loading issuer keypair:', error);
  throw error;
}

// Create a new credential NFT
async function createCredentialNFT(recipientAddress, metadata) {
  try {
    // Create a new mint account
    const mint = await createMint(
      connection,
      issuerKeypair,
      issuerKeypair.publicKey,
      issuerKeypair.publicKey,
      0 // 0 decimals for NFT
    );

    // Get or create the recipient's token account
    const recipientPublicKey = new PublicKey(recipientAddress);
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      issuerKeypair,
      mint,
      recipientPublicKey
    );

    // Mint 1 token to the recipient
    await mintTo(
      connection,
      issuerKeypair,
      mint,
      recipientTokenAccount.address,
      issuerKeypair,
      1
    );

    // Store metadata in AWS DynamoDB
    const metadataItem = {
      mint: mint.toString(),
      recipient: recipientAddress,
      metadata: metadata,
      issuedAt: new Date().toISOString()
    };

    return {
      mint: mint.toString(),
      tokenAccount: recipientTokenAccount.address.toString(),
      metadata: metadataItem
    };
  } catch (error) {
    console.error('Error creating credential NFT:', error);
    throw error;
  }
}

// Verify a credential NFT
async function verifyCredential(mintAddress, recipientAddress) {
  try {
    const mint = new PublicKey(mintAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get the recipient's token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      issuerKeypair,
      mint,
      recipient
    );

    // Check token balance
    const balance = await connection.getTokenAccountBalance(tokenAccount.address);
    
    return {
      isValid: balance.value.uiAmount > 0,
      balance: balance.value.uiAmount,
      mint: mintAddress,
      tokenAccount: tokenAccount.address.toString()
    };
  } catch (error) {
    console.error('Error verifying credential:', error);
    throw error;
  }
}

// Request airdrop for testing
async function requestAirdrop(address) {
  try {
    const publicKey = new PublicKey(address);
    const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    throw error;
  }
}

module.exports = {
  createCredentialNFT,
  verifyCredential,
  requestAirdrop,
  issuerPublicKey: issuerKeypair.publicKey.toString()
}; 
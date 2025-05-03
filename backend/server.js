const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
// Use AWS environment variables for credentials and region
const db = new AWS.DynamoDB.DocumentClient();
const solana = require('./services/solana');

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Increase payload and header limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  console.log('Login request received:', req.body);
  const { username, password } = req.body;
  // For demo purposes, accept any login
  res.json({ success: true });
});

// Get credentials endpoint
app.get('/api/credentials', async (req, res) => {
  const { username } = req.query;
  try {
    const result = await db.query({
      TableName: 'Credentials',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': username
      }
    }).promise();
    
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

// Issue credential endpoint
app.post('/api/issueCredential', async (req, res) => {
  const { userId, certTitle, recipientAddress } = req.body;
  
  try {
    console.log('Issuing credential:', { userId, certTitle, recipientAddress });
    
    // Create NFT credential on Solana
    const credential = await solana.createCredentialNFT(recipientAddress, {
      title: certTitle,
      issuer: solana.issuerPublicKey,
      userId: userId
    });

    console.log('Credential created:', credential);

    // Save to DynamoDB
    const dbItem = {
      certId: credential.mint,
      userId,
      title: certTitle,
      txHash: credential.mint,
      dateIssued: new Date().toISOString(),
      metadata: credential.metadata
    };
    
    console.log('Saving to DynamoDB:', dbItem);
    
    await db.put({
      TableName: 'Credentials',
      Item: dbItem
    }).promise();

    console.log('Credential saved successfully');

    res.json({ 
      success: true, 
      mint: credential.mint,
      tokenAccount: credential.tokenAccount
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ error: error.message || 'Failed to issue credential' });
  }
});

// Verify credential endpoint
app.get('/api/verifyCredential', async (req, res) => {
  const { mintAddress, recipientAddress } = req.query;
  
  try {
    const verification = await solana.verifyCredential(mintAddress, recipientAddress);
    res.json(verification);
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({ error: 'Failed to verify credential' });
  }
});

// Request airdrop endpoint (for testing)
app.post('/api/requestAirdrop', async (req, res) => {
  const { address } = req.body;
  
  try {
    const signature = await solana.requestAirdrop(address);
    res.json({ success: true, signature });
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    res.status(500).json({ error: 'Failed to request airdrop' });
  }
});

// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { userId, password, email } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ error: 'userId and password are required' });
  }
  try {
    // Check if user already exists
    const existing = await db.get({
      TableName: 'Users',
      Key: { userId }
    }).promise();
    if (existing.Item) {
      return res.status(409).json({ error: 'User already exists' });
    }
    // Store new user
    await db.put({
      TableName: 'Users',
      Item: {
        userId,
        password, // In production, hash the password!
        email: email || null,
        createdAt: new Date().toISOString()
      }
    }).promise();
    res.json({ success: true });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Issuer public key:', solana.issuerPublicKey);
}); 
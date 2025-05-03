const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const app = express();
app.use(cors());
app.use(express.json());

// Login endpoint
app.post('/api/login', (req, res) => {
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
  const { userId, certTitle } = req.body;
  const certId = `cert-${Date.now()}`;
  const txHash = `tx-sim-${Math.random().toString(36).substring(2, 10)}`;

  try {
    await db.put({
      TableName: 'Credentials',
      Item: {
        certId,
        userId,
        title: certTitle,
        txHash,
        dateIssued: new Date().toISOString()
      }
    }).promise();

    res.json({ success: true, txHash });
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({ error: 'Failed to issue credential' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
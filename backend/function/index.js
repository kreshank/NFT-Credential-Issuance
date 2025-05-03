const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { userId, certTitle } = JSON.parse(event.body);

  const certId = `cert-${Date.now()}`;

  // Simulate a dummy transaction hash (not real)
  const txHash = `tx-sim-${Math.random().toString(36).substring(2, 10)}`;

  // Save to DynamoDB (make sure your table is Free Tier sized!)
  await db.put({
    TableName: "Credentials",
    Item: {
      certId,
      userId,
      title: certTitle,
      txHash,
      dateIssued: new Date().toISOString()
    }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      txHash
    }),
  };
};

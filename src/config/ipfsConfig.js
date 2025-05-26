import { create } from 'ipfs-http-client';

const ipfsConfig = {
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, POST, GET',
    'Access-Control-Allow-Headers': '*'
  }
};

const gatewayUrl = 'http://127.0.0.1:8080/ipfs';

// Create IPFS client with error handling
let ipfs;
try {
  ipfs = create(ipfsConfig);
} catch (error) {
  console.error('Error creating IPFS client:', error);
  throw new Error('Failed to initialize IPFS client. Please check your IPFS node is running.');
}

// Test IPFS connection
const testConnection = async () => {
  try {
    const testResult = await ipfs.add(new TextEncoder().encode('test'));
    console.log('IPFS connection test successful:', testResult);
    return true;
  } catch (error) {
    console.error('IPFS connection test failed:', error);
    return false;
  }
};

export { ipfs, gatewayUrl, testConnection }; 
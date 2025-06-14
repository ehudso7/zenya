// Simple test script to verify debug connection
const http = require('http');

// Test 1: Connect to the debug monitor endpoint
console.log('Testing debug monitor connection...');

const eventSource = http.get('http://localhost:3000/api/debug/connect', {
  headers: {
    'Accept': 'text/event-stream'
  }
}, (res) => {
  console.log('Connected to debug monitor:', res.statusCode);
  
  res.on('data', (chunk) => {
    console.log('Received:', chunk.toString());
  });
  
  // After 2 seconds, send a test log
  setTimeout(() => {
    console.log('\nSending test log to debug stream...');
    
    const postData = JSON.stringify({
      type: 'test',
      data: {
        message: 'Test log from Node.js script',
        timestamp: new Date().toISOString()
      },
      sessionId: 'test-session'
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/debug/connect',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log('POST response status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('POST response:', data);
        
        // Close after 3 more seconds
        setTimeout(() => {
          console.log('\nClosing connection...');
          eventSource.destroy();
          process.exit(0);
        }, 3000);
      });
    });
    
    req.on('error', (e) => {
      console.error('POST error:', e);
    });
    
    req.write(postData);
    req.end();
  }, 2000);
});

eventSource.on('error', (e) => {
  console.error('Connection error:', e);
});
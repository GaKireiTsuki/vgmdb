const http = require('http');

// Test function
async function testFormatParameter() {
  console.log('Testing format parameter...\n');
  
  // Create test data
  const testData = { name: 'Test Album', catalog: 'TEST-001' };
  
  // Test 1: Without format parameter (should return JSON)
  console.log('Test 1: GET /test (no format param - should be JSON)');
  const test1Headers = await makeRequest('/test', 'no-format');
  console.log('Content-Type:', test1Headers['content-type']);
  console.log('Expected: application/json');
  console.log('✓ Passed\n');
  
  // Test 2: With format=json (should return JSON)
  console.log('Test 2: GET /test?format=json (should be JSON)');
  const test2Headers = await makeRequest('/test?format=json', 'format-json');
  console.log('Content-Type:', test2Headers['content-type']);
  console.log('Expected: application/json');
  console.log('✓ Passed\n');
  
  // Test 3: With format=yaml (should return YAML)
  console.log('Test 3: GET /test?format=yaml (should be YAML)');
  const test3Headers = await makeRequest('/test?format=yaml', 'format-yaml');
  console.log('Content-Type:', test3Headers['content-type']);
  console.log('Expected: application/x-yaml');
  console.log('✓ Passed\n');
  
  console.log('All tests completed!');
}

function makeRequest(path, testName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9990,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`Response body (${testName}):`, data.substring(0, 100));
        resolve(res.headers);
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

testFormatParameter().catch(console.error);

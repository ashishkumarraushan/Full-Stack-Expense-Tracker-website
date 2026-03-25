import http from 'http';

function makeRequest(method, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: path,
            method: method,
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data: body });
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function test() {
    console.log('Testing dashboard routes...\n');
    
    // Test if dashboard router is loaded
    console.log('Testing /api/dashboard/test (debug route)...');
    const debugRes = await makeRequest('GET', '/api/dashboard/test');
    console.log(`Status: ${debugRes.status}`);
    console.log(`Response: ${debugRes.data}\n`);
    
    // Test main dashboard route
    console.log('Testing /api/dashboard (main route)...');
    const mainRes = await makeRequest('GET', '/api/dashboard');
    console.log(`Status: ${mainRes.status}`);
    console.log(`Response: ${mainRes.data}`);
}

test().catch(err => console.error('Error:', err.message));

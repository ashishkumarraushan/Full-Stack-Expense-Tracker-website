import http from 'http';

function makeRequest(method, path, headers, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: path,
            method: method,
            headers: headers
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testEndpoints() {
    try {
        console.log('=== Testing Available Routes ===\n');
        
        // Test root
        console.log('TEST: GET /');
        const rootRes = await makeRequest('GET', '/', {});
        console.log('Status:', rootRes.status);
        console.log('Response:', rootRes.data);
        console.log('');

        // Test user registration
        console.log('TEST: POST /api/users/register');
        const regRes = await makeRequest('POST', '/api/users/register', 
            { 'Content-Type': 'application/json' },
            { name: 'Test', email: `t${Date.now()}@t.com`, password: 'pass123test' }
        );
        console.log('Status:', regRes.status);
        console.log('Has token:', !!regRes.data.token);
        console.log('');

        if(!regRes.data.token) throw new Error('No token');
        const token = regRes.data.token;

        // Test GET income
        console.log('TEST: GET /api/income/get');
        const getRes = await makeRequest('GET', '/api/income/get',
            { 'Authorization': `Bearer ${token}` }
        );
        console.log('Status:', getRes.status);
        console.log('');

        // Test POST income
        console.log('TEST: POST /api/income/add');
        const postRes = await makeRequest('POST', '/api/income/add',
            { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            {
                description: 'Test',
                amount: 1000,
                category: 'test',
                date: '2024-03-25'
            }
        );
        console.log('Status:', postRes.status);
        console.log('Response:', typeof postRes.data === 'string' ? postRes.data.substring(0, 100) : postRes.data);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testEndpoints();

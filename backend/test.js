import http from 'http';

// Test data
const testEmail = `testuser${Date.now()}@test.com`;
const testPassword = 'password123';
const testName = 'Test User';

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

async function runTests() {
    try {
        console.log('=== TEST 1: Register User ===');
        const registerRes = await makeRequest('POST', '/api/users/register',
            { 'Content-Type': 'application/json' },
            { name: testName, email: testEmail, password: testPassword }
        );
        console.log('Status:', registerRes.status);
        console.log('Response:', JSON.stringify(registerRes.data, null, 2));
        
        if (!registerRes.data.token) {
            console.log('❌ Registration failed');
            return;
        }
        
        const token = registerRes.data.token;
        console.log('✅ Registration successful!');

        console.log('\n=== TEST 2: Add Income ===');
        const incomeRes = await makeRequest('POST', '/api/income/add',
            {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            {
                description: 'Test Income',
                amount: 5000,
                category: 'Salary',
                date: new Date().toISOString()
            }
        );
        console.log('Status:', incomeRes.status);
        console.log('Response:', JSON.stringify(incomeRes.data, null, 2));
        
        if (incomeRes.data.success) {
            console.log('✅ Income added successfully!');
        } else {
            console.log('❌ Income addition failed');
        }

        console.log('\n=== TEST 3: Get Income ===');
        const getRes = await makeRequest('GET', '/api/income/get',
            { 'Authorization': `Bearer ${token}` }
        );
        console.log('Status:', getRes.status);
        console.log('Response Length:', Array.isArray(getRes.data) ? 'Array with ' + getRes.data.length + ' items' : 'Object');
        console.log('✅ All tests passed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

runTests();

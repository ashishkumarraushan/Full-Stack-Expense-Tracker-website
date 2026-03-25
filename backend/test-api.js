import http from 'http';

function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testAPI() {
    try {
        console.log('=== Step 1: Register User ===');
        const userData = {
            name: 'Test User',
            email: `testuser${Date.now()}@test.com`,
            password: 'password123'
        };

        const registerRes = await makeRequest('POST', '/api/users/register', userData);
        console.log('Register Response:', registerRes.data);

        if (!registerRes.data.token) {
            console.error('❌ Failed to get token');
            process.exit(1);
        }

        const token = registerRes.data.token;
        console.log('✅ User registered successfully');
        console.log(`✅ Token: ${token.substring(0, 30)}...`);

        // Add a small delay
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('\n=== Step 2: Add Expense ===');
        const expenseData = {
            description: 'Test Groceries',
            amount: 500,
            category: 'Food',
            date: '2024-03-25'
        };

        const expenseRes = await makeRequest('POST', '/api/expense/add', expenseData, token);
        console.log('Expense Response Status:', expenseRes.status);
        console.log('Expense Response:', expenseRes.data);

        if (expenseRes.data.success) {
            console.log('\n✅ SUCCESS! Expense added successfully!');
            console.log('Message:', expenseRes.data.message);
        } else {
            console.log('\n❌ Failed to add expense');
            console.log('Error:', expenseRes.data.message);
        }

        // Add a small delay
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('\n=== Step 3: Get Dashboard ===');
        const dashboardRes = await makeRequest('GET', '/api/dashboard', null, token);
        console.log('Dashboard Response Status:', dashboardRes.status);
        
        if (dashboardRes.status === 200 && dashboardRes.data.success) {
            console.log('✅ Dashboard data retrieved successfully!');
            console.log('Data:', JSON.stringify(dashboardRes.data.data, null, 2));
        } else {
            console.log('❌ Failed to get dashboard');
            console.log('Response:', dashboardRes.data);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testAPI();

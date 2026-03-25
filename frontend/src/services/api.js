const API_BASE_URL = 'https://full-stack-expense-tracker-website.onrender.com/api';

export const apiCall = async (endpoint, method = 'GET', body = null, includeAuth = true) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (includeAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        console.error('API Error:', error);
        return { status: 500, data: { success: false, message: 'Network error' } };
    }
};

// Auth APIs
export const authAPI = {
    register: (name, email, password) => 
        apiCall('/users/register', 'POST', { name, email, password }, false),
    
    login: (email, password) => 
        apiCall('/users/login', 'POST', { email, password }, false),
    
    getProfile: () => 
        apiCall('/users/me', 'GET'),
    
    updateProfile: (name, email) => 
        apiCall('/users/profile', 'PUT', { name, email }),
    
    changePassword: (currentPassword, newPassword) => 
        apiCall('/users/password', 'PUT', { currentPassword, newPassword }),
};

// Expense APIs
export const expenseAPI = {
    addExpense: (description, amount, category, date) =>
        apiCall('/expense/add', 'POST', { description, amount, category, date }),
    
    getExpenses: () =>
        apiCall('/expense/get', 'GET'),
    
    updateExpense: (id, description, amount) =>
        apiCall(`/expense/update/${id}`, 'PUT', { description, amount }),
    
    deleteExpense: (id) =>
        apiCall(`/expense/delete/${id}`, 'DELETE'),
    
    getExpenseOverview: () =>
        apiCall('/expense/overview', 'GET'),
};

// Income APIs
export const incomeAPI = {
    addIncome: (description, amount, category, date) =>
        apiCall('/income/add', 'POST', { description, amount, category, date }),
    
    getIncomes: () =>
        apiCall('/income/get', 'GET'),
    
    updateIncome: (id, description, amount) =>
        apiCall(`/income/update/${id}`, 'PUT', { description, amount }),
    
    deleteIncome: (id) =>
        apiCall(`/income/delete/${id}`, 'DELETE'),
    
    getIncomeOverview: () =>
        apiCall('/income/overview', 'GET'),
};

// Dashboard API
export const dashboardAPI = {
    getDashboard: () =>
        apiCall('/dashboard', 'GET'),
};

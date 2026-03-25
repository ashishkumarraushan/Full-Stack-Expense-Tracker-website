import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI, expenseAPI, incomeAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timePeriod, setTimePeriod] = useState('monthly'); // daily, weekly, monthly, yearly
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        fetchTransactionData();
    }, [timePeriod]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data } = await dashboardAPI.getDashboard();
            if (data.success) {
                setDashboard(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionData = async () => {
        try {
            const [expenseRes, incomeRes] = await Promise.all([
                expenseAPI.getExpenses(),
                incomeAPI.getIncomes(),
            ]);
            if (Array.isArray(expenseRes.data)) {
                setExpenses(expenseRes.data);
            }
            if (Array.isArray(incomeRes.data)) {
                setIncomes(incomeRes.data);
            }
        } catch (err) {
            console.error('Failed to load transactions');
        }
    };

    // Generate chart data based on time period and transactions
    const generateChartData = () => {
        const now = new Date();
        let data = {};
        let dateFormat = 'MMM DD';
        let daysToInclude = 30;

        if (timePeriod === 'daily') {
            daysToInclude = 7;
            dateFormat = 'MMM DD';
        } else if (timePeriod === 'weekly') {
            daysToInclude = 56; // 8 weeks
            dateFormat = 'Week';
        } else if (timePeriod === 'monthly') {
            daysToInclude = 365;
            dateFormat = 'MMM';
        } else if (timePeriod === 'yearly') {
            daysToInclude = 365 * 3;
            dateFormat = 'YYYY';
        }

        // Create date entries
        for (let i = daysToInclude; i >= 0; i--) {
            const date = new Date(now);
            if (timePeriod === 'daily') {
                date.setDate(date.getDate() - i);
                const key = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                data[key] = { name: key, income: 0, expense: 0, date: new Date(date) };
            } else if (timePeriod === 'weekly') {
                date.setDate(date.getDate() - i);
                const weekStart = new Date(date);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const key = `Week ${Math.floor(i / 7)}`;
                if (!data[key]) {
                    data[key] = { name: key, income: 0, expense: 0, date: new Date(weekStart) };
                }
            } else if (timePeriod === 'monthly') {
                date.setMonth(date.getMonth() - i);
                const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                data[key] = { name: key, income: 0, expense: 0, date: new Date(date) };
            } else if (timePeriod === 'yearly') {
                date.setFullYear(date.getFullYear() - i);
                const key = date.getFullYear().toString();
                data[key] = { name: key, income: 0, expense: 0, date: new Date(date) };
            }
        }

        // Populate data with transactions
        expenses.forEach(exp => {
            const date = new Date(exp.date);
            let key;
            if (timePeriod === 'daily') {
                key = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
            } else if (timePeriod === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const diffTime = Math.abs(now - weekStart);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                key = `Week ${Math.floor(diffDays / 7)}`;
            } else if (timePeriod === 'monthly') {
                key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            } else if (timePeriod === 'yearly') {
                key = date.getFullYear().toString();
            }
            if (data[key]) {
                data[key].expense += exp.amount;
            }
        });

        incomes.forEach(inc => {
            const date = new Date(inc.date);
            let key;
            if (timePeriod === 'daily') {
                key = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
            } else if (timePeriod === 'weekly') {
                const weekStart = new Date(date);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const diffTime = Math.abs(now - weekStart);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                key = `Week ${Math.floor(diffDays / 7)}`;
            } else if (timePeriod === 'monthly') {
                key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            } else if (timePeriod === 'yearly') {
                key = date.getFullYear().toString();
            }
            if (data[key]) {
                data[key].income += inc.amount;
            }
        });

        return Object.values(data).sort((a, b) => a.date - b.date);
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;
    }

    const {
        monthlyIncome = 0,
        monthlyExpense = 0,
        savings = 0,
        savingsRate = 0,
        expenseDistribution = [],
        recentTransactions = [],
    } = dashboard || {};

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Monthly Income */}
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 shadow">
                        <p className="text-gray-600 text-sm font-semibold">Monthly Income</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">₹{monthlyIncome.toFixed(2)}</p>
                    </div>

                    {/* Monthly Expense */}
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow">
                        <p className="text-gray-600 text-sm font-semibold">Monthly Expense</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">₹{monthlyExpense.toFixed(2)}</p>
                    </div>

                    {/* Savings */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 shadow">
                        <p className="text-gray-600 text-sm font-semibold">Savings</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">₹{savings.toFixed(2)}</p>
                    </div>

                    {/* Savings Rate */}
                    <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6 shadow">
                        <p className="text-gray-600 text-sm font-semibold">Savings Rate</p>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{savingsRate}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Time Period Filter */}
                    <div className="lg:col-span-3 bg-white rounded-lg shadow p-6 mb-4">
                        <div className="flex gap-4 items-center justify-between flex-wrap">
                            <h2 className="text-xl font-bold text-gray-800">View By:</h2>
                            <div className="flex gap-3">
                                {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setTimePeriod(period)}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            timePeriod === period
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        {period.charAt(0).toUpperCase() + period.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Income & Expense Area Charts */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Income & Expense Trends</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={generateChartData()}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip 
                                    formatter={(value) => `₹${value.toFixed(2)}`}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Expense Distribution */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Expense by Category</h2>
                        <div className="space-y-3">
                            {expenseDistribution.length > 0 ? (
                                expenseDistribution.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-700">{item.category}</span>
                                            <span className="text-sm font-semibold text-gray-700">₹{item.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${item.percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No expenses this month</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
                        <div className="space-y-2">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.slice(0, 5).map((transaction, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-semibold text-gray-800">{transaction.description}</p>
                                            <p className="text-sm text-gray-600">{transaction.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No transactions yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

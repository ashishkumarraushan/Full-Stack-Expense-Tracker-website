import React, { useEffect, useState } from 'react';
import { expenseAPI } from '../services/api.js';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const { data } = await expenseAPI.getExpenses();
            if (Array.isArray(data)) {
                setExpenses(data);
            }
        } catch (err) {
            console.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description || !formData.amount || !formData.category || !formData.date) {
            alert('All fields are required');
            return;
        }

        try {
            if (editingId) {
                await expenseAPI.updateExpense(editingId, formData.description, parseFloat(formData.amount));
            } else {
                await expenseAPI.addExpense(
                    formData.description,
                    parseFloat(formData.amount),
                    formData.category,
                    formData.date
                );
            }
            fetchExpenses();
            setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
            setShowForm(false);
            setEditingId(null);
        } catch (err) {
            alert('Error saving expense');
        }
    };

    const handleEdit = (expense) => {
        setEditingId(expense._id);
        setFormData({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: new Date(expense.date).toISOString().split('T')[0],
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await expenseAPI.deleteExpense(id);
                fetchExpenses();
            } catch (err) {
                alert('Error deleting expense');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Expenses</h1>
                        <p className="text-gray-600 mt-2">Total: ₹{totalExpense.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                        {showForm ? 'Cancel' : 'Add Expense'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? 'Edit Expense' : 'Add New Expense'}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                                className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                placeholder="Amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Category</option>
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="col-span-1 md:col-span-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                                {editingId ? 'Update Expense' : 'Add Expense'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Expenses List */}
                <div className="space-y-3">
                    {expenses.length > 0 ? (
                        expenses.map(expense => (
                            <div key={expense._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:shadow-lg transition">
                                <div>
                                    <p className="font-semibold text-gray-800">{expense.description}</p>
                                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{expense.category}</span>
                                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-2xl font-bold text-red-600">₹{expense.amount.toFixed(2)}</p>
                                    <button
                                        onClick={() => handleEdit(expense)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(expense._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No expenses yet. Add one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;

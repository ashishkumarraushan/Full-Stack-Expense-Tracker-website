import React, { useEffect, useState } from 'react';
import { incomeAPI } from '../services/api.js';

const Incomes = () => {
    const [incomes, setIncomes] = useState([]);
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
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const { data } = await incomeAPI.getIncomes();
            if (Array.isArray(data)) {
                setIncomes(data);
            }
        } catch (err) {
            console.error('Failed to load incomes');
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
                await incomeAPI.updateIncome(editingId, formData.description, parseFloat(formData.amount));
            } else {
                await incomeAPI.addIncome(
                    formData.description,
                    parseFloat(formData.amount),
                    formData.category,
                    formData.date
                );
            }
            fetchIncomes();
            setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
            setShowForm(false);
            setEditingId(null);
        } catch (err) {
            alert('Error saving income');
        }
    };

    const handleEdit = (income) => {
        setEditingId(income._id);
        setFormData({
            description: income.description,
            amount: income.amount,
            category: income.category,
            date: new Date(income.date).toISOString().split('T')[0],
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await incomeAPI.deleteIncome(id);
                fetchIncomes();
            } catch (err) {
                alert('Error deleting income');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Incomes</h1>
                        <p className="text-gray-600 mt-2">Total: ₹{totalIncome.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
                    >
                        {showForm ? 'Cancel' : 'Add Income'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingId ? 'Edit Income' : 'Add New Income'}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="description"
                                placeholder="Description (e.g., Salary, Bonus)"
                                value={formData.description}
                                onChange={handleChange}
                                className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                placeholder="Amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Select Category</option>
                                <option value="Salary">Salary</option>
                                <option value="Bonus">Bonus</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Investment">Investment</option>
                                <option value="Gift">Gift</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                type="submit"
                                className="col-span-1 md:col-span-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                                {editingId ? 'Update Income' : 'Add Income'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Incomes List */}
                <div className="space-y-3">
                    {incomes.length > 0 ? (
                        incomes.map(income => (
                            <div key={income._id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:shadow-lg transition">
                                <div>
                                    <p className="font-semibold text-gray-800">{income.description}</p>
                                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{income.category}</span>
                                        <span>{new Date(income.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-2xl font-bold text-green-600">+₹{income.amount.toFixed(2)}</p>
                                    <button
                                        onClick={() => handleEdit(income)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(income._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No incomes yet. Add one to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Incomes;

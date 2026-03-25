import incomeModel from "../models/incomeModel.js"; 
import XLSX from "xlsx";
import getDateRange from "../utils/dateFilter.js";


//add income
export async function addIncome(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "all fields are required."
            });
        }

        const newIncome = new incomeModel({
            userId,
            description,
            amount,
            category,
            date
        });

        await newIncome.save();
        res.json({
            success: true,
            message: "income added successfully.",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}

// to get all income of a user
export async function getIncome(req, res) {
    const userId = req.user._id;
    try {
        const incomes = await incomeModel.find({ userId }).sort({ date: -1 });
        res.json(incomes);
    }
    
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error."
        }); 
    }
}

// update income
export async function updateIncome(req, res) {
    const {id} = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;
    try {
        const income = await incomeModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );
        if (!income) {
            return res.status(404).json({
                success: false,
                message: "income not found."
            });
        }
        res.json({
            success: true,
            message: "income updated successfully.",
            data: income
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}

// delete income
export async function deleteIncome(req, res) {
    try {
        const income = await incomeModel.findOneAndDelete({ _id: req.params.id});
        if (!income) {
            return res.status(404).json({
                success: false,
                message: "income not found."
            });
        }
        return res.json({
            success: true,
            message: "income deleted successfully."
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}
// to download income data in an excel sheet
export async function downloadIncome(req, res) {
    const userId = req.user._id;
    try {
        const incomes = await incomeModel.find({ userId }).sort({ date: -1 });
        const plainData = incomes.map(inc => ({
            description: inc.description,
            amount: inc.amount,
            category: inc.category,
            Date: new Date(inc.date).toLocaleDateString(),
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "IncomeModel");
        XLSX.writeFile(workbook, "income_details.xlsx");
        res.download("income_details.xlsx");
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}
// to get income overview 

export async function getIncomeOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);

        const incomes = await incomeModel.find({
            userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 });

        const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
        const numberOfTransactions = incomes.length;
        const recentTransactions = incomes.slice(0, 9);
        res.json({
            success: true,
            data: {
                totalIncome,
                averageIncome,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error."
        });
    }
}

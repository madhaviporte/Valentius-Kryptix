const Expense = require("../models/Expense");
const Category = require("../models/Category");

// GET /api/expenses
// Optional query params: ?search=food&category=<categoryId>&sort=date|amount&order=asc|desc
const getExpenses = async (req, res, next) => {
  try {
    const { search, category, sort, order } = req.query;

    // Build the filter step by step (empty filter = all expenses)
    const filter = {};
    if (search) {
      // Case-insensitive match on title or notes
      const regex = { $regex: search, $options: "i" };
      filter.$or = [{ title: regex }, { notes: regex }];
    }
    if (category) {
      filter.category = category;
    }

    // Sorting: newest date first by default
    const sortField = sort === "amount" ? "amount" : "date";
    const sortDirection = order === "asc" ? 1 : -1;

    const expenses = await Expense.find(filter)
      .populate("category", "name")
      .sort({ [sortField]: sortDirection });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/:id
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("category", "name");
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, notes, user } = req.body;

    // Manual checks first so the user gets a clear message
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    // Make sure the category actually exists in the database
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: "Selected category does not exist" });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount,
      category,
      date,
      notes: notes ? notes.trim() : "",
      user: user || null,
    });

    const populatedExpense = await Expense.findById(expense._id).populate("category", "name");
    res.status(201).json({ success: true, data: populatedExpense });
  } catch (error) {
    next(error);
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    // Same manual checks as create, but only for fields that are being changed
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ success: false, message: "Title cannot be empty" });
    }
    if (amount !== undefined) {
      if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
      }
    }
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Selected category does not exist" });
      }
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, category, date, notes },
      { new: true, runValidators: true } // return the updated document + re-run schema validation
    ).populate("category", "name");

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    res.status(200).json({ success: true, data: expense, message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};

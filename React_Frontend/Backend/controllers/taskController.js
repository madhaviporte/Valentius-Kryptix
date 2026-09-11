const Task = require("../models/Task");

// Allowed values for the status field (must match the Task model enum)
const VALID_STATUSES = ["pending", "in-progress", "completed"];

// ---------- Helpers ----------

// Checks that the id is a valid MongoDB ObjectId before hitting the database
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

// Checks that a value is a non-empty string after trimming
const isNonEmptyString = (value) => {
    return typeof value === "string" && value.trim().length > 0;
};

// ---------- Controllers ----------

// POST /api/tasks  (protected)
const createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;

        // title is required
        if (!isNonEmptyString(title)) {
            return res.status(400).json({
                message: "Title is required and must be a non-empty string"
            });
        }

        if (title.trim().length > 100) {
            return res.status(400).json({
                message: "Title must not exceed 100 characters"
            });
        }

        // description is optional but must be a string when provided
        if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({
                message: "Description must be a string"
            });
        }

        // status is optional but must be one of the allowed values
        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${VALID_STATUSES.join(", ")}`
            });
        }

        const task = await Task.create({
            title: title.trim(),
            description: description ? description.trim() : "",
            status: status || "pending",
            // The task always belongs to the logged-in user, never to anyone else
            user: req.user.id
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while creating the task"
        });
    }
};

// GET /api/tasks  (protected) - returns only the logged-in user's tasks
const getTasks = async (req, res) => {
    try {
        // Filter by the logged-in user so no one sees anyone else's tasks
        const tasks = await Task.find({ user: req.user.id }).sort({
            createdAt: -1
        });

        res.status(200).json({
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while fetching tasks"
        });
    }
};

// GET /api/tasks/:id  (protected) - returns one of the logged-in user's tasks
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid task id format"
            });
        }

        // Find by id AND user -> a user can only read their own task
        const task = await Task.findOne({ _id: id, user: req.user.id });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while fetching the task"
        });
    }
};

// PUT /api/tasks/:id  (protected) - updates one of the logged-in user's tasks
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid task id format"
            });
        }

        // Reject completely empty update bodies
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update (title, description, status)"
            });
        }

        if (title !== undefined && !isNonEmptyString(title)) {
            return res.status(400).json({
                message: "Title must be a non-empty string"
            });
        }

        if (title !== undefined && title.trim().length > 100) {
            return res.status(400).json({
                message: "Title must not exceed 100 characters"
            });
        }

        if (description !== undefined && typeof description !== "string") {
            return res.status(400).json({
                message: "Description must be a string"
            });
        }

        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Status must be one of: ${VALID_STATUSES.join(", ")}`
            });
        }

        // Find by id AND user -> a user can only update their own task
        const task = await Task.findOne({ _id: id, user: req.user.id });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Only apply the fields that were actually sent
        if (title !== undefined) task.title = title.trim();
        if (description !== undefined) task.description = description.trim();
        if (status !== undefined) task.status = status;

        // updatedAt is refreshed automatically by Mongoose
        await task.save();

        res.status(200).json({
            message: "Task updated successfully",
            task
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while updating the task"
        });
    }
};

// DELETE /api/tasks/:id  (protected) - deletes one of the logged-in user's tasks
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid task id format"
            });
        }

        // Delete by id AND user -> a user can only delete their own task
        const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while deleting the task"
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
};

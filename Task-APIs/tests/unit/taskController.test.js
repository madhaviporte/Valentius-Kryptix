/**
 * Unit tests for controllers/taskController.js
 *
 * The Task model (the only database dependency) is mocked, so the real
 * validation helpers, ownership filtering and response shapes are tested
 * without any MongoDB connection.
 */
jest.mock("../../models/Task", () => ({
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn()
}));

const Task = require("../../models/Task");
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require("../../controllers/taskController");

const USER_ID = "64b000000000000000000001";
const OTHER_USER_ID = "64b000000000000000000002";
const TASK_ID = "64b0000000000000000000aa";

const makeRes = () => {
    const res = { statusCode: null, body: null };
    res.status = jest.fn((code) => {
        res.statusCode = code;
        return res;
    });
    res.json = jest.fn((body) => {
        res.body = body;
        return res;
    });
    return res;
};

const run = async (handler, req) => {
    const res = makeRes();
    await handler(req, res);
    return res;
};

const createReq = (body) => ({ body, user: { id: USER_ID } });
const byIdReq = (body, id) => ({ body, params: { id }, user: { id: USER_ID } });

describe("taskController - createTask", () => {
    test("rejects a missing title", async () => {
        const res = await run(createTask, createReq({ description: "no title" }));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Title is required and must be a non-empty string" });
        expect(Task.create).not.toHaveBeenCalled();
    });

    test("rejects a non-string title", async () => {
        const res = await run(createTask, createReq({ title: 123 }));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Title is required and must be a non-empty string" });
    });

    test("rejects a whitespace-only title", async () => {
        const res = await run(createTask, createReq({ title: "   " }));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Title is required and must be a non-empty string" });
    });

    test("rejects a title longer than 100 characters", async () => {
        const res = await run(createTask, createReq({ title: "a".repeat(101) }));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Title must not exceed 100 characters" });
        expect(Task.create).not.toHaveBeenCalled();
    });

    test("accepts a title of exactly 100 characters (boundary)", async () => {
        const created = { _id: TASK_ID, title: "a".repeat(100) };
        Task.create.mockResolvedValue(created);

        const res = await run(createTask, createReq({ title: "a".repeat(100) }));

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("rejects a non-string description", async () => {
        const res = await run(createTask, createReq({ title: "Task", description: 42 }));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Description must be a string" });
        expect(Task.create).not.toHaveBeenCalled();
    });

    test("rejects a status outside the allowed enum", async () => {
        const res = await run(createTask, createReq({ title: "Task", status: "done" }));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({
            message: "Status must be one of: pending, in-progress, completed"
        });
        expect(Task.create).not.toHaveBeenCalled();
    });

    test("creates a task with defaults and assigns it to the logged-in user", async () => {
        const createdTask = {
            _id: TASK_ID,
            title: "Write tests",
            description: "",
            status: "pending",
            user: USER_ID
        };
        Task.create.mockResolvedValue(createdTask);

        const res = await run(createTask, createReq({ title: "  Write tests  " }));

        expect(Task.create).toHaveBeenCalledWith({
            title: "Write tests",
            description: "",
            status: "pending",
            user: USER_ID // ownership comes from the authenticated user, not the body
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.body).toEqual({ message: "Task created successfully", task: createdTask });
    });

    test("creates a task with all fields provided", async () => {
        Task.create.mockResolvedValue({ _id: TASK_ID });

        const res = await run(
            createTask,
            createReq({ title: "Task", description: "  Details  ", status: "completed" })
        );

        expect(Task.create).toHaveBeenCalledWith({
            title: "Task",
            description: "Details",
            status: "completed",
            user: USER_ID
        });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("returns 500 when the database write fails", async () => {
        Task.create.mockRejectedValue(new Error("database unavailable"));

        const res = await run(createTask, createReq({ title: "Task" }));

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: "Something went wrong while creating the task" });
    });
});

describe("taskController - getTasks", () => {
    test("returns only the logged-in user's tasks, newest first", async () => {
        const tasks = [
            { _id: TASK_ID, title: "Second" },
            { _id: "64b0000000000000000000bb", title: "First" }
        ];
        const sortMock = jest.fn().mockResolvedValue(tasks);
        Task.find.mockReturnValue({ sort: sortMock });

        const res = await run(getTasks, { user: { id: USER_ID } });

        expect(Task.find).toHaveBeenCalledWith({ user: USER_ID });
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body).toEqual({ count: 2, tasks });
    });

    test("returns count 0 when the user has no tasks", async () => {
        Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

        const res = await run(getTasks, { user: { id: USER_ID } });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body).toEqual({ count: 0, tasks: [] });
    });

    test("returns 500 when the database query fails", async () => {
        Task.find.mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error("database unavailable"))
        });

        const res = await run(getTasks, { user: { id: USER_ID } });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: "Something went wrong while fetching tasks" });
    });
});

describe("taskController - getTaskById", () => {
    test.each([
        "not-an-id",
        "zzzzzzzzzzzzzzzzzzzzzzzz", // 24 chars but not hexadecimal
        "64b00000000000000000000" // 23 chars
    ])("rejects the invalid id %s before querying", async (id) => {
        const res = await run(getTaskById, byIdReq(undefined, id));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Invalid task id format" });
        expect(Task.findOne).not.toHaveBeenCalled();
    });

    test("returns 404 when the task does not exist", async () => {
        Task.findOne.mockResolvedValue(null);

        const res = await run(getTaskById, byIdReq(undefined, TASK_ID));

        expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.body).toEqual({ message: "Task not found" });
    });

    test("returns a task belonging to the logged-in user", async () => {
        const task = { _id: TASK_ID, title: "Task", user: USER_ID };
        Task.findOne.mockResolvedValue(task);

        const res = await run(getTaskById, byIdReq(undefined, TASK_ID));

        expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body).toEqual({ task });
    });

    test("returns 500 when the database query fails", async () => {
        Task.findOne.mockRejectedValue(new Error("database unavailable"));

        const res = await run(getTaskById, byIdReq(undefined, TASK_ID));

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: "Something went wrong while fetching the task" });
    });
});

describe("taskController - updateTask", () => {
    const makeTask = () => ({
        _id: TASK_ID,
        title: "Old title",
        description: "Old description",
        status: "pending",
        user: USER_ID,
        save: jest.fn().mockResolvedValue(undefined)
    });

    test("rejects an invalid task id", async () => {
        const res = await run(updateTask, byIdReq({ title: "New" }, "bad-id"));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Invalid task id format" });
        expect(Task.findOne).not.toHaveBeenCalled();
    });

    test("rejects an empty update body", async () => {
        const res = await run(updateTask, byIdReq({}, TASK_ID));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({
            message: "Provide at least one field to update (title, description, status)"
        });
        expect(Task.findOne).not.toHaveBeenCalled();
    });

    test("rejects an empty or non-string title", async () => {
        const res = await run(updateTask, byIdReq({ title: "   " }, TASK_ID));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Title must be a non-empty string" });
    });

    test("rejects a title longer than 100 characters", async () => {
        const res = await run(updateTask, byIdReq({ title: "a".repeat(101) }, TASK_ID));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Title must not exceed 100 characters" });
    });

    test("rejects a non-string description", async () => {
        const res = await run(updateTask, byIdReq({ description: 42 }, TASK_ID));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Description must be a string" });
    });

    test("rejects a status outside the allowed enum", async () => {
        const res = await run(updateTask, byIdReq({ status: "done" }, TASK_ID));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({
            message: "Status must be one of: pending, in-progress, completed"
        });
    });

    test("returns 404 when the task does not exist for this user", async () => {
        Task.findOne.mockResolvedValue(null);

        const res = await run(updateTask, byIdReq({ title: "New" }, TASK_ID));

        expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.body).toEqual({ message: "Task not found" });
    });

    test("applies a partial update, leaving the other fields untouched", async () => {
        const task = makeTask();
        Task.findOne.mockResolvedValue(task);

        const res = await run(updateTask, byIdReq({ status: "in-progress" }, TASK_ID));

        expect(task.status).toBe("in-progress");
        expect(task.title).toBe("Old title");
        expect(task.description).toBe("Old description");
        expect(task.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body).toEqual({ message: "Task updated successfully", task });
    });

    test("leaves the status untouched when only the title is sent", async () => {
        const task = makeTask();
        Task.findOne.mockResolvedValue(task);

        const res = await run(updateTask, byIdReq({ title: "  New title  " }, TASK_ID));

        expect(task.title).toBe("New title");
        expect(task.status).toBe("pending");
        expect(task.description).toBe("Old description");
        expect(task.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body).toEqual({ message: "Task updated successfully", task });
    });

    test("applies a full update with trimmed values", async () => {
        const task = makeTask();
        Task.findOne.mockResolvedValue(task);

        const res = await run(
            updateTask,
            byIdReq(
                { title: "  New title  ", description: "  New description  ", status: "completed" },
                TASK_ID
            )
        );

        expect(task.title).toBe("New title");
        expect(task.description).toBe("New description");
        expect(task.status).toBe("completed");
        expect(task.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body).toEqual({ message: "Task updated successfully", task });
    });

    test("returns 500 when the database lookup fails", async () => {
        Task.findOne.mockRejectedValue(new Error("database unavailable"));

        const res = await run(updateTask, byIdReq({ title: "New" }, TASK_ID));

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: "Something went wrong while updating the task" });
    });
});

describe("taskController - deleteTask", () => {
    test("rejects an invalid task id", async () => {
        const res = await run(deleteTask, byIdReq(undefined, "bad-id"));

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "Invalid task id format" });
        expect(Task.findOneAndDelete).not.toHaveBeenCalled();
    });

    test("returns 404 when the task does not exist for this user", async () => {
        Task.findOneAndDelete.mockResolvedValue(null);

        const res = await run(deleteTask, byIdReq(undefined, TASK_ID));

        expect(Task.findOneAndDelete).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.body).toEqual({ message: "Task not found" });
    });

    test("deletes a task belonging to the logged-in user", async () => {
        Task.findOneAndDelete.mockResolvedValue({ _id: TASK_ID, user: USER_ID });

        const res = await run(deleteTask, byIdReq(undefined, TASK_ID));

        expect(Task.findOneAndDelete).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body).toEqual({ message: "Task deleted successfully" });
    });

    test("returns 500 when the database delete fails", async () => {
        Task.findOneAndDelete.mockRejectedValue(new Error("database unavailable"));

        const res = await run(deleteTask, byIdReq(undefined, TASK_ID));

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: "Something went wrong while deleting the task" });
    });
});

// ensures the ownership filter is never built from a different user id
test("every ownership query uses the authenticated user id", async () => {
    Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    Task.findOne.mockResolvedValue(null);
    Task.findOneAndDelete.mockResolvedValue(null);

    await run(getTasks, { user: { id: OTHER_USER_ID } });
    await run(getTaskById, { params: { id: TASK_ID }, user: { id: OTHER_USER_ID } });
    await run(deleteTask, { params: { id: TASK_ID }, user: { id: OTHER_USER_ID } });

    expect(Task.find).toHaveBeenCalledWith({ user: OTHER_USER_ID });
    expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID, user: OTHER_USER_ID });
    expect(Task.findOneAndDelete).toHaveBeenCalledWith({ _id: TASK_ID, user: OTHER_USER_ID });
});

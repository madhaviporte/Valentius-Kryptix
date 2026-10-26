/**
 * Integration tests for /api/tasks (create, list, read, update, delete).
 *
 * Requests go through the real protect middleware with real JWTs and the
 * real routes/controllers from server.js. Only the Task model (the database
 * access) is mocked, so tests are repeatable and never touch a database.
 */
jest.mock("../../models/Task", () => ({
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn()
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const Task = require("../../models/Task");
const { app } = require("../helpers/testApp");

const USER_ID = "64b000000000000000000001";
const TASK_ID = "64b0000000000000000000aa";

const TOKEN = jwt.sign({ userId: USER_ID }, process.env.JWT_SECRET);
const bearer = `Bearer ${TOKEN}`;

const makeTask = (overrides = {}) => ({
    _id: TASK_ID,
    title: "Old title",
    description: "Old description",
    status: "pending",
    user: USER_ID,
    ...overrides
});

describe("JWT authentication on /api/tasks", () => {
    test("returns 401 without an Authorization header", async () => {
        const res = await request(app).get("/api/tasks");

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: "Not authorized, no token provided" });
        expect(Task.find).not.toHaveBeenCalled();
    });

    test("returns 401 when the header does not use the Bearer scheme", async () => {
        const res = await request(app).get("/api/tasks").set("Authorization", `Token ${TOKEN}`);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: "Not authorized, no token provided" });
    });

    test("returns 401 for a malformed token", async () => {
        const res = await request(app).get("/api/tasks").set("Authorization", "Bearer not.a.token");

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: "Not authorized, token is invalid or expired" });
    });

    test("returns 401 for a token signed with another secret", async () => {
        const forged = jwt.sign({ userId: USER_ID }, "not-the-server-secret");
        const res = await request(app)
            .get("/api/tasks")
            .set("Authorization", `Bearer ${forged}`);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: "Not authorized, token is invalid or expired" });
        expect(Task.find).not.toHaveBeenCalled();
    });

    test("returns 401 for an expired token", async () => {
        const expired = jwt.sign({ userId: USER_ID }, process.env.JWT_SECRET, { expiresIn: -10 });
        const res = await request(app)
            .get("/api/tasks")
            .set("Authorization", `Bearer ${expired}`);

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: "Not authorized, token is invalid or expired" });
    });

    test("rejects write requests without a token as well", async () => {
        const res = await request(app).post("/api/tasks").send({ title: "Task" });

        expect(res.status).toBe(401);
        expect(Task.create).not.toHaveBeenCalled();
    });
});

describe("POST /api/tasks", () => {
    test("creates a task for the logged-in user and returns 201", async () => {
        const createdTask = {
            _id: TASK_ID,
            title: "Write tests",
            description: "",
            status: "pending",
            user: USER_ID
        };
        Task.create.mockResolvedValue(createdTask);

        const res = await request(app)
            .post("/api/tasks")
            .set("Authorization", bearer)
            .send({ title: "  Write tests  " });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ message: "Task created successfully", task: createdTask });
        // ownership always comes from the token, never from the body
        expect(Task.create).toHaveBeenCalledWith({
            title: "Write tests",
            description: "",
            status: "pending",
            user: USER_ID
        });
    });

    test("creates a task with all fields provided", async () => {
        Task.create.mockResolvedValue({ _id: TASK_ID });

        const res = await request(app)
            .post("/api/tasks")
            .set("Authorization", bearer)
            .send({ title: "Task", description: "Details", status: "completed" });

        expect(res.status).toBe(201);
        expect(Task.create).toHaveBeenCalledWith({
            title: "Task",
            description: "Details",
            status: "completed",
            user: USER_ID
        });
    });

    test("returns 400 when the title is missing", async () => {
        const res = await request(app)
            .post("/api/tasks")
            .set("Authorization", bearer)
            .send({ description: "no title" });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "Title is required and must be a non-empty string"
        });
        expect(Task.create).not.toHaveBeenCalled();
    });

    test("returns 400 when the title exceeds 100 characters", async () => {
        const res = await request(app)
            .post("/api/tasks")
            .set("Authorization", bearer)
            .send({ title: "a".repeat(101) });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Title must not exceed 100 characters" });
    });

    test("returns 400 when the description is not a string", async () => {
        const res = await request(app)
            .post("/api/tasks")
            .set("Authorization", bearer)
            .send({ title: "Task", description: 42 });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Description must be a string" });
    });

    test("returns 400 when the status is not one of the allowed values", async () => {
        const res = await request(app)
            .post("/api/tasks")
            .set("Authorization", bearer)
            .send({ title: "Task", status: "done" });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "Status must be one of: pending, in-progress, completed"
        });
        expect(Task.create).not.toHaveBeenCalled();
    });
});

describe("GET /api/tasks", () => {
    test("returns only the logged-in user's tasks with a count", async () => {
        const tasks = [
            { _id: TASK_ID, title: "Second", status: "pending", user: USER_ID },
            { _id: "64b0000000000000000000bb", title: "First", status: "completed", user: USER_ID }
        ];
        Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(tasks) });

        const res = await request(app).get("/api/tasks").set("Authorization", bearer);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ count: 2, tasks });
        expect(Task.find).toHaveBeenCalledWith({ user: USER_ID });
    });

    test("returns count 0 for a user without tasks", async () => {
        Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

        const res = await request(app).get("/api/tasks").set("Authorization", bearer);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ count: 0, tasks: [] });
    });

    test("returns 500 when the database query fails", async () => {
        Task.find.mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error("database unavailable"))
        });

        const res = await request(app).get("/api/tasks").set("Authorization", bearer);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Something went wrong while fetching tasks" });
    });
});

describe("GET /api/tasks/:id", () => {
    test("returns 400 for an invalid task id", async () => {
        const res = await request(app)
            .get("/api/tasks/not-an-id")
            .set("Authorization", bearer);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Invalid task id format" });
        expect(Task.findOne).not.toHaveBeenCalled();
    });

    test("returns 404 when the task does not exist", async () => {
        Task.findOne.mockResolvedValue(null);

        const res = await request(app)
            .get(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer);

        expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: "Task not found" });
    });

    test("returns the task when it belongs to the logged-in user", async () => {
        const task = { _id: TASK_ID, title: "Task", status: "pending", user: USER_ID };
        Task.findOne.mockResolvedValue(task);

        const res = await request(app)
            .get(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ task });
        expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
    });

    test("returns 500 when the database query fails", async () => {
        Task.findOne.mockRejectedValue(new Error("database unavailable"));

        const res = await request(app)
            .get(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Something went wrong while fetching the task" });
    });
});

describe("PUT /api/tasks/:id", () => {
    test("updates the sent fields only and returns 200", async () => {
        const task = makeTask();
        task.save = jest.fn().mockResolvedValue(undefined);
        Task.findOne.mockResolvedValue(task);

        const res = await request(app)
            .put(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer)
            .send({ status: "in-progress" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: "Task updated successfully",
            task: {
                _id: TASK_ID,
                title: "Old title", // untouched
                description: "Old description", // untouched
                status: "in-progress",
                user: USER_ID
            }
        });
        expect(task.save).toHaveBeenCalledTimes(1);
        expect(Task.findOne).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
    });

    test("returns 400 for an empty update body", async () => {
        const res = await request(app)
            .put(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "Provide at least one field to update (title, description, status)"
        });
        expect(Task.findOne).not.toHaveBeenCalled();
    });

    test("returns 400 for an invalid status", async () => {
        const res = await request(app)
            .put(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer)
            .send({ status: "done" });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "Status must be one of: pending, in-progress, completed"
        });
    });

    test("returns 400 for an invalid task id", async () => {
        const res = await request(app)
            .put("/api/tasks/bad-id")
            .set("Authorization", bearer)
            .send({ title: "New" });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Invalid task id format" });
    });

    test("returns 404 when the task does not exist for this user", async () => {
        Task.findOne.mockResolvedValue(null);

        const res = await request(app)
            .put(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer)
            .send({ title: "New" });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: "Task not found" });
    });

    test("returns 500 when the database update fails", async () => {
        Task.findOne.mockRejectedValue(new Error("database unavailable"));

        const res = await request(app)
            .put(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer)
            .send({ title: "New" });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Something went wrong while updating the task" });
    });
});

describe("DELETE /api/tasks/:id", () => {
    test("deletes the task and returns 200", async () => {
        Task.findOneAndDelete.mockResolvedValue({ _id: TASK_ID, user: USER_ID });

        const res = await request(app)
            .delete(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "Task deleted successfully" });
        expect(Task.findOneAndDelete).toHaveBeenCalledWith({ _id: TASK_ID, user: USER_ID });
    });

    test("returns 400 for an invalid task id", async () => {
        const res = await request(app)
            .delete("/api/tasks/bad-id")
            .set("Authorization", bearer);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Invalid task id format" });
        expect(Task.findOneAndDelete).not.toHaveBeenCalled();
    });

    test("returns 404 when the task does not exist for this user", async () => {
        Task.findOneAndDelete.mockResolvedValue(null);

        const res = await request(app)
            .delete(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: "Task not found" });
    });

    test("returns 500 when the database delete fails", async () => {
        Task.findOneAndDelete.mockRejectedValue(new Error("database unavailable"));

        const res = await request(app)
            .delete(`/api/tasks/${TASK_ID}`)
            .set("Authorization", bearer);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Something went wrong while deleting the task" });
    });
});

/**
 * Unit tests for models/User.js and models/Task.js
 *
 * Mongoose schema validation runs entirely in memory (document.validate()),
 * so these tests verify required fields, defaults, trimming/lowercasing and
 * the status enum without ever connecting to MongoDB.
 */
const mongoose = require("mongoose");
const User = require("../../models/User");
const Task = require("../../models/Task");

const OBJECT_ID = new mongoose.Types.ObjectId();

// validate() rejects on invalid documents; capture the ValidationError instead.
const validationError = (doc) => doc.validate().then(() => null, (error) => error);

describe("User model", () => {
    test("registers the model under the name User", () => {
        expect(User.modelName).toBe("User");
    });

    test("requires name, email and password", async () => {
        const error = await validationError(new User({}));

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(Object.keys(error.errors).sort()).toEqual(["email", "name", "password"]);
    });

    test("reports a cast error for a non-string name", async () => {
        const error = await validationError(
            new User({ name: {}, email: "user@example.com", password: "123456" })
        );

        expect(error).toBeDefined();
        expect(error.errors.name).toBeDefined();
    });

    test("trims the name and trims + lowercases the email on assignment", async () => {
        const user = new User({
            name: "  Madhavi  ",
            email: "  Madhavi@Example.COM  ",
            password: "123456"
        });

        expect(user.name).toBe("Madhavi");
        expect(user.email).toBe("madhavi@example.com");
        await user.validate(); // resolves for a valid document, rejects otherwise
    });
});

describe("Task model", () => {
    test("registers the model under the name Task", () => {
        expect(Task.modelName).toBe("Task");
    });

    test("requires a title and an owning user", async () => {
        const error = await validationError(new Task({}));

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(Object.keys(error.errors).sort()).toEqual(["title", "user"]);
    });

    test("applies defaults: empty description and pending status", async () => {
        const task = new Task({ title: "  Buy milk  ", user: OBJECT_ID });

        expect(task.title).toBe("Buy milk"); // trimmed
        expect(task.description).toBe("");
        expect(task.status).toBe("pending");
        await task.validate(); // resolves for a valid document, rejects otherwise
    });

    test.each(["pending", "in-progress", "completed"])("accepts the status %s", async (status) => {
        const task = new Task({ title: "Task", status, user: OBJECT_ID });

        await task.validate(); // resolves for a valid document, rejects otherwise
    });

    test("rejects a status outside the enum", async () => {
        const task = new Task({ title: "Task", user: OBJECT_ID });
        task.status = "done";

        const error = await validationError(task);

        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.status).toBeDefined();
        expect(error.errors.status.kind).toBe("enum");
    });

    test("stores the owning user id", () => {
        const task = new Task({ title: "Task", user: OBJECT_ID });

        expect(task.user.equals(OBJECT_ID)).toBe(true);
    });
});

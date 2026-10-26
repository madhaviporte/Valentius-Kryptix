/**
 * Integration tests for POST /api/auth/register and POST /api/auth/login.
 *
 * Requests travel through the real Express app from server.js, the real
 * auth routes and controllers, and real bcrypt hashing / JWT signing.
 * Only the User model (the database access) is mocked, so the suite is
 * repeatable and never touches a real database.
 */
jest.mock("../../models/User", () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));

const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { app } = require("../helpers/testApp");

const USER_ID = "64b000000000000000000001";

describe("POST /api/auth/register", () => {
    test("registers a user and returns 201 with safe fields only", async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
            _id: USER_ID,
            name: "Madhavi",
            email: "madhavi@example.com",
            createdAt: "2026-10-26T10:00:00.000Z"
        });

        const res = await request(app).post("/api/auth/register").send({
            name: "  Madhavi  ",
            email: "  Madhavi@Example.COM  ",
            password: "secret1"
        });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            message: "User registered successfully",
            user: {
                id: USER_ID,
                name: "Madhavi",
                email: "madhavi@example.com",
                createdAt: "2026-10-26T10:00:00.000Z"
            }
        });
        expect(res.body.user).not.toHaveProperty("password");

        expect(User.findOne).toHaveBeenCalledWith({ email: "madhavi@example.com" });
        const stored = User.create.mock.calls[0][0];
        expect(stored.name).toBe("Madhavi");
        expect(stored.email).toBe("madhavi@example.com");
        expect(stored.password).not.toBe("secret1"); // stored hashed, never plain text
        expect(await bcrypt.compare("secret1", stored.password)).toBe(true);
    });

    test("returns 400 for a duplicate email", async () => {
        User.findOne.mockResolvedValue({ _id: USER_ID });

        const res = await request(app).post("/api/auth/register").send({
            name: "Madhavi",
            email: "madhavi@example.com",
            password: "secret1"
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "User with this email already exists" });
        expect(User.create).not.toHaveBeenCalled();
    });

    test("returns 400 when the name is missing", async () => {
        const res = await request(app).post("/api/auth/register").send({
            email: "madhavi@example.com",
            password: "secret1"
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "Name is required and must be a non-empty string"
        });
        expect(User.findOne).not.toHaveBeenCalled();
    });

    test("returns 400 for an invalid email", async () => {
        const res = await request(app).post("/api/auth/register").send({
            name: "Madhavi",
            email: "not-an-email",
            password: "secret1"
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "A valid email is required (e.g. user@example.com)"
        });
    });

    test("returns 400 for a password shorter than 6 characters", async () => {
        const res = await request(app).post("/api/auth/register").send({
            name: "Madhavi",
            email: "madhavi@example.com",
            password: "12345"
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "Password is required and must be at least 6 characters"
        });
    });

    test("returns 500 when the request has no body at all", async () => {
        // Existing behavior: Express 5 leaves req.body undefined when no
        // body is sent, the destructure inside registerUser throws, and the
        // controller's catch block answers 500.
        const res = await request(app).post("/api/auth/register");

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Something went wrong during registration" });
    });

    test("returns 500 when the database write fails", async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockRejectedValue(new Error("database unavailable"));

        const res = await request(app).post("/api/auth/register").send({
            name: "Madhavi",
            email: "madhavi@example.com",
            password: "secret1"
        });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Something went wrong during registration" });
    });
});

describe("POST /api/auth/login", () => {
    const storedPassword = "correct-password";

    const mockExistingUser = async () => {
        const hash = await bcrypt.hash(storedPassword, 4);
        User.findOne.mockResolvedValue({
            _id: USER_ID,
            name: "Madhavi",
            email: "madhavi@example.com",
            password: hash
        });
    };

    test("logs in and returns a verifiable JWT with 200", async () => {
        await mockExistingUser();

        const res = await request(app).post("/api/auth/login").send({
            email: "  Madhavi@Example.COM  ",
            password: storedPassword
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Login successful");
        expect(res.body.user).toEqual({
            id: USER_ID,
            name: "Madhavi",
            email: "madhavi@example.com"
        });
        expect(res.body).not.toHaveProperty("password");
        expect(User.findOne).toHaveBeenCalledWith({ email: "madhavi@example.com" });

        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded.userId).toBe(USER_ID);
        expect(decoded.exp).toBeDefined(); // signed with expiresIn: "1d"
    });

    test("returns 401 for an unknown email", async () => {
        User.findOne.mockResolvedValue(null);

        const res = await request(app).post("/api/auth/login").send({
            email: "nobody@example.com",
            password: storedPassword
        });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: "Invalid email or password" });
    });

    test("returns 401 for a wrong password", async () => {
        await mockExistingUser();

        const res = await request(app).post("/api/auth/login").send({
            email: "madhavi@example.com",
            password: "wrong-password"
        });

        expect(res.status).toBe(401);
        // same message as an unknown email - no user enumeration
        expect(res.body).toEqual({ message: "Invalid email or password" });
    });

    test("returns 400 for an invalid email", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "not-an-email",
            password: storedPassword
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "A valid email is required (e.g. user@example.com)"
        });
        expect(User.findOne).not.toHaveBeenCalled();
    });

    test("returns 400 when the password is missing", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "madhavi@example.com"
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Password is required" });
    });

    test("returns 500 when the database lookup fails", async () => {
        User.findOne.mockRejectedValue(new Error("database unavailable"));

        const res = await request(app).post("/api/auth/login").send({
            email: "madhavi@example.com",
            password: storedPassword
        });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Something went wrong during login" });
    });
});

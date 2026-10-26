/**
 * Unit tests for controllers/authController.js
 *
 * The User model (the only database dependency) is mocked, so these tests
 * exercise the real validation, hashing, JWT and response-building logic
 * without any MongoDB connection. bcryptjs and jsonwebtoken stay real.
 */
jest.mock("../../models/User", () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { registerUser, loginUser } = require("../../controllers/authController");

const USER_ID = "64b000000000000000000001";

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

const register = async (body) => {
    const res = makeRes();
    await registerUser({ body }, res);
    return res;
};

const login = async (body) => {
    const res = makeRes();
    await loginUser({ body }, res);
    return res;
};

describe("authController - registerUser", () => {
    describe("validation failures (400)", () => {
        test("rejects a missing name", async () => {
            const res = await register({ email: "user@example.com", password: "123456" });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({
                message: "Name is required and must be a non-empty string"
            });
            expect(User.findOne).not.toHaveBeenCalled();
            expect(User.create).not.toHaveBeenCalled();
        });

        test("rejects a non-string name", async () => {
            const res = await register({ name: 42, email: "user@example.com", password: "123456" });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({
                message: "Name is required and must be a non-empty string"
            });
        });

        test("rejects a whitespace-only name", async () => {
            const res = await register({ name: "   ", email: "user@example.com", password: "123456" });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({
                message: "Name is required and must be a non-empty string"
            });
        });

        test.each([
            ["a missing email", undefined],
            ["a non-string email", 42],
            ["an email without @", "user.example.com"],
            ["an email without a domain part", "user@localhost"],
            ["an email without a TLD", "user@example"],
            ["an email containing spaces", "user name@example.com"]
        ])("rejects %s", async (_label, email) => {
            const res = await register({ name: "Madhavi", email, password: "123456" });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({
                message: "A valid email is required (e.g. user@example.com)"
            });
            expect(User.findOne).not.toHaveBeenCalled();
        });

        test("rejects a missing password", async () => {
            const res = await register({ name: "Madhavi", email: "user@example.com" });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({
                message: "Password is required and must be at least 6 characters"
            });
            expect(User.findOne).not.toHaveBeenCalled();
        });

        test("rejects a password shorter than 6 characters", async () => {
            const res = await register({ name: "Madhavi", email: "user@example.com", password: "12345" });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({
                message: "Password is required and must be at least 6 characters"
            });
        });

        test("rejects a non-string password", async () => {
            const res = await register({ name: "Madhavi", email: "user@example.com", password: 123456 });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({
                message: "Password is required and must be at least 6 characters"
            });
        });
    });

    test("rejects a duplicate email before creating the user", async () => {
        User.findOne.mockResolvedValue({ _id: USER_ID });

        const res = await register({ name: "Madhavi", email: "user@example.com", password: "123456" });

        expect(User.findOne).toHaveBeenCalledWith({ email: "user@example.com" });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "User with this email already exists" });
        expect(User.create).not.toHaveBeenCalled();
    });

    test("registers a user: normalizes input, hashes the password and returns safe fields only", async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue({
            _id: USER_ID,
            name: "Madhavi",
            email: "madhavi@example.com",
            createdAt: "2026-10-26T10:00:00.000Z"
        });

        const res = await register({
            name: "  Madhavi  ",
            email: "  Madhavi@Example.COM  ",
            password: "secret1"
        });

        // lookup and storage use the trimmed, lowercased email
        expect(User.findOne).toHaveBeenCalledWith({ email: "madhavi@example.com" });
        expect(User.create).toHaveBeenCalledTimes(1);

        const created = User.create.mock.calls[0][0];
        expect(created.name).toBe("Madhavi");
        expect(created.email).toBe("madhavi@example.com");
        expect(created.password).not.toBe("secret1"); // never stored in plain text
        expect(await bcrypt.compare("secret1", created.password)).toBe(true);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.body).toEqual({
            message: "User registered successfully",
            user: {
                id: USER_ID,
                name: "Madhavi",
                email: "madhavi@example.com",
                createdAt: "2026-10-26T10:00:00.000Z"
            }
        });
        expect(res.body.user).not.toHaveProperty("password"); // password never returned
    });

    test("maps a duplicate-key race (code 11000) to 400", async () => {
        User.findOne.mockResolvedValue(null);
        const duplicateError = new Error("E11000 duplicate key error");
        duplicateError.code = 11000;
        User.create.mockRejectedValue(duplicateError);

        const res = await register({ name: "Madhavi", email: "user@example.com", password: "123456" });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: "User with this email already exists" });
    });

    test("returns 500 when the database write fails", async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockRejectedValue(new Error("database unavailable"));

        const res = await register({ name: "Madhavi", email: "user@example.com", password: "123456" });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: "Something went wrong during registration" });
    });

    test("returns 500 when the duplicate lookup fails", async () => {
        User.findOne.mockRejectedValue(new Error("database unavailable"));

        const res = await register({ name: "Madhavi", email: "user@example.com", password: "123456" });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: "Something went wrong during registration" });
    });
});

describe("authController - loginUser", () => {
    describe("validation failures (400)", () => {
        test.each([
            ["a missing email", undefined],
            ["a non-string email", 42],
            ["a malformed email", "not-an-email"]
        ])("rejects %s", async (_label, email) => {
            const res = await login({ email, password: "123456" });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({
                message: "A valid email is required (e.g. user@example.com)"
            });
            expect(User.findOne).not.toHaveBeenCalled();
        });

        test("rejects a missing password", async () => {
            const res = await login({ email: "user@example.com" });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({ message: "Password is required" });
            expect(User.findOne).not.toHaveBeenCalled();
        });

        test("rejects a non-string password", async () => {
            const res = await login({ email: "user@example.com", password: 123456 });

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.body).toEqual({ message: "Password is required" });
        });
    });

    test("returns 401 with the same message for an unknown email", async () => {
        User.findOne.mockResolvedValue(null);

        const res = await login({ email: "nobody@example.com", password: "123456" });

        expect(User.findOne).toHaveBeenCalledWith({ email: "nobody@example.com" });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Invalid email or password" });
    });

    test("returns 401 with the same message for a wrong password", async () => {
        const storedHash = await bcrypt.hash("correct-password", 4);
        User.findOne.mockResolvedValue({
            _id: USER_ID,
            name: "Madhavi",
            email: "madhavi@example.com",
            password: storedHash
        });

        const res = await login({ email: "madhavi@example.com", password: "wrong-password" });

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Invalid email or password" });
    });

    test("logs in successfully and returns a JWT containing the user id", async () => {
        const storedHash = await bcrypt.hash("correct-password", 4);
        User.findOne.mockResolvedValue({
            _id: USER_ID,
            name: "Madhavi",
            email: "madhavi@example.com",
            password: storedHash
        });

        const res = await login({
            email: "  Madhavi@Example.COM  ",
            password: "correct-password"
        });

        expect(User.findOne).toHaveBeenCalledWith({ email: "madhavi@example.com" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.body.message).toBe("Login successful");
        expect(res.body.user).toEqual({
            id: USER_ID,
            name: "Madhavi",
            email: "madhavi@example.com"
        });
        expect(res.body).not.toHaveProperty("password");

        // the token really verifies against the configured secret
        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(decoded.userId).toBe(USER_ID);
        expect(decoded.exp).toBeDefined(); // signed with expiresIn: "1d"
    });

    test("returns 500 when the lookup fails", async () => {
        User.findOne.mockRejectedValue(new Error("database unavailable"));

        const res = await login({ email: "user@example.com", password: "123456" });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: "Something went wrong during login" });
    });
});

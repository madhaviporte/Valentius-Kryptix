/**
 * Unit tests for middleware/authMiddleware.js (protect)
 *
 * The middleware is exercised directly with plain request/response objects
 * and real JSON Web Tokens signed with the test secret from tests/setup.js.
 * No HTTP server and no database are involved.
 */
const jwt = require("jsonwebtoken");
const { protect } = require("../../middleware/authMiddleware");

const USER_ID = "64b000000000000000000001";
const SECRET = process.env.JWT_SECRET;

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

const runProtect = async (authorization) => {
    const req = { headers: authorization === undefined ? {} : { authorization } };
    const res = makeRes();
    const next = jest.fn();
    await protect(req, res, next);
    return { req, res, next };
};

describe("authMiddleware - protect", () => {
    test("returns 401 when the Authorization header is missing", async () => {
        const { res, next } = await runProtect(undefined);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Not authorized, no token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    test("returns 401 when the header does not use the Bearer scheme", async () => {
        const { res, next } = await runProtect(`Token ${jwt.sign({ userId: USER_ID }, SECRET)}`);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Not authorized, no token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    test("returns 401 when the header is exactly 'Bearer' with no token", async () => {
        const { res, next } = await runProtect("Bearer");

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Not authorized, no token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    test("attaches the user id and calls next() for a valid token", async () => {
        const token = jwt.sign({ userId: USER_ID }, SECRET);
        const { req, res, next } = await runProtect(`Bearer ${token}`);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(req.user).toEqual({ id: USER_ID });
    });

    test("returns 401 for a token signed with a different secret", async () => {
        const token = jwt.sign({ userId: USER_ID }, "some-other-secret");
        const { res, next } = await runProtect(`Bearer ${token}`);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Not authorized, token is invalid or expired" });
        expect(next).not.toHaveBeenCalled();
    });

    test("returns 401 for an expired token", async () => {
        const token = jwt.sign({ userId: USER_ID }, SECRET, { expiresIn: -10 });
        const { res, next } = await runProtect(`Bearer ${token}`);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Not authorized, token is invalid or expired" });
        expect(next).not.toHaveBeenCalled();
    });

    test("returns 401 for a malformed token", async () => {
        const { res, next } = await runProtect("Bearer not.a.real.jwt");

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Not authorized, token is invalid or expired" });
        expect(next).not.toHaveBeenCalled();
    });

    test("returns 401 when the Bearer token is empty", async () => {
        const { res, next } = await runProtect("Bearer ");

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.body).toEqual({ message: "Not authorized, token is invalid or expired" });
        expect(next).not.toHaveBeenCalled();
    });

    test("throws at require time when JWT_SECRET is missing", () => {
        const originalSecret = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;

        try {
            jest.isolateModules(() => {
                expect(() => require("../../middleware/authMiddleware")).toThrow(
                    "JWT_SECRET is missing"
                );
            });
        } finally {
            process.env.JWT_SECRET = originalSecret;
        }

        // the module loaded in the main registry still works after the restore
        expect(typeof protect).toBe("function");
    });
});

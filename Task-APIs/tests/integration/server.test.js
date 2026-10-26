/**
 * Integration tests for server.js itself: the root endpoint, the 404
 * handler, both JSON error-handler branches and the startup paths around
 * the MongoDB connection.
 *
 * PORT is set before the app loads so the truthy side of server.js's
 * `parseInt(process.env.PORT, 10) || 3000` is exercised here, while the
 * other test files (with PORT="" from tests/setup.js) cover the 3000
 * fallback. No port is ever bound - the test bootstrap disables listen().
 */
process.env.PORT = "4500";

const request = require("supertest");
const { app, loadApp } = require("../helpers/testApp");

describe("server.js", () => {
    test("GET / returns the root message", async () => {
        const res = await request(app).get("/");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "Task API is running" });
    });

    test("returns 404 for unknown routes", async () => {
        const res = await request(app).get("/definitely/not/a/route");

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: "Route not found" });
    });

    test("returns 400 for a malformed JSON body", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .set("Content-Type", "application/json")
            .send("{ this is not json");

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Invalid JSON in request body" });
    });

    test("routes a too-large JSON body to the generic 500 error handler", async () => {
        // body-parser rejects it with type "entity.too.large" (not
        // "entity.parse.failed"), so server.js's error handler answers 500
        const res = await request(app)
            .post("/api/auth/register")
            .set("Content-Type", "application/json")
            .send('{"padding":"' + "x".repeat(150000) + '"}');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Something went wrong on the server" });
    });

    test("starts up without crashing when the database connection fails", () => {
        const logs = [];

        jest.isolateModules(() => {
            const mongoose = require("mongoose");
            // a thenable whose .catch() rejects, like a failed connect()
            mongoose.connect = () => ({
                then() {
                    return {
                        catch(onFailed) {
                            onFailed(new Error("simulated connection failure"));
                        }
                    };
                }
            });

            // loads a fresh copy of server.js; startup logs are collected
            expect(() => loadApp({ logs })).not.toThrow();
        });

        expect(logs).toContainEqual([
            "MongoDB connection failed:",
            "simulated connection failure"
        ]);
    });
});

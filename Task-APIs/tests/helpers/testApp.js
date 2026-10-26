/**
 * Test bootstrap for the real application.
 *
 * server.js does two side-effectful things the moment it is required:
 *
 *   1. mongoose.connect(process.env.MONGO_URI) - tests must NEVER open a real
 *      database connection, so mongoose.connect is replaced with a synchronous
 *      thenable. server.js only chains .then(...).catch(...) onto the result,
 *      so invoking those callbacks synchronously exercises the same code paths
 *      without leaving an open handle. The startup logs are muted below.
 *
 *   2. app.listen(PORT) - tests must not bind a port. The HTTP server that
 *      express' app.listen() builds is intercepted while server.js loads:
 *      the app instance is captured (that is how we obtain the app, since
 *      server.js does not export it) and Server.prototype.listen is a no-op
 *      for the duration of the require. Both patches are restored in `finally`
 *      before any test - and before supertest, which needs the real listen().
 *
 * Everything else is the untouched application: real routes, controllers,
 * middleware, error handlers and 404 handler. Only MongoDB access is mocked.
 */
const http = require("http");
const net = require("net");
const mongoose = require("mongoose");

// Synchronous thenable: .then(cb) runs cb now; .catch(cb) is a no-op so the
// "connection failed" path stays silent while tests use the working stub.
mongoose.connect = function connectForTests() {
    return {
        then(onConnected) {
            onConnected();
            return {
                catch() {
                    // no connection error to handle with the success stub
                }
            };
        }
    };
};

/**
 * Requires server.js and returns the exact Express app instance it created,
 * without binding a port or logging startup messages.
 *
 * @param {{ logs?: unknown[][] }} [options] - when `logs` is provided, muted
 *   console.log calls made during the require are collected there instead.
 */
function loadApp(options = {}) {
    const logs = options.logs;
    let capturedApp = null;

    const originalCreateServer = http.createServer;
    http.createServer = function createServerForCapture(requestListener) {
        capturedApp = requestListener;
        return originalCreateServer.call(http, requestListener);
    };

    const originalListen = net.Server.prototype.listen;
    net.Server.prototype.listen = function listenWithoutBinding(...args) {
        // pretend the listen succeeded (without binding) so server.js's
        // startup callback runs just like it does in production; the
        // callback is the last argument of listen(port, ..., callback)
        const done = args[args.length - 1];
        if (typeof done === "function") done();
        return this;
    };

    const originalLog = console.log;
    console.log = (...args) => {
        if (logs) logs.push(args);
    };

    try {
        require("../../server");
    } finally {
        http.createServer = originalCreateServer;
        net.Server.prototype.listen = originalListen;
        console.log = originalLog;
    }

    if (typeof capturedApp !== "function") {
        throw new Error("testApp helper could not capture the Express app from server.js");
    }

    return capturedApp;
}

const app = loadApp();

module.exports = { app, loadApp };

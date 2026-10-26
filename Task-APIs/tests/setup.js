/**
 * Test environment configuration (loaded via jest.config.js `setupFiles`,
 * i.e. before any application module is required).
 *
 * These values make the suite deterministic and safe:
 * - JWT_SECRET: tests sign and verify tokens with this known value, so they
 *   never depend on (or expose) the real secret from .env. dotenv cannot
 *   overwrite it because dotenv does not replace already-set variables.
 * - MONGO_URI: a dummy value; tests never dial it because the test bootstrap
 *   (tests/helpers/testApp.js) stubs mongoose.connect before server.js runs.
 * - PORT: empty string so server.js exercises its "PORT missing" fallback
 *   (parseInt("") -> NaN -> 3000). No port is ever bound during tests.
 * - NODE_ENV: standard test environment marker.
 *
 * No .env file and no running MongoDB instance are required for `npm test`.
 */
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-only-used-by-jest";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/task-api-tests-never-connected";
process.env.PORT = "";

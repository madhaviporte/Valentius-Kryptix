/** Jest configuration for the Task API test suite. */
module.exports = {
    testEnvironment: "node",

    // Runs before any test file (or application module) is loaded.
    setupFiles: ["<rootDir>/tests/setup.js"],

    // Only the files in tests/ that end with .test.js are test suites;
    // helpers (tests/helpers/) and setup (tests/setup.js) are never run as tests.
    testMatch: ["<rootDir>/tests/**/*.test.js"],

    // Isolate each test from the mock usage of the previous one.
    clearMocks: true,

    // Report coverage for the application code only (never node_modules).
    collectCoverageFrom: [
        "server.js",
        "controllers/**/*.js",
        "routes/**/*.js",
        "middleware/**/*.js",
        "models/**/*.js"
    ],
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: ["/node_modules/"],
    coverageReporters: ["text", "lcov", "json-summary"],

    // Fail the coverage run if any metric drops below 80%.
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
        }
    }
};

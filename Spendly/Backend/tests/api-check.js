// Simple API smoke test for Spendly - no dependencies, uses Node's built-in fetch.
// Run while the backend is running:  npm run test:api   (or: node tests/api-check.js)
// Optional: set API_URL to test a deployed backend, e.g. API_URL=https://your-api.onrender.com

const BASE_URL = process.env.API_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

const check = (name, condition, detail = "") => {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${detail ? `- ${detail}` : ""}`);
  }
};

const request = async (method, path, body) => {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    // response had no JSON body
  }
  return { status: res.status, data };
};

const cleanupIds = { expenses: [], categories: [], users: [] };

async function main() {
  console.log(`\nSpendly API smoke test -> ${BASE_URL}\n`);

  // ---------- Health ----------
  console.log("[Health]");
  let r = await request("GET", "/");
  check("GET / returns 200", r.status === 200);

  // ---------- Users ----------
  console.log("\n[Users]");
  r = await request("POST", "/api/users", { name: "Test User", email: `test-${Date.now()}@spendly.test` });
  check("POST /api/users returns 201", r.status === 201, `got ${r.status}`);
  check("created user has _id", Boolean(r.data?.data?._id));
  const userId = r.data?.data?._id;

  r = await request("POST", "/api/users", { name: "", email: "" });
  check("POST /api/users with empty body returns 400", r.status === 400, `got ${r.status}`);

  r = await request("GET", "/api/users");
  check("GET /api/users returns 200 + array", r.status === 200 && Array.isArray(r.data?.data));

  // ---------- Categories ----------
  console.log("\n[Categories]");
  r = await request("POST", "/api/categories", { name: `TestCat-${Date.now()}` });
  check("POST /api/categories returns 201", r.status === 201, `got ${r.status}`);
  const categoryId = r.data?.data?._id;

  r = await request("POST", "/api/categories", { name: "" });
  check("POST /api/categories without name returns 400", r.status === 400, `got ${r.status}`);

  r = await request("GET", "/api/categories");
  check("GET /api/categories returns 200 + array", r.status === 200 && Array.isArray(r.data?.data));

  if (categoryId) {
    r = await request("PUT", `/api/categories/${categoryId}`, { name: `Renamed-${Date.now()}` });
    check("PUT /api/categories/:id returns 200", r.status === 200, `got ${r.status}`);
  }

  // ---------- Expenses (full CRUD) ----------
  console.log("\n[Expenses - CRUD]");

  // Validation first
  r = await request("POST", "/api/expenses", { amount: -5, category: categoryId, date: "2026-01-15" });
  check("POST missing title returns 400", r.status === 400, `got ${r.status}`);
  r = await request("POST", "/api/expenses", { title: "X", amount: 0, category: categoryId, date: "2026-01-15" });
  check("POST amount=0 returns 400", r.status === 400, `got ${r.status}`);
  r = await request("POST", "/api/expenses", { title: "X", amount: 10, date: "2026-01-15" });
  check("POST missing category returns 400", r.status === 400, `got ${r.status}`);
  r = await request("POST", "/api/expenses", { title: "X", amount: 10, category: categoryId });
  check("POST missing date returns 400", r.status === 400, `got ${r.status}`);
  r = await request("POST", "/api/expenses", { title: "X", amount: 10, category: "507f1f77bcf86cd799439011", date: "2026-01-15" });
  check("POST with unknown category returns 400", r.status === 400, `got ${r.status}`);

  // CREATE
  r = await request("POST", "/api/expenses", {
    title: "API Test Lunch",
    amount: 250.5,
    category: categoryId,
    date: "2026-01-15",
    notes: "created by smoke test",
    user: userId,
  });
  check("POST /api/expenses returns 201", r.status === 201, `got ${r.status}`);
  check("created expense has populated category name", typeof r.data?.data?.category?.name === "string");
  const expenseId = r.data?.data?._id;
  if (expenseId) cleanupIds.expenses.push(expenseId);

  // READ
  r = await request("GET", "/api/expenses");
  check("GET /api/expenses returns 200 + array", r.status === 200 && Array.isArray(r.data?.data));
  const createdVisible = r.data?.data?.some((e) => e._id === expenseId);
  check("created expense appears in list", createdVisible === true);

  r = await request("GET", `/api/expenses/${expenseId}`);
  check("GET /api/expenses/:id returns 200", r.status === 200, `got ${r.status}`);
  r = await request("GET", "/api/expenses/invalidid123");
  check("GET /api/expenses/bad-id returns 404", r.status === 404, `got ${r.status}`);

  // SEARCH / FILTER / SORT
  r = await request("GET", "/api/expenses?search=lunch");
  check("GET ?search=lunch finds the expense", r.status === 200 && r.data?.data?.some((e) => e._id === expenseId));
  r = await request("GET", `/api/expenses?category=${categoryId}`);
  check("GET ?category=<id> filters", r.status === 200 && r.data?.data?.every((e) => e.category?._id === categoryId || e.category === categoryId));
  r = await request("GET", "/api/expenses?sort=amount&order=desc");
  const amounts = (r.data?.data || []).map((e) => e.amount);
  const sortedDesc = amounts.every((a, i) => i === 0 || amounts[i - 1] >= a);
  check("GET ?sort=amount&order=desc sorts correctly", r.status === 200 && sortedDesc);

  // UPDATE
  r = await request("PUT", `/api/expenses/${expenseId}`, { title: "API Test Lunch EDITED", amount: 999 });
  check("PUT /api/expenses/:id returns 200", r.status === 200, `got ${r.status}`);
  check("PUT actually changed the title", r.data?.data?.title === "API Test Lunch EDITED");
  r = await request("PUT", `/api/expenses/${expenseId}`, { amount: 0 });
  check("PUT amount=0 returns 400", r.status === 400, `got ${r.status}`);

  // DELETE
  r = await request("DELETE", `/api/expenses/${expenseId}`);
  check("DELETE /api/expenses/:id returns 200", r.status === 200, `got ${r.status}`);
  r = await request("GET", `/api/expenses/${expenseId}`);
  check("deleted expense now returns 404", r.status === 404, `got ${r.status}`);

  // ---------- Cleanup test data ----------
  console.log("\n[Cleanup]");
  if (categoryId) await request("DELETE", `/api/categories/${categoryId}`);
  if (userId) await request("DELETE", "/api/users/nonexistent").catch(() => {});
  console.log("  (test category removed; test user left in place - no DELETE /api/users route by design)");

  // ---------- Summary ----------
  console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Smoke test crashed:", err.message);
  console.error("Is the backend running? Start it with: cd Backend && npm run dev");
  process.exit(1);
});

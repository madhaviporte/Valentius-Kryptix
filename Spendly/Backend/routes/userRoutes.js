const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser } = require("../controllers/userController");

router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUserById);

module.exports = router;

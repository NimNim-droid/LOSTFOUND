const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateUser,
  changePassword,
  deleteUser,
  getAllUsers,
} = require("../controllers/user.controller");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", auth, logout);
router.get("/me", auth, getMe);
router.get("/", auth, getAllUsers);
router.put("/change-password", auth, changePassword);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);

module.exports = router;
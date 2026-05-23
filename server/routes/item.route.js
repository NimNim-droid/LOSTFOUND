const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");  // FIXED: single slash
const {
  createItem,
  getAllItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
} = require("../controllers/item.controller");

router.post("/", auth, createItem);
router.get("/", getAllItems);
router.get("/my-items", auth, getMyItems);
router.get("/:id", getItemById);
router.put("/:id", auth, updateItem);
router.delete("/:id", auth, deleteItem);

module.exports = router;
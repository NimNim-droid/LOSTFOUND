//controllers/item.controller.js
const Item = require("../models/item.model");

// ─── CREATE ITEM ──────────────────────────────────────
const createItem = async (req, res) => {
  try {
    const { title, description, category, status, location, date, images } = req.body;

    const item = await Item.create({
      title,
      description,
      category,
      status,
      location,
      date,
      images: images || [],
      user: req.user.userId, // from auth middleware
    });

    // Populate user data in response
    const populatedItem = await Item.findById(item._id).populate("user", "name email profile");

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: populatedItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL ITEMS ────────────────────────────────────
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("user", "name email profile phone_number location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE ITEM BY ID ────────────────────────────
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "user",
      "name email profile phone_number location"
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET LOGGED IN USER'S ITEMS ───────────────────────
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.userId })
      .populate("user", "name email profile phone_number location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE ITEM ──────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const { title, description, category, status, location, date, images, isResolved } = req.body;

    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if user owns this item
    if (item.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (location) updateData.location = location;
    if (date) updateData.date = date;
    if (images) updateData.images = images;
    if (isResolved !== undefined) updateData.isResolved = isResolved;

    item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "name email profile phone_number location");

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE ITEM ──────────────────────────────────────
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if user owns this item
    if (item.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
};
const express = require('express');
const router = express.Router();
const {
  createItem,
  getFreshList,
  getItems,
  getItemById,
  getNearbyItems,
  updateItem,
  deleteItemImage,
  claimItem,
  resolveItem,
  addMessage,
  getMessages,
  deleteItem,
  getMyItems,
  getMyClaims,
  getAllItemsAdmin,
  flagItem
} = require('../controllers/item.controller');

const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware'); // multer/cloudinary

// ─── Public Routes ──────────────────────────────
router.get('/fresh', getFreshList);
router.get('/nearby', getNearbyItems);
router.get('/', getItems);
router.get('/:id', getItemById);

// ─── Protected Routes ───────────────────────────
router.use(protect); // All routes below require auth

// Create item (with image uploads)
router.post(
  '/',
  upload.fields([
    { name: 'itemImages', maxCount: 5 },
    { name: 'reporterImage', maxCount: 1 }
  ]),
  createItem
);

// My items & claims
router.get('/user/my-items', getMyItems);
router.get('/user/my-claims', getMyClaims);

// Item actions
router.put(
  '/:id',
  upload.fields([
    { name: 'itemImages', maxCount: 5 }
  ]),
  updateItem
);
router.delete('/:id/images/:imageId', deleteItemImage);
router.delete('/:id', deleteItem);

// Claim & resolve
router.post('/:id/claim', claimItem);
router.post('/:id/resolve', resolveItem);

// Messaging
router.post('/:id/messages', addMessage);
router.get('/:id/messages', getMessages);

// ─── Admin Routes ───────────────────────────────
router.get('/admin/all', adminOnly, getAllItemsAdmin);
router.put('/:id/flag', adminOnly, flagItem);

module.exports = router;
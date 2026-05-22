const Item = require('../models/Item.model');
const User = require('../models/User.model');
const asyncHandler = require('express-async-handler');

// @desc    Create a new lost/found report
// @route   POST /api/items
// @access  Private
const createItem = asyncHandler(async (req, res) => {
  const {
    itemName,
    description,
    category,
    reportType,
    location,
    dateFoundOrLost,
    contactPreference,
    verificationAnswer,
    verificationQuestion
  } = req.body;

  // Handle uploaded images (from multer/cloudinary middleware)
  const itemImages = req.files?.itemImages?.map((file, index) => ({
    url: file.path || file.secure_url,
    publicId: file.filename || file.public_id,
    isPrimary: index === 0
  })) || [];

  const reporterImage = req.files?.reporterImage?.[0]
    ? {
        url: req.files.reporterImage[0].path || req.files.reporterImage[0].secure_url,
        publicId: req.files.reporterImage[0].filename || req.files.reporterImage[0].public_id
      }
    : undefined;

  const item = new Item({
    itemName,
    description,
    category,
    reportType,
    reportedBy: req.user._id,
    location: {
      address: location?.address,
      city: location?.city,
      coordinates: location?.coordinates,
      landmark: location?.landmark
    },
    dateFoundOrLost: new Date(dateFoundOrLost),
    itemImages,
    ...(reporterImage && { reporterImage }),
    contactPreference: contactPreference || 'in-app',
    ...(verificationQuestion && {
      verificationQuestion: { question: verificationQuestion }
    })
  });

  // Hash verification answer if provided
  if (verificationAnswer && verificationQuestion) {
    await item.setVerificationAnswer(verificationAnswer);
  } else {
    await item.save();
  }

  await item.populate('reportedBy', 'profile.displayName profile.avatar email');

  res.status(201).json({
    success: true,
    data: item
  });
});

// @desc    Get fresh list (24h items)
// @route   GET /api/items/fresh
// @access  Public
const getFreshList = asyncHandler(async (req, res) => {
  const { reportType, category, city } = req.query;
  const filters = {};

  if (reportType) filters.reportType = reportType;
  if (category) filters.category = category;
  if (city) filters['location.city'] = new RegExp(city, 'i');

  const items = await Item.getFreshList(filters);

  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get all items with filters & pagination
// @route   GET /api/items
// @access  Public
const getItems = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    reportType,
    category,
    status = 'active',
    city,
    search,
    sortBy = 'datePosted',
    order = 'desc'
  } = req.query;

  const filters = { status };
  if (reportType) filters.reportType = reportType;
  if (category) filters.category = category;
  if (city) filters['location.city'] = new RegExp(city, 'i');

  // Text search
  let query = Item.find(filters);
  if (search) {
    query = Item.find({ ...filters, $text: { $search: search } });
  }

  // Sorting
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortOptions = {};
  if (search && sortBy === 'relevance') {
    sortOptions.score = { $meta: 'textScore' };
  } else {
    sortOptions[sortBy] = sortOrder;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    query
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('reportedBy', 'profile.displayName profile.avatar email')
      .lean(),
    Item.countDocuments(filters)
  ]);

  res.json({
    success: true,
    count: items.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    data: items
  });
});

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('reportedBy', 'profile.displayName profile.avatar email phone')
    .populate('claimedBy', 'profile.displayName profile.avatar');

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Increment views (fire and forget)
  item.incrementViews();

  res.json({
    success: true,
    data: item
  });
});

// @desc    Get items near location
// @route   GET /api/items/nearby
// @access  Public
const getNearbyItems = asyncHandler(async (req, res) => {
  const { lng, lat, distance = 5000, reportType } = req.query;

  if (!lng || !lat) {
    res.status(400);
    throw new Error('Longitude and latitude are required');
  }

  const filters = {};
  if (reportType) filters.reportType = reportType;

  const items = await Item.findNearby(
    [Number(lng), Number(lat)],
    Number(distance),
    filters
  );

  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (owner only)
const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Check ownership
  if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this item');
  }

  // Prevent updating if already resolved
  if (item.status === 'resolved') {
    res.status(400);
    throw new Error('Cannot update a resolved item');
  }

  const allowedUpdates = [
    'itemName', 'description', 'category', 'location',
    'contactPreference', 'dateFoundOrLost'
  ];

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'location') {
        item.location = { ...item.location, ...req.body[field] };
      } else {
        item[field] = req.body[field];
      }
    }
  });

  // Handle new images
  if (req.files?.itemImages?.length > 0) {
    const newImages = req.files.itemImages.map((file, index) => ({
      url: file.path || file.secure_url,
      publicId: file.filename || file.public_id,
      isPrimary: item.itemImages.length === 0 && index === 0
    }));
    item.itemImages.push(...newImages);
  }

  await item.save();
  await item.populate('reportedBy', 'profile.displayName profile.avatar email');

  res.json({
    success: true,
    data: item
  });
});

// @desc    Delete item image
// @route   DELETE /api/items/:id/images/:imageId
// @access  Private (owner only)
const deleteItemImage = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const imageIndex = item.itemImages.findIndex(
    img => img._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    res.status(404);
    throw new Error('Image not found');
  }

  // TODO: Delete from Cloudinary/S3 using publicId
  // await cloudinary.uploader.destroy(item.itemImages[imageIndex].publicId);

  item.itemImages.splice(imageIndex, 1);

  // Ensure at least one image is primary
  if (item.itemImages.length > 0 && !item.itemImages.some(img => img.isPrimary)) {
    item.itemImages[0].isPrimary = true;
  }

  await item.save();

  res.json({
    success: true,
    message: 'Image deleted'
  });
});

// @desc    Claim an item
// @route   POST /api/items/:id/claim
// @access  Private
const claimItem = asyncHandler(async (req, res) => {
  const { answer, message } = req.body;
  const item = await Item.findById(req.params.id).select('+verificationQuestion.answerHash');

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.status !== 'active') {
    res.status(400);
    throw new Error('Item is no longer available for claiming');
  }

  if (item.reportedBy.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot claim your own item');
  }

  // Verify answer if required
  if (item.verificationQuestion?.answerHash) {
    const isCorrect = await item.verifyAnswer(answer);
    if (!isCorrect) {
      res.status(400);
      throw new Error('Incorrect verification answer');
    }
  }

  await item.markClaimed(req.user._id);

  // Add initial claim message if provided
  if (message) {
    await item.addMessage(req.user._id, message);
  }

  await item.populate([
    { path: 'reportedBy', select: 'profile.displayName email' },
    { path: 'claimedBy', select: 'profile.displayName email' }
  ]);

  res.json({
    success: true,
    message: 'Item claimed successfully',
    data: item
  });
});

// @desc    Mark item as resolved
// @route   POST /api/items/:id/resolve
// @access  Private (owner only)
const resolveItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (item.status !== 'claimed') {
    res.status(400);
    throw new Error('Item must be claimed before resolving');
  }

  await item.markResolved();

  res.json({
    success: true,
    message: 'Item marked as resolved',
    data: item
  });
});

// @desc    Add message to item
// @route   POST /api/items/:id/messages
// @access  Private
const addMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.status !== 'active' && item.status !== 'claimed') {
    res.status(400);
    throw new Error('Cannot message on resolved/expired items');
  }

  // Only reporter, claimant, or admin can message
  const isAuthorized =
    item.reportedBy.toString() === req.user._id.toString() ||
    item.claimedBy?.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to message on this item');
  }

  await item.addMessage(req.user._id, content);
  await item.populate('messages.sender', 'profile.displayName profile.avatar');

  res.json({
    success: true,
    data: item.messages[item.messages.length - 1]
  });
});

// @desc    Get messages for an item
// @route   GET /api/items/:id/messages
// @access  Private (participants only)
const getMessages = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate('messages.sender', 'profile.displayName profile.avatar')
    .select('messages reportedBy claimedBy');

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  const isAuthorized =
    item.reportedBy.toString() === req.user._id.toString() ||
    item.claimedBy?.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({
    success: true,
    count: item.messages.length,
    data: item.messages
  });
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (owner or admin)
const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  // TODO: Delete images from Cloudinary/S3
  // for (const img of item.itemImages) {
  //   if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
  // }
  // if (item.reporterImage?.publicId) {
  //   await cloudinary.uploader.destroy(item.reporterImage.publicId);
  // }

  await item.deleteOne();

  res.json({
    success: true,
    message: 'Item deleted'
  });
});

// @desc    Get my items (reported by me)
// @route   GET /api/items/my-items
// @access  Private
const getMyItems = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filters = { reportedBy: req.user._id };
  if (status) filters.status = status;

  const [items, total] = await Promise.all([
    Item.find(filters)
      .sort({ datePosted: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    Item.countDocuments(filters)
  ]);

  res.json({
    success: true,
    count: items.length,
    total,
    data: items
  });
});

// @desc    Get my claims
// @route   GET /api/items/my-claims
// @access  Private
const getMyClaims = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filters = { claimedBy: req.user._id };
  if (status) filters.status = status;

  const [items, total] = await Promise.all([
    Item.find(filters)
      .sort({ dateClaimed: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('reportedBy', 'profile.displayName profile.avatar email')
      .lean(),
    Item.countDocuments(filters)
  ]);

  res.json({
    success: true,
    count: items.length,
    total,
    data: items
  });
});

// @desc    Admin: Get all items (with moderation flags)
// @route   GET /api/items/admin/all
// @access  Private/Admin
const getAllItemsAdmin = asyncHandler(async (req, res) => {
  const { isFlagged, status, page = 1, limit = 20 } = req.query;
  const filters = {};
  if (isFlagged !== undefined) filters.isFlagged = isFlagged === 'true';
  if (status) filters.status = status;

  const [items, total] = await Promise.all([
    Item.find(filters)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('reportedBy', 'profile.displayName email')
      .populate('claimedBy', 'profile.displayName email')
      .lean(),
    Item.countDocuments(filters)
  ]);

  res.json({
    success: true,
    count: items.length,
    total,
    data: items
  });
});

// @desc    Admin: Flag/unflag item
// @route   PUT /api/items/:id/flag
// @access  Private/Admin
const flagItem = asyncHandler(async (req, res) => {
  const { isFlagged, reason } = req.body;
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  item.isFlagged = isFlagged;
  item.flagReason = reason || '';
  item.moderatedBy = req.user._id;
  await item.save();

  res.json({
    success: true,
    message: `Item ${isFlagged ? 'flagged' : 'unflagged'}`,
    data: item
  });
});

module.exports = {
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
};
const cron = require('node-cron');
const Item = require('../models/Item.model');

// Run every hour to clean up expired fresh items
const startCronJobs = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('Running fresh list cleanup...');
    const now = new Date();

    const result = await Item.updateMany(
      { isFresh: true, freshExpiresAt: { $lt: now } },
      { $set: { isFresh: false } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Expired ${result.modifiedCount} items from fresh list`);
    }
  });

  console.log('Cron jobs started');
};

module.exports = startCronJobs;
// backend/routes/tripRoutes.js
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Route to save a trip
router.post('/', tripController.saveTrip);

// Route to get trips for a specific user
router.get('/:userId', tripController.getUserTrips);

// Add route to delete a trip by its ID
router.delete('/:tripId', tripController.deleteTrip);

module.exports = router;

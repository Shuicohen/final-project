// backend/controllers/tripController.js
const tripModel = require('../models/tripModel');

module.exports = {  saveTrip: async (req, res) => {
  const { userId, ...tripData } = req.body;
  console.log('Saving trip for user:', userId, 'with data:', tripData);

  try {
    const savedTrip = await tripModel.createTrip(userId, tripData);
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error('Error in saveTrip:', error.message);
    res.status(500).json({ message: 'Failed to save trip', error: error.message });
  }
},
  
getUserTrips: async (req, res) => {
  const userId = req.params.userId;
  try {
    const trips = await tripModel.getTripsByUser(userId);
    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error.message);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
},

deleteTrip: async (req, res) => {
  const tripId = req.params.tripId;
  try {
    const result = await tripModel.deleteTripById(tripId);
    if (result) {
      res.status(200).json({ message: 'Trip deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Trip not found.' });
    }
  } catch (error) {
    console.error('Error deleting trip:', error.message);
    res.status(500).json({ message: 'Failed to delete trip.' });
  }
},
};
// backend/models/tripModel.js
const { db } = require('../config/db');

module.exports = {
  createTrip: async (userId, tripData) => {
    console.log('Inserting trip data:', { user_id: userId, ...tripData });
    try {
      const [trip] = await db('trips').insert({
        user_id: userId,
        destination: tripData.destination,
        start_date: tripData.startDate,  // Change to match DB column
        end_date: tripData.endDate,      // Change to match DB column
        budget: tripData.budget,
        currency: tripData.currency,
        travelers: tripData.travelers,
        recommendations: tripData.recommendations
      }).returning('*');
      return trip;
    } catch (error) {
      console.error('Error in createTrip:', error.message);
      throw error;
    }
  },
  
  getTripsByUser: async (userId) => {
    try {
      return await db('trips').where({ user_id: userId }).select('*');
    } catch (error) {
      console.error('Error fetching user trips:', error.message);
      throw error;
    }
  },

  deleteTripById: async (tripId) => {
    try {
      const result = await db('trips').where({ id: tripId }).del();
      return result > 0; // Returns true if a row was deleted
    } catch (error) {
      console.error('Error in deleteTripById:', error.message);
      throw error;
    }
  },
};
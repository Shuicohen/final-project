import React, { useState } from 'react';
import TripForm from '../components/TripForm';
import TripRecommendations from '../components/TripRecommendations';
import { generateFullItinerary } from '../services/aiService';
import { saveTrip } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import './TripPlanner.css';

function TripPlanner() {
  const [tripDetails, setTripDetails] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [animateTick, setAnimateTick] = useState(false);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      setTripDetails(formData);
      const aiRecommendations = await generateFullItinerary(formData);
      setRecommendations(aiRecommendations);
    } catch (err) {
      setError('Failed to generate trip recommendations. Please try again.');
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!user || !user.userid) {
      setError('Please log in to save your trip.');
      return;
    }
    try {
      setAnimateTick(true);
      await saveTrip(user.userid, { ...tripDetails, recommendations });
      alert('Trip saved successfully!');
      setTimeout(() => setAnimateTick(false), 800); // Reset animation after it completes
    } catch (err) {
      setError('Failed to save trip. Please try again.');
      console.error('Error saving trip:', err);
    }
  };

  return (
    <div className="trip-planner">
      {!loading && !recommendations && <TripForm onSubmit={handleFormSubmit} />}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Generating your personalized trip plan...</p>
          <p>Please wait, this may take a few moments...</p>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {recommendations && (
        <>
          <TripRecommendations recommendations={recommendations} />
          <button className="save-trip-btn" onClick={handleSaveTrip}>
            {animateTick ? (
              <span className="tick-icon animate">✓</span>
            ) : (
              'Save Trip'
            )}
          </button>
        </>
      )}
    </div>
  );
}

export default TripPlanner;

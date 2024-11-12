import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserTrips, deleteTrip } from '../services/dbService';
import './SavedTrips.css';

const sanitizeText = (text) => (typeof text === 'string' ? text.replace(/\*/g, '') : '');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTextWithLinks = (text) => {
  const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/;
  const match = text.match(markdownLinkPattern);

  if (match) {
    const label = match[1];
    const url = match[2];
    const textWithFirstLink = text.replace(
      markdownLinkPattern,
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
    );

    return <span dangerouslySetInnerHTML={{ __html: textWithFirstLink }} />;
  }

  return sanitizeText(text);
};

function SavedTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [expandedTripId, setExpandedTripId] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, [user]);

  async function fetchTrips() {
    if (!user || !user.userid) {
      setLoading(false);
      setError('Please log in to view your saved trips.');
      return;
    }
    try {
      const userTrips = await getUserTrips(user.userid);
      setTrips(userTrips);
    } catch (err) {
      setError('Failed to fetch saved trips. Please try again later.');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(tripId) {
    try {
      await deleteTrip(tripId);
      setTrips(trips.filter((trip) => trip.id !== tripId));
      alert('Trip deleted successfully.');
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  }

  const toggleExpandTrip = (tripId) => {
    setExpandedTripId(expandedTripId === tripId ? null : tripId);
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading...</p></div>;
  if (error) return <p>{error}</p>;
  if (trips.length === 0) return <p>You haven't saved any trips yet.</p>;

  return (
    <div className="saved-trips">
      <h2>Your Saved Trips</h2>
      {trips.map((trip) => {
        const destination = typeof trip.destination === 'string'
          ? JSON.parse(trip.destination)
          : trip.destination;

        const isExpanded = expandedTripId === trip.id;

        return (
          <div
            key={trip.id}
            className={`trip-card ${isExpanded ? 'expanded' : ''}`}
            onClick={() => !isExpanded && toggleExpandTrip(trip.id)}
          >
            {isExpanded && (
              <button
                className="close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandTrip(trip.id);
                }}
              >
                &times;
              </button>
            )}

            <h3 className="destination-text">{destination?.label || destination?.value || 'Destination Not Available'}</h3>
            <p><strong>Dates:</strong> {formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>

            {isExpanded && (
              <>
                {/* Flights Section */}
                <h4 className="section-header centered">Flights</h4>
                {trip.recommendations?.flights?.length > 0 ? (
                  trip.recommendations.flights.map((flight, index) => (
                    <div key={index} className="flight-details">
                      <h5>{sanitizeText(flight.airline)}</h5>
                      {flight.flightNumber && <p><strong>Flight Number:</strong> {sanitizeText(flight.flightNumber)}</p>}
                      {flight.departure && <p><strong>Departure:</strong> {sanitizeText(flight.departure)}</p>}
                      {flight.arrival && <p><strong>Arrival:</strong> {sanitizeText(flight.arrival)}</p>}
                      {flight.duration && <p><strong>Duration:</strong> {sanitizeText(flight.duration)}</p>}
                      {flight.price && <p><strong>Price:</strong> ${sanitizeText(flight.price)}</p>}
                      {flight.bookingLink && (
                        <a href={flight.bookingLink} target="_blank" rel="noopener noreferrer">Book Here</a>
                      )}
                    </div>
                  ))
                ) : <p>No flight information available.</p>}

                {/* Accommodation Section */}
                <h4 className="section-header centered">Accommodation</h4>
                {trip.recommendations?.accommodation?.length > 0 ? (
                  trip.recommendations.accommodation.map((hotel, index) => (
                    <div key={index} className="hotel-details">
                      <h5>{sanitizeText(hotel.name)} ({sanitizeText(hotel.stars)}-star)</h5>
                      {hotel.location && <p><strong>Location:</strong> {sanitizeText(hotel.location)}</p>}
                      {hotel.nightlyRate && <p><strong>Nightly Rate:</strong> ${sanitizeText(hotel.nightlyRate)}</p>}
                      {hotel.bookingLink && (
                        <a href={hotel.bookingLink} target="_blank" rel="noopener noreferrer">Book Now</a>
                      )}
                    </div>
                  ))
                ) : <p>No accommodation information available.</p>}

                {/* Transportation Section */}
                <h4 className="section-header centered">Transportation</h4>
                {trip.recommendations?.transportation ? (
                  trip.recommendations.transportation.map((line, index) => (
                    <p key={index}>{formatTextWithLinks(line)}</p>
                  ))
                ) : <p>No transportation information available.</p>}

                {/* Daily Itinerary Section */}
                <h4 className="section-header centered">Daily Itinerary</h4>
                {trip.recommendations?.dailyItinerary ? (
                  trip.recommendations.dailyItinerary.map((day, index) => (
                    <div key={index} className="itinerary-day">
                      <h5>Day {index + 1}</h5>
                      {day.activities.map((activity, i) => (
                        <p key={i}>
                          <strong>{sanitizeText(activity?.title)}:</strong> {sanitizeText(activity?.name)} ({sanitizeText(activity?.time || 'N/A')})
                        </p>
                      ))}
                    </div>
                  ))
                ) : <p>No daily itinerary available.</p>}

                {/* Budget Breakdown Section */}
                <h4 className="section-header centered">Budget Breakdown</h4>
                <p>{sanitizeText(trip.recommendations?.budgetBreakdown) || 'No budget breakdown available.'}</p>

                {/* Additional Tips Section */}
                <h4 className="section-header centered">Additional Tips</h4>
                {trip.recommendations?.additionalTips ? (
                  trip.recommendations.additionalTips.map((tip, index) => (
                    <p key={index}>{formatTextWithLinks(tip)}</p>
                  ))
                ) : <p>No additional tips available.</p>}
              </>
            )}

            <button onClick={() => handleDelete(trip.id)} className="delete-button">
              Delete Trip
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default SavedTrips;

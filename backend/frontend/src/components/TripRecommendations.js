import React, { useState } from 'react';
import './TripRecommendations.css';

function TripRecommendations({ recommendations }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [nights, setNights] = useState(2);

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const renderSection = (title, content, sectionName, icon) => (
    <div className={`section ${expandedSection === sectionName ? 'expanded' : ''} ${expandedSection && expandedSection !== sectionName ? 'minimized' : ''}`}>
      {expandedSection === sectionName && (
        <button className="close-button" onClick={() => toggleSection(null)}>
          &times;
        </button>
      )}
      <div className="section-icon">{icon}</div>
      <h2>{title}</h2>
      {/* Expand section when clicking on content area */}
      <div className="content" onClick={() => toggleSection(sectionName)}>
        {content}
      </div>
    </div>
  );

  const renderFlights = () => (
    <div>
      {Array.isArray(recommendations.flights) && recommendations.flights.length > 0 ? (
        recommendations.flights.map((flight, index) => (
          <div key={index} className="flight-option">
            <h3>Option {index + 1}: {flight.airline || 'Airline not specified'}</h3>
            <div className="flight-details">
              <p><strong>Flight Number:</strong> {flight.flightNumber || 'N/A'}</p>
              <p><strong>Departure:</strong> {flight.departure || 'N/A'}</p>
              <p><strong>Arrival:</strong> {flight.arrival || 'N/A'}</p>
              <p><strong>Duration:</strong> {flight.duration || 'N/A'}</p>
              <p><strong>Estimated Price:</strong> ${flight.price || 'N/A'}</p>
              <p>
                <strong>Booking Link:</strong>{' '}
                <a href={flight.bookingLink || '#'} target="_blank" rel="noopener noreferrer">
                  Book Here
                </a>
              </p>
              {flight.returnFlight && (
                <>
                  <h4>Return Flight</h4>
                  <p><strong>Flight Number:</strong> {flight.returnFlight.flightNumber || 'N/A'}</p>
                  <p><strong>Departure:</strong> {flight.returnFlight.departure || 'N/A'}</p>
                  <p><strong>Arrival:</strong> {flight.returnFlight.arrival || 'N/A'}</p>
                  <p><strong>Duration:</strong> {flight.returnFlight.duration || 'N/A'}</p>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No flight information available.</p>
      )}
    </div>
  );
  

  const renderStars = (stars) => {
    return Array.from({ length: stars }, (_, i) => (
      <span key={i} className="star">★</span>
    ));
  };
  
  const renderAccommodation = () => (
    <div>
      {Array.isArray(recommendations.accommodation) && recommendations.accommodation.length > 0 ? (
        recommendations.accommodation.map((hotel, index) => {
          const nightlyRate = parseFloat(hotel.nightlyRate);
          const totalRate = !isNaN(nightlyRate) && nights ? (nightlyRate * nights).toFixed(2) : null;
  
          return (
            <div key={index} className="hotel-option">
              <h3>
                {hotel.name ? hotel.name.replace(/\*\*/g, '') : 'Hotel Name Unavailable'} 
                {hotel.stars && (
                  <span className="stars">
                    {renderStars(parseInt(hotel.stars, 10))}
                  </span>
                )}
              </h3>
              <div><strong>Location:</strong> {hotel.location ? hotel.location.replace(/\*\*/g, '') : 'Location unavailable'}</div>
              <div><strong>Nearby Attractions:</strong> {hotel.nearbyAttractions ? hotel.nearbyAttractions.replace(/\*\*/g, '') : 'No nearby attractions listed'}</div>
              <div><strong>Nightly Rate:</strong> {nightlyRate ? `$${nightlyRate}` : 'Rate unavailable'}</div>
              <div><strong>Total Rate for {nights} Nights:</strong> {totalRate ? `$${totalRate}` : 'Total rate unavailable'}</div>
              <div><strong>Amenities:</strong> {hotel.amenities ? hotel.amenities.replace(/\*\*/g, '') : 'Information not available'}</div>
              <div><strong>Description:</strong> {hotel.description ? hotel.description.replace(/\*\*/g, '') : 'No description available'}</div>
              <div>
                <strong>Booking Link:</strong>{' '}
                <a href={hotel.bookingLink || '#'} target="_blank" rel="noopener noreferrer">
                  {hotel.bookingLink ? 'Book Now' : 'Booking link unavailable'}
                </a>
              </div>
            </div>
          );
        })
      ) : (
        <p>No accommodation information available.</p>
      )}
    </div>
  );
  
  


  const renderTransportation = () => {
    const transportationContent = recommendations.transportation;
  
    const renderLine = (line, index) => {
      // Remove all "*" characters
      const sanitizedLine = line.replace(/\*/g, '');
  
      // Headings (e.g., "Taxi", "Bus", "Car Rental", "Private Transfer") in blue
      const headings = ["Taxi", "Bus", "Car Rental", "Private Transfer"];
      const isHeading = headings.some((heading) => sanitizedLine.startsWith(heading));
      if (isHeading) {
        return <h4 key={index} style={{ color: '#007bff' }}>{sanitizedLine}</h4>;
      }
  
      // Markdown-style link handling (only display the first link per line)
      const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/;
      const match = sanitizedLine.match(markdownLinkPattern);
      if (match) {
        const label = match[1];
        const url = match[2];
        const textWithLink = sanitizedLine.replace(
          markdownLinkPattern,
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
        );
        return <span key={index} dangerouslySetInnerHTML={{ __html: textWithLink }} />;
      }
  
      // Regular paragraph text
      return <p key={index}>{sanitizedLine}</p>;
    };
  
    return (
      <div className="transportation-content">
        {Array.isArray(transportationContent)
          ? transportationContent.map((line, index) => renderLine(line, index))
          : typeof transportationContent === 'string'
          ? transportationContent.split('\n').map((line, index) => renderLine(line.trim(), index))
          : <p>Transportation details unavailable.</p>}
      </div>
    );
  };
  
  

  const renderDailyItinerary = () => (
    <div className="itinerary-content">
      {Array.isArray(recommendations.dailyItinerary) && recommendations.dailyItinerary.length > 0 ? (
        recommendations.dailyItinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="day-itinerary">
            <h3 className="itinerary-day-header">Day {dayIndex + 1}</h3>
            {day.activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <p>
                  <strong>{activity.title.replace(/\*/g, '')}:</strong> {activity.name.replace(/\*/g, '')} ({activity.time?.replace(/\*/g, '') || 'Time not specified'})
                </p>
                {activity.location && (
                  <p><strong>Location:</strong> {activity.location.replace(/\*/g, '')}</p>
                )}
                {activity.description && (
                  <p><strong>Description:</strong> {activity.description.replace(/\*/g, '')}</p>
                )}
                {activity.link && (
                  <p>
                    <strong>Link:</strong>{' '}
                    <a href={activity.link.replace(/\*/g, '')} target="_blank" rel="noopener noreferrer">
                      {activity.linkText?.replace(/\*/g, '') || 'More Info'}
                    </a>
                  </p>
                )}
                {activity.cuisine && (
                  <>
                    <p><strong>Restaurant Name:</strong> {activity.name.replace(/\*/g, '')}</p>
                    <p><strong>Cuisine:</strong> {activity.cuisine.replace(/\*/g, '')}</p>
                    <p><strong>Price Range:</strong> {activity.priceRange.replace(/\*/g, '')}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>No daily itinerary available.</p>
      )}
    </div>
  );
  
  
  const renderBudgetBreakdown = () => {
    const budgetContent = recommendations.budgetBreakdown.replace(/\*/g, ''); // Remove all asterisks
  
    const sections = [
      "Flights",
      "Accommodation",
      "Local Transportation",
      "Daily Meals",
      "Activities and Attractions",
      "Miscellaneous Expenses",
      "Total Estimated Budget Breakdown",
    ];
  
    const renderSection = (line, index) => {
      // Check if the line starts with any section name
      const isSectionHeader = sections.some((section) => line.includes(section));
      if (isSectionHeader) {
        return <h4 key={index} style={{ color: '#007bff' }}>{line}</h4>;
      }
  
      // Markdown-style link handling for the first link
      const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/;
      const match = line.match(markdownLinkPattern);
      if (match) {
        const label = match[1];
        const url = match[2];
        const textWithLink = line.replace(markdownLinkPattern, `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
        return <p key={index} dangerouslySetInnerHTML={{ __html: textWithLink }} />;
      }
  
      // Render as regular paragraph if it's not a section header or a link
      return <p key={index}>{line}</p>;
    };
  
    return (
      <div className="budget-breakdown-content">
        {budgetContent.split('\n').map((line, index) => renderSection(line.trim(), index))}
      </div>
    );
  };
  

  const renderAdditionalTips = () => {
    const tipsContent = recommendations.additionalTips;
  
    if (!Array.isArray(tipsContent)) {
      return <p>No additional tips available.</p>;
    }
  
    const sectionKeywords = [
      "Additional Tips",
      "Local Customs, Tipping Practices, or Etiquette",
      "Must-Try Local Dishes",
      "Weather Information",
      "Links to Reputable Travel Guides",
      "Additional tips"
    ];
  
    const renderSection = (line, index) => {
      // Remove any asterisks and check if the line includes a section header keyword
      const sanitizedLine = line.replace(/\*/g, '');
      const isSectionHeader = sectionKeywords.some(keyword => sanitizedLine.toLowerCase().includes(keyword.toLowerCase()));
      
      if (isSectionHeader) {
        return <h4 key={index} style={{ color: '#007bff' }}>{sanitizedLine}</h4>;
      }
  
      // Handle Markdown-style links (only display the first link per line)
      const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/;
      const match = sanitizedLine.match(markdownLinkPattern);
      if (match) {
        const label = match[1];
        const url = match[2];
        const textWithLink = sanitizedLine.replace(
          markdownLinkPattern,
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
        );
        return <p key={index} dangerouslySetInnerHTML={{ __html: textWithLink }} />;
      }
  
      // Render as regular paragraph text
      return <p key={index}>{sanitizedLine}</p>;
    };
  
    return (
      <div className="additional-tips-content">
        {tipsContent.map((line, index) => renderSection(line.trim(), index))}
      </div>
    );
  };
  
  

  return (
    <div className="trip-recommendations">
      <h1>Your Trip Itinerary</h1>
      <div className="service-section">
      {renderSection('Flights', renderFlights(), 'flights', '✈️')}
      {renderSection('Accommodation', renderAccommodation(), 'accommodation', '🏨')}
      {renderSection('Transportation', renderTransportation(), 'transportation', '🚗')}
      {renderSection('Daily Itinerary', renderDailyItinerary(), 'dailyItinerary', '🗓️')}
      {renderSection('Budget Breakdown', renderBudgetBreakdown(), 'budgetBreakdown', '💰')}
      {renderSection('Additional Tips', renderAdditionalTips(), 'additionalTips', '💡')}
      </div>
    </div>
  );
}

export default TripRecommendations;

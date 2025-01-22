import React, { useState, useEffect } from 'react';
import './TripRecommendations.css';

function TripRecommendations({ recommendations }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [nights, setNights] = useState(2);

  // ✅ useEffect to log and debug daily itinerary
  useEffect(() => {
    if (recommendations && recommendations.dailyItinerary) {
      console.log("✅ Updated Daily Itinerary:", recommendations.dailyItinerary);
    } else {
      console.log("❌ No Itinerary Data Available");
    }
  }, [recommendations.dailyItinerary]); // Runs when dailyItinerary updates

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
            <h3>Option {index + 1}: {flight.airline}</h3>
            <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
            <p><strong>Departure:</strong> {flight.departure}</p>
            <p><strong>Arrival:</strong> {flight.arrival}</p>
            <p><strong>Duration:</strong> {flight.duration}</p>
            <p><strong>Layovers:</strong> {flight.layovers}</p>
            <p><strong>Estimated Price:</strong> {flight.price}</p>
            <p>
              <strong>Booking Link:</strong> <span dangerouslySetInnerHTML={{ __html: flight.bookingLink }} />
            </p>
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
        recommendations.accommodation.map((hotel, index) => (
          <div key={index} className="hotel-option">
            <h3>{hotel.name} {hotel.stars ? `(${hotel.stars}★)` : ''}</h3>
            <p><strong>Location:</strong> {hotel.location}</p>
            <p><strong>Nearby Attractions:</strong> {hotel.nearbyAttractions}</p>
            <p><strong>Nightly Rate:</strong> {hotel.nightlyRate}</p>
            <p><strong>Total Rate for Stay:</strong> {hotel.totalRate}</p>
            <p><strong>Amenities:</strong> {hotel.amenities}</p>
            <p><strong>Description:</strong> {hotel.description}</p>
            <p>
              <strong>Booking Link:</strong> <span dangerouslySetInnerHTML={{ __html: hotel.bookingLink }} />
            </p>
          </div>
        ))
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
  
  
  const renderDailyItinerary = () => {
  
    return (
      <div className="itinerary-content">
        {Array.isArray(recommendations.dailyItinerary) && recommendations.dailyItinerary.length > 0 ? (
          recommendations.dailyItinerary.map((day, dayIndex) => (
            <div key={dayIndex} className="day-itinerary">
              <h3 className="itinerary-day-header">{day.title}</h3>
  
              {Array.isArray(day.activities) && day.activities.length > 0 ? (
                day.activities.map((activity, index) => {
  
                  return (
                    <div key={index} className="activity-item">
                      <h4>{activity.title || 'Activity'}</h4>
                      {Object.entries(activity).map(([key, value]) => (
                        key !== "title" && value && (
                          key.toLowerCase().includes("link") ? (
                            <p key={key}>
                              <strong>{key}:</strong>{" "}
                              <span dangerouslySetInnerHTML={{ __html: value }} />
                            </p>
                          ) : (
                            <p key={key}><strong>{key}:</strong> {value}</p>
                          )
                        )
                      ))}
                    </div>
                  );
                })
              ) : (
                <p>No activities listed for this day.</p>
              )}
            </div>
          ))
        ) : (
          <p>No daily itinerary available.</p>
        )}
      </div>
    );
  };
  
  
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
  
      // ✅ Fix: Handle multiple Markdown-style links per line
      const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      const formattedText = sanitizedLine.replace(markdownLinkPattern, (_, label, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      });
  
      return <p key={index} dangerouslySetInnerHTML={{ __html: formattedText }} />;
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


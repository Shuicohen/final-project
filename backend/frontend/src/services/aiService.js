import axios from 'axios';

const PERPLEXITY_API_KEY = process.env.REACT_APP_PERPLEXITY_API_KEY;

async function generateSection(prompt) {
  const payload = {
    model: 'llama-3.1-70b-instruct',
    messages: [
      { role: 'system', content: 'You are a helpful AI travel assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1500
  };

  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', payload, {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const content = response.data.choices[0].message.content;
    console.log(`Response for prompt: ${prompt}`, content);
    return content;
  } catch (error) {
    console.error('Error generating section:', error);
    throw new Error('Failed to generate itinerary section');
  }
}

function parseFlightsResponse(content) {
  const options = content.split(/\*\*Option \d+:.+?\*\*/).slice(1);
  return options.map(optionText => {
    const lines = optionText.trim().split('\n').map(line => line.trim());
    return {
      airline: getLineContent(lines, 'Airline:'),
      flightNumber: getLineContent(lines, 'Flight Number:'),
      departure: getLineContent(lines, 'Departure:'),
      arrival: getLineContent(lines, 'Arrival:'),
      duration: getLineContent(lines, 'Duration:'),
      price: formatPrice(getLineContent(lines, 'Estimated Price:')),
      bookingLink: extractLink(getLineContent(lines, 'Booking Link:'))
    };
  });
}

function parseAccommodationResponse(content) {
  if (!content || typeof content !== 'string') {
    console.error('Accommodation content is undefined or not a string');
    return [];
  }

  const hotels = content.split(/\*\*Hotel \d+:/).slice(1); // Split on "Hotel 1:", "Hotel 2:", etc.
  return hotels.map(hotelText => {
    const lines = hotelText.trim().split('\n').map(line => line.trim());

    // Find the line with the name and star rating, typically the first line in each hotel block
    const nameLine = lines.find(line => /\(\d+-star\)/.test(line)) || 'Name not available';

    const hotel = {
      name: nameLine.replace(/\*\*/g, '').split('(')[0].trim(), // Extract the name before the star rating
      location: getLineContent(lines, 'Location:'),
      nearbyAttractions: getLineContent(lines, 'Nearby attractions include'),
      nightlyRate: getLineContent(lines, 'Nightly rate:').split(' ')[2] || 'Rate unavailable',
      totalRate: getLineContent(lines, 'Total rate for 7 nights:'),
      stars: nameLine.match(/\((\d+)-star\)/)?.[1] || null, // Extract the star rating
      amenities: getLineContent(lines, 'Key amenities:'),
      description: getLineContent(lines, 'Brief description:'),
      bookingLink: extractLink(getLineContent(lines, 'Booking link:')),
    };

    return hotel;
  });
}



function parseTransportationResponse(content) {
  return content.split('\n').map(line => line.trim()).filter(line => line);
}

// Helper function to format time
function formatTime(timeString) {
  const time = parseInt(timeString, 10);
  if (isNaN(time)) return 'Time not specified';

  // Convert to 12-hour format with AM/PM
  const period = time >= 12 ? 'PM' : 'AM';
  const formattedTime = time > 12 ? time - 12 : time;
  return `${formattedTime}:00 ${period}`;
}

function parseDailyItineraryResponse(content) {
  if (!content || typeof content !== 'string') {
    console.error('Daily Itinerary content is undefined or not a string');
    return [];
  }

  const days = content.split('**Day');
  return days.slice(1).map(dayText => {
    const details = dayText.trim().split('\n').map(line => line.trim()).filter(line => line);
    const dayTitle = details[0] ? `Day ${details[0].split(':')[0].trim()}` : 'Day';
    const activities = [];
    let currentActivity = {};

    details.slice(1).forEach(line => {
      if (line.startsWith('*')) {
        if (Object.keys(currentActivity).length > 0) {
          activities.push(currentActivity);
          currentActivity = {};
        }
        const [title, info] = line.split(':');
        if (info) {
          const [name, time] = info.split('(');
          currentActivity.title = title.replace('*', '').trim();
          currentActivity.name = name.trim();
          currentActivity.time = time ? formatTime(time.replace(')', '').trim()) : 'Time not specified';
        }
      } else if (line.startsWith('+')) {
        if (line.includes('Location:')) {
          currentActivity.location = line.replace('+ Location:', '').trim();
        } else if (line.includes('Description:')) {
          currentActivity.description = line.replace('+ Description:', '').trim();
        } else if (line.includes('Link:')) {
          const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
          currentActivity.linkText = linkMatch ? linkMatch[1] : 'Link';
          currentActivity.link = linkMatch ? linkMatch[2] : '#';
        }
      }
    });

    if (Object.keys(currentActivity).length > 0) {
      activities.push(currentActivity);
    }
    return { title: dayTitle, activities };
  });
}



function parseBudgetBreakdownResponse(content) {
  return content;
}

function parseAdditionalTipsResponse(content) {
  return content.split('\n').map(line => line.trim()).filter(line => line);
}

export async function generateFullItinerary(tripDetails) {
  const { destination, startDate, endDate, travelers, budget, currency, origin } = tripDetails;
  const tripDuration = getTripDuration(startDate, endDate);

  // Extract labels from `origin` and `destination` if they are objects
  const tripDetailsForAI = {
    origin: typeof origin === 'object' ? origin.label : origin,
    destination: typeof destination === 'object' ? destination.label : destination,
    startDate,
    endDate,
    travelers,
    budget,
    currency
  };

  const prompts = {
    flights: `Provide 2-3 detailed flight options from ${tripDetailsForAI.origin} to ${tripDetailsForAI.destination} for a trip on ${tripDetailsForAI.startDate} and a return on ${tripDetailsForAI.endDate}. For each option, include:
      - Airline name
      - Flight number
      - Departure and arrival times
      - Duration
      - Estimated price
      - Booking link.
    `,
    accommodation: `I need information on three distinct hotels in ${tripDetailsForAI.destination} for a ${tripDuration}-day trip from ${tripDetailsForAI.startDate} to ${tripDetailsForAI.endDate} with a total budget of ${tripDetailsForAI.budget} ${tripDetailsForAI.currency}. For each hotel, include:
      - Hotel name and star rating, beginning each hotel with "Hotel 1:", "Hotel 2:", and "Hotel 3:"
      - Location with nearby attractions
      - Nightly rate and total rate for all nights
      - Key amenities
      - Brief description
      - Booking link.
    `,
    transportation: `Recommend the best mode of local transportation in ${tripDetailsForAI.destination}. If car rental is advised, suggest 2-3 options with prices and booking link.`,
    dailyItinerary: `Create a detailed itinerary for each day of a ${tripDuration}-day trip to ${tripDetailsForAI.destination}. For each day, include:
      - Morning activity with location, description, and link
      - Lunch recommendation with restaurant name, cuisine, price range, and link
      - Afternoon activity with details and link
      - Dinner recommendation with details and link
    `,
    budgetBreakdown: `Provide an estimated budget breakdown for a ${tripDuration}-day trip to ${tripDetailsForAI.destination} for ${tripDetailsForAI.travelers} traveler(s) with a budget of ${tripDetailsForAI.budget} ${tripDetailsForAI.currency}. Include estimated costs for:
      - Flights
      - Accommodation
      - Local transportation
      - Daily meals
      - Activities and attractions
      - Miscellaneous expenses
    `,
    additionalTips: `Provide additional travel tips for ${tripDetailsForAI.destination} including:
      - Local customs, tipping practices, or etiquette
      - Must-try local dishes
      - Weather information
      - Links to reputable travel guides
    `
  };

  const itinerarySections = {};
  for (const [section, prompt] of Object.entries(prompts)) {
    try {
      const content = await generateSection(prompt);
      switch (section) {
        case 'flights':
          itinerarySections[section] = parseFlightsResponse(content);
          break;
        case 'accommodation':
          itinerarySections[section] = parseAccommodationResponse(content);
          break;
        case 'transportation':
          itinerarySections[section] = parseTransportationResponse(content);
          break;
        case 'dailyItinerary':
          itinerarySections[section] = parseDailyItineraryResponse(content);
          break;
        case 'budgetBreakdown':
          itinerarySections[section] = parseBudgetBreakdownResponse(content);
          break;
        case 'additionalTips':
          itinerarySections[section] = parseAdditionalTipsResponse(content);
          break;
        default:
          itinerarySections[section] = content;
      }
    } catch (error) {
      console.error(`Error parsing section ${section}:`, error);
      itinerarySections[section] = `Error retrieving ${section} information.`;
    }
  }

  return itinerarySections;
}

function getTripDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function getLineContent(lines, label) {
  const line = lines.find(line => line.includes(label));
  return line ? line.split(label)[1].trim() : 'N/A';
}

function formatPrice(priceText) {
  const price = parseFloat(priceText.replace('$', ''));
  return isNaN(price) ? 'N/A' : `$${price}`;
}

function extractLink(text) {
  if (typeof text === 'string') {
    const match = text.match(/\[(.*?)\]\((.*?)\)/);
    return match ? match[2] : 'Book Here';
  }
  return 'Book Here';
}

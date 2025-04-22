import axios from 'axios';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

async function generateSection(prompt) {
  const payload = {
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful AI travel assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1500
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    

    const content = response.data.choices[0].message.content;
    return content;
  } catch (error) {
    console.error('Error generating section:', error);
    throw new Error('Failed to generate itinerary section');
  }
}

function parseFlightsResponse(content) {
  if (!content || typeof content !== 'string') return [];

  const flightSections = content.split(/### Option \d+:/).slice(1);
  return flightSections.map(flightText => {
    const lines = flightText.trim().split('\n').map(line => line.trim());

    return {
      airline: getLineContent(lines, '**Airline:**') || 'Not specified',
      flightNumber: getLineContent(lines, '**Flight Number:**') || 'N/A',
      departure: getLineContent(lines, '**Departure:**') || 'N/A',
      arrival: getLineContent(lines, '**Arrival:**') || 'N/A',
      duration: getLineContent(lines, '**Duration:**') || 'N/A',
      layovers: getLineContent(lines, '**Layovers:**') || 'None',
      price: formatPrice(getLineContent(lines, '**Estimated Price:**')) || 'N/A',
      bookingLink: extractLink(getLineContent(lines, '**Booking Link:**') || 'No booking link available')
    };
  });
}





function parseAccommodationResponse(content) {
  if (!content || typeof content !== 'string') return [];

  const hotels = content.split(/### Hotel \d+:/).slice(1);
  return hotels.map(hotelText => {
    const lines = hotelText.trim().split('\n').map(line => line.trim());

    return {
      name: getLineContent(lines, '**Name:**') || 'Unnamed Hotel',
      stars: getLineContent(lines, '**Star Rating:**')?.replace('-star', '') || 'N/A',
      location: getLineContent(lines, '**Location:**') || 'Location not available',
      nearbyAttractions: getLineContent(lines, '**Nearby Attractions:**') || 'None listed',
      nightlyRate: formatPrice(getLineContent(lines, '**Nightly Rate:**')) || 'N/A',
      totalRate: formatPrice(getLineContent(lines, '**Total Rate for**')) || 'N/A',
      amenities: getLineContent(lines, '**Key Amenities:**') || 'No amenities listed',
      description: getLineContent(lines, '**Brief Description:**') || 'No description available',
      bookingLink: extractLink(getLineContent(lines, '**Booking Link:**') || 'No booking link available')
    };
  });
}





function parseTransportationResponse(content) {
  return content.split('\n').map(line => line.trim()).filter(line => line);
}

function parseDailyItineraryResponse(content) {
  if (!content || typeof content !== 'string') return [];



  const days = content.split(/### Day \d+:/).slice(1);
  return days.map(dayText => {
    const details = dayText.trim().split('\n').map(line => line.trim()).filter(line => line);
    const title = details[0] || 'Day';

    const activities = [];
    let currentActivity = {};

    details.slice(1).forEach(line => {
      if (line.startsWith('#### ')) {
        if (Object.keys(currentActivity).length > 0) activities.push(currentActivity);
        currentActivity = {};
        currentActivity.title = line.replace('#### ', '').trim();
      } else if (line.includes(':')) {
        let [key, ...values] = line.split(':'); // Capture full value (fixes truncated text)
        if (values.length) {
          let formattedValue = values.join(':').trim(); // Reassemble split parts

          // ✅ Fix for correctly extracting full Markdown links
          const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
          formattedValue = formattedValue.replace(markdownLinkPattern, (_, label, url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
          });

          currentActivity[key.trim()] = formattedValue;
        }
      }
    });

    if (Object.keys(currentActivity).length > 0) activities.push(currentActivity);
    
    

    return { title, activities };
  });
}





function parseBudgetBreakdownResponse(content) {
  return content;
}

function parseAdditionalTipsResponse(content) {
  if (!content || typeof content !== 'string') return [];

  return content.split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => {
      // ✅ Fix for correctly extracting full Markdown links
      const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      return line.replace(markdownLinkPattern, (_, label, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      });
    });
}


export async function generateFullItinerary(tripDetails) {
  const { destination, startDate, endDate, travelers, budget, currency, origin, preferences } = tripDetails;
  const tripDuration = getTripDuration(startDate, endDate);

  const tripDetailsForAI = {
    origin: typeof origin === 'object' ? origin.label : origin,
    destination: typeof destination === 'object' ? destination.label : destination,
    startDate,
    endDate,
    travelers,
    budget,
    currency,
    preferences
  };

  const prompts = {
    flights: `Provide exactly 3 detailed flight options from ${tripDetailsForAI.origin} to ${tripDetailsForAI.destination} for a trip on ${tripDetailsForAI.startDate} and a return on ${tripDetailsForAI.endDate}. If no direct flights exist, suggest alternative routes. Each flight must include:
      ### Option 1:
      - **Airline:** [Airline Name]
      - **Flight Number:** [Flight Number]
      - **Departure:** [Departure City, Date, Time, Timezone]
      - **Arrival:** [Arrival City, Date, Time, Timezone]
      - **Duration:** [Total Flight Duration]
      - **Layovers:** [If applicable, list layover cities, duration]
      - **Estimated Price:** [$XXX - $YYY]
      - **Booking Link:** [Provide a valid booking link for the airline]

      ### Option 2:
      (Same format as Option 1)

      ### Option 3:
      (Same format as Option 1)

      Ensure that all flights contain valid airline names, prices, and booking links. If no flights are available, suggest nearby alternative airports.` 
    ,
    accommodation: `Provide details on exactly 3 recommended hotels in ${tripDetailsForAI.destination} for a ${tripDuration}-day stay from ${tripDetailsForAI.startDate} to ${tripDetailsForAI.endDate} within a total budget of ${tripDetailsForAI.budget} ${tripDetailsForAI.currency}. Each hotel must include:

        ### Hotel 1:
        - **Name:** [Hotel Name]
        - **Star Rating:** [e.g., 3-star, 4-star, 5-star]
        - **Location:** [Address, Proximity to key attractions]
        - **Nearby Attractions:** [List top attractions within walking distance]
        - **Nightly Rate:** [$XX per night]
        - **Total Rate for ${tripDuration} Nights:** [$XXX - $YYY]
        - **Key Amenities:** [Free WiFi, Pool, Breakfast, Parking, etc.]
        - **Guest Rating:** [e.g., 4.5/5 on TripAdvisor, Booking.com, etc.]
        - **Brief Description:** [Summary of hotel experience]
        - **Booking Link:** [Provide a valid booking link]

        ### Hotel 2:
        (Same format as Hotel 1)

        ### Hotel 3:
        (Same format as Hotel 1)

        Ensure all hotels are in safe and accessible locations, with high ratings and verified booking links. If budget is too low, suggest alternatives within range.`
    ,
    transportation: `Provide the best modes of local transportation in ${tripDetailsForAI.destination} based on a preference for ${tripDetailsForAI.preferences}. Include:

      ### Public Transport:
      - **Best Option:** [Metro/Bus/Ferries/Trams available]
      - **Pricing:** [$X per ride / $Y per day pass]
      - **Coverage:** [Best for city center, tourist areas, or outskirts]
      - **Ride Time Estimate:** [Average travel times for common routes]

      ### Ride-Sharing Apps:
      - **Available Services:** [Uber, Lyft, Bolt, etc.]
      - **Pricing Estimate:** [$X per mile/km]
      - **Safety & Reliability:** [Trusted apps, peak hour pricing insights]

      ### Car Rental:
      - **Recommended Companies:** [Hertz, Avis, Europcar, etc.]
      - **Pricing Estimate:** [$XX per day + additional fees]
      - **Best for:** [e.g., Exploring countryside, national parks]
      - **Booking Link:** [Provide direct car rental links]

      Suggest the best mode of transport for safety, budget, and convenience.`
    ,
    dailyItinerary: `Create a structured daily itinerary for a ${tripDuration}-day trip to ${tripDetailsForAI.destination}. Focus on activities matching the preference for ${tripDetailsForAI.preferences}. Each day should include:

    ### Day 1:
    #### Morning Activity:
    - **Activity:** [E.g., Guided city tour]
    - **Location:** [Attraction or meeting point]
    - **Time:** [Start-End Time]
    - **Description:** [Brief summary]
    - **Price Estimate:** [$XX per person]
    - **Booking Link:** [Provide a valid booking link]

    #### Lunch:
    - **Restaurant:** [Name]
    - **Cuisine Type:** [e.g., Italian, Seafood, Street Food]
    - **Price Range:** [$X - $Y per person]
    - **Description:** [Brief summary]
    - **Booking Link:** [If applicable]

    #### Afternoon Activity:
    (Same format as Morning Activity)

    #### Dinner:
    (Same format as Lunch)

    #### Optional Evening Entertainment:
    - **Suggested Activity:** [e.g., Live Music, Bar, Theatre]
    - **Location:** [Address]
    - **Booking Link:** [If available]

    Repeat this structure for each day of the trip, ensuring all activities have prices, timing, and booking links.`
    ,
    budgetBreakdown: `Provide a detailed estimated budget breakdown for a ${tripDuration}-day trip to ${tripDetailsForAI.destination} for ${tripDetailsForAI.travelers} traveler(s) with a total budget of ${tripDetailsForAI.budget} ${tripDetailsForAI.currency}. Include:

    ### Flights:
    - **Estimated Cost:** [$XXX per person]
    - **Best Deals Found:** [Yes/No]
    - **Booking Link:** [If applicable]

    ### Accommodation:
    - **Estimated Cost:** [$XX per night, $XXX total]
    - **Hotel Suggested:** [Hotel Name]
    - **Booking Link:** [If applicable]

    ### Transportation:
    - **Total Estimated Cost:** [$XX for public transport / rental]
    - **Breakdown:** [Daily transport costs]

    ### Meals:
    - **Total Estimated Cost:** [$XX per day, $XXX total]
    - **Restaurants Included:** [Yes/No]

    ### Activities:
    - **Total Estimated Cost:** [$XX for tickets, excursions]
    - **Breakdown:** [Entry fees, guided tours, special experiences]

    ### Miscellaneous Expenses:
    - **Estimated Cost:** [$XX for shopping, emergencies]

    ### Total Estimated Budget:
    - **Total:** [$XXXX]
    - **Buffer Amount Suggested:** [$XX for unforeseen expenses]

    Ensure the breakdown aligns with the given budget and provides the most cost-effective options.`
    ,
    additionalTips: `Provide additional travel tips for ${tripDetailsForAI.destination} with a focus on ${tripDetailsForAI.preferences}. Include local customs, must-try local dishes, weather information, and links to reputable travel guides.`
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
  const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  return text.replace(markdownLinkPattern, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}


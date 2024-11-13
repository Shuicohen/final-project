import React, { useState, useEffect, useCallback } from 'react';
import AsyncSelect from 'react-select/async';
import { debounce } from 'lodash';
import './TripForm.css';

function TripForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    origin: null,
    destination: null,
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'USD',
    travelers: 1
  });

  const [airports, setAirports] = useState([]);

  useEffect(() => {
    fetch('/airports.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const airportOptions = Object.entries(data).map(([icao, airport]) => ({
          value: icao,
          label: `${airport.name} (${icao}) - ${airport.city}, ${airport.state}, ${airport.country}`,
          searchTerms: `${airport.name} ${airport.city} ${icao} ${airport.state} ${airport.country}`.toLowerCase()
        }));
        setAirports(airportOptions);
      })
      .catch(error => {
        console.error('Error fetching airports:', error);
      });
  }, []);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'ILS', name: 'Israeli Shekel' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' }
  ];

  const handleChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: (name === 'origin' || name === 'destination') ? value : value
    }));
  };
  
  

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const filterAirports = useCallback(
    debounce((inputValue, callback) => {
      if (typeof inputValue !== 'string') {
        callback([]);
        return;
      }
      const searchTerms = inputValue.toLowerCase().split(' ');
      const filteredOptions = airports.filter(airport =>
        searchTerms.every(term => airport.searchTerms.includes(term))
      );
      callback(filteredOptions);
    }, 300),
    [airports]
  );

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#ddd',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#007bff'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : 'white',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': {
        backgroundColor: '#e6f2ff',
        color: 'black'
      }
    })
  };

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="origin">Origin</label>
          <AsyncSelect
            id="origin"
            value={formData.origin}
            onChange={(option) => handleChange('origin', option)}
            placeholder="Search for an airport"
            isClearable
            isSearchable
            loadOptions={filterAirports}
            styles={customStyles}
          />
        </div>
        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <AsyncSelect
            id="destination"
            value={formData.destination}
            onChange={(option) => handleChange('destination', option)}
            placeholder="Search for an airport"
            isClearable
            isSearchable
            loadOptions={filterAirports}
            styles={customStyles}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="budget">Budget</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="travelers">Number of Travelers</label>
        <input
          type="number"
          id="travelers"
          name="travelers"
          value={formData.travelers}
          onChange={(e) => handleChange('travelers', e.target.value)}
          min="1"
        />
      </div>
            {/* Add new Preferences input */}
            <div className="form-group">
        <label htmlFor="preferences">Preferences</label>
        <input
          type="text"
          id="preferences"
          name="preferences"
          value={formData.preferences}
          onChange={(e) => handleChange('preferences', e.target.value)}
          placeholder="E.g., beach, adventure, family-friendly"
        />
      </div>
      <button type="submit" className="submit-button">Plan My Trip</button>
    </form>
  );
}

export default TripForm;

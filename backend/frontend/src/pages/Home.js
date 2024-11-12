import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <main className="home">
      {/* Hero Section */}
      <div className="content-wrapper">
        <section className="home__hero">
          <h1>Welcome to AI Travel Planner</h1>
          <p>Let AI help you create your perfect travel experience with personalized recommendations for flights, accommodations, and things to do.</p>
          <Link to="/plan" className="home__cta-button">Start Planning</Link>
        </section>
      </div>

      {/* Features Section */}
      <div className="content-wrapper">
        <section className="home__features">
          <h2>What We Offer</h2>
          <div className="home__features-grid">
            <div className="feature">
              <h3>Find Flights</h3>
              <p>Search and compare the best flights to your destination, all in one place.</p>
            </div>
            <div className="feature">
              <h3>Book Accommodations</h3>
              <p>Choose from a range of hotels, hostels, and vacation rentals that fit your budget and style.</p>
            </div>
            <div className="feature">
              <h3>Plan Itineraries</h3>
              <p>Get custom itinerary suggestions based on your interests and travel goals.</p>
            </div>
            <div className="feature">
              <h3>Explore Local Attractions</h3>
              <p>Discover top attractions, dining options, and hidden gems at your destination.</p>
            </div>
          </div>
        </section>
      </div>

      {/* How It Works Section */}
      <div className="content-wrapper">
        <section className="home__how-it-works">
          <h2>How It Works</h2>
          <div className="home__steps">
            <p>Enter your destination and travel dates.</p>
            <p>Get personalized recommendations for flights, hotels, and activities.</p>
            <p>Save your favorites and create a tailored itinerary.</p>
            <p>Book directly through the platform, and enjoy your trip!</p>
          </div>
        </section>
      </div>

      {/* Testimonials Section */}
      <div className="content-wrapper">
        <section className="home__testimonials">
          <h2>What Our Users Say</h2>
          <div className="testimonial">
            <p>"This app made planning my vacation so easy! The recommendations were spot-on."</p>
            <span>- Alex M.</span>
          </div>
          <div className="testimonial">
            <p>"I saved so much time and found amazing deals. Highly recommend!"</p>
            <span>- Jamie L.</span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;

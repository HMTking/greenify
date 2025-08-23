import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Mini Plant Store</h1>
            <p>Discover beautiful plants to brighten your home and garden</p>
            <Link to="/catalog" className="btn btn-primary btn-lg">
              Shop Plants
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-3">
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Fresh Plants</h3>
              <p>
                All our plants are fresh and healthy, sourced from trusted
                growers.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>
                Quick and secure delivery to your doorstep with Cash on
                Delivery.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3>Plant Care</h3>
              <p>
                Get expert advice and tips to keep your plants healthy and
                thriving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title text-center">Shop by Category</h2>
          <div className="grid grid-cols-4">
            <Link to="/catalog?category=Indoor" className="category-card">
              <div className="category-icon">🏠</div>
              <h3>Indoor Plants</h3>
            </Link>
            <Link to="/catalog?category=Outdoor" className="category-card">
              <div className="category-icon">🌳</div>
              <h3>Outdoor Plants</h3>
            </Link>
            <Link to="/catalog?category=Succulents" className="category-card">
              <div className="category-icon">🌵</div>
              <h3>Succulents</h3>
            </Link>
            <Link to="/catalog?category=Flowering" className="category-card">
              <div className="category-icon">🌸</div>
              <h3>Flowering Plants</h3>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

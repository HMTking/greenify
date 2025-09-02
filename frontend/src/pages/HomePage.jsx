import { Link } from "react-router-dom";
import { memo } from "react";
import "./HomePage.css";

const FeatureCard = memo(({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
));

const CategoryCard = memo(({ to, icon, title }) => (
  <Link to={to} className="category-card">
    <div className="category-icon">{icon}</div>
    <h3>{title}</h3>
  </Link>
));

const features = [
  {
    icon: "🌱",
    title: "Fresh Plants",
    description:
      "All our plants are fresh and healthy, sourced from trusted growers.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    description:
      "Quick and secure delivery to your doorstep with Cash on Delivery.",
  },
  {
    icon: "❤️",
    title: "Plant Care",
    description:
      "Get expert advice and tips to keep your plants healthy and thriving.",
  },
];

const categories = [
  { to: "/catalogue?category=Indoor", icon: "🏠", title: "Indoor Plants" },
  { to: "/catalogue?category=Outdoor", icon: "🌳", title: "Outdoor Plants" },
  { to: "/catalogue?category=Succulents", icon: "🌵", title: "Succulents" },
  {
    to: "/catalogue?category=Flowering",
    icon: "🌸",
    title: "Flowering Plants",
  },
];

const HomePage = memo(() => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Mini Plant Store</h1>
            <p>Discover beautiful plants to brighten your home and garden</p>
            <Link to="/catalogue" className="btn btn-primary btn-lg">
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
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title text-center">Shop by Category</h2>
          <div className="grid grid-cols-4">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
});

export default HomePage;

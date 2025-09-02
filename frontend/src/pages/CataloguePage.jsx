// Plant catalogue page with search, filter and add-to-cart functionality
import { useState, useEffect } from "react";
import api from "../utils/api";
import "./CataloguePage.css";

const CataloguePage = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchPlants();
    fetchCategories();
  }, [search, category, minPrice, maxPrice, minRating, sortBy, sortOrder]);
  //If any one of these values changes, React will re-run the useEffect function.

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (minRating) params.append("minRating", minRating);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      const response = await api.get(`/plants?${params}`);
      setPlants(response.data.plants);
    } catch (error) {
      console.error("Error fetching plants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/plants/categories/list`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ☆
        </span>
      );
    }

    return stars;
  };

  return (
    <div className="container catalogue-page" style={{ padding: "2rem 0" }}>
      <h1 className="page-title">Plant Catalogue</h1>

      {/* Filters */}
      <div className="catalogue-filters">
        <div className="filter-group">
          <label htmlFor="search" className="form-label">
            Search Plants
          </label>
          <input
            type="text"
            id="search"
            className="form-input"
            placeholder="Search for plants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="price-range" className="form-label">
            Price Range
          </label>
          <div className="price-range">
            <input
              type="number"
              placeholder="Min"
              className="form-input price-input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder="Max"
              className="form-input price-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="rating" className="form-label">
            Min Rating
          </label>
          <select
            id="rating"
            className="form-select"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="">Any Rating</option>
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort" className="form-label">
            Sort By
          </label>
          <div className="sort-controls">
            <select
              id="sort"
              className="form-select sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="createdAt">Newest</option>
            </select>
            <button
              className={`sort-order-btn ${
                sortOrder === "desc" ? "desc" : "asc"
              }`}
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <div className="filter-group">
          <button
            onClick={clearFilters}
            className="btn btn-secondary clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Plants Grid */}
      {loading ? (
        <div className="text-center">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-4">
          {plants.length > 0 ? (
            plants.map((plant) => (
              <div key={plant._id} className="card">
                {/* Image Section */}
                <div className="card-image">
                  {plant.image ? (
                    <img src={plant.image} alt={plant.name} />
                  ) : (
                    <span style={{ fontSize: "3rem" }}>🌱</span>
                  )}
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {/* Title */}
                  <h3 className="card-title">{plant.name}</h3>

                  {/* Description */}
                  <p className="card-description">{plant.description}</p>

                  {/* Rating Section */}
                  <div className="card-rating">
                    {plant.reviewCount > 0 ? (
                      <>
                        <div className="stars">{renderStars(plant.rating)}</div>
                        <span className="rating-text">
                          {plant.rating.toFixed(1)} ({plant.reviewCount}{" "}
                          reviews)
                        </span>
                      </>
                    ) : (
                      <div className="no-reviews">
                        <div className="stars">{renderStars(0)}</div>
                        <span className="rating-text">No reviews yet</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Stock Section */}
                  <div className="card-meta">
                    <div className="card-price">
                      <span className="price-main">₹{plant.price}</span>
                      {plant.originalPrice &&
                        plant.originalPrice > plant.price && (
                          <span className="price-original">
                            ₹{plant.originalPrice}
                          </span>
                        )}
                    </div>
                    <div
                      className={`card-stock ${
                        plant.stock > 0 ? "stock-available" : "stock-out"
                      }`}
                    >
                      {plant.stock > 0
                        ? `${plant.stock} in stock`
                        : "Out of stock"}
                    </div>
                  </div>

                  {/* Actions - Always at Bottom */}
                  <div className="card-actions">
                    <a
                      href={`/plant/${plant._id}`}
                      className="btn btn-primary w-full"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center" style={{ gridColumn: "1 / -1" }}>
              <p>No plants found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CataloguePage;

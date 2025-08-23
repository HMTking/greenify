import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import PlantDetailPage from "./pages/PlantDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlants from "./pages/admin/AdminPlants";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import AdminRedirect from "./components/AdminRedirect";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <AdminRedirect>
                      <HomePage />
                    </AdminRedirect>
                  }
                />
                <Route
                  path="/catalog"
                  element={
                    <AdminRedirect>
                      <CatalogPage />
                    </AdminRedirect>
                  }
                />
                <Route
                  path="/plant/:id"
                  element={
                    <AdminRedirect>
                      <PlantDetailPage />
                    </AdminRedirect>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Private Routes */}
                <Route
                  path="/cart"
                  element={
                    <AdminRedirect>
                      <PrivateRoute>
                        <CartPage />
                      </PrivateRoute>
                    </AdminRedirect>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <AdminRedirect>
                      <PrivateRoute>
                        <CheckoutPage />
                      </PrivateRoute>
                    </AdminRedirect>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <AdminRedirect>
                      <PrivateRoute>
                        <OrdersPage />
                      </PrivateRoute>
                    </AdminRedirect>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/plants"
                  element={
                    <AdminRoute>
                      <AdminPlants />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

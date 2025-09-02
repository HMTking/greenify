// BrowserRouter/Router = map; Routes = list of roads; Route = a single road
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CataloguePage from "./pages/CataloguePage";
import PlantDetailPage from "./pages/PlantDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlantCareAI from "./pages/PlantCareAI";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlants from "./pages/admin/AdminPlants";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import AdminRedirect from "./components/AdminRedirect"; //prevent Admin Access
import "./App.css";

// Layout wrapper to conditionally show header/footer
function Layout() {
  const location = useLocation();
  const isAIPage = location.pathname === "/plant-care-ai";

  return (
    <div className="app">
      <Navbar />
      <main className={`main-content ${isAIPage ? "ai-page" : ""}`}>
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
            path="/catalogue"
            element={
              <AdminRedirect>
                <CataloguePage />
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

          {/* AI Plant Care Assistant - Public Route */}
          <Route path="/plant-care-ai" element={<PlantCareAI />} />

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
      {!isAIPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout />
      </Router>
    </Provider>
  );
}

export default App;

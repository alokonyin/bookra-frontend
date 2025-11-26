import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import TravelerDashboard from "./pages/traveler/Dashboard";
import TravelerSearch from "./pages/traveler/Search";
import TravelerBookings from "./pages/traveler/Bookings";
import ProtectedRoute from "./components/ProtectedRoute";
import ConfirmBooking from "./pages/traveler/ConfirmBooking";
import Dashboard from "./pages/operator/Dashboard";
import AddBus from "./pages/operator/AddBus";
import PaymentMethod from "./pages/operator/PaymentMethod";
import Bookings from "./pages/operator/Bookings";


export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Traveler routes */}
        <Route
          path="/traveler/dashboard"
          element={
            <ProtectedRoute>
              <TravelerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/traveler/search"
          element={
            <ProtectedRoute>
              <TravelerSearch />
            </ProtectedRoute>
          }
        />
        <Route
            path="/traveler/confirm/:id"
            element={
                <ProtectedRoute>
                <ConfirmBooking />
                </ProtectedRoute>
            }
            />
            <Route path="/operator/dashboard" element={<Dashboard />} />
            <Route path="/operator/add-bus" element={<AddBus />} />
            <Route path="/operator/payment" element={<PaymentMethod />} />
            <Route path="/operator/bookings" element={<Bookings />} />

        <Route
          path="/traveler/bookings"
          element={
            <ProtectedRoute>
              <TravelerBookings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

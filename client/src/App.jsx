import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Rooms from "./components/Rooms";
import Experiences from "./components/Experiences";
import OurStory from "./components/OurStory";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

import RoomDetails from "./pages/RoomDetails";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestDashboard from "./pages/GuestDashboard";
import GuestBookings from "./pages/GuestBookings";
import StaffDashboard from "./pages/StaffDashboard";
import CreateStaff from "./pages/CreateStaff";
import AdminRooms from "./pages/AdminRooms";
import StaffRooms from "./pages/StaffRooms";
import AdminBookings from "./pages/AdminBookings";
import BookRoom from "./pages/BookRoom";
import StaffBookings from "./pages/StaffBookings";
import StaffCheckIn from "./pages/StaffCheckIn";
import StaffCheckOut from "./pages/StaffCheckOut";
import StaffHousekeeping from "./pages/StaffHousekeeping";
import StaffMaintenance from "./pages/StaffMaintenance";
import StaffGuests from "./pages/StaffGuests";
import GuestProfile from "./pages/GuestProfile";
import AdminFinance from "./pages/AdminFinance";
import AdminReports from "./pages/AdminReports";
import AdminFeedback from "./pages/AdminFeedback";

function Home() {
  return (
    <>
      <Hero />
      <Rooms />
      <Experiences />
      <OurStory />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
          </>
        }
      />

      <Route
        path="/rooms/:id"
        element={
          <>
            <Navbar />
            <RoomDetails />
          </>
        }
      />

      <Route path="/auth" element={<Auth />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminRooms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-staff"
        element={
          <ProtectedRoute allowedRole="admin">
            <CreateStaff />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminFinance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
  path="/admin/feedback"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminFeedback />
    </ProtectedRoute>
  }
/>

      <Route
        path="/guest"
        element={
          <ProtectedRoute allowedRole="guest">
            <GuestDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guest/book-room"
        element={
          <ProtectedRoute allowedRole="guest">
            <BookRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guest/my-bookings"
        element={
          <ProtectedRoute allowedRole="guest">
            <GuestBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guest/profile"
        element={
          <ProtectedRoute allowedRole="guest">
            <GuestProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/rooms"
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffRooms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/bookings"
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/check-in"
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffCheckIn />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/check-out"
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffCheckOut />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/housekeeping"
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffHousekeeping />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/maintenance"
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/guests"
        element={
          <ProtectedRoute allowedRole="staff">
            <StaffGuests />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
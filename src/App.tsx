import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import BookingPage from "./pages/BookingPage";
import BarbershopsPage from "./pages/BarbershopsPage";
import BarbersPage from "./pages/BarbersPage";
import ServicesPage from "./pages/ServicesPage";
import BookingsPage from "./pages/BookingsPage";
import ReportsPage from "./pages/ReportsPage";
import MySchedulePage from "./pages/MySchedulePage";
import WorkingHoursPage from "./pages/WorkingHoursPage";
import MyReportsPage from "./pages/MyReportsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/barbershops" element={<BarbershopsPage />} />
            <Route path="/barbers" element={<BarbersPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/my-schedule" element={<MySchedulePage />} />
            <Route path="/working-hours" element={<WorkingHoursPage />} />
            <Route path="/my-reports" element={<MyReportsPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

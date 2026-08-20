import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AIAssistantWidget from "@/components/ai/AIAssistantWidget";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import MarketplacePage from "@/pages/MarketplacePage";
import CropDetailPage from "@/pages/CropDetailPage";
import FarmerDashboard from "@/pages/FarmerDashboard";
import BuyerDashboard from "@/pages/BuyerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import KycPage from "@/pages/KycPage";
import ChatsPage from "@/pages/ChatsPage";
import MandiPricesPage from "@/pages/MandiPricesPage";
import AgroMonitoringPage from "@/pages/AgroMonitoringPage";
import ProfilePage from "@/pages/ProfilePage";
import CreateCropPage from "@/pages/CreateCropPage";
import AIChatPage from "@/pages/AIChatPage";
import { useAuthStore } from "@/store/authStore";

function DashboardSwitch() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/dashboard/admin" replace />;
  if (user.role === "FARMER") return <Navigate to="/dashboard/farmer" replace />;
  return <Navigate to="/dashboard/buyer" replace />;
}

function App() {
  return (
    <div className="App min-h-screen bg-background text-foreground" data-testid="krishi-app-root">
      <BrowserRouter>
        <Navbar />
        <main className="min-h-[calc(100vh-72px)]">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/crops/:id" element={<CropDetailPage />} />
            <Route path="/mandi-prices" element={<MandiPricesPage />} />
            <Route path="/agro-monitoring" element={<AgroMonitoringPage />} />
            <Route path="/ai-assistant" element={<AIChatPage />} />

            <Route path="/dashboard" element={<DashboardSwitch />} />
            <Route
              path="/dashboard/farmer"
              element={
                <ProtectedRoute roles={["FARMER"]}>
                  <FarmerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/farmer/new"
              element={
                <ProtectedRoute roles={["FARMER"]}>
                  <CreateCropPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/buyer"
              element={
                <ProtectedRoute roles={["BUYER"]}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc"
              element={
                <ProtectedRoute roles={["BUYER"]}>
                  <KycPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <ChatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats/:chatId"
              element={
                <ProtectedRoute>
                  <ChatsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <AIAssistantWidget />
        <Toaster richColors closeButton position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;

import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import SendOTP from "../pages/auth/SendOTP";
import VerifyOTP from "../pages/auth/VerifyOTP";
import NotFound from "../pages/NotFound";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/profile/Profile";
import DatasetUpload from "../pages/datasets/DatasetUpload";
import HistoricalYieldData from "../pages/datasets/HistoricalYieldData";
import SoilData from "../pages/datasets/SoilData";
import WeatherData from "../pages/datasets/WeatherData";
import FarmList from "../pages/farms/FarmList";
import CreateFarm from "../pages/farms/CreateFarm";
import FarmDetails from "../pages/farms/FarmDetails";
import EditFarm from "../pages/farms/EditFarm";
import AdminFarmList from "../pages/farms/AdminFarmList";
import Prediction from "../pages/Prediction";
import PredictionHistory from "../pages/predictions/PredictionHistory";
import PredictionDetails from "../pages/predictions/PredictionDetails";
import WeatherAnalysis from "../pages/weather/WeatherAnalysis";
import SoilAnalysis from "../pages/soil/SoilAnalysis";
import AnalyticsDashboard from "../pages/analytics/AnalyticsDashboard";
import Recommendation from "../components/recommendation/Recommendation";
import RecommendationHistory from "../components/recommendation/RecommendationHistory";
import RecommendationDetails from "../components/recommendation/RecommendationDetails";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/send-otp" element={<SendOTP />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/prediction"
        element={
          <ProtectedRoute farmerOnly>
            <Prediction />
          </ProtectedRoute>
        }
      />

      <Route
        path="/predictions/history"
        element={
          <ProtectedRoute farmerOnly>
            <PredictionHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/predictions/:predictionId"
        element={
          <ProtectedRoute farmerOnly>
            <PredictionDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendation"
        element={
          <ProtectedRoute farmerOnly>
            <Recommendation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations/history"
        element={
          <ProtectedRoute farmerOnly>
            <RecommendationHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations/:recommendationId"
        element={
          <ProtectedRoute farmerOnly>
            <RecommendationDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/datasets/upload"
        element={
          <ProtectedRoute adminOnly>
            <DatasetUpload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/datasets/historical-yield"
        element={
          <ProtectedRoute>
            <HistoricalYieldData />
          </ProtectedRoute>
        }
      />

      <Route
        path="/datasets/soil"
        element={
          <ProtectedRoute>
            <SoilData />
          </ProtectedRoute>
        }
      />

      <Route
        path="/datasets/weather"
        element={
          <ProtectedRoute>
            <WeatherData />
          </ProtectedRoute>
        }
      />

      <Route
        path="/weather-analysis"
        element={
          <ProtectedRoute>
            <WeatherAnalysis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/soil-analysis"
        element={
          <ProtectedRoute>
            <SoilAnalysis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farms"
        element={
          <ProtectedRoute farmerOnly>
            <FarmList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farms/create"
        element={
          <ProtectedRoute farmerOnly>
            <CreateFarm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farms/:farmId"
        element={
          <ProtectedRoute>
            <FarmDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/farms/:farmId/edit"
        element={
          <ProtectedRoute>
            <EditFarm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/farms"
        element={
          <ProtectedRoute adminOnly>
            <AdminFarmList />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default AppRoutes;
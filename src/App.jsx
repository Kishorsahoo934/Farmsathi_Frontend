import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import WeatherBar from './components/WeatherBar';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CropRecommendPage from './pages/CropRecommendPage';
import FertilizerRecommendPage from './pages/FertilizerRecommendPage';
import DiseaseDetectPage from './pages/DiseaseDetectPage';
import SurveyPage from './pages/SurveyPage';
import FeedbackPage from './pages/FeedbackPage';
import ContactPage from './pages/ContactPage';
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      {user && <WeatherBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/crop-recommend" element={<ProtectedRoute><CropRecommendPage /></ProtectedRoute>} />
        <Route path="/fertilizer-recommend" element={<ProtectedRoute><FertilizerRecommendPage /></ProtectedRoute>} />
        <Route path="/disease-detect" element={<ProtectedRoute><DiseaseDetectPage /></ProtectedRoute>} />
        <Route path="/survey" element={<ProtectedRoute><SurveyPage /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
        <Route path="*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      </Routes>
      <ChatbotWidget />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLoginForm from './components/AdminLoginForm';

// Ленивая загрузка страниц
const HomePage = lazy(() => import('./pages/HomePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const RoomsPage = lazy(() => import('./pages/RoomsPage'));
const ConferencePage = lazy(() => import('./pages/ConferencePage'));
const PartyPage = lazy(() => import('./pages/PartyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const BookingSuccessPage = lazy(() => import('./pages/BookingSuccessPage'));
const BookingFailurePage = lazy(() => import('./pages/BookingFailurePage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const SaunaPage = lazy(() => import('./pages/SaunaPage'));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));

// Простой компонент-заглушка для Suspense
// В реальном приложении здесь может быть спиннер или другой индикатор
const LoadingFallback = () => <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>Загрузка...</div>;

const App: React.FC = () => {
  return (
    <Router>
      <GlobalStyle />
      <Header />
      {/* Обертка Suspense для ленивой загрузки */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/booking/:roomId" element={<BookingPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/conference" element={<ConferencePage />} />
          <Route path="/party" element={<PartyPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/booking-success/:bookingId" element={<BookingSuccessPage />} />
          <Route path="/booking-failure" element={<BookingFailurePage />} />
          <Route path="/sauna" element={<SaunaPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/login" element={<AdminLoginForm />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Footer />
    </Router>
  );
};

export default App;

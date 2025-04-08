import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Ленивая загрузка страниц
const HomePage = lazy(() => import('./pages/HomePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const RoomsPage = lazy(() => import('./pages/RoomsPage'));

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
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
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

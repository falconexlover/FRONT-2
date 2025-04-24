import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TabItem } from './ui/Tabs';
import HomepageEditor from './HomepageEditor';
import RoomsAdminPanel from './RoomsAdminPanel';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import PromotionsAdminPanel from './admin/PromotionsAdminPanel';
import ConferencePageEditor from './admin/editors/ConferencePageEditor';
import PartyPageEditor from './admin/editors/PartyPageEditor';
import SaunaPageEditor from './admin/editors/SaunaPageEditor';
import GalleryAdminPanel from './admin/GalleryAdminPanel';
import ServicesAdminPanel from './admin/ServicesAdminPanel';
import ArticlesAdminPanel from './admin/ArticlesAdminPanel';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

interface AdminPanelProps {}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1rem;
  font-size: 2rem;
  color: var(--primary-color);
  flex-direction: column;
  gap: 1rem;

  i {
    animation: ${spin} 1s linear infinite;
  }
`;

const adminTabs: TabItem[] = [
    { id: 'dashboard', label: 'Дашборд' },
    { id: 'homepage', label: 'Главная страница' },
    { id: 'rooms', label: 'Номера' },
    { id: 'services', label: 'Преимущества' },
    { id: 'edit-conference', label: 'Ред. Конференц-зал' }, 
    { id: 'edit-party', label: 'Ред. Детские праздники' }, 
    { id: 'edit-sauna', label: 'Ред. Сауна' },
    { id: 'gallery', label: 'Галерея' },
    { id: 'promotions', label: 'Акции' },
    { id: 'articles', label: 'Блог' },
];

const tabToRoute: Record<string, string> = {
  dashboard: '',
  homepage: 'homepage',
  rooms: 'rooms',
  services: 'services',
  'edit-conference': 'edit-conference',
  'edit-party': 'edit-party',
  'edit-sauna': 'edit-sauna',
  gallery: 'gallery',
  promotions: 'promotions',
  articles: 'articles',
};

const routeToTab: Record<string, string> = Object.fromEntries(
  Object.entries(tabToRoute).map(([k, v]) => [v, k])
);

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.replace(/^\/admin\/?/, '');
  const activeTab = routeToTab[path] || 'dashboard';
  const [homepageUnsaved, setHomepageUnsaved] = React.useState(false);

  // Обработчик смены вкладки с предупреждением
  const handleTabChange = (id: string) => {
    if (activeTab === 'homepage' && homepageUnsaved) {
      if (!window.confirm('У вас есть несохранённые изменения на главной странице. Перейти без сохранения?')) {
        return;
      }
    }
    navigate(tabToRoute[id] ? `/admin/${tabToRoute[id]}` : '/admin');
  };

  return (
    <AdminLayout 
      menuItems={adminTabs} 
      activeMenuItemId={activeTab} 
      onMenuItemSelect={handleTabChange}
    >
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Routes>
            <Route path="" element={<Dashboard setActiveTab={handleTabChange} />} />
            <Route path="homepage" element={<HomepageEditor onUnsavedChange={setHomepageUnsaved} />} />
            <Route path="rooms" element={<RoomsAdminPanel />} />
            <Route path="services" element={<ServicesAdminPanel />} />
            <Route path="gallery" element={<GalleryAdminPanel />} />
            <Route path="promotions" element={<PromotionsAdminPanel />} />
            <Route path="edit-conference" element={<ConferencePageEditor />} />
            <Route path="edit-party" element={<PartyPageEditor />} />
            <Route path="edit-sauna" element={<SaunaPageEditor />} />
            <Route path="articles" element={<ArticlesAdminPanel />} />
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminPanel; 
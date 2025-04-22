import React, { useState } from 'react';
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

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [activeTab, setActiveTab] = useState(adminTabs[0].id);
  const [homepageUnsaved, setHomepageUnsaved] = useState(false);

  // Обработчик смены вкладки с предупреждением
  const handleTabChange = (id: string) => {
    if (activeTab === 'homepage' && homepageUnsaved) {
      if (!window.confirm('У вас есть несохранённые изменения на главной странице. Перейти без сохранения?')) {
        return;
      }
    }
    setActiveTab(id);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'homepage':
        return <HomepageEditor onUnsavedChange={setHomepageUnsaved} />;
      case 'rooms':
        return <RoomsAdminPanel />;
      case 'services':
        return <ServicesAdminPanel />;
      case 'gallery':
        return <GalleryAdminPanel />;
      case 'promotions':
        return <PromotionsAdminPanel />;
      case 'edit-conference':
        return <ConferencePageEditor />;
      case 'edit-party':
        return <PartyPageEditor />;
      case 'edit-sauna':
        return <SaunaPageEditor />;
      case 'articles':
        return <ArticlesAdminPanel />;
      default:
        return <p>Раздел в разработке.</p>;
    }
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
             {renderContent()}
          </motion.div>
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminPanel; 
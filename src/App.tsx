import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import ExecutiveSummary from './pages/ExecutiveSummary';
import SalesAnalytics from './pages/SalesAnalytics';
import FunnelLeads from './pages/FunnelLeads';
import ClientRetention from './pages/ClientRetention';
import TrainerPerformance from './pages/TrainerPerformance';
import ClassAttendance from './pages/ClassAttendance';
import Sessions from './pages/Sessions';
import DiscountsPromotions from './pages/DiscountsPromotions';
import PowerCycleVsBarre from './pages/PowerCycleVsBarre';
import NotFound from './pages/NotFound';

import { NoteTakingProvider } from '@/contexts/NoteTakingContext';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <NoteTakingProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/executive-summary" element={<ExecutiveSummary />} />
            <Route path="/sales-analytics" element={<SalesAnalytics />} />
            <Route path="/funnel-leads" element={<FunnelLeads />} />
            <Route path="/client-retention" element={<ClientRetention />} />
            <Route path="/trainer-performance" element={<TrainerPerformance />} />
            <Route path="/class-attendance" element={<ClassAttendance />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/discounts-promotions" element={<DiscountsPromotions />} />
            <Route path="/powercycle-vs-barre" element={<PowerCycleVsBarre />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NoteTakingProvider>
      </div>
    </Router>
  );
}

export default App;

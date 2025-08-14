
import React from 'react';
import { ExecutiveSummarySection } from '@/components/dashboard/ExecutiveSummarySection';
import { Footer } from '@/components/ui/footer';
import { GlobalFiltersProvider } from '@/contexts/GlobalFiltersContext';
import { ComprehensiveFilterSection } from '@/components/filters/ComprehensiveFilterSection';

const ExecutiveSummary = () => {
  return (
    <GlobalFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        {/* Add the comprehensive filter section here so it's within the provider */}
        <div className="p-6">
          <div className="max-w-[1600px] mx-auto mb-8">
            <ComprehensiveFilterSection
              availableLocations={[]} // Will be populated by the dashboard component
              showAdvancedFilters={true}
            />
          </div>
        </div>
        <ExecutiveSummarySection />
        <Footer />
      </div>
    </GlobalFiltersProvider>
  );
};

export default ExecutiveSummary;

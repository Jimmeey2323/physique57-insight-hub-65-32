
import React, { Suspense } from 'react';
import { ExecutiveSummarySection } from '@/components/dashboard/ExecutiveSummarySection';
import { Footer } from '@/components/ui/footer';
import { GlobalFiltersProvider } from '@/contexts/GlobalFiltersContext';

// Lazy load the filter section for better performance
const ComprehensiveFilterSection = React.lazy(() => 
  import('@/components/filters/ComprehensiveFilterSection').then(module => ({
    default: module.ComprehensiveFilterSection
  }))
);

const ExecutiveSummary = React.memo(() => {
  return (
    <GlobalFiltersProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <Suspense fallback={
          <div className="p-6">
            <div className="max-w-[1600px] mx-auto mb-8">
              <div className="h-32 bg-white/90 backdrop-blur-sm rounded-lg animate-pulse" />
            </div>
          </div>
        }>
          <ExecutiveSummarySection />
        </Suspense>
        <Footer />
      </div>
    </GlobalFiltersProvider>
  );
});

ExecutiveSummary.displayName = 'ExecutiveSummary';

export default ExecutiveSummary;

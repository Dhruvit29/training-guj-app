import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import TrainingAppBar from './TrainingAppBar';
import TrainingSidebar from './TrainingSidebar';

const TrainingLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TrainingSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TrainingAppBar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TrainingLayout;

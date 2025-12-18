import { useContext } from 'react';
import { RightSidebarContext } from '@/gui/contexts';

export const useRightSidebar = () => {
  const context = useContext(RightSidebarContext);
  if (!context) {
    throw new Error('useRightSidebar must be used within a RightSidebarProvider');
  }
  return context;
};

export default useRightSidebar;

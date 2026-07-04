import { SelectedTimeFrameContext, SelectedTimeFrameContextAPI } from 'Contexts/SelectedTimeFrame.context';
import { use } from 'react';

export default function useSelectedTimeFrame(): SelectedTimeFrameContextAPI {
  const context = use(SelectedTimeFrameContext);

  if (context === null) {
    throw new Error('useSelectedTimeFrame must be used within a SelectedTimeFrameProvider');
  }

  return context;
}

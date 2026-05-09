import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PageRoutes from 'Components/PageRoutes/PageRoutes';
import SelectedTimeFrameProvider from 'Contexts/SelectedTimeFrame.context';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { IsMobileContextProvider } from 'Util/IsMobileContext';
import msMapper from 'Util/Time/TimeMapping';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: msMapper.day,
    },
  },
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <QueryClientProvider client={queryClient}>
        <IsMobileContextProvider>
          <BrowserRouter>
            <SelectedTimeFrameProvider>
              <PageRoutes />
            </SelectedTimeFrameProvider>
          </BrowserRouter>
        </IsMobileContextProvider>
      </QueryClientProvider>
    </LocalizationProvider>
  </StrictMode>,
);

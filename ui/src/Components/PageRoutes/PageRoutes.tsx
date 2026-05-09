import DesktopNavigation from 'Components/Navigation/DesktopNavigation/DesktopNavigation';
import MobileNavigation from 'Components/Navigation/MobileNavigation/MobileNavigation';
import useSessionStatus from 'Hooks/useSessionStatus/useSessionStatus';
import AuthScreen from 'Pages/AuthScreen/AuthScreen';
import Dashboard from 'Pages/Dashboard/Dashboard';
import RecurringSpending from 'Pages/RecurringSpending/RecurringSpending';
import Savings from 'Pages/Savings/Savings';
import Trends from 'Pages/Trends/Trends';
import TripsPage from 'Pages/TripsPage/TripsPage';
import { useEffect, useLayoutEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from 'Util/IsMobileContext';

export enum PageName {
  dashboard = 'dashboard',
  auth = 'auth',
  savings = 'savings',
  recurring_spending = 'recurring_spending',
  trends = 'trends',
  trips = 'trips',
}

export const PAGE_ROUTES: Record<PageName, `/${PageName}`> = {
  dashboard: '/dashboard',
  auth: '/auth',
  savings: '/savings',
  trends: '/trends',
  recurring_spending: '/recurring_spending',
  trips: '/trips',
};

export default function PageRoutes() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticating, isAuthenticated } = useSessionStatus();

  useEffect(() => {
    if (!isAuthenticating && !isAuthenticated) {
      navigate('/auth');
    }

    if ((location.pathname === '/auth' || location.pathname === '/') && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAuthenticating, location.pathname, navigate]);

  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      <Route element={isMobile ? <MobileNavigation /> : <DesktopNavigation />}>
        <Route path={PAGE_ROUTES.dashboard} element={<Dashboard />} />
        <Route path={PAGE_ROUTES.savings} element={<Savings />} />
        <Route path={PAGE_ROUTES.recurring_spending} element={<RecurringSpending />} />
        <Route path={PAGE_ROUTES.trips} element={<TripsPage />} />
        <Route path={PAGE_ROUTES.trends} element={<Trends />} />
      </Route>
      <Route path={PAGE_ROUTES.auth} element={<AuthScreen />} />
    </Routes>
  );
}

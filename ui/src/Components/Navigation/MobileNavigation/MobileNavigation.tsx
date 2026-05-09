import { PAGE_ROUTES } from 'Components/PageRoutes/PageRoutes';
import useContent from 'Hooks/useContent';
import { FaChartPie, FaHistory, FaHome, FaPlaneDeparture } from 'react-icons/fa';
import { MdSavings } from 'react-icons/md';
import { Outlet } from 'react-router-dom';
import styles from './MobileNavigation.module.css';
import MobileNavItem from './MobileNavItem';

export default function MobileNavigation() {
  const getContent = useContent('navigation');

  return (
    <>
      <div className={styles.outletContainer}>
        <Outlet data-testid="outlet-container" />
        <div className={styles.outletSpacer} />
      </div>
      <nav id="mobile-nav" className={styles.navContainer}>
        <MobileNavItem to={PAGE_ROUTES.dashboard} icon={<FaHome />} text={getContent('dashboard')} />
        <MobileNavItem to={PAGE_ROUTES.savings} icon={<MdSavings />} text={getContent('savings')} />
        <MobileNavItem to={PAGE_ROUTES.trends} icon={<FaChartPie />} text={getContent('trends')} />
        <MobileNavItem to={PAGE_ROUTES.recurring_spending} icon={<FaHistory />} text={getContent('recurring')} />
        <MobileNavItem to={PAGE_ROUTES.trips} icon={<FaPlaneDeparture />} text={getContent('trips')} />
      </nav>
    </>
  );
}

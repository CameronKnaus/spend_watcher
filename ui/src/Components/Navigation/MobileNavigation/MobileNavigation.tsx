import { Outlet } from '@tanstack/react-router';
import createContentGetter from 'Content/createContentGetter';
import { FaChartPie, FaHistory, FaHome, FaPlaneDeparture } from 'react-icons/fa';
import { MdSavings } from 'react-icons/md';
import styles from './MobileNavigation.module.css';
import MobileNavItem from './MobileNavItem';

export default function MobileNavigation() {
  const getContent = createContentGetter('navigation');

  return (
    <>
      <div className={styles.outletContainer}>
        <Outlet />
        <div className={styles.outletSpacer} />
      </div>
      <nav id="mobile-nav" className={styles.navContainer}>
        <MobileNavItem to="/dashboard" icon={<FaHome />} text={getContent('dashboard')} />
        <MobileNavItem to="/savings" icon={<MdSavings />} text={getContent('savings')} />
        <MobileNavItem to="/trends" icon={<FaChartPie />} text={getContent('trends')} />
        <MobileNavItem to="/recurring_spending" icon={<FaHistory />} text={getContent('recurring')} />
        <MobileNavItem to="/trips" icon={<FaPlaneDeparture />} text={getContent('trips')} />
      </nav>
    </>
  );
}

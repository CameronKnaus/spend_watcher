import { DateRangeType } from 'Contexts/SelectedTimeFrame.context';
import useContent from 'Hooks/useContent';
import useSelectedTimeFrame from 'Hooks/useSelectedTimeFrame/useSelectedTimeFrame';
import { useLayoutEffect, useRef } from 'react';
import { FaFilter } from 'react-icons/fa';
import { useIsMobile } from 'Util/IsMobileContext';
import TimeFrameButton from '../TimeFrameButton/TimeFrameButton';
import MobileButton from './MobileButton/MobileButton';
import styles from './TrendsMobileNavigation.module.css';

export default function TrendsMobileNavigation() {
  const navRef = useRef<HTMLDivElement>(null);
  const { dateRangeType, updateDateRangeType } = useSelectedTimeFrame();
  const getContent = useContent('trends');
  const isMobile = useIsMobile();

  useLayoutEffect(() => {
    const navElement = navRef.current;
    if (!navElement) {
      return;
    }

    if (!isMobile) {
      navElement.style.bottom = '0px';
      return;
    }

    const mobileNav = document.getElementById('mobile-nav');

    navElement.style.bottom = `${mobileNav?.clientHeight ?? 0}px`;
  }, [isMobile]);

  return (
    <nav ref={navRef} className={styles.navContainer}>
      <TimeFrameButton />
      <MobileButton
        icon={<FaFilter />}
        buttonText={dateRangeType === DateRangeType.YEAR ? getContent('monthlyLabel') : getContent('yearlyLabel')}
        onClick={() => {
          updateDateRangeType(dateRangeType === DateRangeType.YEAR ? DateRangeType.MONTH : DateRangeType.YEAR);
        }}
      />
    </nav>
  );
}

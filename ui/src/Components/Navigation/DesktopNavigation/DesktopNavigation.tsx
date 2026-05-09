import { animated, useChain, useSpring, useSpringRef } from '@react-spring/web';
import { PAGE_ROUTES } from 'Components/PageRoutes/PageRoutes';
import useContent from 'Hooks/useContent';
import { useEffect, useRef, useState } from 'react';
import { FaChartPie, FaHistory, FaHome, FaPlaneDeparture } from 'react-icons/fa';
import { MdSavings } from 'react-icons/md';
import { Outlet, useLocation } from 'react-router-dom';
import styles from './DesktopNavigation.module.css';
import DesktopNavItem from './DesktopNavItem';

// Time user needs to hover on menu before it expands
const MENU_OPEN_DELAY = 1500;
const DEFAULT_WIDTH = 68;

// This component turned out rough
export default function DesktopNavigation() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const menuListRef = useRef<HTMLDivElement>(null);
  const paddingOffset = 40;
  const expandedWidth = menuListRef.current ? menuListRef.current.scrollWidth + paddingOffset : DEFAULT_WIDTH;
  const location = useLocation();
  const getContent = useContent('navigation');

  const containerSpringRef = useSpringRef();
  const containerSprings = useSpring({
    ref: containerSpringRef,
    from: {
      width: DEFAULT_WIDTH,
    },
    to: {
      width: menuExpanded ? expandedWidth : DEFAULT_WIDTH,
    },
    config: {
      mass: 1.1,
    },
  });

  const textSpringRef = useSpringRef();
  const textSprings = useSpring({
    ref: textSpringRef,
    from: {
      opacity: 0,
    },
    opacity: menuExpanded ? 1 : 0,
  });

  // Close menu if the routing changes
  useEffect(() => {
    setMenuExpanded(false);
  }, [location.pathname]);

  useChain(
    menuExpanded ? [containerSpringRef, textSpringRef] : [textSpringRef, containerSpringRef],
    [0, 1],
    menuExpanded ? 300 : 50,
  );

  function handleOnBlur() {
    if (delayHandler) {
      clearTimeout(delayHandler);
    }

    setTimeout(() => {
      if (!menuListRef.current?.contains(document.activeElement)) {
        closeMenu();
      }
    }, 100);
  }

  function closeMenu() {
    setMenuExpanded(false);
    if (delayHandler) {
      clearTimeout(delayHandler);
      setDelayHandler(null);
    }
  }

  function openMenu() {
    if (delayHandler) {
      return;
    }

    setDelayHandler(
      setTimeout(() => {
        setMenuExpanded(true);
      }, MENU_OPEN_DELAY),
    );
  }

  return (
    <>
      <div className={styles.desktopNav}>
        <animated.nav
          ref={menuListRef}
          className={styles.menuList}
          style={containerSprings}
          onMouseLeave={closeMenu}
          onMouseEnter={openMenu}
        >
          <DesktopNavItem
            to={PAGE_ROUTES.dashboard}
            icon={<FaHome />}
            text={getContent('dashboard')}
            openMenu={openMenu}
            onBlur={handleOnBlur}
            textSprings={textSprings}
          />
          <DesktopNavItem
            to={PAGE_ROUTES.savings}
            icon={<MdSavings />}
            text={getContent('savings')}
            openMenu={openMenu}
            onBlur={handleOnBlur}
            textSprings={textSprings}
          />
          <DesktopNavItem
            to={PAGE_ROUTES.recurring_spending}
            icon={<FaHistory />}
            text={getContent('recurringDesktop')}
            openMenu={openMenu}
            onBlur={handleOnBlur}
            textSprings={textSprings}
          />
          <DesktopNavItem
            to={PAGE_ROUTES.trends}
            icon={<FaChartPie />}
            text={getContent('trends')}
            openMenu={openMenu}
            onBlur={handleOnBlur}
            textSprings={textSprings}
          />
          <DesktopNavItem
            to={PAGE_ROUTES.trips}
            icon={<FaPlaneDeparture />}
            text={getContent('trips')}
            openMenu={openMenu}
            onBlur={handleOnBlur}
            textSprings={textSprings}
          />
        </animated.nav>
      </div>
      {/* Padding left for the nav bar space, isolation to avoid conflicting with nav menu z-index */}
      <div style={{ paddingLeft: DEFAULT_WIDTH, isolation: 'isolate' }}>
        <div className={styles.outletContainer}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

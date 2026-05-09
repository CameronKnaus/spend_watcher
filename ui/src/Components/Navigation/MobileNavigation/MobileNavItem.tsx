import { NavLink, useLocation } from 'react-router-dom';
import styles from './MobileNavigation.module.css';
import { animated } from '@react-spring/web';
import useNavSelectionSpring from '../useNavSelectionSpring';

type MobileNavItemPropTypes = {
  to: string;
  icon: React.ReactNode;
  text: string;
};

export default function MobileNavItem({ to, icon, text }: MobileNavItemPropTypes) {
  const isCurrentRoute = useLocation().pathname === to;
  const selectionSprings = useNavSelectionSpring(isCurrentRoute);

  return (
    <NavLink to={to} className={styles.menuItem}>
      <div className={styles.icon}>
        <animated.div
          data-testid={`${text}-icon-selection`}
          className={styles.selectionBackground}
          style={selectionSprings}
        />
        <span
          data-testid={`${text}-icon`}
          style={{
            color: isCurrentRoute ? 'var(--token-color-background-primary)' : 'var(--token-navigation-color)',
            transitionDuration: '0.3s',
          }}
        >
          {icon}
        </span>
      </div>
      <div className={styles.navLabel}>{text}</div>
    </NavLink>
  );
}

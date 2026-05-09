import { NavLink, useLocation } from 'react-router-dom';
import styles from './DesktopNavigation.module.css';
import { animated, SpringValues } from '@react-spring/web';
import useNavSelectionSpring from '../useNavSelectionSpring';

type DesktopNavItemPropTypes = {
  to: string;
  icon: React.ReactNode;
  text: string;
  textSprings: SpringValues<{
    opacity: number;
  }>;
  openMenu: () => void;
  onBlur: () => void;
};

export default function DesktopNavItem({ to, icon, text, textSprings, openMenu, onBlur }: DesktopNavItemPropTypes) {
  const isCurrentRoute = useLocation().pathname === to;
  const selectionSprings = useNavSelectionSpring(isCurrentRoute);

  return (
    <NavLink to={to} className={styles.menuItem} onFocus={openMenu} onBlur={onBlur}>
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
      <div className={styles.navTextContainer}>
        <animated.span style={textSprings}>{text}</animated.span>
      </div>
    </NavLink>
  );
}

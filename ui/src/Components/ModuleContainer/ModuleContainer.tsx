import { clsx } from 'clsx';
import SkeletonLoader from 'Components/Shared/SkeletonLoader';
import { ComponentProps, ReactNode } from 'react';
import { UseMeasureRef } from 'react-use/lib/useMeasure';
import styles from './ModuleContainer.module.css';

type ModuleContainerPropTypes = {
  forwardRef?: UseMeasureRef<HTMLDivElement>;
  heading?: ReactNode;
  // For shadow effect
  elevation?: 'low' | 'medium' | 'high';
  isLoading?: boolean; // Show default staggered skeleton loader animations
  children?: ReactNode;
  padding?: string;
};

// TODO: This component has too many responsibilities.  It should be made into a simple "Tile" extension of a div
export default function ModuleContainer({
  forwardRef,
  heading,
  elevation,
  isLoading = false,
  children,
  ...attributes
}: ModuleContainerPropTypes & ComponentProps<'div'>) {
  const { className, ...restAttributes } = attributes;

  const containerClass = clsx(styles.defaultContainer, className, {
    'background-secondary-elevation-low': elevation === 'low',
    'background-secondary-elevation-medium': elevation === 'medium',
    'background-secondary-elevation-high': elevation === 'high',
  });

  return (
    // Order of attributes here matters
    <div ref={forwardRef} {...restAttributes} className={containerClass}>
      {heading && <h3 className={styles.heading}>{heading}</h3>}
      {isLoading ? (
        <div className={styles.skeletonLoaderContainer}>
          <SkeletonLoader style={{ height: 24, width: '100%' }} />
          <SkeletonLoader style={{ height: 24, width: '75%' }} />
          <SkeletonLoader style={{ height: 24, width: '50%' }} />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

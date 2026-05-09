import styles from './SkeletonLoader.module.css';
import { clsx } from 'clsx';

type SkeletonLoaderPropTypes = {
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export default function SkeletonLoader({ className, ...rest }: SkeletonLoaderPropTypes) {
  return <div className={clsx([styles.loader, className])} {...rest} />;
}

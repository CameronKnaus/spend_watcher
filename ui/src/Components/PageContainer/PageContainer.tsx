import clsx from 'clsx';
import { ComponentProps } from 'react';
import styles from './PageContainer.module.css';

type PageContainerPropTypes = {
  pageTitle: string;
} & ComponentProps<'div'>;

export default function PageContainer({ pageTitle, children, className, ...props }: PageContainerPropTypes) {
  return (
    <div className={clsx(styles.pageContainer, className)} {...props}>
      <h1 className={styles.pageTitle}>{pageTitle}</h1>
      {children}
    </div>
  );
}

import AlertMessage from 'Components/AlertMessage/AlertMessage';
import CustomButton from 'Components/CustomButton/CustomButton';
import createContentGetter from 'Content/createContentGetter';
import styles from './RouteErrorFallback.module.css';

// Router-level fallback for render-time errors that escape a route's own error handling. A full
// reload (rather than the router's `reset()`) clears any bad in-memory state that caused the crash.
export default function RouteErrorFallback() {
  const getContent = createContentGetter('general');

  return (
    <div className={styles.container}>
      <AlertMessage variant="error" title={getContent('routeErrorTitle')} message={getContent('routeErrorMessage')} />
      <CustomButton variant="primary" onClick={() => window.location.reload()}>
        {getContent('reloadPage')}
      </CustomButton>
    </div>
  );
}

import AlertMessage from 'Components/AlertMessage/AlertMessage';
import PageContainer from 'Components/PageContainer/PageContainer';
import useContent from 'Hooks/useContent';
import useTripsList from 'Hooks/useTripsList/useTripsList';
import AddTripButton from './AddTripButton/AddTripButton';
import TripModule from './TripModule/TripModule';
import TripModuleLoader from './TripModule/TripModuleLoader';
import styles from './TripsPage.module.css';

export default function TripsPage() {
  const { tripsList, isLoading, isError } = useTripsList();
  const getContent = useContent('trips');
  const pageTitle = getContent('pageTitle');

  if (isLoading) {
    return (
      <PageContainer pageTitle={pageTitle}>
        <span className="accessible-text">{getContent('pageLoadingAccessibleText')}</span>
        <div className={styles.tripModulesContainer}>
          <TripModuleLoader />
          <TripModuleLoader />
          <TripModuleLoader />
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer pageTitle={pageTitle}>
        <AlertMessage
          variant="error"
          title={getContent('tripsPageErrorTitle')}
          message={getContent('tripsPageErrorMessage')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={pageTitle}>
      <AddTripButton />
      <div className={styles.tripModulesContainer}>
        {tripsList?.map((tripDetails) => (
          <TripModule key={tripDetails.trip.tripId} trip={tripDetails.trip} tripCostTotals={tripDetails.costTotals} />
        ))}
      </div>
    </PageContainer>
  );
}

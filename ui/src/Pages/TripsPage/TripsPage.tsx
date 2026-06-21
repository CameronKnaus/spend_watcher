import { useQuery } from '@tanstack/react-query';
import AlertMessage from 'Components/AlertMessage/AlertMessage';
import PageContainer from 'Components/PageContainer/PageContainer';
import useContent from 'Hooks/useContent/useContent';
import { tripsListQueryOptions } from 'queryOptions/tripsListQueryOptions';
import AddTripButton from './AddTripButton/AddTripButton';
import TripModule from './TripModule/TripModule';
import TripModuleLoader from './TripModule/TripModuleLoader';
import styles from './TripsPage.module.css';

export default function TripsPage() {
  const { data, isLoading, isFetching, isError } = useQuery(tripsListQueryOptions);
  const tripsList = data?.tripsList;
  const getContent = useContent('trips');
  const pageTitle = getContent('pageTitle');

  if (isLoading || isFetching) {
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

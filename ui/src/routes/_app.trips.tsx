import { createFileRoute } from '@tanstack/react-router';
import TripsPage from 'Pages/TripsPage/TripsPage';

export const Route = createFileRoute('/_app/trips')({
  component: TripsPage,
});

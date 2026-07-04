import { createFileRoute } from '@tanstack/react-router';
import Dashboard from 'Pages/Dashboard/Dashboard';

export const Route = createFileRoute('/_app/dashboard')({
  component: Dashboard,
});

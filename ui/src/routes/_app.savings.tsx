import { createFileRoute } from '@tanstack/react-router';
import Savings from 'Pages/Savings/Savings';

export const Route = createFileRoute('/_app/savings')({
  component: Savings,
});

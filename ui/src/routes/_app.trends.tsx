import { createFileRoute } from '@tanstack/react-router';
import Trends from 'Pages/Trends/Trends';

export const Route = createFileRoute('/_app/trends')({
  component: Trends,
});

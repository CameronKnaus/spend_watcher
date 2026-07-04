import { format } from 'date-fns';

export const currentMonth = () => format(new Date(), 'yyyy-MM');

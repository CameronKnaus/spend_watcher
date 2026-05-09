// import { render, screen, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { PAGE_ROUTES } from 'Components/PageRoutes/PageRoutes';
// import { MemoryRouter, BrowserRouter as Router } from 'react-router-dom';
// import DesktopNavigation from './DesktopNavigation';

// const ANIMATION_WAIT_DURATION = 2500;

// describe('DesktopNavigation', () => {
//     test('renders all menu items', () => {
//         render(
//             <Router>
//                 <DesktopNavigation />
//             </Router>,
//         );

//         expect(screen.getByText('Dashboard')).toBeInTheDocument();
//         expect(screen.getByText('Transactions')).toBeInTheDocument();
//         expect(screen.getByText('Recurring spending')).toBeInTheDocument();
//         expect(screen.getByText('Trends')).toBeInTheDocument();
//         expect(screen.getByText('Trips')).toBeInTheDocument();
//     });

//     test('the menu opens and closes when hovering in and out', async () => {
//         const user = userEvent.setup({ delay: null });

//         render(
//             <MemoryRouter initialEntries={[{ pathname: '/' }]}>
//                 <DesktopNavigation />
//             </MemoryRouter>,
//         );

//         const menuList = screen.getByRole('navigation');
//         const dashboardNavItem = screen.getByText('Dashboard');

//         // Ensure menu items start hidden
//         expect(dashboardNavItem).toHaveStyle({ opacity: 0 });
//         expect(menuList).toHaveStyle({ width: '68px' });

//         // Mock the scrollWidth of the menuListRef.current
//         const mockScrollWidth = 300;
//         Object.defineProperty(menuList, 'scrollWidth', {
//             value: mockScrollWidth,
//             configurable: true,
//         });

//         // Simulate mouse entering the menu area for 2 seconds
//         await user.hover(menuList);

//         // Wait for the menu to expand
//         await waitFor(
//             () => {
//                 expect(menuList).toHaveStyle({ width: `${mockScrollWidth + 40}px` });
//             },
//             { timeout: ANIMATION_WAIT_DURATION },
//         );

//         // Ensure the text becomes visible
//         expect(dashboardNavItem).toHaveStyle({ opacity: 1 });

//         // Simulate mouse leaving the menu area
//         await user.unhover(menuList);

//         // Wait for the menu to collapse
//         await waitFor(() => {
//             expect(menuList).toHaveStyle({ width: '68px' });
//         });

//         // Ensure the text becomes hidden again
//         expect(dashboardNavItem).toHaveStyle({ opacity: 0 });
//     });

//     test('applies active styles to the current route', () => {
//         render(
//             <MemoryRouter initialEntries={[{ pathname: PAGE_ROUTES.dashboard }]}>
//                 <DesktopNavigation />
//             </MemoryRouter>,
//         );

//         const dashboardIcon = screen.getByTestId('Dashboard-icon');
//         expect(dashboardIcon).toHaveStyle({
//             color: 'var(--token-color-background-primary)',
//         });

//         const iconSelection = screen.getByTestId('Dashboard-icon-selection');
//         expect(iconSelection).toHaveStyle({
//             width: '100%',
//             height: '100%',
//         });
//     });

//     test('applies inactive styles to non-current routes', () => {
//         render(
//             <MemoryRouter initialEntries={[{ pathname: PAGE_ROUTES.transactions }]}>
//                 <DesktopNavigation />
//             </MemoryRouter>,
//         );

//         const dashboardIcon = screen.getByTestId('Dashboard-icon');
//         expect(dashboardIcon).toHaveStyle({
//             color: 'var(--token-navigation-color)',
//         });
//     });

//     test('closes menu on route change', async () => {
//         const user = userEvent.setup();
//         render(
//             <MemoryRouter initialEntries={[{ pathname: PAGE_ROUTES.transactions }]}>
//                 <DesktopNavigation />
//             </MemoryRouter>,
//         );

//         const menuList = screen.getByRole('navigation');

//         // Simulate mouse entering the menu area for 2 seconds
//         await user.hover(menuList);

//         // Wait for the menu to expand
//         const dashboardNavItem = screen.getByText('Dashboard');
//         await waitFor(
//             () => {
//                 expect(dashboardNavItem).toHaveStyle({ opacity: 1 });
//             },
//             { timeout: ANIMATION_WAIT_DURATION },
//         );

//         // Change route and check menu collapse
//         await user.click(dashboardNavItem);
//         await waitFor(
//             () => {
//                 expect(dashboardNavItem).toHaveStyle({ opacity: 0 });
//             },
//             { timeout: ANIMATION_WAIT_DURATION },
//         );
//     });
// });

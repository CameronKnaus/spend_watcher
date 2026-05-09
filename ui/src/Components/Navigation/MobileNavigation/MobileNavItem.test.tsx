// import { render, screen } from '@testing-library/react';
// import { BrowserRouter as Router, useLocation } from 'react-router-dom';
// import MobileNavItem from './MobileNavItem';

// // Mock useLocation
// vi.mock('react-router-dom', () => ({
//     ...vi.importActual('react-router-dom'),
//     useLocation: vi.fn(),
// }));

// describe('MobileNavItem', () => {
//     const mockIcon = <span>Icon</span>;
//     const mockText = 'Home';
//     const mockTo = '/home';

//     beforeEach(() => {
//         (useLocation as Mock).mockReturnValue({ pathname: '/' });
//     });

//     test('renders correctly with given props', () => {
//         render(
//             <Router>
//                 <MobileNavItem to={mockTo} icon={mockIcon} text={mockText} />
//             </Router>,
//         );

//         expect(screen.getByText('Home')).toBeInTheDocument();
//         expect(screen.getByText('Icon')).toBeInTheDocument();
//     });

//     test('icon color changes based on current route', () => {
//         (useLocation as Mock).mockReturnValue({ pathname: mockTo });

//         render(
//             <Router>
//                 <MobileNavItem to={mockTo} icon={mockIcon} text={mockText} />
//             </Router>,
//         );

//         const iconElement = screen.getByText('Icon');
//         setTimeout(() => {
//             expect(iconElement).toHaveStyle('color: rgb(255, 255, 255)');
//         }, 1000);
//     });

//     test('selection background changes based on current route', () => {
//         (useLocation as Mock).mockReturnValue({ pathname: mockTo });

//         render(
//             <Router>
//                 <MobileNavItem to={mockTo} icon={mockIcon} text={mockText} />
//             </Router>,
//         );

//         const selectionBackground = screen
//             .getByRole('link', { name: /Icon Home/i })
//             .querySelector('.selectionBackground');

//         setTimeout(() => {
//             expect(selectionBackground).toHaveStyle('width: 100%');
//             expect(selectionBackground).toHaveStyle('height: 100%');
//         }, 1000);
//     });
// });

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, within } from '@testing-library/react';
import { ArrowUpRight, UserRound } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuGroup,
    NavigationMenuItem,
} from '../../../src/components/Molecules/NavigationMenu/NavigationMenu.js';
import { renderWithTheme } from '../../test-utils/theme.js';

interface RouterLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string;
}

const RouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(({ to, ...rest }, ref) => {
    return <a ref={ref} href={to} {...rest} />;
});

RouterLink.displayName = 'RouterLink';

const ITEMS = [
    { key: 'users', label: 'Users', to: '/users' },
    { key: 'groups', label: 'Groups', to: '/groups' },
];

describe('Components: NavigationMenu', () => {
    it('should render groups and items', () => {
        const { container } = renderWithTheme(
            <NavigationMenu ariaLabel="Console">
                <NavigationMenuGroup label="Access management">
                    {ITEMS.map((item) => (
                        <NavigationMenuItem
                            key={item.key}
                            startIcon={<UserRound />}
                            component={RouterLink}
                            to={item.to}
                            selected={item.key === 'users'}
                        >
                            {item.label}
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuGroup>
                <NavigationMenuItem endAdornment={<ArrowUpRight />} href="https://example.com">
                    Help
                </NavigationMenuItem>
            </NavigationMenu>,
        );

        expect(container).toMatchSnapshot();
    });

    it('names the landmark and the list of a group by its label', () => {
        const { getByRole } = renderWithTheme(
            <NavigationMenu ariaLabel="Console">
                <NavigationMenuGroup label="Access management">
                    <NavigationMenuItem>Users</NavigationMenuItem>
                </NavigationMenuGroup>
            </NavigationMenu>,
        );

        const group = getByRole('list', { name: 'Access management' });

        expect(getByRole('navigation', { name: 'Console' })).toBeTruthy();
        expect(within(group).getByRole('button', { name: 'Users' })).toBeTruthy();
    });

    it('leaves the list of a group without a label unnamed', () => {
        const { container } = renderWithTheme(
            <NavigationMenu>
                <NavigationMenuGroup>
                    <NavigationMenuItem>Users</NavigationMenuItem>
                </NavigationMenuGroup>
            </NavigationMenu>,
        );

        expect(container.querySelector('.ring-navigationmenugroup ul')?.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('renders items placed directly in the menu, without a group', () => {
        const { getAllByRole } = renderWithTheme(
            <NavigationMenu>
                <NavigationMenuItem>Users</NavigationMenuItem>
                <NavigationMenuItem>Groups</NavigationMenuItem>
            </NavigationMenu>,
        );

        expect(getAllByRole('listitem')).toHaveLength(2);
    });

    it('marks the selected item as the current page', () => {
        const { getByRole } = renderWithTheme(
            <NavigationMenu>
                <NavigationMenuItem selected={true}>Users</NavigationMenuItem>
                <NavigationMenuItem>Groups</NavigationMenuItem>
            </NavigationMenu>,
        );

        const users = getByRole('button', { name: 'Users' });

        expect(users.getAttribute('aria-current')).toBe('page');
        expect(users.classList.contains('Mui-selected')).toBe(true);
        expect(getByRole('button', { name: 'Groups' }).hasAttribute('aria-current')).toBe(false);
    });

    it('lets aria-current be set for a section of the same page', () => {
        const { getByRole } = renderWithTheme(
            <NavigationMenu>
                <NavigationMenuItem selected={true} aria-current="location">
                    Image
                </NavigationMenuItem>
            </NavigationMenu>,
        );

        expect(getByRole('button', { name: 'Image' }).getAttribute('aria-current')).toBe('location');
    });

    it('renders a link for href and for a router link component', () => {
        const { getByRole } = renderWithTheme(
            <NavigationMenu>
                <NavigationMenuItem href="https://example.com">Help</NavigationMenuItem>
                <NavigationMenuItem component={RouterLink} to="/users">
                    Users
                </NavigationMenuItem>
            </NavigationMenu>,
        );

        expect(getByRole('link', { name: 'Help' }).getAttribute('href')).toBe('https://example.com');
        expect(getByRole('link', { name: 'Users' }).getAttribute('href')).toBe('/users');
    });

    it('renders the start icon and the end adornment, a zero counter included', () => {
        const { container, getByText } = renderWithTheme(
            <NavigationMenu>
                <NavigationMenuItem startIcon={<UserRound data-testid="start" />} endAdornment={0}>
                    Users
                </NavigationMenuItem>
            </NavigationMenu>,
        );

        expect(container.querySelector('[data-testid="start"]')).toBeTruthy();
        expect(getByText('0')).toBeTruthy();
    });

    it('renders no icon or adornment slot for an empty startIcon or endAdornment', () => {
        const { getByRole } = renderWithTheme(
            <NavigationMenu>
                <NavigationMenuItem startIcon={false} endAdornment="">
                    Users
                </NavigationMenuItem>
            </NavigationMenu>,
        );

        expect(getByRole('button', { name: 'Users' }).children).toHaveLength(1);
    });

    it('calls onClick', () => {
        const onClick = vi.fn();
        const { getByRole } = render(
            <NavigationMenu>
                <NavigationMenuItem onClick={onClick}>Users</NavigationMenuItem>
            </NavigationMenu>,
        );

        fireEvent.click(getByRole('button', { name: 'Users' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('builds data-testid from the suffix and takes an override', () => {
        const { container } = renderWithTheme(
            <NavigationMenu dataTestIdSuffix="console">
                <NavigationMenuGroup dataTestIdSuffix="access">
                    <NavigationMenuItem dataTestIdSuffix="users">Users</NavigationMenuItem>
                    <NavigationMenuItem data-testid="groups-link">Groups</NavigationMenuItem>
                </NavigationMenuGroup>
            </NavigationMenu>,
        );

        expect(container.querySelector('nav')?.getAttribute('data-testid')).toBe('ring-navigationmenu-console');
        expect(container.querySelector('[data-testid="ring-navigationmenugroup-access"]')).toBeTruthy();
        expect(container.querySelector('[data-testid="ring-navigationmenuitem-users"]')?.textContent).toBe('Users');
        expect(container.querySelector('[data-testid="groups-link"]')?.textContent).toBe('Groups');
    });

    it('puts className and sx on the item button', () => {
        const { getByRole } = renderWithTheme(
            <NavigationMenu className="menu">
                <NavigationMenuItem className="item" sx={{ px: 1 }}>
                    Users
                </NavigationMenuItem>
            </NavigationMenu>,
        );

        expect(getByRole('navigation').classList.contains('menu')).toBe(true);
        expect(getByRole('button', { name: 'Users' }).classList.contains('item')).toBe(true);
    });
});

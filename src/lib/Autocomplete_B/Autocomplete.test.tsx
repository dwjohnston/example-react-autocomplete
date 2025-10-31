import React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Autocomplete, AutocompleteProps } from './Autocomplete';

type TestItem = {
    id: number;
    name: string;
    description: string;
};

const mockItems: TestItem[] = [
    { id: 1, name: 'Apple', description: 'A red fruit' },
    { id: 2, name: 'Banana', description: 'A yellow fruit' },
    { id: 3, name: 'Cherry', description: 'A small red fruit' },
];

const createMockSearchFn = (shouldReturnResults: boolean = true, delay: number = 0) => {
    return vi.fn().mockImplementation(async (searchTerm: string, pageNumber: number) => {
        await new Promise(resolve => setTimeout(resolve, delay));

        if (!shouldReturnResults || !searchTerm) {
            return {
                items: [],
                pageMeta: {
                    totalResults: 0,
                    pageNumber: 1,
                    resultsPerPage: 10,
                },
            };
        }

        const filteredItems = mockItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return {
            items: filteredItems,
            pageMeta: {
                totalResults: filteredItems.length,
                pageNumber: pageNumber,
                resultsPerPage: 10,
            },
        };
    });
};

describe('Autocomplete', () => {
    const user = userEvent.setup();


    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Scenario 1: Empty text field, user types something, no results', () => {
        it('should show no results message when search returns empty results', async () => {
            const searchFn = createMockSearchFn(false, 50); // Returns no results

            render(
                <Autocomplete
                    searchFn={searchFn}
                    renderItem={(item: TestItem) => <div>{item.name} - {item.description}</div>}
                    itemKey="id"
                    onSelectValue={vi.fn()}
                />
            );

            const input = screen.getByPlaceholderText('Type to search...');

            // Initially no messages should be visible
            expect(screen.queryByText('No results.')).not.toBeInTheDocument();
            expect(screen.queryByText('Searching...')).not.toBeInTheDocument();

            // Type in the input
            await user.type(input, 'xyz');

            // Called for each character typed - this is something we might change with a debounce
            expect(searchFn).toHaveBeenCalledTimes(3);

            // Should show loading state first
            expect(await screen.findByText('Searching...')).toBeInTheDocument();

            // Wait for search to complete and show no results
            await waitFor(() => {
                expect(screen.getByText('No results.')).toBeInTheDocument();
            });

            // Loading should be gone
            expect(screen.queryByText('Searching...')).not.toBeInTheDocument();

        });
    });

    describe('Scenario 2: Empty text field, user types something with results, then types more with no results', () => {
        it('should show results then no results as user types', async () => {
            // Custom search function that returns results for 'a' but not for 'ax'
            const searchFn = vi.fn().mockImplementation(async (searchTerm: string) => {
                await new Promise(resolve => setTimeout(resolve, 50));

                if (searchTerm === 'a') {
                    return {
                        items: [mockItems[0]], // Apple
                        pageMeta: { totalResults: 1, pageNumber: 1, resultsPerPage: 10 },
                    };
                }

                return {
                    items: [],
                    pageMeta: { totalResults: 0, pageNumber: 1, resultsPerPage: 10 },
                };
            });

            render(
                <Autocomplete
                    searchFn={searchFn}
                    renderItem={(item: TestItem) => <div>{item.name} - {item.description}</div>}
                    itemKey="id"
                    onSelectValue={vi.fn()}
                />
            );

            const input = screen.getByPlaceholderText('Type to search...');

            // Type 'a' - should get results
            await user.type(input, 'a');

            expect(screen.getByText('Searching...')).toBeInTheDocument();


            await waitFor(() => {
                expect(screen.getByText('Apple - A red fruit')).toBeInTheDocument();
            });

            // Verify we have results and no "no results" message
            expect(screen.queryByText('No results.')).not.toBeInTheDocument();
            expect(screen.getByRole('list')).toBeInTheDocument();

            // Type 'x' to make it 'ax' - should get no results
            await user.type(input, 'x');
            // We shouldn't see 'Searching...' if we already have results.
            expect(screen.queryByText('Searching...')).not.toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText('No results.')).toBeInTheDocument();
            });

            // Results list should be gone
            expect(screen.queryByRole('list')).not.toBeInTheDocument();
            expect(screen.queryByText('Apple - A red fruit')).not.toBeInTheDocument();

            // Verify search was called for both terms
            expect(searchFn).toHaveBeenCalledWith('a', 1);
            expect(searchFn).toHaveBeenCalledWith('ax', 1);
        });
    });

    describe('Keyboard navigation', () => {
        it('should navigate through items with arrow keys', async () => {
            const searchFn = createMockSearchFn(true);

            render(
                <Autocomplete
                    searchFn={searchFn}
                    renderItem={(item: TestItem) => <div>{item.name} - {item.description}</div>}
                    itemKey="id"
                    onSelectValue={vi.fn()}
                />
            );

            const input = screen.getByPlaceholderText('Type to search...');

            // Type to get results
            await user.type(input, 'a');

            await waitFor(() => {
                expect(screen.getByRole('list')).toBeInTheDocument();
            });

            // Press ArrowDown to select first item
            await user.keyboard('{ArrowDown}');

            const items = screen.getAllByRole('listitem');
            expect(items[0]).toHaveClass('autocomplete-item selected');

            // Press ArrowDown again to select second item
            await user.keyboard('{ArrowDown}');
            expect(items[0]).not.toHaveClass('autocomplete-item selected');
            if (items[1]) {
                expect(items[1]).toHaveClass('autocomplete-item selected');
            }

            // Press ArrowUp to go back to first item
            await user.keyboard('{ArrowUp}');
            expect(items[0]).toHaveClass('autocomplete-item selected');
        });

        it('should select item with Enter key', async () => {
            const onSelectValue = vi.fn();
            const searchFn = createMockSearchFn(true);

            render(
                <Autocomplete
                    searchFn={searchFn}
                    renderItem={(item: TestItem) => <div>{item.name} - {item.description}</div>}
                    itemKey="id"
                    onSelectValue={onSelectValue}
                    valuePrettyNameFn={(item: TestItem) => item.name}
                />
            );

            const input = screen.getByPlaceholderText('Type to search...');

            // Type to get results
            await user.type(input, 'apple');

            await waitFor(() => {
                expect(screen.getByText('Apple - A red fruit')).toBeInTheDocument();
            });

            expect(screen.getByRole("list")).toBeInTheDocument();

            // Navigate to first item and select with Enter
            await user.keyboard('{ArrowDown}');
            await user.keyboard('{Enter}');

            // Verify selection
            expect(onSelectValue).toHaveBeenCalledWith('id', mockItems[0]);

            await waitFor(() => {
                expect(screen.queryByRole("list")).not.toBeInTheDocument();
            });
            expect((input as HTMLInputElement).value).toBe('Apple');
        });
    });

});
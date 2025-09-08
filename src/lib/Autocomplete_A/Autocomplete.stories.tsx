import React from 'react';
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { Autocomplete, AutocompleteProps } from './Autocomplete';


const meta = {

    component: Autocomplete<Todo>,
    decorators: [(Story) => <div style={{ height: 500, border: "solid 1px red" }}><Story /></div>],

} satisfies Meta<typeof Autocomplete<Todo>>;

export default meta;
type Story = StoryObj<typeof meta>;


const todos = [
    {
        id: "1",
        name: "Foo"
    },
    {
        id: "2",
        name: "Food"
    },
    {
        id: "3",
        name: "Bar"
    }
]


type Todo = {
    id: string;
    name: string;
}

async function searchFn(searchTerm: string, pageNumber: number) {


    let result: Array<Todo> = [];
    if (searchTerm.length < 3) {
        result = [];
    }
    else {
        result = todos.filter((v) => v.name.startsWith(searchTerm));
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        items: result,
        pageMeta: {
            totalResults: result.length,
            pageNumber: 1,
            resultsPerPage: 20
        }
    }
}

export function Interactive() {
    const [searchValue, setSearchValue] = React.useState("");
    const [selectedValue, setSelectedValue] = React.useState<Todo | null>(null);
    const [availableOptions, setAvailableOptions] = React.useState<Array<Todo>>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    // Simulate search
    React.useEffect(() => {
        let active = true;
        if (searchValue.length < 3) {
            setAvailableOptions([]);
            return;
        }
        setIsLoading(true);
        searchFn(searchValue, 1).then((result) => {
            if (active) {
                setAvailableOptions(result.items);
                setIsLoading(false);
            }
        });
        return () => {
            active = false;
        };
    }, [searchValue]);

    return <div>
        <pre>
            {JSON.stringify({ selectedValue, searchValue }, null, 2)}
        </pre>
        <Autocomplete
            searchValue={searchValue}
            onChangeSearchValue={(str: string) => { setSearchValue(str) }}
            selectedValue={selectedValue}
            onSelectValue={(value: Todo) => { setSelectedValue(value); setSearchValue(value.name); setAvailableOptions([]); }}
            renderItem={(v: Todo) => { return <div>{v.name}</div> }}
            isLoading={isLoading}
            availableOptions={availableOptions}
        ></Autocomplete>
    </div>
}

export const Main: Story = {
    args: {
        renderItem: (v: Todo) => {
            return <div>{v.name}</div>
        },
        searchValue: "",
        onChangeSearchValue: (str: string) => { console.log(str) },
        selectedValue: null,
        onSelectValue: (value: Todo) => { console.log(value) },
        isLoading: false,
        availableOptions: [],


    },
    parameters: {

    },

}

// Test data for 10 options
const tenTodos = [
    { id: "1", name: "Buy groceries" },
    { id: "2", name: "Walk the dog" },
    { id: "3", name: "Read a book" },
    { id: "4", name: "Write code" },
    { id: "5", name: "Exercise" },
    { id: "6", name: "Cook dinner" },
    { id: "7", name: "Call mom" },
    { id: "8", name: "Clean house" },
    { id: "9", name: "Study React" },
    { id: "10", name: "Plan vacation" }
];

// Test Story 1: Component has focus and there are 10 options available
export const FocusedWith10Options: Story = {
    args: {
        renderItem: (v: Todo) => <div>{v.name}</div>,
        searchValue: "test",
        onChangeSearchValue: () => { },
        selectedValue: null,
        onSelectValue: () => { },
        isLoading: false,
        availableOptions: tenTodos,
    },
    play: async ({ canvasElement, },) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');

        // Focus the input to show dropdown
        await userEvent.click(input);

        // Wait for dropdown to appear and verify 10 options are visible
        await waitFor(() => {
            const listItems = canvas.getAllByRole('listitem');
            expect(listItems).toHaveLength(10);
        });

        // Verify first option is visible
        expect(canvas.getByText('Buy groceries')).toBeInTheDocument();
        expect(canvas.getByText('Plan vacation')).toBeInTheDocument();
    },
};

// Test Story 2: Component has focus and there are 0 options available
export const FocusedWith0Options: Story = {
    args: {
        renderItem: (v: Todo) => <div>{v.name}</div>,
        searchValue: "xyz",
        onChangeSearchValue: () => { },
        selectedValue: null,
        onSelectValue: () => { },
        isLoading: false,
        availableOptions: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');

        // Focus the input
        await userEvent.click(input);

        // Wait and verify "No results found" message appears
        await waitFor(() => {
            expect(canvas.getByText('No results found')).toBeInTheDocument();
        });

        // Verify no list items are present
        const listItems = canvas.queryAllByRole('listitem');
        expect(listItems).toHaveLength(0);
    },
};

// Test Story 3: Component has focus, is loading and 0 options are available
export const FocusedLoadingWith0Options: Story = {
    args: {
        renderItem: (v: Todo) => <div>{v.name}</div>,
        searchValue: "foo",
        onChangeSearchValue: () => { },
        selectedValue: null,
        onSelectValue: () => { },
        isLoading: true,
        availableOptions: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');

        // Focus the input
        await userEvent.click(input);

        // Wait and verify loading message appears
        await waitFor(() => {
            expect(canvas.getByText('Loading...')).toBeInTheDocument();
        });

        // Verify no "No results found" message since we're loading
        expect(canvas.queryByText('No results found')).not.toBeInTheDocument();

        // Verify no list items are present
        const listItems = canvas.queryAllByRole('listitem');
        expect(listItems).toHaveLength(0);
    },
};

// Test Story 4: Component has focus, is loading and 10 options are available
export const FocusedLoadingWith10Options: Story = {
    args: {
        renderItem: (v: Todo) => <div>{v.name}</div>,
        searchValue: "foo",
        onChangeSearchValue: () => { },
        selectedValue: null,
        onSelectValue: () => { },
        isLoading: true,
        availableOptions: tenTodos,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');

        // Focus the input
        await userEvent.click(input);

        // Wait and verify loading message appears (should take priority over options)
        await waitFor(() => {
            expect(canvas.getByText('Loading...')).toBeInTheDocument();
        });

        // Even though there are 10 options available, they should not be visible while loading
        // The loading state should take priority
        const listItems = canvas.queryAllByRole('listitem');
        expect(listItems).toHaveLength(0);

        // Verify options are not visible during loading
        expect(canvas.queryByText('Buy groceries')).not.toBeInTheDocument();
    },
};

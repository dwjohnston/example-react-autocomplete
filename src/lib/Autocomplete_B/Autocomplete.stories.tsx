import React from 'react';
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { Autocomplete, AutocompleteProps } from './Autocomplete';


function StorybookDemoComponent(args: AutocompleteProps<Todo, "id">) {

    const [value, setValue] = React.useState({ itemKey: "", itemValue: null as Todo | null });

    return <div style={{ height: 500, border: "solid 1px red" }}>
        <Autocomplete {...args} onSelectValue={(itemKey, itemValue) => {

            setValue({
                itemKey, itemValue
            });
        }} />

        {JSON.stringify(value, null, 2)}
    </div>
}

const meta = {

    component: Autocomplete<Todo, "id">,
    render: (args) => <StorybookDemoComponent {...args}></StorybookDemoComponent>,

} satisfies Meta<typeof Autocomplete<Todo, "id">>;

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

export const Main: Story = {
    args: {
        searchFn,

        renderItem: (v: Todo) => {
            return <div>{v.name}</div>
        },
        itemKey: "id",

    },
    parameters: {

    },

}

export function Interactive() {
    return (
        <div>
            <Autocomplete
                searchFn={searchFn}
                renderItem={(item) => <div>{item.name}</div>}
                itemKey="id"

            />
        </div>
    );
}


export const TestUserSearchesWithNoResults: Story = {
    args: {
        searchFn,
        renderItem: (v: Todo) => {
            return <div>{v.name}</div>
        },
        itemKey: "id",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByPlaceholderText('Type to search...');

        // User focuses on input and searches 'foo' (gets 0 results)
        await userEvent.click(input);
        await userEvent.type(input, 'xyz');

        expect(canvas.getByText("Searching...")).toBeInTheDocument();

        // Should show "No results" message
        await waitFor(async () => {
            expect(canvas.queryByText("Searching...")).not.toBeInTheDocument();
            expect(canvas.getByText('No results.')).toBeInTheDocument();
        });

        // Types some more, still gets 0 results
        await userEvent.type(input, 'xyz');

        // Should still show "No results" message
        await waitFor(async () => {
            expect(canvas.getByText('No results.')).toBeInTheDocument();
        });
    },
}

export const TestUserSearchesWithResultsThenNoResults: Story = {
    args: {
        searchFn,
        renderItem: (v: Todo) => {
            return <div>{v.name}</div>
        },
        itemKey: "id",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByPlaceholderText('Type to search...');

        // User focuses on input and searches 'bar' (gets results)
        await userEvent.click(input);
        await userEvent.type(input, 'Bar');

        expect(canvas.getByText("Searching...")).toBeInTheDocument();

        // Should show results
        await waitFor(async () => {
            expect(canvas.queryByText("Searching...")).not.toBeInTheDocument();
            expect(canvas.getByText('Bar')).toBeInTheDocument();
        });

        // Types some more, gets 0 results
        await userEvent.type(input, 'xyz');

        // Should show "No results" message
        await waitFor(async () => {
            expect(canvas.getByText('No results.')).toBeInTheDocument();
        });
    },
}

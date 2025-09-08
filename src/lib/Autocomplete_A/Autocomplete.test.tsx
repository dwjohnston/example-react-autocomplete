import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Autocomplete } from "./Autocomplete";
import { userEvent } from "@storybook/test";

describe(Autocomplete, () => {
    it("Displays the values when the input is focused, has text, and there are results", async () => {
        const renderResult = render(<Autocomplete
            searchValue="123"
            onChangeSearchValue={vi.fn()}
            selectedValue={null}
            onSelectValue={vi.fn()}
            renderItem={(v) => <div>{v.name}</div>}
            isLoading={false}
            availableOptions={[{ id: "1", name: "Foo" }, { id: "2", name: "Bar" }]}

        />)


        expect(screen.getByRole("textbox")).toBeInTheDocument();
        userEvent.click(screen.getByRole("textbox"));

        await waitFor(() => {

            expect(screen.getByText("Foo")).toBeInTheDocument();
            expect(screen.getByText("Bar")).toBeInTheDocument();
        })
    });


    it("Displays the no results message when the input is focused, has text, and there are not results", async () => {
        render(<Autocomplete
            searchValue="123"
            onChangeSearchValue={vi.fn()}
            selectedValue={null}
            onSelectValue={vi.fn()}
            renderItem={(v) => <div>{v.name}</div>}
            isLoading={false}
            availableOptions={[] as Array<{ id: string, name: string }>}

        />)

        expect(screen.getByRole("textbox")).toBeInTheDocument();
        userEvent.click(screen.getByRole("textbox"));

        await waitFor(() => {
            expect(screen.getByText("No results found")).toBeInTheDocument();
        })
    })

    it("Is first loading, and then is not loading", async () => {
        // First the component is loading
        const renderResult = render(<Autocomplete
            searchValue="123"
            onChangeSearchValue={vi.fn()}
            selectedValue={null}
            onSelectValue={vi.fn()}
            renderItem={(v) => <div>{v.name}</div>}
            isLoading={true}
            availableOptions={[] as Array<{ id: string, name: string }>}

        />)

        expect(screen.getByRole("textbox")).toBeInTheDocument();
        userEvent.click(screen.getByRole("textbox"));

        await waitFor(() => {
            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        // And then it has result
        renderResult.rerender(<Autocomplete
            searchValue="123"
            onChangeSearchValue={vi.fn()}
            selectedValue={null}
            onSelectValue={vi.fn()}
            renderItem={(v) => <div>{v.name}</div>}
            isLoading={false}
            availableOptions={[{ id: "1", name: "Foo" }, { id: "2", name: "Bar" }]}
        />)

        expect(screen.getByText("Foo")).toBeInTheDocument();
        expect(screen.getByText("Bar")).toBeInTheDocument();
    })
})
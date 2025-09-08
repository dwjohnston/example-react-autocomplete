import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Autocomplete } from "./Autocomplete";
import { userEvent } from "@storybook/test";

describe(Autocomplete, () => {
    it("Displays the values when the input is focused and their are results", async () => {
        render(<Autocomplete
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
    })
    it("Displays the no results message when the input is focused and their are not results", async () => {
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
})
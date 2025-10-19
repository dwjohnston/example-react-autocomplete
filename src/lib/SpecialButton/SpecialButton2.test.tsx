import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { SpecialButton2 } from "./SpecialButton2";

describe(SpecialButton2, () => {
    it("manages async operation state internally from pending to loading to success", async () => {
        const mockAsyncOperation = vi.fn().mockImplementation(
            async () => {
                await new Promise((res) => setTimeout(res, 100));
                return { success: true };
            }
        )

        render(<SpecialButton2 onClick={mockAsyncOperation} />);


        expect(mockAsyncOperation).not.toHaveBeenCalled();

        const button = screen.getByRole("button");

        // Initially should be in pending state
        expect(screen.getByText("Click Me")).toBeInTheDocument();
        expect(button).not.toBeDisabled();

        // Click the button to start async operation
        userEvent.click(button);

        // Should immediately transition to loading state
        expect(await screen.findByText("Loading...")).toBeInTheDocument();
        expect(button).toBeDisabled();

        // Wait for async operation to complete and transition to success
        await waitFor(() => {
            expect(screen.getByText("Success!")).toBeInTheDocument();
        });

        expect(button).not.toBeDisabled();
        expect(mockAsyncOperation).toHaveBeenCalledOnce();
    });
});

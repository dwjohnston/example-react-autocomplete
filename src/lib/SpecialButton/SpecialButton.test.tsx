import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@storybook/test";
import { SpecialButton } from "./SpecialButton";

describe(SpecialButton, () => {
    it("renders with pending state and correct text", () => {
        const mockOnClick = vi.fn();

        render(
            <SpecialButton
                onClick={mockOnClick}
                state="pending"
            />
        );

        expect(screen.getByRole("button")).toBeInTheDocument();
        expect(screen.getByText("Click Me")).toBeInTheDocument();
        expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("renders with loading state and is disabled", () => {
        const mockOnClick = vi.fn();

        render(
            <SpecialButton
                onClick={mockOnClick}
                state="loading"
            />
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("renders with success state", () => {
        const mockOnClick = vi.fn();

        render(
            <SpecialButton
                onClick={mockOnClick}
                state="success"
            />
        );

        expect(screen.getByText("Success!")).toBeInTheDocument();
        expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("renders with error state", () => {
        const mockOnClick = vi.fn();

        render(
            <SpecialButton
                onClick={mockOnClick}
                state="error"
            />
        );

        expect(screen.getByText("Error!")).toBeInTheDocument();
        expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("calls onClick when button is clicked and not disabled", async () => {
        const mockOnClick = vi.fn();

        render(
            <SpecialButton
                onClick={mockOnClick}
                state="pending"
            />
        );

        const button = screen.getByRole("button");
        await userEvent.click(button);

        expect(mockOnClick).toHaveBeenCalledOnce();
    });

    it("does not call onClick when button is disabled (loading state)", async () => {
        const mockOnClick = vi.fn();

        render(
            <SpecialButton
                onClick={mockOnClick}
                state="loading"
            />
        );

        const button = screen.getByRole("button");
        await userEvent.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("transitions from pending to loading state", async () => {
        const TestWrapper = () => {
            const [state, setState] = React.useState<"loading" | "error" | "success" | "pending">("pending");

            const handleClick = async () => {
                await new Promise((res) => setTimeout(res, 50));
                setState("loading");
            };

            return (
                <SpecialButton
                    onClick={handleClick}
                    state={state}
                />
            );
        };

        render(<TestWrapper />);

        const button = screen.getByRole("button");

        // Initially should be in pending state
        expect(screen.getByText("Click Me")).toBeInTheDocument();
        expect(button).not.toBeDisabled();

        // Click the button to trigger state change
        await userEvent.click(button);

        // Should now be in loading state
        expect(await screen.findByText("Loading...")).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it("responds to prop changes when rerendered", () => {
        const mockOnClick = vi.fn();

        const { rerender } = render(
            <SpecialButton
                onClick={mockOnClick}
                state="pending"
            />
        );

        let button = screen.getByRole("button");

        // Initial state: pending
        expect(screen.getByText("Click Me")).toBeInTheDocument();
        expect(button).not.toBeDisabled();
        expect(button).toHaveClass("special-button", "pending");

        // Rerender with loading state
        rerender(
            <SpecialButton
                onClick={mockOnClick}
                state="loading"
            />
        );

        button = screen.getByRole("button");
        expect(screen.getByText("Loading...")).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(button).toHaveClass("special-button", "loading");

        // Rerender with success state
        rerender(
            <SpecialButton
                onClick={mockOnClick}
                state="success"
            />
        );

        button = screen.getByRole("button");
        expect(screen.getByText("Success!")).toBeInTheDocument();
        expect(button).not.toBeDisabled();
        expect(button).toHaveClass("special-button", "success");

        // Rerender with error state
        rerender(
            <SpecialButton
                onClick={mockOnClick}
                state="error"
            />
        );

        button = screen.getByRole("button");
        expect(screen.getByText("Error!")).toBeInTheDocument();
        expect(button).not.toBeDisabled();
        expect(button).toHaveClass("special-button", "error");
    });


});

import React from 'react';
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { SpecialButton } from './SpecialButton';
import { SpecialButton2 } from './SpecialButton2';

// SpecialButton Stories
const meta = {
    title: 'Components/SpecialButton',
    component: SpecialButton,
} satisfies Meta<typeof SpecialButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
    args: {
        onClick: () => console.log('Button clicked'),
        state: 'pending',
    },
};

export const Loading: Story = {
    args: {
        onClick: () => console.log('Button clicked'),
        state: 'loading',
    },
};

export const Success: Story = {
    args: {
        onClick: () => console.log('Button clicked'),
        state: 'success',
    },
};

export const Error: Story = {
    args: {
        onClick: () => console.log('Button clicked'),
        state: 'error',
    },
};



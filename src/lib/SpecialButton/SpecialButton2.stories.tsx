import React from 'react';
import type { Meta, StoryObj } from "@storybook/react";
import { SpecialButton2 } from './SpecialButton2';

const meta = {
    title: 'Components/SpecialButton2',
    component: SpecialButton2,
} satisfies Meta<typeof SpecialButton2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SuccessfulAsync: Story = {
    args: {
        onClick: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true };
        },
    },
};

export const FailingAsync: Story = {
    args: {
        onClick: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: false };
        },
    },
};

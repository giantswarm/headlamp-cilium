import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { PolicyStatusLabel, StatusLabelFor } from './common';

const meta: Meta<typeof PolicyStatusLabel> = {
  title: 'Cilium/PolicyStatusLabel',
  component: PolicyStatusLabel,
};
export default meta;

type Story = StoryObj<typeof PolicyStatusLabel>;

export const Valid: Story = {
  args: { conditions: [{ type: 'Valid', status: 'True' }] },
};

export const Invalid: Story = {
  args: { conditions: [{ type: 'Valid', status: 'False', reason: 'PolicyInvalid' }] },
};

export const Unknown: Story = {
  args: { conditions: [] },
};

export const FreeFormStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatusLabelFor status="Enforcing" />
      <StatusLabelFor status="pending" />
      <StatusLabelFor status="BPFLoadFailed" />
      <StatusLabelFor status={undefined} />
    </div>
  ),
};

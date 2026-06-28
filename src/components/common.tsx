import { StatusLabel } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box, Chip, Typography } from '@mui/material';
import React from 'react';
import { Condition, PortRule } from '../resources/types';
import { policyStatusFromConditions, severityForStatus } from '../utils/status';

/** Colored StatusLabel for a free-form status string. */
export function StatusLabelFor({ status }: { status?: string }) {
  if (!status) {
    return <StatusLabel status="">Unknown</StatusLabel>;
  }
  return <StatusLabel status={severityForStatus(status)}>{status}</StatusLabel>;
}

/** Colored StatusLabel derived from a policy's conditions. */
export function PolicyStatusLabel({ conditions }: { conditions?: Condition[] }) {
  const { label, severity } = policyStatusFromConditions(conditions);
  return <StatusLabel status={severity}>{label}</StatusLabel>;
}

/** Render a policy port rule: ports plus an L7 indicator chip. */
export function PortRuleCell({ portRule }: { portRule: PortRule }): React.ReactNode {
  const ports = portRule.ports?.map(p => `${p.port || '*'}/${p.protocol || 'ANY'}`).join(', ');
  const hasL7 = !!(
    portRule.rules?.http ||
    portRule.rules?.kafka ||
    portRule.rules?.dns ||
    portRule.rules?.l7proto
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body2" component="span">
        Ports: {ports || 'Any'}
      </Typography>
      {hasL7 && (
        <Chip label="L7 Rules Present" size="small" sx={{ mt: 0.5, width: 'fit-content' }} />
      )}
    </Box>
  );
}

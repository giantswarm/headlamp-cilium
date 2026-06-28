import { Condition } from '../resources/types';

export type Severity = 'success' | 'error' | 'warning' | '';

/** Map a free-form status string to a StatusLabel severity. */
export function severityForStatus(status?: string): Severity {
  if (!status) return '';
  const s = status.toLowerCase();
  if (s === 'ready' || s === 'enforcing' || s === 'true' || s === 'valid' || s === 'ok') {
    return 'success';
  }
  if (
    s === 'disconnected' ||
    s === 'invalid' ||
    s === 'false' ||
    s === 'error' ||
    s.includes('fail')
  ) {
    return 'error';
  }
  if (
    s === 'waiting-for-identity' ||
    s === 'waiting-to-regenerate' ||
    s === 'restoring' ||
    s === 'regenerating' ||
    s === 'pending'
  ) {
    return 'warning';
  }
  return '';
}

export interface PolicyStatusResult {
  label: string;
  severity: Severity;
}

/**
 * Derive a policy's status from its conditions. Recent Cilium versions report a
 * `Valid` condition rather than the legacy `derivativePolicies` map, so that is
 * the primary signal; fall back to the first condition, then to "Unknown".
 */
export function policyStatusFromConditions(conditions?: Condition[]): PolicyStatusResult {
  if (!conditions || conditions.length === 0) {
    return { label: 'Unknown', severity: '' };
  }
  const valid = conditions.find(c => c.type === 'Valid');
  if (valid) {
    if (valid.status === 'True') return { label: 'Valid', severity: 'success' };
    return { label: valid.reason || 'Invalid', severity: 'error' };
  }
  const first = conditions[0];
  return {
    label: `${first.type}: ${first.status}`,
    severity: first.status === 'True' ? 'success' : 'warning',
  };
}

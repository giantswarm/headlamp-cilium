import { describe, expect, it } from 'vitest';
import { policyStatusFromConditions, severityForStatus } from './status';

describe('severityForStatus', () => {
  it('maps healthy statuses to success', () => {
    ['ready', 'Enforcing', 'true', 'Valid', 'ok'].forEach(s => {
      expect(severityForStatus(s)).toBe('success');
    });
  });

  it('maps failure statuses to error', () => {
    ['invalid', 'false', 'error', 'BPFLoadFailed'].forEach(s => {
      expect(severityForStatus(s)).toBe('error');
    });
  });

  it('maps transitional statuses to warning', () => {
    ['pending', 'regenerating', 'restoring'].forEach(s => {
      expect(severityForStatus(s)).toBe('warning');
    });
  });

  it('returns the neutral severity for unknown or missing statuses', () => {
    expect(severityForStatus(undefined)).toBe('');
    expect(severityForStatus('something-else')).toBe('');
  });
});

describe('policyStatusFromConditions', () => {
  it('returns Unknown when there are no conditions', () => {
    expect(policyStatusFromConditions(undefined)).toEqual({ label: 'Unknown', severity: '' });
    expect(policyStatusFromConditions([])).toEqual({ label: 'Unknown', severity: '' });
  });

  it('treats a Valid=True condition as success', () => {
    expect(policyStatusFromConditions([{ type: 'Valid', status: 'True' }])).toEqual({
      label: 'Valid',
      severity: 'success',
    });
  });

  it('treats a Valid=False condition as error and surfaces the reason', () => {
    expect(
      policyStatusFromConditions([{ type: 'Valid', status: 'False', reason: 'PolicyInvalid' }])
    ).toEqual({ label: 'PolicyInvalid', severity: 'error' });
  });

  it('falls back to the first condition when Valid is absent', () => {
    expect(policyStatusFromConditions([{ type: 'Enforcing', status: 'True' }])).toEqual({
      label: 'Enforcing: True',
      severity: 'success',
    });
    expect(policyStatusFromConditions([{ type: 'Enforcing', status: 'False' }])).toEqual({
      label: 'Enforcing: False',
      severity: 'warning',
    });
  });
});

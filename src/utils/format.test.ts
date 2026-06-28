import { describe, expect, it } from 'vitest';
import { formatCIDRRule, formatLabelMap, formatSelector } from './format';

describe('formatSelector', () => {
  it('returns "None" for an undefined selector', () => {
    expect(formatSelector(undefined)).toBe('None');
  });

  it('joins matchLabels as k=v pairs', () => {
    expect(formatSelector({ matchLabels: { app: 'web', tier: 'fe' } })).toBe('app=web, tier=fe');
  });

  it('renders matchExpressions with operator and values', () => {
    expect(
      formatSelector({ matchExpressions: [{ key: 'env', operator: 'In', values: ['prod', 'qa'] }] })
    ).toBe('env In (prod, qa)');
  });

  it('renders a value-less matchExpression without trailing space', () => {
    expect(formatSelector({ matchExpressions: [{ key: 'env', operator: 'Exists' }] })).toBe(
      'env Exists'
    );
  });

  it('returns "Any" for an empty selector', () => {
    expect(formatSelector({})).toBe('Any');
    expect(formatSelector({ matchLabels: {} })).toBe('Any');
  });
});

describe('formatCIDRRule', () => {
  it('renders a plain cidr', () => {
    expect(formatCIDRRule({ cidr: '10.0.0.0/8' })).toBe('10.0.0.0/8');
  });

  it('appends exceptions', () => {
    expect(formatCIDRRule({ cidr: '10.0.0.0/8', except: ['10.1.0.0/16'] })).toBe(
      '10.0.0.0/8 (except 10.1.0.0/16)'
    );
  });

  it('falls back to a group ref', () => {
    expect(formatCIDRRule({ cidrGroupRef: 'my-group' })).toBe('my-group');
  });

  it('renders a group selector', () => {
    expect(formatCIDRRule({ cidrGroupSelector: { matchLabels: { k: 'v' } } })).toBe('k=v');
  });

  it('returns "Invalid Rule" for an empty rule', () => {
    expect(formatCIDRRule({})).toBe('Invalid Rule');
  });
});

describe('formatLabelMap', () => {
  it('returns "-" for empty input', () => {
    expect(formatLabelMap(undefined)).toBe('-');
    expect(formatLabelMap({})).toBe('-');
  });

  it('joins entries as k=v', () => {
    expect(formatLabelMap({ a: '1', b: '2' })).toBe('a=1, b=2');
  });
});

import { CIDRRule, EndpointSelector } from '../resources/types';

/** Render a label/expression selector as a compact `k=v, ...` string. */
export function formatSelector(selector?: EndpointSelector): string {
  if (!selector) return 'None';
  if (selector.matchLabels && Object.keys(selector.matchLabels).length > 0) {
    return Object.entries(selector.matchLabels)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
  }
  if (selector.matchExpressions && selector.matchExpressions.length > 0) {
    return selector.matchExpressions
      .map(expr =>
        `${expr.key} ${expr.operator} ${expr.values ? `(${expr.values.join(', ')})` : ''}`.trim()
      )
      .join(', ');
  }
  return 'Any';
}

/** Render a CIDR rule (cidr, group ref, or group selector) with its exceptions. */
export function formatCIDRRule(rule: CIDRRule): string {
  const base =
    rule.cidr ||
    rule.cidrGroupRef ||
    (rule.cidrGroupSelector ? formatSelector(rule.cidrGroupSelector) : '') ||
    'Invalid Rule';
  if (rule.except && rule.except.length > 0) {
    return `${base} (except ${rule.except.join(', ')})`;
  }
  return base;
}

/** Render a label map as a sorted `k=v, ...` string for list columns. */
export function formatLabelMap(labels?: Record<string, string>): string {
  if (!labels || Object.keys(labels).length === 0) return '-';
  return Object.entries(labels)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
}

import {
  ConditionsTable,
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import { Grid, Typography } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import { CiliumClusterwideNetworkPolicy, CiliumNetworkPolicy } from '../resources';
import { CiliumNetworkPolicyResource, PolicyRuleSpec, PolicySpec } from '../resources/types';
import { formatCIDRRule, formatSelector } from '../utils/format';
import { policyStatusFromConditions } from '../utils/status';
import { PolicyStatusLabel, PortRuleCell } from './common';

type RuleType = 'Ingress' | 'Egress' | 'IngressDeny' | 'EgressDeny';

interface PolicyRuleProps {
  rule: PolicyRuleSpec;
  type: RuleType;
  index: number;
}

function PolicyRule({ rule, type, index }: PolicyRuleProps) {
  const peerRows: { name: string; value?: React.ReactNode }[] = [];
  const portRows: { name: string; value?: React.ReactNode }[] = [];

  const isDeny = type.endsWith('Deny');
  const isIngress = type.startsWith('Ingress');

  if (rule.fromEndpoints || rule.toEndpoints) {
    peerRows.push({
      name: 'Endpoints',
      value: formatSelector(rule.fromEndpoints?.[0] || rule.toEndpoints?.[0]),
    });
  }
  if (rule.fromCIDRSet || rule.toCIDRSet) {
    peerRows.push({
      name: 'CIDRSet',
      value: (rule.fromCIDRSet || rule.toCIDRSet)!.map(formatCIDRRule).join(', '),
    });
  }
  if (rule.fromCIDR || rule.toCIDR) {
    peerRows.push({ name: 'CIDR', value: (rule.fromCIDR || rule.toCIDR)!.join(', ') });
  }
  if (rule.fromEntities || rule.toEntities) {
    peerRows.push({ name: 'Entities', value: (rule.fromEntities || rule.toEntities)!.join(', ') });
  }

  if (rule.toPorts) {
    rule.toPorts.forEach((portRule, portIndex) => {
      portRows.push({
        name: `Port Rule ${portIndex + 1}`,
        value: <PortRuleCell portRule={portRule} />,
      });
    });
  }
  if (rule.icmps) {
    const icmpFields = rule.icmps.flatMap(icmpRule => icmpRule.fields || []);
    portRows.push({
      name: 'ICMPs',
      value: icmpFields.map(f => `${f.type} (Family: ${f.family || 'IPv4'})`).join(', '),
    });
  }

  return (
    <SectionBox title={`${type} Rule ${index + 1}`} key={index}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Peers ({isIngress ? 'From' : 'To'})
          </Typography>
          {peerRows.length > 0 ? (
            <NameValueTable rows={peerRows} />
          ) : (
            <Typography variant="body2">Any</Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            {isDeny ? 'Denied Ports / ICMP' : 'Ports / Protocols'}
          </Typography>
          {portRows.length > 0 ? (
            <NameValueTable rows={portRows} />
          ) : (
            <Typography variant="body2">{isDeny ? 'None Specified' : 'Any'}</Typography>
          )}
        </Grid>
      </Grid>
    </SectionBox>
  );
}

function PolicyDetails({ item, titlePrefix }: { item: KubeObject; titlePrefix: string }) {
  const data = (item.jsonData || {}) as CiliumNetworkPolicyResource;
  const spec: PolicySpec = data.spec || {};
  const status = data.status || {};
  const description = spec.description || '-';

  const policySpec: PolicySpec = spec.specs ? spec.specs[0] : spec;
  const policySpecs: PolicySpec[] = spec.specs || [spec];

  let selectorType = '';
  let selectorString = 'None';
  if (policySpec?.endpointSelector) {
    selectorType = 'Endpoint Selector';
    selectorString = formatSelector(policySpec.endpointSelector);
  } else if (policySpec?.nodeSelector) {
    selectorType = 'Node Selector';
    selectorString = formatSelector(policySpec.nodeSelector);
  }

  const ingressRules = policySpecs.flatMap(s => s.ingress || []);
  const egressRules = policySpecs.flatMap(s => s.egress || []);
  const ingressDenyRules = policySpecs.flatMap(s => s.ingressDeny || []);
  const egressDenyRules = policySpecs.flatMap(s => s.egressDeny || []);

  const hasConditions = !!status.conditions && status.conditions.length > 0;

  return (
    <>
      <MainInfoSection
        resource={item}
        title={`${titlePrefix}: ${data.metadata?.name}`}
        extraInfo={[
          { name: 'Status', value: <PolicyStatusLabel conditions={status.conditions} /> },
          { name: 'Description', value: description },
          ...(selectorType ? [{ name: selectorType, value: selectorString }] : []),
        ]}
      />
      {hasConditions && (
        <SectionBox title="Conditions">
          <ConditionsTable resource={item.jsonData} />
        </SectionBox>
      )}

      {ingressRules.map((rule, index) => (
        <PolicyRule rule={rule} type="Ingress" index={index} key={`ingress-${index}`} />
      ))}
      {egressRules.map((rule, index) => (
        <PolicyRule rule={rule} type="Egress" index={index} key={`egress-${index}`} />
      ))}
      {ingressDenyRules.map((rule, index) => (
        <PolicyRule rule={rule} type="IngressDeny" index={index} key={`ingress-deny-${index}`} />
      ))}
      {egressDenyRules.map((rule, index) => (
        <PolicyRule rule={rule} type="EgressDeny" index={index} key={`egress-deny-${index}`} />
      ))}
    </>
  );
}

function policyStatusValue(item: KubeObject): string {
  const data = (item.jsonData || {}) as CiliumNetworkPolicyResource;
  return policyStatusFromConditions(data.status?.conditions).label;
}

function policyStatusColumn() {
  return {
    id: 'status',
    label: 'Status',
    getValue: (item: KubeObject) => policyStatusValue(item),
    render: (item: KubeObject) => {
      const data = (item.jsonData || {}) as CiliumNetworkPolicyResource;
      return <PolicyStatusLabel conditions={data.status?.conditions} />;
    },
  };
}

export function CiliumNetworkPolicyList() {
  return (
    <ResourceListView
      title="Cilium Network Policies"
      resourceClass={CiliumNetworkPolicy}
      columns={['name', 'namespace', policyStatusColumn(), 'age']}
    />
  );
}

export function CiliumNetworkPolicyDetail() {
  const { name, namespace } = useParams<{ namespace: string; name: string }>();
  const [item, error] = CiliumNetworkPolicy.useGet(name, namespace);

  if (error) {
    return <div>Error loading Network Policy: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Network Policy details..." />;
  }
  return <PolicyDetails item={item} titlePrefix="Network Policy" />;
}

export function CiliumClusterwideNetworkPolicyList() {
  return (
    <ResourceListView
      title="Cilium Clusterwide Network Policies"
      resourceClass={CiliumClusterwideNetworkPolicy}
      columns={['name', policyStatusColumn(), 'age']}
    />
  );
}

export function CiliumClusterwideNetworkPolicyDetail() {
  const { name } = useParams<{ name: string }>();
  const [item, error] = CiliumClusterwideNetworkPolicy.useGet(name);

  if (error) {
    return <div>Error loading Clusterwide Network Policy: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Clusterwide Network Policy details..." />;
  }
  return <PolicyDetails item={item} titlePrefix="Clusterwide Network Policy" />;
}

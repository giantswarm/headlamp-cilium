import {
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import React from 'react';
import { useParams } from 'react-router-dom';
import { CiliumEndpoint } from '../resources';
import { CiliumEndpointResource } from '../resources/types';
import { StatusLabelFor } from './common';

function endpointData(item: KubeObject): CiliumEndpointResource {
  return (item.jsonData || {}) as CiliumEndpointResource;
}

export function CiliumEndpointList() {
  return (
    <ResourceListView
      title="Cilium Endpoints"
      resourceClass={CiliumEndpoint}
      columns={[
        'name',
        'namespace',
        {
          id: 'identity',
          label: 'Identity ID',
          getValue: item => endpointData(item).status?.identity?.id ?? '-',
        },
        {
          id: 'state',
          label: 'State',
          getValue: item => endpointData(item).status?.state || 'Unknown',
          render: item => <StatusLabelFor status={endpointData(item).status?.state} />,
        },
        {
          id: 'ipv4',
          label: 'IPv4',
          getValue: item => endpointData(item).status?.networking?.addressing?.[0]?.ipv4 || '-',
        },
        {
          id: 'ipv6',
          label: 'IPv6',
          getValue: item => endpointData(item).status?.networking?.addressing?.[0]?.ipv6 || '-',
        },
        'age',
      ]}
    />
  );
}

export function CiliumEndpointDetail() {
  const { name, namespace } = useParams<{ namespace: string; name: string }>();
  const [item, error] = CiliumEndpoint.useGet(name, namespace);

  if (error) {
    return <div>Error loading Endpoint: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Endpoint details..." />;
  }

  const data = endpointData(item);
  const status = data.status || {};
  const { identity, networking, policy, health } = status;
  const ipv4 = networking?.addressing?.[0]?.ipv4 || '-';
  const ipv6 = networking?.addressing?.[0]?.ipv6 || '-';

  return (
    <>
      <MainInfoSection
        resource={item}
        title={`Endpoint: ${data.metadata?.name}`}
        extraInfo={[
          { name: 'State', value: <StatusLabelFor status={status.state} /> },
          { name: 'Identity ID', value: identity?.id ?? '-' },
          { name: 'IPv4', value: ipv4 },
          { name: 'IPv6', value: ipv6 },
          { name: 'Node', value: networking?.node || '-' },
        ]}
      />
      <SectionBox title="Policy Enforcement">
        <NameValueTable
          rows={[
            { name: 'Ingress', value: <StatusLabelFor status={policy?.ingress?.state} /> },
            { name: 'Egress', value: <StatusLabelFor status={policy?.egress?.state} /> },
          ]}
        />
      </SectionBox>
      <SectionBox title="Health">
        <NameValueTable
          rows={[
            { name: 'BPF', value: <StatusLabelFor status={health?.bpf} /> },
            { name: 'Policy', value: <StatusLabelFor status={health?.policy} /> },
            { name: 'Connected', value: <StatusLabelFor status={String(health?.connected)} /> },
            { name: 'Overall', value: <StatusLabelFor status={health?.overallHealth} /> },
          ]}
        />
      </SectionBox>
      <SectionBox title="Networking Details">
        <NameValueTable
          rows={[
            { name: 'Node Address', value: networking?.node || '-' },
            ...(networking?.addressing?.flatMap((addr, index) => [
              { name: `IPv4 [${index}]`, value: addr.ipv4 || '-' },
              { name: `IPv6 [${index}]`, value: addr.ipv6 || '-' },
            ]) || []),
          ]}
        />
      </SectionBox>
      {identity?.labels && identity.labels.length > 0 && (
        <SectionBox title="Identity Labels">
          <NameValueTable rows={identity.labels.map(label => ({ name: label }))} />
        </SectionBox>
      )}
    </>
  );
}

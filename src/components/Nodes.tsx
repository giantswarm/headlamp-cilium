import {
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
  SimpleTable,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import React from 'react';
import { useParams } from 'react-router-dom';
import { CiliumNode } from '../resources';
import { CiliumNodeResource, NodeAddress, NodeIPAMAllocation } from '../resources/types';

function nodeData(item: KubeObject): CiliumNodeResource {
  return (item.jsonData || {}) as CiliumNodeResource;
}

function addressOfType(addresses: NodeAddress[] | undefined, type: string): string {
  return addresses?.find(a => a.type === type)?.ip || '-';
}

export function CiliumNodeList() {
  return (
    <ResourceListView
      title="Cilium Nodes"
      resourceClass={CiliumNode}
      columns={[
        'name',
        {
          id: 'ciliumInternalIP',
          label: 'Cilium Internal IP',
          getValue: item => addressOfType(nodeData(item).spec?.addresses, 'CiliumInternalIP'),
        },
        {
          id: 'internalIP',
          label: 'Internal IP',
          getValue: item => addressOfType(nodeData(item).spec?.addresses, 'InternalIP'),
        },
        'age',
      ]}
    />
  );
}

type IPAMEntry = [string, NodeIPAMAllocation];

export function CiliumNodeDetail() {
  const { name } = useParams<{ name: string }>();
  const [item, error] = CiliumNode.useGet(name);

  if (error) {
    return <div>Error loading Node: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Node details..." />;
  }

  const data = nodeData(item);
  const spec = data.spec || {};
  const status = data.status || {};
  const ipam = status.ipam || {};
  const addresses = spec.addresses || [];

  const usedEntries = Object.entries(ipam.used || {}) as IPAMEntry[];
  const podCIDRs = (ipam.podCIDRs || []).join(', ') || '-';

  return (
    <>
      <MainInfoSection
        resource={item}
        title={`Node: ${data.metadata?.name}`}
        extraInfo={[
          { name: 'Instance ID', value: spec.instanceID || '-' },
          { name: 'Cilium Internal IP', value: addressOfType(addresses, 'CiliumInternalIP') },
          { name: 'Internal IP', value: addressOfType(addresses, 'InternalIP') },
          { name: 'Boot ID', value: spec.bootid || '-' },
        ]}
      />
      <SectionBox title="Node Addresses (Spec)">
        <NameValueTable rows={addresses.map(addr => ({ name: addr.type, value: addr.ip }))} />
      </SectionBox>
      <SectionBox title="Health Endpoints (Spec)">
        <NameValueTable
          rows={[
            { name: 'IPv4', value: spec.health?.ipv4 || '-' },
            { name: 'IPv6', value: spec.health?.ipv6 || '-' },
          ]}
        />
      </SectionBox>
      <SectionBox title="IPAM">
        <NameValueTable rows={[{ name: 'Pod CIDRs', value: podCIDRs }]} />
        <SimpleTable
          data={usedEntries}
          columns={[
            { label: 'IP', getter: (row: IPAMEntry) => row[0] },
            { label: 'Owner', getter: (row: IPAMEntry) => row[1]?.owner || '-' },
            { label: 'Resource', getter: (row: IPAMEntry) => row[1]?.resource || '-' },
          ]}
          emptyMessage="No allocated IPs reported."
        />
      </SectionBox>
      <SectionBox title="Encryption (Spec)">
        <NameValueTable rows={[{ name: 'Key Index', value: spec.encryption?.key ?? 'Disabled' }]} />
      </SectionBox>
      <SectionBox title="Health Status">
        <NameValueTable
          rows={Object.entries(status.health || {}).map(([k, v]) => ({
            name: k,
            value: String(v),
          }))}
        />
      </SectionBox>
      <SectionBox title="Encryption Status">
        <NameValueTable
          rows={Object.entries(status.encryption || {}).map(([k, v]) => ({
            name: k,
            value: String(v),
          }))}
        />
      </SectionBox>
    </>
  );
}

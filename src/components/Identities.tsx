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
import { CiliumIdentity } from '../resources';
import { CiliumIdentityResource } from '../resources/types';
import { formatLabelMap } from '../utils/format';

function identityData(item: KubeObject): CiliumIdentityResource {
  return (item.jsonData || {}) as CiliumIdentityResource;
}

export function CiliumIdentityList() {
  return (
    <ResourceListView
      title="Cilium Identities"
      resourceClass={CiliumIdentity}
      columns={[
        'name',
        {
          id: 'labels',
          label: 'Security Labels',
          getValue: item => formatLabelMap(identityData(item)['security-labels']),
        },
        'age',
      ]}
    />
  );
}

export function CiliumIdentityDetail() {
  const { name } = useParams<{ name: string }>();
  const [item, error] = CiliumIdentity.useGet(name);

  if (error) {
    return <div>Error loading Identity: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Identity details..." />;
  }

  const data = identityData(item);
  const securityLabels = data['security-labels'] || {};
  const metadataLabels = data.metadata?.labels || {};

  return (
    <>
      <MainInfoSection resource={item} title={`Identity: ${data.metadata?.name}`} />
      <SectionBox title="Security Labels (Source of Truth)">
        <NameValueTable
          rows={Object.entries(securityLabels).map(([k, v]) => ({ name: k, value: v }))}
        />
      </SectionBox>
      <SectionBox title="Kubernetes Labels (Used for Lookup)">
        <NameValueTable
          rows={Object.entries(metadataLabels).map(([k, v]) => ({ name: k, value: v as string }))}
        />
      </SectionBox>
    </>
  );
}

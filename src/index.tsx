import {
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import {
  // ConditionsTable, // Keep for potential use later
  Link,
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
  // StatusLabel, // Keep for potential use later
  // Table, // Keep for potential use later
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
// import { Box, Tab, Tabs, Typography } from '@mui/material'; // Keep for potential use later
import React from 'react';
import { useParams } from 'react-router-dom';

// --- Define Cilium Resource Classes ---
const ciliumGroup = 'cilium.io';
const ciliumV2Version = 'v2';
// const ciliumV2Alpha1Version = 'v2alpha1'; // For CRDs not yet in v2

const CiliumNetworkPolicy = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: true,
  singularName: 'CiliumNetworkPolicy',
  pluralName: 'ciliumnetworkpolicies',
});

const CiliumClusterwideNetworkPolicy = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: false, // Cluster-scoped
  singularName: 'CiliumClusterwideNetworkPolicy',
  pluralName: 'ciliumclusterwidenetworkpolicies',
});

const CiliumEndpoint = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: true,
  singularName: 'CiliumEndpoint',
  pluralName: 'ciliumendpoints',
});

const CiliumIdentity = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: false, // Cluster-scoped
  singularName: 'CiliumIdentity',
  pluralName: 'ciliumidentities',
});

const CiliumNode = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: false, // Cluster-scoped
  singularName: 'CiliumNode',
  pluralName: 'ciliumnodes',
});

// Add other CRDs like CiliumCIDRGroup, CiliumExternalWorkload later if needed

// --- Placeholder Detail View Components ---

function PlaceholderDetailsView({ resourceClass, titlePrefix }: { resourceClass: any, titlePrefix: string }) {
  // Use useParams type based on whether the resource is namespaced
  const params = useParams<{ namespace?: string; name: string }>();
  const { name, namespace } = params;

  const [item, error] = resourceClass.useGet(name, namespace); // namespace might be undefined for cluster-scoped

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading {titlePrefix}: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title={`Loading ${titlePrefix} details...`} />;
  }

  const itemName = item?.metadata?.name || name;

  // Basic details for now
  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore Title prop works but might show TS error depending on Headlamp version
        title={`${titlePrefix}: ${itemName}`}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Raw YAML">
        <pre>{JSON.stringify(item?.jsonData || {}, null, 2)}</pre>
      </SectionBox>
      {/* Add more sections later */}
    </>
  );
}

function CiliumNetworkPolicyDetailsView() {
  return <PlaceholderDetailsView resourceClass={CiliumNetworkPolicy} titlePrefix="Network Policy" />;
}

function CiliumClusterwideNetworkPolicyDetailsView() {
  return <PlaceholderDetailsView resourceClass={CiliumClusterwideNetworkPolicy} titlePrefix="Clusterwide Network Policy" />;
}

function CiliumEndpointDetailsView() {
  return <PlaceholderDetailsView resourceClass={CiliumEndpoint} titlePrefix="Endpoint" />;
}

function CiliumIdentityDetailsView() {
  return <PlaceholderDetailsView resourceClass={CiliumIdentity} titlePrefix="Identity" />;
}

function CiliumNodeDetailsView() {
  return <PlaceholderDetailsView resourceClass={CiliumNode} titlePrefix="Node" />;
}


// --- Define route and sidebar names ---
const CILIUM_ROOT_SIDEBAR = 'cilium';
const CILIUM_NETWORK_POLICIES_LIST_ROUTE = 'ciliumnetworkpolicies';
const CILIUM_NETWORK_POLICY_DETAILS_ROUTE = 'ciliumnetworkpolicy';
const CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE = 'ciliumclusterwidenetworkpolicies';
const CILIUM_CLUSTERWIDE_NETWORK_POLICY_DETAILS_ROUTE = 'ciliumclusterwidenetworkpolicy';
const CILIUM_ENDPOINTS_LIST_ROUTE = 'ciliumendpoints';
const CILIUM_ENDPOINT_DETAILS_ROUTE = 'ciliumendpoint';
const CILIUM_IDENTITIES_LIST_ROUTE = 'ciliumidentities';
const CILIUM_IDENTITY_DETAILS_ROUTE = 'ciliumidentity';
const CILIUM_NODES_LIST_ROUTE = 'ciliumnodes';
const CILIUM_NODE_DETAILS_ROUTE = 'ciliumnode';

// --- Register Sidebar Entries ---

registerSidebarEntry({
  parent: null, // Top-level entry
  name: CILIUM_ROOT_SIDEBAR,
  label: 'Cilium',
  icon: 'mdi:hexagon-multiple-outline', // Example icon (find better later?) https://icon-sets.iconify.design/mdi/
});

registerSidebarEntry({
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_NETWORK_POLICIES_LIST_ROUTE,
  label: 'Network Policies',
  url: '/cilium/networkpolicies',
});

registerSidebarEntry({
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE,
  label: 'Clusterwide Policies',
  url: '/cilium/clusterwidenetworkpolicies',
});

registerSidebarEntry({
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_ENDPOINTS_LIST_ROUTE,
  label: 'Endpoints',
  url: '/cilium/endpoints',
});

registerSidebarEntry({
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_IDENTITIES_LIST_ROUTE,
  label: 'Identities',
  url: '/cilium/identities',
});

registerSidebarEntry({
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_NODES_LIST_ROUTE,
  label: 'Nodes',
  url: '/cilium/nodes',
});


// --- Register Routes and Components ---

// CiliumNetworkPolicy List View
registerRoute({
  path: '/cilium/networkpolicies',
  sidebar: CILIUM_NETWORK_POLICIES_LIST_ROUTE,
  name: CILIUM_NETWORK_POLICIES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Cilium Network Policies"
      resourceClass={CiliumNetworkPolicy}
      columns={[
        'name',
        'namespace',
        // Basic status check - needs refinement based on actual status structure
        {
            id: 'status',
            label: 'Status',
            getter: (policy: KubeObjectInterface) => {
                // Example: check for a 'Valid' condition type
                const validCondition = policy.status?.conditions?.find((c: any) => c.type === 'Valid');
                return validCondition?.status || 'Unknown';
            },
            sort: true,
        },
        'age',
      ]}
    />
  ),
});

// CiliumNetworkPolicy Detail View
registerRoute({
  path: '/cilium/networkpolicies/:namespace/:name',
  sidebar: CILIUM_NETWORK_POLICIES_LIST_ROUTE,
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_NETWORK_POLICY_DETAILS_ROUTE,
  exact: true,
  component: CiliumNetworkPolicyDetailsView,
});

// CiliumClusterwideNetworkPolicy List View
registerRoute({
  path: '/cilium/clusterwidenetworkpolicies',
  sidebar: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE,
  name: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Cilium Clusterwide Network Policies"
      resourceClass={CiliumClusterwideNetworkPolicy}
      columns={[
        'name',
        // Basic status check - needs refinement based on actual status structure
        {
            id: 'status',
            label: 'Status',
            getter: (policy: KubeObjectInterface) => {
                const validCondition = policy.status?.conditions?.find((c: any) => c.type === 'Valid');
                return validCondition?.status || 'Unknown';
            },
            sort: true,
        },
        'age',
      ]}
    />
  ),
});

// CiliumClusterwideNetworkPolicy Detail View
registerRoute({
  path: '/cilium/clusterwidenetworkpolicies/:name', // No namespace for cluster-scoped
  sidebar: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE,
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_CLUSTERWIDE_NETWORK_POLICY_DETAILS_ROUTE,
  exact: true,
  component: CiliumClusterwideNetworkPolicyDetailsView,
});

// CiliumEndpoint List View
registerRoute({
  path: '/cilium/endpoints',
  sidebar: CILIUM_ENDPOINTS_LIST_ROUTE,
  name: CILIUM_ENDPOINTS_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Cilium Endpoints"
      resourceClass={CiliumEndpoint}
      columns={[
        'name',
        'namespace',
        {
            id: 'identity',
            label: 'Identity ID',
            getter: (endpoint: KubeObjectInterface) => endpoint.status?.identity?.id ?? '-',
            sort: true,
        },
        {
            id: 'state',
            label: 'State',
            getter: (endpoint: KubeObjectInterface) => endpoint.status?.state || 'Unknown',
            sort: true,
        },
        {
            id: 'ipv4',
            label: 'IPv4',
            getter: (endpoint: KubeObjectInterface) => endpoint.status?.networking?.addressing?.[0]?.ipv4 || '-',
        },
        {
            id: 'ipv6',
            label: 'IPv6',
            getter: (endpoint: KubeObjectInterface) => endpoint.status?.networking?.addressing?.[0]?.ipv6 || '-',
        },
        'age',
      ]}
    />
  ),
});

// CiliumEndpoint Detail View
registerRoute({
  path: '/cilium/endpoints/:namespace/:name',
  sidebar: CILIUM_ENDPOINTS_LIST_ROUTE,
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_ENDPOINT_DETAILS_ROUTE,
  exact: true,
  component: CiliumEndpointDetailsView,
});

// CiliumIdentity List View
registerRoute({
  path: '/cilium/identities',
  sidebar: CILIUM_IDENTITIES_LIST_ROUTE,
  name: CILIUM_IDENTITIES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Cilium Identities"
      resourceClass={CiliumIdentity}
      columns={[
        'name', // Identity ID is the name
        {
            id: 'labels',
            label: 'Security Labels',
            // Simple join for now, could be improved
            getter: (identity: KubeObjectInterface) => Object.entries(identity.jsonData?.['security-labels'] || {}).map(([k,v]) => `${k}=${v}`).join(', '),
        },
        'age',
      ]}
    />
  ),
});

// CiliumIdentity Detail View
registerRoute({
  path: '/cilium/identities/:name', // No namespace for cluster-scoped
  sidebar: CILIUM_IDENTITIES_LIST_ROUTE,
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_IDENTITY_DETAILS_ROUTE,
  exact: true,
  component: CiliumIdentityDetailsView,
});

// CiliumNode List View
registerRoute({
  path: '/cilium/nodes',
  sidebar: CILIUM_NODES_LIST_ROUTE,
  name: CILIUM_NODES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Cilium Nodes"
      resourceClass={CiliumNode}
      columns={[
        'name',
        {
            id: 'ciliumInternalIP',
            label: 'Cilium Internal IP',
            getter: (node: KubeObjectInterface) => node.spec?.addresses?.find((a: any) => a.type === 'CiliumInternalIP')?.ip || '-',
        },
        {
            id: 'internalIP',
            label: 'Internal IP',
            getter: (node: KubeObjectInterface) => node.spec?.addresses?.find((a: any) => a.type === 'InternalIP')?.ip || '-',
        },
        // Add node status later if needed
        'age',
      ]}
    />
  ),
});

// CiliumNode Detail View
registerRoute({
  path: '/cilium/nodes/:name', // No namespace for cluster-scoped
  sidebar: CILIUM_NODES_LIST_ROUTE,
  parent: CILIUM_ROOT_SIDEBAR,
  name: CILIUM_NODE_DETAILS_ROUTE,
  exact: true,
  component: CiliumNodeDetailsView,
});


console.log('Cilium Plugin registered.');

// No Plugin class initialization needed for this basic setup

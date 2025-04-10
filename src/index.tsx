import {
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import {
  ConditionsTable, // Keep for potential use later
  Link,
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
  StatusLabel, // Keep for potential use later
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

// --- Detail View Components ---

// Helper function to render StatusLabel based on state
function renderStatusLabel(status?: string) {
    let severity: 'success' | 'error' | 'warning' | 'info' | 'unknown' = 'unknown';
    if (!status) return <StatusLabel status={severity}>Unknown</StatusLabel>;

    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'ready' || lowerStatus === 'enforcing' || lowerStatus === 'true') {
        severity = 'success';
    } else if (lowerStatus === 'disconnected' || lowerStatus === 'invalid' || lowerStatus === 'false' || lowerStatus.includes('fail')) {
        severity = 'error';
    } else if (lowerStatus === 'waiting-for-identity' || lowerStatus === 'waiting-to-regenerate' || lowerStatus === 'restoring' || lowerStatus === 'regenerating') {
        severity = 'warning';
    } else if (lowerStatus === 'disabled' || lowerStatus === 'non-enforcing') {
        severity = 'info';
    }

    return <StatusLabel status={severity}>{status}</StatusLabel>;
}


function CiliumEndpointDetailsView() {
  const params = useParams<{ namespace: string; name: string }>();
  const { name, namespace } = params;
  const [item, error] = CiliumEndpoint.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading Endpoint: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Endpoint details..." />;
  }

  const { status = {}, metadata = {} } = item.jsonData || {};
  const { identity = {}, networking = {}, policy = {}, health = {} } = status;
  const ipv4 = networking?.addressing?.[0]?.ipv4 || '-';
  const ipv6 = networking?.addressing?.[0]?.ipv6 || '-';

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`Endpoint: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: renderStatusLabel(status.state) },
          { name: 'Identity ID', value: identity?.id ?? '-' },
          { name: 'IPv4', value: ipv4 },
          { name: 'IPv6', value: ipv6 },
          { name: 'Node', value: networking?.node || '-' },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Policy Enforcement">
        <NameValueTable
          rows={[
            { name: 'Ingress', value: renderStatusLabel(policy?.ingress?.state) },
            { name: 'Egress', value: renderStatusLabel(policy?.egress?.state) },
            // TODO: Add more details like allowed identities if needed
          ]}
        />
      </SectionBox>
       <SectionBox title="Health">
        <NameValueTable
          rows={[
            { name: 'BPF', value: renderStatusLabel(health?.bpf) },
            { name: 'Policy', value: renderStatusLabel(health?.policy) },
            { name: 'Connected', value: renderStatusLabel(String(health?.connected)) }, // Assuming 'true'/'false'
            { name: 'Overall', value: renderStatusLabel(health?.overallHealth) },
          ]}
        />
      </SectionBox>
      <SectionBox title="Networking Details">
        <NameValueTable
            rows={[
                { name: 'Node Address', value: networking?.node || '-' },
                // Display all addresses if more than one exists potentially
                ...(networking?.addressing?.flatMap((addr: any, index: number) => [
                   { name: `IPv4 [${index}]`, value: addr.ipv4 || '-' },
                   { name: `IPv6 [${index}]`, value: addr.ipv6 || '-' },
                ]) || []),
            ]}
        />
       </SectionBox>
      {/* Add sections for Logs, Controllers if needed */}
       <SectionBox title="Identity Labels">
         <NameValueTable
            rows={identity?.labels?.map((label: string) => ({ name: label })) || [{ name: '-', value: 'No labels' }]}
         />
       </SectionBox>
    </>
  );
}

function CiliumIdentityDetailsView() {
  const params = useParams<{ name: string }>(); // Cluster-scoped
  const { name } = params;
  const [item, error] = CiliumIdentity.useGet(name); // No namespace

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading Identity: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Identity details..." />;
  }

  const securityLabels = item.jsonData?.['security-labels'] || {};
  const metadataLabels = item.metadata?.labels || {};

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`Identity: ${item.metadata.name}`} // Name is the ID
         // No extra info needed for the header for now
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Security Labels (Source of Truth)">
        <NameValueTable
          rows={Object.entries(securityLabels).map(([k, v]) => ({ name: k, value: v as string }))}
          defaultOpen
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


function CiliumNodeDetailsView() {
    const params = useParams<{ name: string }>(); // Cluster-scoped
    const { name } = params;
    const [item, error] = CiliumNode.useGet(name); // No namespace

    if (error) {
      // @ts-ignore Error type is not well defined
      return <div>Error loading Node: {(error as Error).message}</div>;
    }
    if (!item) {
      return <Loader title="Loading Node details..." />;
    }

    const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};
    const { ipam = {}, health = {}, encryption = {} } = status;
    const { addresses = [] } = spec;

    const ciliumInternalIP = addresses.find((a: any) => a.type === 'CiliumInternalIP')?.ip || '-';
    const internalIP = addresses.find((a: any) => a.type === 'InternalIP')?.ip || '-';

    return (
      <>
        <MainInfoSection
          resource={item}
          // @ts-ignore
          title={`Node: ${metadata.name}`}
          extraInfo={[
            { name: 'Instance ID', value: spec.instanceID || '-' },
            { name: 'Cilium Internal IP', value: ciliumInternalIP },
            { name: 'Internal IP', value: internalIP },
            { name: 'Boot ID', value: spec.bootid || '-' },
          ]}
          // actions={[ /* Add Actions Here */ ]}
        />
        <SectionBox title="Node Addresses">
          <NameValueTable
            rows={addresses.map((addr: any) => ({ name: addr.type, value: addr.ip }))}
          />
        </SectionBox>
        <SectionBox title="Health Endpoints">
           <NameValueTable
             rows={[
                { name: 'IPv4', value: spec.health?.ipv4 || '-' },
                { name: 'IPv6', value: spec.health?.ipv6 || '-' },
             ]}
           />
         </SectionBox>
         <SectionBox title="IPAM Status">
            {/* TODO: Improve display of IPAM status, potentially with tables */}
            <pre>{JSON.stringify(ipam || {}, null, 2)}</pre>
         </SectionBox>
         <SectionBox title="Encryption">
            <NameValueTable rows={[{ name: 'Key Index', value: spec.encryption?.key ?? 'Disabled' }]} />
         </SectionBox>
         {/* TODO: Add provider-specific status sections (AWS ENI, Azure, GKE, etc.) */}
      </>
    );
}

// --- Placeholder Detail Views for Policies (Keep Simple for Now) ---

function PlaceholderPolicyDetailsView({ resourceClass, titlePrefix }: { resourceClass: any, titlePrefix: string }) {
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
  const { spec = {}, status = {} } = item.jsonData || {};
  const description = spec.description || '-';
  const endpointSelector = spec.endpointSelector; // Present in both CNP and Rule
  const nodeSelector = spec.nodeSelector; // Present in both CCNP and Rule
  const ruleEndpointSelector = spec.specs?.[0]?.endpointSelector; // If using specs array
  const ruleNodeSelector = spec.specs?.[0]?.nodeSelector; // If using specs array

  // Determine the primary selector
  let selectorString = '-';
  if (endpointSelector) {
    selectorString = `Endpoint Selector: ${JSON.stringify(endpointSelector.matchLabels || endpointSelector)}`;
  } else if (nodeSelector) {
    selectorString = `Node Selector: ${JSON.stringify(nodeSelector.matchLabels || nodeSelector)}`;
  } else if (ruleEndpointSelector) {
      selectorString = `Rule Endpoint Selector: ${JSON.stringify(ruleEndpointSelector.matchLabels || ruleEndpointSelector)}`;
  } else if (ruleNodeSelector) {
      selectorString = `Rule Node Selector: ${JSON.stringify(ruleNodeSelector.matchLabels || ruleNodeSelector)}`;
  }


  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`${titlePrefix}: ${itemName}`}
        extraInfo={[
            { name: 'Description', value: description },
            { name: 'Selector', value: selectorString },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
       <SectionBox title="Status">
           <ConditionsTable resource={item.jsonData} />
       </SectionBox>
      <SectionBox title="Spec (Raw YAML)">
        {/* Displaying full spec is complex, show raw YAML for now */}
        <pre>{JSON.stringify(spec || {}, null, 2)}</pre>
      </SectionBox>
    </>
  );
}


function CiliumNetworkPolicyDetailsView() {
  return <PlaceholderPolicyDetailsView resourceClass={CiliumNetworkPolicy} titlePrefix="Network Policy" />;
}

function CiliumClusterwideNetworkPolicyDetailsView() {
  return <PlaceholderPolicyDetailsView resourceClass={CiliumClusterwideNetworkPolicy} titlePrefix="Clusterwide Network Policy" />;
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
                // Note: CRD shows status conditions are under status.derivativePolicies[nodeName].conditions? Maybe just show OK?
                // Let's simplify for now
                const nodeStatuses = Object.values(policy.status?.derivativePolicies || {});
                if (nodeStatuses.length === 0) return 'No Status';
                // Check if any node has an error or is not enforcing
                const hasError = nodeStatuses.some((s: any) => s.error);
                const allEnforcing = nodeStatuses.every((s: any) => s.enforcing);
                if (hasError) return 'Error';
                return allEnforcing ? 'Enforcing' : 'Pending';
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
                // Example: check for a 'Valid' condition type
                // Note: CRD shows status conditions are under status.derivativePolicies[nodeName].conditions? Maybe just show OK?
                // Let's simplify for now
                const nodeStatuses = Object.values(policy.status?.derivativePolicies || {});
                if (nodeStatuses.length === 0) return 'No Status';
                // Check if any node has an error or is not enforcing
                const hasError = nodeStatuses.some((s: any) => s.error);
                const allEnforcing = nodeStatuses.every((s: any) => s.enforcing);
                if (hasError) return 'Error';
                return allEnforcing ? 'Enforcing' : 'Pending';
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
             cellProps: (endpoint: KubeObjectInterface) => ({
                children: renderStatusLabel(endpoint.status?.state),
            }),
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

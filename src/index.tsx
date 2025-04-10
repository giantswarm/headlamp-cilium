import {
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import {
  ConditionsTable, // Use this for policy status
  Link, // Use for linking related resources if possible later
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
  SimpleTable, // Use for structured lists like ports/rules
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObjectInterface, KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster'; // Import KubeObject
import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { Box, Chip, Grid, Typography } from '@mui/material'; // Import necessary MUI components
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

// --- Detail View Helper Functions ---

function renderStatusLabel(status?: string) {
  // Map statuses to valid StatusLabel severities or 'unknown'
  let severity: 'success' | 'error' | 'warning' | 'info' | 'unknown' = 'unknown'; // Default to unknown
  if (!status) return <StatusLabel status={severity}>Unknown</StatusLabel>;

  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'ready' || lowerStatus === 'enforcing' || lowerStatus === 'true') {
      severity = 'success';
  } else if (lowerStatus === 'disconnected' || lowerStatus === 'invalid' || lowerStatus === 'false' || lowerStatus.includes('fail')) {
      severity = 'error';
  } else if (lowerStatus === 'waiting-for-identity' || lowerStatus === 'waiting-to-regenerate' || lowerStatus === 'restoring' || lowerStatus === 'regenerating' || lowerStatus === 'pending') {
      severity = 'warning'; // Treat pending as warning
  } else if (lowerStatus === 'disabled' || lowerStatus === 'non-enforcing' || lowerStatus === 'no status') {
      severity = 'info'; // Use info for these neutral/disabled states
  }
  // Other statuses will use 'unknown' severity

  return <StatusLabel status={severity}>{status}</StatusLabel>;
}

function formatSelector(selector: any): string {
    if (!selector) return 'None';
    if (selector.matchLabels) {
        return Object.entries(selector.matchLabels)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ');
    }
    if (selector.matchExpressions) {
        return selector.matchExpressions
            .map((expr: any) => `${expr.key} ${expr.operator} ${expr.values ? `(${expr.values.join(', ')})` : ''}`)
            .join(', ');
    }
    return JSON.stringify(selector); // Fallback
}

function formatCIDRRule(rule: any): string {
    let text = rule.cidr || rule.cidrGroupRef || formatSelector(rule.cidrGroupSelector) || 'Invalid Rule';
    if (rule.except && rule.except.length > 0) {
        text += ` (except ${rule.except.join(', ')})`;
    }
    return text;
}

function formatPortRule(portRule: any): React.ReactNode {
    // Simplified display for brevity in NameValueTable
    const ports = portRule.ports?.map((p: any) => `${p.port || '*'}/${p.protocol || 'ANY'}`).join(', ');
    const hasL7 = !!(portRule.rules?.http || portRule.rules?.kafka || portRule.rules?.dns || portRule.rules?.l7proto);
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" component="span">Ports: {ports || 'Any'}</Typography>
            {hasL7 && <Chip label="L7 Rules Present" size="small" sx={{ mt: 0.5, width: 'fit-content' }} />}
            {/* TODO: Could expand L7 rules details here or in a separate table */}
        </Box>
    );
}

// --- Detail View Components ---

function CiliumEndpointDetailsView() {
  const params = useParams<{ namespace: string; name: string }>();
  const { name, namespace } = params;
  const [item, error] = CiliumEndpoint.useGet(name, namespace);

  if (error) {
    // @ts-ignore
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
      />
      <SectionBox title="Policy Enforcement">
        <NameValueTable
          rows={[
            { name: 'Ingress', value: renderStatusLabel(policy?.ingress?.state) },
            { name: 'Egress', value: renderStatusLabel(policy?.egress?.state) },
          ]}
        />
      </SectionBox>
       <SectionBox title="Health">
        <NameValueTable
          rows={[
            { name: 'BPF', value: renderStatusLabel(health?.bpf) },
            { name: 'Policy', value: renderStatusLabel(health?.policy) },
            { name: 'Connected', value: renderStatusLabel(String(health?.connected)) },
            { name: 'Overall', value: renderStatusLabel(health?.overallHealth) },
          ]}
        />
      </SectionBox>
      <SectionBox title="Networking Details">
        <NameValueTable
            rows={[
                { name: 'Node Address', value: networking?.node || '-' },
                ...(networking?.addressing?.flatMap((addr: any, index: number) => [
                   { name: `IPv4 [${index}]`, value: addr.ipv4 || '-' },
                   { name: `IPv6 [${index}]`, value: addr.ipv6 || '-' },
                ]) || []),
            ]}
        />
       </SectionBox>
       <SectionBox title="Identity Labels">
         <NameValueTable
            rows={identity?.labels?.map((label: string) => ({ name: label })) || [{ name: '-', value: 'No labels' }]}
         />
       </SectionBox>
    </>
  );
}

function CiliumIdentityDetailsView() {
  const params = useParams<{ name: string }>();
  const { name } = params;
  const [item, error] = CiliumIdentity.useGet(name);

  if (error) {
    // @ts-ignore
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
        title={`Identity: ${item.metadata.name}`}
      />
      <SectionBox title="Security Labels (Source of Truth)">
        <NameValueTable
          rows={Object.entries(securityLabels).map(([k, v]) => ({ name: k, value: v as string }))}
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
    const params = useParams<{ name: string }>();
    const { name } = params;
    const [item, error] = CiliumNode.useGet(name);

    if (error) {
      // @ts-ignore
      return <div>Error loading Node: {(error as Error).message}</div>;
    }
    if (!item) {
      return <Loader title="Loading Node details..." />;
    }

    const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};
    const { ipam = {}, health: statusHealth = {}, encryption: statusEncryption = {} } = status; // Renamed to avoid clash
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
        />
        <SectionBox title="Node Addresses (Spec)">
          <NameValueTable
            rows={addresses.map((addr: any) => ({ name: addr.type, value: addr.ip }))}
          />
        </SectionBox>
        <SectionBox title="Health Endpoints (Spec)">
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
         <SectionBox title="Encryption (Spec)">
            <NameValueTable rows={[{ name: 'Key Index', value: spec.encryption?.key ?? 'Disabled' }]} />
         </SectionBox>
         {/* TODO: Add provider-specific status sections (AWS ENI, Azure, GKE, etc.) */}
      </>
    );
}

// --- Reusable Policy Detail Component ---

interface PolicyRuleProps {
    rule: any; // Type this more accurately based on CRD if needed
    type: 'Ingress' | 'Egress' | 'IngressDeny' | 'EgressDeny';
    index: number;
}

function PolicyRule({ rule, type, index }: PolicyRuleProps) {
    const peerRows = [];
    const portRows = [];

    const isDeny = type.endsWith('Deny');
    const isIngress = type.startsWith('Ingress');

    // Peers (From/To)
    if (rule.fromEndpoints || rule.toEndpoints) {
        peerRows.push({ name: 'Endpoints', value: formatSelector(rule.fromEndpoints?.[0] || rule.toEndpoints?.[0])});
        // TODO: Handle multiple selectors? CRD seems to imply list but examples often show one.
    }
    if (rule.fromCIDRSet || rule.toCIDRSet) {
        peerRows.push({ name: 'CIDRSet', value: (rule.fromCIDRSet || rule.toCIDRSet).map(formatCIDRRule).join(', ')});
    }
     if (rule.fromCIDR || rule.toCIDR) { // Handle simple CIDR too
        peerRows.push({ name: 'CIDR', value: (rule.fromCIDR || rule.toCIDR).join(', ')});
    }
    if (rule.fromEntities || rule.toEntities) {
        peerRows.push({ name: 'Entities', value: (rule.fromEntities || rule.toEntities).join(', ')});
    }
    // TODO: Add From/To Groups, Nodes, Services if needed

    // Ports / ICMP (Allow rules only have L7, Deny only L4/ICMP)
    if (rule.toPorts) { // Only applies to Ingress/Egress (Allow or Deny)
        rule.toPorts.forEach((portRule: any, portIndex: number) => {
            portRows.push({ name: `Port Rule ${portIndex + 1}`, value: formatPortRule(portRule) });
        });
    }
     if (rule.icmps) { // Applies to Allow or Deny
        const icmpFields = rule.icmps.flatMap((icmpRule: any) => icmpRule.fields || []);
        portRows.push({
            name: 'ICMPs',
            value: icmpFields.map((f: any) => `${f.type} (Family: ${f.family || 'IPv4'})`).join(', ')
        });
    }


    return (
        <SectionBox title={`${type} Rule ${index + 1}`} key={index}>
             <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                     <Typography variant="subtitle2" gutterBottom>Peers ({isIngress ? 'From' : 'To'})</Typography>
                     {peerRows.length > 0 ? <NameValueTable rows={peerRows} /> : <Typography variant="body2">Any</Typography>}
                </Grid>
                {!isDeny && // Only show Ports section for Allow rules
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Ports / Protocols</Typography>
                        {portRows.length > 0 ? <NameValueTable rows={portRows} /> : <Typography variant="body2">Any</Typography>}
                    </Grid>
                 }
                 {isDeny && // Show Deny Ports/ICMP in their own section
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>Denied Ports / ICMP</Typography>
                        {portRows.length > 0 ? <NameValueTable rows={portRows} /> : <Typography variant="body2">None Specified</Typography>}
                    </Grid>
                 }
             </Grid>
        </SectionBox>
    );
}


interface PolicyDetailsProps {
  // Use KubeObject instead of KubeObjectInterface if available methods are needed
  item: KubeObjectInterface;
  titlePrefix: string;
}

function PolicyDetailsComponent({ item, titlePrefix }: PolicyDetailsProps) {
    const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};
    const description = spec.description || '-';

    // Handle both single spec and list of specs (older format?)
    const policySpec = spec.specs ? spec.specs[0] : spec; // Use first spec if array exists, else use spec directly
    const policySpecs = spec.specs || [spec]; // Array to iterate over for rules

    const endpointSelector = policySpec?.endpointSelector;
    const nodeSelector = policySpec?.nodeSelector;

    let selectorString = 'None';
    let selectorType = '';
     if (endpointSelector) {
        selectorType = 'Endpoint Selector';
        selectorString = formatSelector(endpointSelector);
    } else if (nodeSelector) {
        selectorType = 'Node Selector';
        selectorString = formatSelector(nodeSelector);
    }

    const ingressRules = policySpecs.flatMap((s: any) => s.ingress || []);
    const egressRules = policySpecs.flatMap((s: any) => s.egress || []);
    const ingressDenyRules = policySpecs.flatMap((s: any) => s.ingressDeny || []);
    const egressDenyRules = policySpecs.flatMap((s: any) => s.egressDeny || []);


  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`${titlePrefix}: ${metadata.name}`}
        extraInfo={[
            { name: 'Description', value: description },
            ...(selectorType ? [{ name: selectorType, value: selectorString }] : []),
        ]}
      />
       <SectionBox title="Status">
           {/* Using derivativePolicies status as per CRD for CNP/CCNP */}
           <SimpleTable
                data={Object.entries(status?.derivativePolicies || {})}
                // Using getter for derived values, accessor for direct keys
                columns={[
                    { header: 'Node', accessor: '0'}, // Key is node name (string)
                    { header: 'Enforcing', getter: (row: any) => String(row[1].enforcing), },
                    { header: 'OK', getter: (row: any) => String(row[1].ok), },
                    { header: 'Revision', getter: (row: any) => row[1].localPolicyRevision, },
                    { header: 'Error', getter: (row: any) => row[1].error || '-', },
                    { header: 'Last Updated', getter: (row: any) => row[1].lastUpdated, },
                ]}
                emptyMessage="No derivative policy status available."
           />
           {/* Conditions might exist directly on status for some CRDs, keep just in case */}
           {status?.conditions && <ConditionsTable resource={item.jsonData} />}
       </SectionBox>

        {ingressRules.map((rule: any, index: number) => (
            <PolicyRule rule={rule} type="Ingress" index={index} key={`ingress-${index}`} />
        ))}
        {egressRules.map((rule: any, index: number) => (
            <PolicyRule rule={rule} type="Egress" index={index} key={`egress-${index}`} />
        ))}
        {ingressDenyRules.map((rule: any, index: number) => (
            <PolicyRule rule={rule} type="IngressDeny" index={index} key={`ingress-deny-${index}`} />
        ))}
         {egressDenyRules.map((rule: any, index: number) => (
            <PolicyRule rule={rule} type="EgressDeny" index={index} key={`egress-deny-${index}`} />
        ))}

      {/* Keep raw spec as fallback or additional info */}
      <SectionBox title="Raw Spec">
        <pre>{JSON.stringify(spec || {}, null, 2)}</pre>
      </SectionBox>
    </>
  );
}

function CiliumNetworkPolicyDetailsView() {
  const params = useParams<{ namespace: string; name: string }>();
  const { name, namespace } = params;
  const [item, error] = CiliumNetworkPolicy.useGet(name, namespace);

  if (error) {
    // @ts-ignore
    return <div>Error loading Network Policy: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Network Policy details..." />;
  }
  // Cast item to KubeObjectInterface for the component prop
  return <PolicyDetailsComponent item={item as KubeObjectInterface} titlePrefix="Network Policy" />;
}

function CiliumClusterwideNetworkPolicyDetailsView() {
  const params = useParams<{ name: string }>(); // Cluster-scoped
  const { name } = params;
  const [item, error] = CiliumClusterwideNetworkPolicy.useGet(name); // No namespace

  if (error) {
    // @ts-ignore
    return <div>Error loading Clusterwide Network Policy: {(error as Error).message}</div>;
  }
  if (!item) {
    return <Loader title="Loading Clusterwide Network Policy details..." />;
  }
   // Cast item to KubeObjectInterface for the component prop
   return <PolicyDetailsComponent item={item as KubeObjectInterface} titlePrefix="Clusterwide Network Policy" />;
}

// --- Routes and Sidebar ---

// Define route and sidebar names
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

// Register Sidebar Entries
registerSidebarEntry({ parent: null, name: CILIUM_ROOT_SIDEBAR, label: 'Cilium', icon: 'mdi:hexagon-multiple-outline' });
registerSidebarEntry({ parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_NETWORK_POLICIES_LIST_ROUTE, label: 'Network Policies', url: '/cilium/networkpolicies' });
registerSidebarEntry({ parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE, label: 'Clusterwide Policies', url: '/cilium/clusterwidenetworkpolicies' });
registerSidebarEntry({ parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_ENDPOINTS_LIST_ROUTE, label: 'Endpoints', url: '/cilium/endpoints' });
registerSidebarEntry({ parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_IDENTITIES_LIST_ROUTE, label: 'Identities', url: '/cilium/identities' });
registerSidebarEntry({ parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_NODES_LIST_ROUTE, label: 'Nodes', url: '/cilium/nodes' });

// Helper to get policy status for list view
function getPolicyStatus(policy: KubeObjectInterface): React.ReactNode {
    const nodeStatuses = Object.values(policy.status?.derivativePolicies || {});
    if (nodeStatuses.length === 0) return renderStatusLabel('No Status');
    const hasError = nodeStatuses.some((s: any) => s.error);
    const allEnforcing = nodeStatuses.every((s: any) => s.enforcing);
    if (hasError) return renderStatusLabel('Error');
    return renderStatusLabel(allEnforcing ? 'Enforcing' : 'Pending');
}

// Register Routes and Components

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
        { id: 'status', label: 'Status', getter: getPolicyStatus, sort: true },
        'age',
      ]}
    />
  ),
});

// CiliumNetworkPolicy Detail View
registerRoute({ path: '/cilium/networkpolicies/:namespace/:name', sidebar: CILIUM_NETWORK_POLICIES_LIST_ROUTE, parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_NETWORK_POLICY_DETAILS_ROUTE, exact: true, component: CiliumNetworkPolicyDetailsView });

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
        { id: 'status', label: 'Status', getter: getPolicyStatus, sort: true },
        'age',
      ]}
    />
  ),
});

// CiliumClusterwideNetworkPolicy Detail View
registerRoute({ path: '/cilium/clusterwidenetworkpolicies/:name', sidebar: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE, parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_CLUSTERWIDE_NETWORK_POLICY_DETAILS_ROUTE, exact: true, component: CiliumClusterwideNetworkPolicyDetailsView });

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
        { id: 'identity', label: 'Identity ID', getter: (ep: KubeObjectInterface) => ep.status?.identity?.id ?? '-', sort: true },
        // Add getter to state column
        { 
          id: 'state', 
          label: 'State', 
          getter: (ep: KubeObjectInterface) => ep.status?.state || 'Unknown', // Getter for sorting/filtering
          cellProps: (ep: KubeObjectInterface) => ({ children: renderStatusLabel(ep.status?.state) }), // Custom rendering
          sort: true 
        },
        { id: 'ipv4', label: 'IPv4', getter: (ep: KubeObjectInterface) => ep.status?.networking?.addressing?.[0]?.ipv4 || '-' },
        { id: 'ipv6', label: 'IPv6', getter: (ep: KubeObjectInterface) => ep.status?.networking?.addressing?.[0]?.ipv6 || '-' },
        'age',
      ]}
    />
  ),
});

// CiliumEndpoint Detail View
registerRoute({ path: '/cilium/endpoints/:namespace/:name', sidebar: CILIUM_ENDPOINTS_LIST_ROUTE, parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_ENDPOINT_DETAILS_ROUTE, exact: true, component: CiliumEndpointDetailsView });

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
        'name',
        { id: 'labels', label: 'Security Labels', getter: (id: KubeObjectInterface) => Object.entries(id.jsonData?.['security-labels'] || {}).map(([k,v]) => `${k}=${v}`).join(', ') },
        'age',
      ]}
    />
  ),
});

// CiliumIdentity Detail View
registerRoute({ path: '/cilium/identities/:name', sidebar: CILIUM_IDENTITIES_LIST_ROUTE, parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_IDENTITY_DETAILS_ROUTE, exact: true, component: CiliumIdentityDetailsView });

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
        { id: 'ciliumInternalIP', label: 'Cilium Internal IP', getter: (node: KubeObjectInterface) => node.spec?.addresses?.find((a: any) => a.type === 'CiliumInternalIP')?.ip || '-' },
        { id: 'internalIP', label: 'Internal IP', getter: (node: KubeObjectInterface) => node.spec?.addresses?.find((a: any) => a.type === 'InternalIP')?.ip || '-' },
        'age',
      ]}
    />
  ),
});

// CiliumNode Detail View
registerRoute({ path: '/cilium/nodes/:name', sidebar: CILIUM_NODES_LIST_ROUTE, parent: CILIUM_ROOT_SIDEBAR, name: CILIUM_NODE_DETAILS_ROUTE, exact: true, component: CiliumNodeDetailsView });


console.log('Cilium Plugin registered.');

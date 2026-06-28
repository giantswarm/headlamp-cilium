import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { CiliumEndpointDetail, CiliumEndpointList } from './components/Endpoints';
import { CiliumIdentityDetail, CiliumIdentityList } from './components/Identities';
import { CiliumNodeDetail, CiliumNodeList } from './components/Nodes';
import {
  CiliumClusterwideNetworkPolicyDetail,
  CiliumClusterwideNetworkPolicyList,
  CiliumNetworkPolicyDetail,
  CiliumNetworkPolicyList,
} from './components/Policies';

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

// --- Sidebar entries ---

registerSidebarEntry({
  parent: null,
  name: CILIUM_ROOT_SIDEBAR,
  label: 'Cilium',
  icon: 'mdi:hexagon-multiple-outline',
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

// --- Routes ---

registerRoute({
  path: '/cilium/networkpolicies',
  sidebar: CILIUM_NETWORK_POLICIES_LIST_ROUTE,
  name: CILIUM_NETWORK_POLICIES_LIST_ROUTE,
  exact: true,
  component: CiliumNetworkPolicyList,
});
registerRoute({
  path: '/cilium/networkpolicies/:namespace/:name',
  sidebar: { item: CILIUM_NETWORK_POLICIES_LIST_ROUTE, sidebar: CILIUM_ROOT_SIDEBAR },
  name: CILIUM_NETWORK_POLICY_DETAILS_ROUTE,
  exact: true,
  component: CiliumNetworkPolicyDetail,
});

registerRoute({
  path: '/cilium/clusterwidenetworkpolicies',
  sidebar: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE,
  name: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE,
  exact: true,
  component: CiliumClusterwideNetworkPolicyList,
});
registerRoute({
  path: '/cilium/clusterwidenetworkpolicies/:name',
  sidebar: { item: CILIUM_CLUSTERWIDE_NETWORK_POLICIES_LIST_ROUTE, sidebar: CILIUM_ROOT_SIDEBAR },
  name: CILIUM_CLUSTERWIDE_NETWORK_POLICY_DETAILS_ROUTE,
  exact: true,
  component: CiliumClusterwideNetworkPolicyDetail,
});

registerRoute({
  path: '/cilium/endpoints',
  sidebar: CILIUM_ENDPOINTS_LIST_ROUTE,
  name: CILIUM_ENDPOINTS_LIST_ROUTE,
  exact: true,
  component: CiliumEndpointList,
});
registerRoute({
  path: '/cilium/endpoints/:namespace/:name',
  sidebar: { item: CILIUM_ENDPOINTS_LIST_ROUTE, sidebar: CILIUM_ROOT_SIDEBAR },
  name: CILIUM_ENDPOINT_DETAILS_ROUTE,
  exact: true,
  component: CiliumEndpointDetail,
});

registerRoute({
  path: '/cilium/identities',
  sidebar: CILIUM_IDENTITIES_LIST_ROUTE,
  name: CILIUM_IDENTITIES_LIST_ROUTE,
  exact: true,
  component: CiliumIdentityList,
});
registerRoute({
  path: '/cilium/identities/:name',
  sidebar: { item: CILIUM_IDENTITIES_LIST_ROUTE, sidebar: CILIUM_ROOT_SIDEBAR },
  name: CILIUM_IDENTITY_DETAILS_ROUTE,
  exact: true,
  component: CiliumIdentityDetail,
});

registerRoute({
  path: '/cilium/nodes',
  sidebar: CILIUM_NODES_LIST_ROUTE,
  name: CILIUM_NODES_LIST_ROUTE,
  exact: true,
  component: CiliumNodeList,
});
registerRoute({
  path: '/cilium/nodes/:name',
  sidebar: { item: CILIUM_NODES_LIST_ROUTE, sidebar: CILIUM_ROOT_SIDEBAR },
  name: CILIUM_NODE_DETAILS_ROUTE,
  exact: true,
  component: CiliumNodeDetail,
});

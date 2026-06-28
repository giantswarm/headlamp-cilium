import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';

// --- Shared selector / rule types ---

export interface MatchExpression {
  key: string;
  operator: string;
  values?: string[];
}

export interface EndpointSelector {
  matchLabels?: Record<string, string>;
  matchExpressions?: MatchExpression[];
}

export interface CIDRRule {
  cidr?: string;
  cidrGroupRef?: string;
  cidrGroupSelector?: EndpointSelector;
  except?: string[];
}

export interface PortProtocol {
  port?: string;
  protocol?: string;
}

export interface L7Rules {
  http?: unknown[];
  kafka?: unknown[];
  dns?: unknown[];
  l7proto?: unknown;
}

export interface PortRule {
  ports?: PortProtocol[];
  rules?: L7Rules;
}

export interface ICMPField {
  type: number | string;
  family?: string;
}

export interface ICMPRule {
  fields?: ICMPField[];
}

/** A single ingress/egress rule entry inside a policy spec. */
export interface PolicyRuleSpec {
  fromEndpoints?: EndpointSelector[];
  toEndpoints?: EndpointSelector[];
  fromCIDRSet?: CIDRRule[];
  toCIDRSet?: CIDRRule[];
  fromCIDR?: string[];
  toCIDR?: string[];
  fromEntities?: string[];
  toEntities?: string[];
  toPorts?: PortRule[];
  icmps?: ICMPRule[];
}

/**
 * A Cilium policy spec. Either carries rules directly, or nests an array of
 * specs (`spec.specs`) for the multi-rule form.
 */
export interface PolicySpec extends PolicyRuleSpec {
  description?: string;
  endpointSelector?: EndpointSelector;
  nodeSelector?: EndpointSelector;
  ingress?: PolicyRuleSpec[];
  egress?: PolicyRuleSpec[];
  ingressDeny?: PolicyRuleSpec[];
  egressDeny?: PolicyRuleSpec[];
  specs?: PolicySpec[];
}

export interface Condition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
}

export interface PolicyStatus {
  conditions?: Condition[];
  /** Legacy field; not populated by recent Cilium versions. */
  derivativePolicies?: Record<string, unknown>;
}

export interface CiliumNetworkPolicyResource extends KubeObjectInterface {
  spec?: PolicySpec;
  status?: PolicyStatus;
}

// --- Endpoint ---

export interface EndpointAddressing {
  ipv4?: string;
  ipv6?: string;
}

export interface EndpointIdentity {
  id?: number;
  labels?: string[];
}

export interface EndpointNetworking {
  addressing?: EndpointAddressing[];
  node?: string;
}

export interface EndpointPolicyDirection {
  state?: string;
}

export interface EndpointPolicy {
  ingress?: EndpointPolicyDirection;
  egress?: EndpointPolicyDirection;
}

export interface EndpointHealth {
  bpf?: string;
  policy?: string;
  connected?: boolean;
  overallHealth?: string;
}

export interface EndpointStatus {
  state?: string;
  identity?: EndpointIdentity;
  networking?: EndpointNetworking;
  policy?: EndpointPolicy;
  health?: EndpointHealth;
}

export interface CiliumEndpointResource extends KubeObjectInterface {
  status?: EndpointStatus;
}

// --- Identity ---

export interface CiliumIdentityResource extends KubeObjectInterface {
  'security-labels'?: Record<string, string>;
}

// --- Node ---

export interface NodeAddress {
  type: string;
  ip: string;
}

export interface NodeHealthAddressing {
  ipv4?: string;
  ipv6?: string;
}

export interface NodeEncryption {
  key?: number;
}

export interface CiliumNodeSpec {
  instanceID?: string;
  bootid?: string;
  addresses?: NodeAddress[];
  health?: NodeHealthAddressing;
  encryption?: NodeEncryption;
}

export interface NodeIPAMAllocation {
  owner?: string;
  resource?: string;
}

export interface NodeIPAMStatus {
  podCIDRs?: string[];
  used?: Record<string, NodeIPAMAllocation>;
}

export interface CiliumNodeStatus {
  ipam?: NodeIPAMStatus;
  health?: Record<string, unknown>;
  encryption?: Record<string, unknown>;
}

export interface CiliumNodeResource extends KubeObjectInterface {
  spec?: CiliumNodeSpec;
  status?: CiliumNodeStatus;
}

import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';

const ciliumGroup = 'cilium.io';
const ciliumV2Version = 'v2';

export const CiliumNetworkPolicy = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: true,
  kind: 'CiliumNetworkPolicy',
  singularName: 'CiliumNetworkPolicy',
  pluralName: 'ciliumnetworkpolicies',
});

export const CiliumClusterwideNetworkPolicy = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: false,
  kind: 'CiliumClusterwideNetworkPolicy',
  singularName: 'CiliumClusterwideNetworkPolicy',
  pluralName: 'ciliumclusterwidenetworkpolicies',
});

export const CiliumEndpoint = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: true,
  kind: 'CiliumEndpoint',
  singularName: 'CiliumEndpoint',
  pluralName: 'ciliumendpoints',
});

export const CiliumIdentity = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: false,
  kind: 'CiliumIdentity',
  singularName: 'CiliumIdentity',
  pluralName: 'ciliumidentities',
});

export const CiliumNode = makeCustomResourceClass({
  apiInfo: [{ group: ciliumGroup, version: ciliumV2Version }],
  isNamespaced: false,
  kind: 'CiliumNode',
  singularName: 'CiliumNode',
  pluralName: 'ciliumnodes',
});

export * from './types';

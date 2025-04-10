(function(i,r){typeof exports=="object"&&typeof module<"u"?r(require("react/jsx-runtime"),require("@kinvolk/headlamp-plugin/lib"),require("@kinvolk/headlamp-plugin/lib/CommonComponents"),require("@kinvolk/headlamp-plugin/lib/K8s/crd"),require("react-router-dom")):typeof define=="function"&&define.amd?define(["react/jsx-runtime","@kinvolk/headlamp-plugin/lib","@kinvolk/headlamp-plugin/lib/CommonComponents","@kinvolk/headlamp-plugin/lib/K8s/crd","react-router-dom"],r):(i=typeof globalThis<"u"?globalThis:i||self,r(i.pluginLib.ReactJSX,i.pluginLib,i.pluginLib.CommonComponents,i.pluginLib.Crd,i.pluginLib.ReactRouter))})(this,function(i,r,o,c,P){"use strict";const d="cilium.io",m="v2",N=c.makeCustomResourceClass({apiInfo:[{group:d,version:m}],isNamespaced:!0,singularName:"CiliumNetworkPolicy",pluralName:"ciliumnetworkpolicies"}),k=c.makeCustomResourceClass({apiInfo:[{group:d,version:m}],isNamespaced:!1,singularName:"CiliumClusterwideNetworkPolicy",pluralName:"ciliumclusterwidenetworkpolicies"}),L=c.makeCustomResourceClass({apiInfo:[{group:d,version:m}],isNamespaced:!0,singularName:"CiliumEndpoint",pluralName:"ciliumendpoints"}),_=c.makeCustomResourceClass({apiInfo:[{group:d,version:m}],isNamespaced:!1,singularName:"CiliumIdentity",pluralName:"ciliumidentities"}),f=c.makeCustomResourceClass({apiInfo:[{group:d,version:m}],isNamespaced:!1,singularName:"CiliumNode",pluralName:"ciliumnodes"});function p({resourceClass:n,titlePrefix:e}){var y;const t=P.useParams(),{name:s,namespace:a}=t,[u,T]=n.useGet(s,a);if(T)return i.jsxs("div",{children:["Error loading ",e,": ",T.message]});if(!u)return i.jsx(o.Loader,{title:`Loading ${e} details...`});const M=((y=u==null?void 0:u.metadata)==null?void 0:y.name)||s;return i.jsxs(i.Fragment,{children:[i.jsx(o.MainInfoSection,{resource:u,title:`${e}: ${M}`}),i.jsx(o.SectionBox,{title:"Raw YAML",children:i.jsx("pre",{children:JSON.stringify((u==null?void 0:u.jsonData)||{},null,2)})})]})}function S(){return i.jsx(p,{resourceClass:N,titlePrefix:"Network Policy"})}function b(){return i.jsx(p,{resourceClass:k,titlePrefix:"Clusterwide Network Policy"})}function O(){return i.jsx(p,{resourceClass:L,titlePrefix:"Endpoint"})}function R(){return i.jsx(p,{resourceClass:_,titlePrefix:"Identity"})}function U(){return i.jsx(p,{resourceClass:f,titlePrefix:"Node"})}const l="cilium",I="ciliumnetworkpolicies",h="ciliumnetworkpolicy",g="ciliumclusterwidenetworkpolicies",D="ciliumclusterwidenetworkpolicy",C="ciliumendpoints",x="ciliumendpoint",w="ciliumidentities",v="ciliumidentity",E="ciliumnodes",V="ciliumnode";r.registerSidebarEntry({parent:null,name:l,label:"Cilium",icon:"mdi:hexagon-multiple-outline"}),r.registerSidebarEntry({parent:l,name:I,label:"Network Policies",url:"/cilium/networkpolicies"}),r.registerSidebarEntry({parent:l,name:g,label:"Clusterwide Policies",url:"/cilium/clusterwidenetworkpolicies"}),r.registerSidebarEntry({parent:l,name:C,label:"Endpoints",url:"/cilium/endpoints"}),r.registerSidebarEntry({parent:l,name:w,label:"Identities",url:"/cilium/identities"}),r.registerSidebarEntry({parent:l,name:E,label:"Nodes",url:"/cilium/nodes"}),r.registerRoute({path:"/cilium/networkpolicies",sidebar:I,name:I,exact:!0,component:()=>i.jsx(o.ResourceListView,{title:"Cilium Network Policies",resourceClass:N,columns:["name","namespace",{id:"status",label:"Status",getter:n=>{var t,s;const e=(s=(t=n.status)==null?void 0:t.conditions)==null?void 0:s.find(a=>a.type==="Valid");return(e==null?void 0:e.status)||"Unknown"},sort:!0},"age"]})}),r.registerRoute({path:"/cilium/networkpolicies/:namespace/:name",sidebar:I,parent:l,name:h,exact:!0,component:S}),r.registerRoute({path:"/cilium/clusterwidenetworkpolicies",sidebar:g,name:g,exact:!0,component:()=>i.jsx(o.ResourceListView,{title:"Cilium Clusterwide Network Policies",resourceClass:k,columns:["name",{id:"status",label:"Status",getter:n=>{var t,s;const e=(s=(t=n.status)==null?void 0:t.conditions)==null?void 0:s.find(a=>a.type==="Valid");return(e==null?void 0:e.status)||"Unknown"},sort:!0},"age"]})}),r.registerRoute({path:"/cilium/clusterwidenetworkpolicies/:name",sidebar:g,parent:l,name:D,exact:!0,component:b}),r.registerRoute({path:"/cilium/endpoints",sidebar:C,name:C,exact:!0,component:()=>i.jsx(o.ResourceListView,{title:"Cilium Endpoints",resourceClass:L,columns:["name","namespace",{id:"identity",label:"Identity ID",getter:n=>{var e,t;return((t=(e=n.status)==null?void 0:e.identity)==null?void 0:t.id)??"-"},sort:!0},{id:"state",label:"State",getter:n=>{var e;return((e=n.status)==null?void 0:e.state)||"Unknown"},sort:!0},{id:"ipv4",label:"IPv4",getter:n=>{var e,t,s,a;return((a=(s=(t=(e=n.status)==null?void 0:e.networking)==null?void 0:t.addressing)==null?void 0:s[0])==null?void 0:a.ipv4)||"-"}},{id:"ipv6",label:"IPv6",getter:n=>{var e,t,s,a;return((a=(s=(t=(e=n.status)==null?void 0:e.networking)==null?void 0:t.addressing)==null?void 0:s[0])==null?void 0:a.ipv6)||"-"}},"age"]})}),r.registerRoute({path:"/cilium/endpoints/:namespace/:name",sidebar:C,parent:l,name:x,exact:!0,component:O}),r.registerRoute({path:"/cilium/identities",sidebar:w,name:w,exact:!0,component:()=>i.jsx(o.ResourceListView,{title:"Cilium Identities",resourceClass:_,columns:["name",{id:"labels",label:"Security Labels",getter:n=>{var e;return Object.entries(((e=n.jsonData)==null?void 0:e["security-labels"])||{}).map(([t,s])=>`${t}=${s}`).join(", ")}},"age"]})}),r.registerRoute({path:"/cilium/identities/:name",sidebar:w,parent:l,name:v,exact:!0,component:R}),r.registerRoute({path:"/cilium/nodes",sidebar:E,name:E,exact:!0,component:()=>i.jsx(o.ResourceListView,{title:"Cilium Nodes",resourceClass:f,columns:["name",{id:"ciliumInternalIP",label:"Cilium Internal IP",getter:n=>{var e,t,s;return((s=(t=(e=n.spec)==null?void 0:e.addresses)==null?void 0:t.find(a=>a.type==="CiliumInternalIP"))==null?void 0:s.ip)||"-"}},{id:"internalIP",label:"Internal IP",getter:n=>{var e,t,s;return((s=(t=(e=n.spec)==null?void 0:e.addresses)==null?void 0:t.find(a=>a.type==="InternalIP"))==null?void 0:s.ip)||"-"}},"age"]})}),r.registerRoute({path:"/cilium/nodes/:name",sidebar:E,parent:l,name:V,exact:!0,component:U}),console.log("Cilium Plugin registered.")});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2luZGV4LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICByZWdpc3RlclJvdXRlLFxuICByZWdpc3RlclNpZGViYXJFbnRyeSxcbn0gZnJvbSAnQGtpbnZvbGsvaGVhZGxhbXAtcGx1Z2luL2xpYic7XG5pbXBvcnQge1xuICAvLyBDb25kaXRpb25zVGFibGUsIC8vIEtlZXAgZm9yIHBvdGVudGlhbCB1c2UgbGF0ZXJcbiAgTGluayxcbiAgTG9hZGVyLFxuICBNYWluSW5mb1NlY3Rpb24sXG4gIE5hbWVWYWx1ZVRhYmxlLFxuICBSZXNvdXJjZUxpc3RWaWV3LFxuICBTZWN0aW9uQm94LFxuICAvLyBTdGF0dXNMYWJlbCwgLy8gS2VlcCBmb3IgcG90ZW50aWFsIHVzZSBsYXRlclxuICAvLyBUYWJsZSwgLy8gS2VlcCBmb3IgcG90ZW50aWFsIHVzZSBsYXRlclxufSBmcm9tICdAa2ludm9say9oZWFkbGFtcC1wbHVnaW4vbGliL0NvbW1vbkNvbXBvbmVudHMnO1xuaW1wb3J0IHsgS3ViZU9iamVjdEludGVyZmFjZSB9IGZyb20gJ0BraW52b2xrL2hlYWRsYW1wLXBsdWdpbi9saWIvSzhzL2NsdXN0ZXInO1xuaW1wb3J0IHsgbWFrZUN1c3RvbVJlc291cmNlQ2xhc3MgfSBmcm9tICdAa2ludm9say9oZWFkbGFtcC1wbHVnaW4vbGliL0s4cy9jcmQnO1xuLy8gaW1wb3J0IHsgQm94LCBUYWIsIFRhYnMsIFR5cG9ncmFwaHkgfSBmcm9tICdAbXVpL21hdGVyaWFsJzsgLy8gS2VlcCBmb3IgcG90ZW50aWFsIHVzZSBsYXRlclxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVBhcmFtcyB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuXG4vLyAtLS0gRGVmaW5lIENpbGl1bSBSZXNvdXJjZSBDbGFzc2VzIC0tLVxuY29uc3QgY2lsaXVtR3JvdXAgPSAnY2lsaXVtLmlvJztcbmNvbnN0IGNpbGl1bVYyVmVyc2lvbiA9ICd2Mic7XG4vLyBjb25zdCBjaWxpdW1WMkFscGhhMVZlcnNpb24gPSAndjJhbHBoYTEnOyAvLyBGb3IgQ1JEcyBub3QgeWV0IGluIHYyXG5cbmNvbnN0IENpbGl1bU5ldHdvcmtQb2xpY3kgPSBtYWtlQ3VzdG9tUmVzb3VyY2VDbGFzcyh7XG4gIGFwaUluZm86IFt7IGdyb3VwOiBjaWxpdW1Hcm91cCwgdmVyc2lvbjogY2lsaXVtVjJWZXJzaW9uIH1dLFxuICBpc05hbWVzcGFjZWQ6IHRydWUsXG4gIHNpbmd1bGFyTmFtZTogJ0NpbGl1bU5ldHdvcmtQb2xpY3knLFxuICBwbHVyYWxOYW1lOiAnY2lsaXVtbmV0d29ya3BvbGljaWVzJyxcbn0pO1xuXG5jb25zdCBDaWxpdW1DbHVzdGVyd2lkZU5ldHdvcmtQb2xpY3kgPSBtYWtlQ3VzdG9tUmVzb3VyY2VDbGFzcyh7XG4gIGFwaUluZm86IFt7IGdyb3VwOiBjaWxpdW1Hcm91cCwgdmVyc2lvbjogY2lsaXVtVjJWZXJzaW9uIH1dLFxuICBpc05hbWVzcGFjZWQ6IGZhbHNlLCAvLyBDbHVzdGVyLXNjb3BlZFxuICBzaW5ndWxhck5hbWU6ICdDaWxpdW1DbHVzdGVyd2lkZU5ldHdvcmtQb2xpY3knLFxuICBwbHVyYWxOYW1lOiAnY2lsaXVtY2x1c3RlcndpZGVuZXR3b3JrcG9saWNpZXMnLFxufSk7XG5cbmNvbnN0IENpbGl1bUVuZHBvaW50ID0gbWFrZUN1c3RvbVJlc291cmNlQ2xhc3Moe1xuICBhcGlJbmZvOiBbeyBncm91cDogY2lsaXVtR3JvdXAsIHZlcnNpb246IGNpbGl1bVYyVmVyc2lvbiB9XSxcbiAgaXNOYW1lc3BhY2VkOiB0cnVlLFxuICBzaW5ndWxhck5hbWU6ICdDaWxpdW1FbmRwb2ludCcsXG4gIHBsdXJhbE5hbWU6ICdjaWxpdW1lbmRwb2ludHMnLFxufSk7XG5cbmNvbnN0IENpbGl1bUlkZW50aXR5ID0gbWFrZUN1c3RvbVJlc291cmNlQ2xhc3Moe1xuICBhcGlJbmZvOiBbeyBncm91cDogY2lsaXVtR3JvdXAsIHZlcnNpb246IGNpbGl1bVYyVmVyc2lvbiB9XSxcbiAgaXNOYW1lc3BhY2VkOiBmYWxzZSwgLy8gQ2x1c3Rlci1zY29wZWRcbiAgc2luZ3VsYXJOYW1lOiAnQ2lsaXVtSWRlbnRpdHknLFxuICBwbHVyYWxOYW1lOiAnY2lsaXVtaWRlbnRpdGllcycsXG59KTtcblxuY29uc3QgQ2lsaXVtTm9kZSA9IG1ha2VDdXN0b21SZXNvdXJjZUNsYXNzKHtcbiAgYXBpSW5mbzogW3sgZ3JvdXA6IGNpbGl1bUdyb3VwLCB2ZXJzaW9uOiBjaWxpdW1WMlZlcnNpb24gfV0sXG4gIGlzTmFtZXNwYWNlZDogZmFsc2UsIC8vIENsdXN0ZXItc2NvcGVkXG4gIHNpbmd1bGFyTmFtZTogJ0NpbGl1bU5vZGUnLFxuICBwbHVyYWxOYW1lOiAnY2lsaXVtbm9kZXMnLFxufSk7XG5cbi8vIEFkZCBvdGhlciBDUkRzIGxpa2UgQ2lsaXVtQ0lEUkdyb3VwLCBDaWxpdW1FeHRlcm5hbFdvcmtsb2FkIGxhdGVyIGlmIG5lZWRlZFxuXG4vLyAtLS0gUGxhY2Vob2xkZXIgRGV0YWlsIFZpZXcgQ29tcG9uZW50cyAtLS1cblxuZnVuY3Rpb24gUGxhY2Vob2xkZXJEZXRhaWxzVmlldyh7IHJlc291cmNlQ2xhc3MsIHRpdGxlUHJlZml4IH06IHsgcmVzb3VyY2VDbGFzczogYW55LCB0aXRsZVByZWZpeDogc3RyaW5nIH0pIHtcbiAgLy8gVXNlIHVzZVBhcmFtcyB0eXBlIGJhc2VkIG9uIHdoZXRoZXIgdGhlIHJlc291cmNlIGlzIG5hbWVzcGFjZWRcbiAgY29uc3QgcGFyYW1zID0gdXNlUGFyYW1zPHsgbmFtZXNwYWNlPzogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfT4oKTtcbiAgY29uc3QgeyBuYW1lLCBuYW1lc3BhY2UgfSA9IHBhcmFtcztcblxuICBjb25zdCBbaXRlbSwgZXJyb3JdID0gcmVzb3VyY2VDbGFzcy51c2VHZXQobmFtZSwgbmFtZXNwYWNlKTsgLy8gbmFtZXNwYWNlIG1pZ2h0IGJlIHVuZGVmaW5lZCBmb3IgY2x1c3Rlci1zY29wZWRcblxuICBpZiAoZXJyb3IpIHtcbiAgICAvLyBAdHMtaWdub3JlIEVycm9yIHR5cGUgaXMgbm90IHdlbGwgZGVmaW5lZFxuICAgIHJldHVybiA8ZGl2PkVycm9yIGxvYWRpbmcge3RpdGxlUHJlZml4fTogeyhlcnJvciBhcyBFcnJvcikubWVzc2FnZX08L2Rpdj47XG4gIH1cbiAgaWYgKCFpdGVtKSB7XG4gICAgcmV0dXJuIDxMb2FkZXIgdGl0bGU9e2BMb2FkaW5nICR7dGl0bGVQcmVmaXh9IGRldGFpbHMuLi5gfSAvPjtcbiAgfVxuXG4gIGNvbnN0IGl0ZW1OYW1lID0gaXRlbT8ubWV0YWRhdGE/Lm5hbWUgfHwgbmFtZTtcblxuICAvLyBCYXNpYyBkZXRhaWxzIGZvciBub3dcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPE1haW5JbmZvU2VjdGlvblxuICAgICAgICByZXNvdXJjZT17aXRlbX1cbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUaXRsZSBwcm9wIHdvcmtzIGJ1dCBtaWdodCBzaG93IFRTIGVycm9yIGRlcGVuZGluZyBvbiBIZWFkbGFtcCB2ZXJzaW9uXG4gICAgICAgIHRpdGxlPXtgJHt0aXRsZVByZWZpeH06ICR7aXRlbU5hbWV9YH1cbiAgICAgICAgLy8gYWN0aW9ucz17WyAvKiBBZGQgQWN0aW9ucyBIZXJlICovIF19XG4gICAgICAvPlxuICAgICAgPFNlY3Rpb25Cb3ggdGl0bGU9XCJSYXcgWUFNTFwiPlxuICAgICAgICA8cHJlPntKU09OLnN0cmluZ2lmeShpdGVtPy5qc29uRGF0YSB8fCB7fSwgbnVsbCwgMil9PC9wcmU+XG4gICAgICA8L1NlY3Rpb25Cb3g+XG4gICAgICB7LyogQWRkIG1vcmUgc2VjdGlvbnMgbGF0ZXIgKi99XG4gICAgPC8+XG4gICk7XG59XG5cbmZ1bmN0aW9uIENpbGl1bU5ldHdvcmtQb2xpY3lEZXRhaWxzVmlldygpIHtcbiAgcmV0dXJuIDxQbGFjZWhvbGRlckRldGFpbHNWaWV3IHJlc291cmNlQ2xhc3M9e0NpbGl1bU5ldHdvcmtQb2xpY3l9IHRpdGxlUHJlZml4PVwiTmV0d29yayBQb2xpY3lcIiAvPjtcbn1cblxuZnVuY3Rpb24gQ2lsaXVtQ2x1c3RlcndpZGVOZXR3b3JrUG9saWN5RGV0YWlsc1ZpZXcoKSB7XG4gIHJldHVybiA8UGxhY2Vob2xkZXJEZXRhaWxzVmlldyByZXNvdXJjZUNsYXNzPXtDaWxpdW1DbHVzdGVyd2lkZU5ldHdvcmtQb2xpY3l9IHRpdGxlUHJlZml4PVwiQ2x1c3RlcndpZGUgTmV0d29yayBQb2xpY3lcIiAvPjtcbn1cblxuZnVuY3Rpb24gQ2lsaXVtRW5kcG9pbnREZXRhaWxzVmlldygpIHtcbiAgcmV0dXJuIDxQbGFjZWhvbGRlckRldGFpbHNWaWV3IHJlc291cmNlQ2xhc3M9e0NpbGl1bUVuZHBvaW50fSB0aXRsZVByZWZpeD1cIkVuZHBvaW50XCIgLz47XG59XG5cbmZ1bmN0aW9uIENpbGl1bUlkZW50aXR5RGV0YWlsc1ZpZXcoKSB7XG4gIHJldHVybiA8UGxhY2Vob2xkZXJEZXRhaWxzVmlldyByZXNvdXJjZUNsYXNzPXtDaWxpdW1JZGVudGl0eX0gdGl0bGVQcmVmaXg9XCJJZGVudGl0eVwiIC8+O1xufVxuXG5mdW5jdGlvbiBDaWxpdW1Ob2RlRGV0YWlsc1ZpZXcoKSB7XG4gIHJldHVybiA8UGxhY2Vob2xkZXJEZXRhaWxzVmlldyByZXNvdXJjZUNsYXNzPXtDaWxpdW1Ob2RlfSB0aXRsZVByZWZpeD1cIk5vZGVcIiAvPjtcbn1cblxuXG4vLyAtLS0gRGVmaW5lIHJvdXRlIGFuZCBzaWRlYmFyIG5hbWVzIC0tLVxuY29uc3QgQ0lMSVVNX1JPT1RfU0lERUJBUiA9ICdjaWxpdW0nO1xuY29uc3QgQ0lMSVVNX05FVFdPUktfUE9MSUNJRVNfTElTVF9ST1VURSA9ICdjaWxpdW1uZXR3b3JrcG9saWNpZXMnO1xuY29uc3QgQ0lMSVVNX05FVFdPUktfUE9MSUNZX0RFVEFJTFNfUk9VVEUgPSAnY2lsaXVtbmV0d29ya3BvbGljeSc7XG5jb25zdCBDSUxJVU1fQ0xVU1RFUldJREVfTkVUV09SS19QT0xJQ0lFU19MSVNUX1JPVVRFID0gJ2NpbGl1bWNsdXN0ZXJ3aWRlbmV0d29ya3BvbGljaWVzJztcbmNvbnN0IENJTElVTV9DTFVTVEVSV0lERV9ORVRXT1JLX1BPTElDWV9ERVRBSUxTX1JPVVRFID0gJ2NpbGl1bWNsdXN0ZXJ3aWRlbmV0d29ya3BvbGljeSc7XG5jb25zdCBDSUxJVU1fRU5EUE9JTlRTX0xJU1RfUk9VVEUgPSAnY2lsaXVtZW5kcG9pbnRzJztcbmNvbnN0IENJTElVTV9FTkRQT0lOVF9ERVRBSUxTX1JPVVRFID0gJ2NpbGl1bWVuZHBvaW50JztcbmNvbnN0IENJTElVTV9JREVOVElUSUVTX0xJU1RfUk9VVEUgPSAnY2lsaXVtaWRlbnRpdGllcyc7XG5jb25zdCBDSUxJVU1fSURFTlRJVFlfREVUQUlMU19ST1VURSA9ICdjaWxpdW1pZGVudGl0eSc7XG5jb25zdCBDSUxJVU1fTk9ERVNfTElTVF9ST1VURSA9ICdjaWxpdW1ub2Rlcyc7XG5jb25zdCBDSUxJVU1fTk9ERV9ERVRBSUxTX1JPVVRFID0gJ2NpbGl1bW5vZGUnO1xuXG4vLyAtLS0gUmVnaXN0ZXIgU2lkZWJhciBFbnRyaWVzIC0tLVxuXG5yZWdpc3RlclNpZGViYXJFbnRyeSh7XG4gIHBhcmVudDogbnVsbCwgLy8gVG9wLWxldmVsIGVudHJ5XG4gIG5hbWU6IENJTElVTV9ST09UX1NJREVCQVIsXG4gIGxhYmVsOiAnQ2lsaXVtJyxcbiAgaWNvbjogJ21kaTpoZXhhZ29uLW11bHRpcGxlLW91dGxpbmUnLCAvLyBFeGFtcGxlIGljb24gKGZpbmQgYmV0dGVyIGxhdGVyPykgaHR0cHM6Ly9pY29uLXNldHMuaWNvbmlmeS5kZXNpZ24vbWRpL1xufSk7XG5cbnJlZ2lzdGVyU2lkZWJhckVudHJ5KHtcbiAgcGFyZW50OiBDSUxJVU1fUk9PVF9TSURFQkFSLFxuICBuYW1lOiBDSUxJVU1fTkVUV09SS19QT0xJQ0lFU19MSVNUX1JPVVRFLFxuICBsYWJlbDogJ05ldHdvcmsgUG9saWNpZXMnLFxuICB1cmw6ICcvY2lsaXVtL25ldHdvcmtwb2xpY2llcycsXG59KTtcblxucmVnaXN0ZXJTaWRlYmFyRW50cnkoe1xuICBwYXJlbnQ6IENJTElVTV9ST09UX1NJREVCQVIsXG4gIG5hbWU6IENJTElVTV9DTFVTVEVSV0lERV9ORVRXT1JLX1BPTElDSUVTX0xJU1RfUk9VVEUsXG4gIGxhYmVsOiAnQ2x1c3RlcndpZGUgUG9saWNpZXMnLFxuICB1cmw6ICcvY2lsaXVtL2NsdXN0ZXJ3aWRlbmV0d29ya3BvbGljaWVzJyxcbn0pO1xuXG5yZWdpc3RlclNpZGViYXJFbnRyeSh7XG4gIHBhcmVudDogQ0lMSVVNX1JPT1RfU0lERUJBUixcbiAgbmFtZTogQ0lMSVVNX0VORFBPSU5UU19MSVNUX1JPVVRFLFxuICBsYWJlbDogJ0VuZHBvaW50cycsXG4gIHVybDogJy9jaWxpdW0vZW5kcG9pbnRzJyxcbn0pO1xuXG5yZWdpc3RlclNpZGViYXJFbnRyeSh7XG4gIHBhcmVudDogQ0lMSVVNX1JPT1RfU0lERUJBUixcbiAgbmFtZTogQ0lMSVVNX0lERU5USVRJRVNfTElTVF9ST1VURSxcbiAgbGFiZWw6ICdJZGVudGl0aWVzJyxcbiAgdXJsOiAnL2NpbGl1bS9pZGVudGl0aWVzJyxcbn0pO1xuXG5yZWdpc3RlclNpZGViYXJFbnRyeSh7XG4gIHBhcmVudDogQ0lMSVVNX1JPT1RfU0lERUJBUixcbiAgbmFtZTogQ0lMSVVNX05PREVTX0xJU1RfUk9VVEUsXG4gIGxhYmVsOiAnTm9kZXMnLFxuICB1cmw6ICcvY2lsaXVtL25vZGVzJyxcbn0pO1xuXG5cbi8vIC0tLSBSZWdpc3RlciBSb3V0ZXMgYW5kIENvbXBvbmVudHMgLS0tXG5cbi8vIENpbGl1bU5ldHdvcmtQb2xpY3kgTGlzdCBWaWV3XG5yZWdpc3RlclJvdXRlKHtcbiAgcGF0aDogJy9jaWxpdW0vbmV0d29ya3BvbGljaWVzJyxcbiAgc2lkZWJhcjogQ0lMSVVNX05FVFdPUktfUE9MSUNJRVNfTElTVF9ST1VURSxcbiAgbmFtZTogQ0lMSVVNX05FVFdPUktfUE9MSUNJRVNfTElTVF9ST1VURSxcbiAgZXhhY3Q6IHRydWUsXG4gIGNvbXBvbmVudDogKCkgPT4gKFxuICAgIDxSZXNvdXJjZUxpc3RWaWV3XG4gICAgICB0aXRsZT1cIkNpbGl1bSBOZXR3b3JrIFBvbGljaWVzXCJcbiAgICAgIHJlc291cmNlQ2xhc3M9e0NpbGl1bU5ldHdvcmtQb2xpY3l9XG4gICAgICBjb2x1bW5zPXtbXG4gICAgICAgICduYW1lJyxcbiAgICAgICAgJ25hbWVzcGFjZScsXG4gICAgICAgIC8vIEJhc2ljIHN0YXR1cyBjaGVjayAtIG5lZWRzIHJlZmluZW1lbnQgYmFzZWQgb24gYWN0dWFsIHN0YXR1cyBzdHJ1Y3R1cmVcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdzdGF0dXMnLFxuICAgICAgICAgICAgbGFiZWw6ICdTdGF0dXMnLFxuICAgICAgICAgICAgZ2V0dGVyOiAocG9saWN5OiBLdWJlT2JqZWN0SW50ZXJmYWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gRXhhbXBsZTogY2hlY2sgZm9yIGEgJ1ZhbGlkJyBjb25kaXRpb24gdHlwZVxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkQ29uZGl0aW9uID0gcG9saWN5LnN0YXR1cz8uY29uZGl0aW9ucz8uZmluZCgoYzogYW55KSA9PiBjLnR5cGUgPT09ICdWYWxpZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxpZENvbmRpdGlvbj8uc3RhdHVzIHx8ICdVbmtub3duJztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzb3J0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAnYWdlJyxcbiAgICAgIF19XG4gICAgLz5cbiAgKSxcbn0pO1xuXG4vLyBDaWxpdW1OZXR3b3JrUG9saWN5IERldGFpbCBWaWV3XG5yZWdpc3RlclJvdXRlKHtcbiAgcGF0aDogJy9jaWxpdW0vbmV0d29ya3BvbGljaWVzLzpuYW1lc3BhY2UvOm5hbWUnLFxuICBzaWRlYmFyOiBDSUxJVU1fTkVUV09SS19QT0xJQ0lFU19MSVNUX1JPVVRFLFxuICBwYXJlbnQ6IENJTElVTV9ST09UX1NJREVCQVIsXG4gIG5hbWU6IENJTElVTV9ORVRXT1JLX1BPTElDWV9ERVRBSUxTX1JPVVRFLFxuICBleGFjdDogdHJ1ZSxcbiAgY29tcG9uZW50OiBDaWxpdW1OZXR3b3JrUG9saWN5RGV0YWlsc1ZpZXcsXG59KTtcblxuLy8gQ2lsaXVtQ2x1c3RlcndpZGVOZXR3b3JrUG9saWN5IExpc3QgVmlld1xucmVnaXN0ZXJSb3V0ZSh7XG4gIHBhdGg6ICcvY2lsaXVtL2NsdXN0ZXJ3aWRlbmV0d29ya3BvbGljaWVzJyxcbiAgc2lkZWJhcjogQ0lMSVVNX0NMVVNURVJXSURFX05FVFdPUktfUE9MSUNJRVNfTElTVF9ST1VURSxcbiAgbmFtZTogQ0lMSVVNX0NMVVNURVJXSURFX05FVFdPUktfUE9MSUNJRVNfTElTVF9ST1VURSxcbiAgZXhhY3Q6IHRydWUsXG4gIGNvbXBvbmVudDogKCkgPT4gKFxuICAgIDxSZXNvdXJjZUxpc3RWaWV3XG4gICAgICB0aXRsZT1cIkNpbGl1bSBDbHVzdGVyd2lkZSBOZXR3b3JrIFBvbGljaWVzXCJcbiAgICAgIHJlc291cmNlQ2xhc3M9e0NpbGl1bUNsdXN0ZXJ3aWRlTmV0d29ya1BvbGljeX1cbiAgICAgIGNvbHVtbnM9e1tcbiAgICAgICAgJ25hbWUnLFxuICAgICAgICAvLyBCYXNpYyBzdGF0dXMgY2hlY2sgLSBuZWVkcyByZWZpbmVtZW50IGJhc2VkIG9uIGFjdHVhbCBzdGF0dXMgc3RydWN0dXJlXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnc3RhdHVzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnU3RhdHVzJyxcbiAgICAgICAgICAgIGdldHRlcjogKHBvbGljeTogS3ViZU9iamVjdEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkQ29uZGl0aW9uID0gcG9saWN5LnN0YXR1cz8uY29uZGl0aW9ucz8uZmluZCgoYzogYW55KSA9PiBjLnR5cGUgPT09ICdWYWxpZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxpZENvbmRpdGlvbj8uc3RhdHVzIHx8ICdVbmtub3duJztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzb3J0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAnYWdlJyxcbiAgICAgIF19XG4gICAgLz5cbiAgKSxcbn0pO1xuXG4vLyBDaWxpdW1DbHVzdGVyd2lkZU5ldHdvcmtQb2xpY3kgRGV0YWlsIFZpZXdcbnJlZ2lzdGVyUm91dGUoe1xuICBwYXRoOiAnL2NpbGl1bS9jbHVzdGVyd2lkZW5ldHdvcmtwb2xpY2llcy86bmFtZScsIC8vIE5vIG5hbWVzcGFjZSBmb3IgY2x1c3Rlci1zY29wZWRcbiAgc2lkZWJhcjogQ0lMSVVNX0NMVVNURVJXSURFX05FVFdPUktfUE9MSUNJRVNfTElTVF9ST1VURSxcbiAgcGFyZW50OiBDSUxJVU1fUk9PVF9TSURFQkFSLFxuICBuYW1lOiBDSUxJVU1fQ0xVU1RFUldJREVfTkVUV09SS19QT0xJQ1lfREVUQUlMU19ST1VURSxcbiAgZXhhY3Q6IHRydWUsXG4gIGNvbXBvbmVudDogQ2lsaXVtQ2x1c3RlcndpZGVOZXR3b3JrUG9saWN5RGV0YWlsc1ZpZXcsXG59KTtcblxuLy8gQ2lsaXVtRW5kcG9pbnQgTGlzdCBWaWV3XG5yZWdpc3RlclJvdXRlKHtcbiAgcGF0aDogJy9jaWxpdW0vZW5kcG9pbnRzJyxcbiAgc2lkZWJhcjogQ0lMSVVNX0VORFBPSU5UU19MSVNUX1JPVVRFLFxuICBuYW1lOiBDSUxJVU1fRU5EUE9JTlRTX0xJU1RfUk9VVEUsXG4gIGV4YWN0OiB0cnVlLFxuICBjb21wb25lbnQ6ICgpID0+IChcbiAgICA8UmVzb3VyY2VMaXN0Vmlld1xuICAgICAgdGl0bGU9XCJDaWxpdW0gRW5kcG9pbnRzXCJcbiAgICAgIHJlc291cmNlQ2xhc3M9e0NpbGl1bUVuZHBvaW50fVxuICAgICAgY29sdW1ucz17W1xuICAgICAgICAnbmFtZScsXG4gICAgICAgICduYW1lc3BhY2UnLFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2lkZW50aXR5JyxcbiAgICAgICAgICAgIGxhYmVsOiAnSWRlbnRpdHkgSUQnLFxuICAgICAgICAgICAgZ2V0dGVyOiAoZW5kcG9pbnQ6IEt1YmVPYmplY3RJbnRlcmZhY2UpID0+IGVuZHBvaW50LnN0YXR1cz8uaWRlbnRpdHk/LmlkID8/ICctJyxcbiAgICAgICAgICAgIHNvcnQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnc3RhdGUnLFxuICAgICAgICAgICAgbGFiZWw6ICdTdGF0ZScsXG4gICAgICAgICAgICBnZXR0ZXI6IChlbmRwb2ludDogS3ViZU9iamVjdEludGVyZmFjZSkgPT4gZW5kcG9pbnQuc3RhdHVzPy5zdGF0ZSB8fCAnVW5rbm93bicsXG4gICAgICAgICAgICBzb3J0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2lwdjQnLFxuICAgICAgICAgICAgbGFiZWw6ICdJUHY0JyxcbiAgICAgICAgICAgIGdldHRlcjogKGVuZHBvaW50OiBLdWJlT2JqZWN0SW50ZXJmYWNlKSA9PiBlbmRwb2ludC5zdGF0dXM/Lm5ldHdvcmtpbmc/LmFkZHJlc3Npbmc/LlswXT8uaXB2NCB8fCAnLScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnaXB2NicsXG4gICAgICAgICAgICBsYWJlbDogJ0lQdjYnLFxuICAgICAgICAgICAgZ2V0dGVyOiAoZW5kcG9pbnQ6IEt1YmVPYmplY3RJbnRlcmZhY2UpID0+IGVuZHBvaW50LnN0YXR1cz8ubmV0d29ya2luZz8uYWRkcmVzc2luZz8uWzBdPy5pcHY2IHx8ICctJyxcbiAgICAgICAgfSxcbiAgICAgICAgJ2FnZScsXG4gICAgICBdfVxuICAgIC8+XG4gICksXG59KTtcblxuLy8gQ2lsaXVtRW5kcG9pbnQgRGV0YWlsIFZpZXdcbnJlZ2lzdGVyUm91dGUoe1xuICBwYXRoOiAnL2NpbGl1bS9lbmRwb2ludHMvOm5hbWVzcGFjZS86bmFtZScsXG4gIHNpZGViYXI6IENJTElVTV9FTkRQT0lOVFNfTElTVF9ST1VURSxcbiAgcGFyZW50OiBDSUxJVU1fUk9PVF9TSURFQkFSLFxuICBuYW1lOiBDSUxJVU1fRU5EUE9JTlRfREVUQUlMU19ST1VURSxcbiAgZXhhY3Q6IHRydWUsXG4gIGNvbXBvbmVudDogQ2lsaXVtRW5kcG9pbnREZXRhaWxzVmlldyxcbn0pO1xuXG4vLyBDaWxpdW1JZGVudGl0eSBMaXN0IFZpZXdcbnJlZ2lzdGVyUm91dGUoe1xuICBwYXRoOiAnL2NpbGl1bS9pZGVudGl0aWVzJyxcbiAgc2lkZWJhcjogQ0lMSVVNX0lERU5USVRJRVNfTElTVF9ST1VURSxcbiAgbmFtZTogQ0lMSVVNX0lERU5USVRJRVNfTElTVF9ST1VURSxcbiAgZXhhY3Q6IHRydWUsXG4gIGNvbXBvbmVudDogKCkgPT4gKFxuICAgIDxSZXNvdXJjZUxpc3RWaWV3XG4gICAgICB0aXRsZT1cIkNpbGl1bSBJZGVudGl0aWVzXCJcbiAgICAgIHJlc291cmNlQ2xhc3M9e0NpbGl1bUlkZW50aXR5fVxuICAgICAgY29sdW1ucz17W1xuICAgICAgICAnbmFtZScsIC8vIElkZW50aXR5IElEIGlzIHRoZSBuYW1lXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnbGFiZWxzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnU2VjdXJpdHkgTGFiZWxzJyxcbiAgICAgICAgICAgIC8vIFNpbXBsZSBqb2luIGZvciBub3csIGNvdWxkIGJlIGltcHJvdmVkXG4gICAgICAgICAgICBnZXR0ZXI6IChpZGVudGl0eTogS3ViZU9iamVjdEludGVyZmFjZSkgPT4gT2JqZWN0LmVudHJpZXMoaWRlbnRpdHkuanNvbkRhdGE/Llsnc2VjdXJpdHktbGFiZWxzJ10gfHwge30pLm1hcCgoW2ssdl0pID0+IGAke2t9PSR7dn1gKS5qb2luKCcsICcpLFxuICAgICAgICB9LFxuICAgICAgICAnYWdlJyxcbiAgICAgIF19XG4gICAgLz5cbiAgKSxcbn0pO1xuXG4vLyBDaWxpdW1JZGVudGl0eSBEZXRhaWwgVmlld1xucmVnaXN0ZXJSb3V0ZSh7XG4gIHBhdGg6ICcvY2lsaXVtL2lkZW50aXRpZXMvOm5hbWUnLCAvLyBObyBuYW1lc3BhY2UgZm9yIGNsdXN0ZXItc2NvcGVkXG4gIHNpZGViYXI6IENJTElVTV9JREVOVElUSUVTX0xJU1RfUk9VVEUsXG4gIHBhcmVudDogQ0lMSVVNX1JPT1RfU0lERUJBUixcbiAgbmFtZTogQ0lMSVVNX0lERU5USVRZX0RFVEFJTFNfUk9VVEUsXG4gIGV4YWN0OiB0cnVlLFxuICBjb21wb25lbnQ6IENpbGl1bUlkZW50aXR5RGV0YWlsc1ZpZXcsXG59KTtcblxuLy8gQ2lsaXVtTm9kZSBMaXN0IFZpZXdcbnJlZ2lzdGVyUm91dGUoe1xuICBwYXRoOiAnL2NpbGl1bS9ub2RlcycsXG4gIHNpZGViYXI6IENJTElVTV9OT0RFU19MSVNUX1JPVVRFLFxuICBuYW1lOiBDSUxJVU1fTk9ERVNfTElTVF9ST1VURSxcbiAgZXhhY3Q6IHRydWUsXG4gIGNvbXBvbmVudDogKCkgPT4gKFxuICAgIDxSZXNvdXJjZUxpc3RWaWV3XG4gICAgICB0aXRsZT1cIkNpbGl1bSBOb2Rlc1wiXG4gICAgICByZXNvdXJjZUNsYXNzPXtDaWxpdW1Ob2RlfVxuICAgICAgY29sdW1ucz17W1xuICAgICAgICAnbmFtZScsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnY2lsaXVtSW50ZXJuYWxJUCcsXG4gICAgICAgICAgICBsYWJlbDogJ0NpbGl1bSBJbnRlcm5hbCBJUCcsXG4gICAgICAgICAgICBnZXR0ZXI6IChub2RlOiBLdWJlT2JqZWN0SW50ZXJmYWNlKSA9PiBub2RlLnNwZWM/LmFkZHJlc3Nlcz8uZmluZCgoYTogYW55KSA9PiBhLnR5cGUgPT09ICdDaWxpdW1JbnRlcm5hbElQJyk/LmlwIHx8ICctJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdpbnRlcm5hbElQJyxcbiAgICAgICAgICAgIGxhYmVsOiAnSW50ZXJuYWwgSVAnLFxuICAgICAgICAgICAgZ2V0dGVyOiAobm9kZTogS3ViZU9iamVjdEludGVyZmFjZSkgPT4gbm9kZS5zcGVjPy5hZGRyZXNzZXM/LmZpbmQoKGE6IGFueSkgPT4gYS50eXBlID09PSAnSW50ZXJuYWxJUCcpPy5pcCB8fCAnLScsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIEFkZCBub2RlIHN0YXR1cyBsYXRlciBpZiBuZWVkZWRcbiAgICAgICAgJ2FnZScsXG4gICAgICBdfVxuICAgIC8+XG4gICksXG59KTtcblxuLy8gQ2lsaXVtTm9kZSBEZXRhaWwgVmlld1xucmVnaXN0ZXJSb3V0ZSh7XG4gIHBhdGg6ICcvY2lsaXVtL25vZGVzLzpuYW1lJywgLy8gTm8gbmFtZXNwYWNlIGZvciBjbHVzdGVyLXNjb3BlZFxuICBzaWRlYmFyOiBDSUxJVU1fTk9ERVNfTElTVF9ST1VURSxcbiAgcGFyZW50OiBDSUxJVU1fUk9PVF9TSURFQkFSLFxuICBuYW1lOiBDSUxJVU1fTk9ERV9ERVRBSUxTX1JPVVRFLFxuICBleGFjdDogdHJ1ZSxcbiAgY29tcG9uZW50OiBDaWxpdW1Ob2RlRGV0YWlsc1ZpZXcsXG59KTtcblxuXG5jb25zb2xlLmxvZygnQ2lsaXVtIFBsdWdpbiByZWdpc3RlcmVkLicpO1xuXG4vLyBObyBQbHVnaW4gY2xhc3MgaW5pdGlhbGl6YXRpb24gbmVlZGVkIGZvciB0aGlzIGJhc2ljIHNldHVwXG4iXSwibmFtZXMiOlsiY2lsaXVtR3JvdXAiLCJjaWxpdW1WMlZlcnNpb24iLCJDaWxpdW1OZXR3b3JrUG9saWN5IiwibWFrZUN1c3RvbVJlc291cmNlQ2xhc3MiLCJDaWxpdW1DbHVzdGVyd2lkZU5ldHdvcmtQb2xpY3kiLCJDaWxpdW1FbmRwb2ludCIsIkNpbGl1bUlkZW50aXR5IiwiQ2lsaXVtTm9kZSIsIlBsYWNlaG9sZGVyRGV0YWlsc1ZpZXciLCJyZXNvdXJjZUNsYXNzIiwidGl0bGVQcmVmaXgiLCJwYXJhbXMiLCJ1c2VQYXJhbXMiLCJuYW1lIiwibmFtZXNwYWNlIiwiaXRlbSIsImVycm9yIiwianN4IiwiTG9hZGVyIiwiaXRlbU5hbWUiLCJfYSIsImpzeHMiLCJGcmFnbWVudCIsIk1haW5JbmZvU2VjdGlvbiIsIlNlY3Rpb25Cb3giLCJDaWxpdW1OZXR3b3JrUG9saWN5RGV0YWlsc1ZpZXciLCJDaWxpdW1DbHVzdGVyd2lkZU5ldHdvcmtQb2xpY3lEZXRhaWxzVmlldyIsIkNpbGl1bUVuZHBvaW50RGV0YWlsc1ZpZXciLCJDaWxpdW1JZGVudGl0eURldGFpbHNWaWV3IiwiQ2lsaXVtTm9kZURldGFpbHNWaWV3IiwiQ0lMSVVNX1JPT1RfU0lERUJBUiIsIkNJTElVTV9ORVRXT1JLX1BPTElDSUVTX0xJU1RfUk9VVEUiLCJDSUxJVU1fTkVUV09SS19QT0xJQ1lfREVUQUlMU19ST1VURSIsIkNJTElVTV9DTFVTVEVSV0lERV9ORVRXT1JLX1BPTElDSUVTX0xJU1RfUk9VVEUiLCJDSUxJVU1fQ0xVU1RFUldJREVfTkVUV09SS19QT0xJQ1lfREVUQUlMU19ST1VURSIsIkNJTElVTV9FTkRQT0lOVFNfTElTVF9ST1VURSIsIkNJTElVTV9FTkRQT0lOVF9ERVRBSUxTX1JPVVRFIiwiQ0lMSVVNX0lERU5USVRJRVNfTElTVF9ST1VURSIsIkNJTElVTV9JREVOVElUWV9ERVRBSUxTX1JPVVRFIiwiQ0lMSVVNX05PREVTX0xJU1RfUk9VVEUiLCJDSUxJVU1fTk9ERV9ERVRBSUxTX1JPVVRFIiwicmVnaXN0ZXJTaWRlYmFyRW50cnkiLCJyZWdpc3RlclJvdXRlIiwiUmVzb3VyY2VMaXN0VmlldyIsInBvbGljeSIsInZhbGlkQ29uZGl0aW9uIiwiX2IiLCJjIiwiZW5kcG9pbnQiLCJfZCIsIl9jIiwiaWRlbnRpdHkiLCJrIiwidiIsIm5vZGUiXSwibWFwcGluZ3MiOiJxcEJBc0JBLE1BQU1BLEVBQWMsWUFDZEMsRUFBa0IsS0FHbEJDLEVBQXNCQyxFQUFBQSx3QkFBd0IsQ0FDbEQsUUFBUyxDQUFDLENBQUUsTUFBT0gsRUFBYSxRQUFTQyxFQUFpQixFQUMxRCxhQUFjLEdBQ2QsYUFBYyxzQkFDZCxXQUFZLHVCQUNkLENBQUMsRUFFS0csRUFB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

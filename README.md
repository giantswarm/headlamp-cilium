# Headlamp Cilium Plugin

This plugin integrates [Cilium](https://cilium.io/), a cloud-native networking, observability, and security solution, into the [Headlamp](https://headlamp.dev/) UI. It provides visibility into your Cilium resources directly within Headlamp.

## Overview

Cilium provides eBPF-based networking, security, and observability. Managing and monitoring its components (Network Policies, Endpoints, Identities, Nodes, etc.) often involves `kubectl` or the Cilium CLI. This Headlamp plugin aims to bring essential Cilium resource details and status directly into your primary Kubernetes dashboard, streamlining workflows.

## Features

This plugin provides list and detail views for the following Cilium resources:

*   **CiliumNetworkPolicies (CNP):** List and detail views with condition-derived, colored policy status and per-rule ingress/egress breakdown.
*   **CiliumClusterwideNetworkPolicies (CCNP):** List and detail views, same status handling as CNP.
*   **CiliumEndpoints (CEP):** List and detail views showing status, identity, networking details, and policy enforcement status.
*   **CiliumIdentities:** List and detail views showing security and Kubernetes labels.
*   **CiliumNodes:** List and detail views showing node addressing, IPAM status (as tables), and health.

Additional CRDs (e.g. CiliumExternalWorkloads, CiliumCIDRGroups) may be added in the future.

## Prerequisites

*   **Headlamp:** You need a running instance of Headlamp (either the desktop app or deployed in-cluster).
*   **Cilium:** Cilium must be installed and running in the Kubernetes cluster that Headlamp is connected to. Cilium CRDs must be present in the cluster.

## Installation

### Desktop App (Recommended)

1.  Navigate to the "Plugins" section in Headlamp.
2.  Find the "Cilium" plugin in the catalog. *(Note: This assumes the plugin is published to a catalog Headlamp uses)*.
3.  Click "Install".
4.  Reload Headlamp when prompted.

### Desktop App (Manual)

1.  Build the plugin (`npm run build`) to get the `main.js` file (and potentially other assets in the `dist` directory).
2.  Create the plugin directory structure:
    *   **Linux:** `~/.config/Headlamp/plugins/headlamp-cilium/`
    *   **macOS:** `~/Library/Application Support/Headlamp/plugins/headlamp-cilium/`
    *   **Windows:** `%APPDATA%\Headlamp\config\plugins\headlamp-cilium\`
3.  Copy the contents of the plugin's `dist` folder (including `main.js`) and the `package.json` file into the `headlamp-cilium` directory created above.
4.  Restart Headlamp.

### In-Cluster Deployment

To use this plugin in an in-cluster Headlamp deployment, you need an initContainer to copy the plugin files into a shared volume mounted by the main Headlamp container.

Modify your Headlamp Helm `values.yaml` or Deployment manifest:

```yaml
# Example using Helm values.yaml
# Add this under the main 'headlamp' deployment configuration

initContainers:
  - name: init-cilium-plugin
    image: gsoci.azurecr.io/giantswarm/headlamp-cilium:0.1.0 # use the latest release tag
    imagePullPolicy: Always
    command:
      - /bin/sh
      - -c
      - |
        echo "Copying Cilium plugin..."
        # Target directory MUST match the plugin name in package.json
        PLUGIN_TARGET_DIR="/headlamp/plugins/headlamp-cilium"
        mkdir -p "$PLUGIN_TARGET_DIR"
        # Source path inside the plugin image (based on Dockerfile below)
        cp -r /plugins/headlamp-cilium/* "$PLUGIN_TARGET_DIR/"
        echo "Cilium plugin copied."
    volumeMounts:
      - name: plugins # Must match the volume name used by the main Headlamp container
        mountPath: /headlamp/plugins

# Ensure the corresponding volumeMount is also present in the main Headlamp container
# spec:
#   template:
#     spec:
#       containers:
#       - name: headlamp
#         image: ghcr.io/headlamp-k8s/headlamp:latest # Official Headlamp image
#         volumeMounts:
#         - name: plugins
#           mountPath: /headlamp/plugins
#         # ... other headlamp container config ...
#       volumes:
#       - name: plugins
#         emptyDir: {}
```
*(See Advanced section below for building the plugin-files image)*

## Usage

Once installed and Headlamp is connected to a cluster with Cilium running:

1.  Look for the **Cilium** entry in the main sidebar menu on the left.
2.  Click on it to expand the sub-menu containing Network Policies, Clusterwide Policies, Endpoints, Identities, and Nodes.
3.  Navigate through the different list and detail views.

## Advanced: Building a Plugin-Files Image

You can build a container image containing just the built plugin files (`dist/` and `package.json`). Use the `Dockerfile` provided in this repository.

1.  **Build the plugin bundle:** the Dockerfile only copies a prebuilt `dist/`, so build it first:
    ```bash
    npm run ci:build
    ```
2.  **Build the image:** Run from the repository root:
    ```bash
    docker build -t ghcr.io/your-org/headlamp-cilium:my-tag .
    ```
    (Replace `your-org` and `my-tag`).

3.  **Push the image:** (If needed for your cluster)
    ```bash
    docker push ghcr.io/your-org/headlamp-cilium:my-tag
    ```
This image can now be referenced in an initContainer as shown above. Official images are published to `gsoci.azurecr.io/giantswarm/headlamp-cilium` on every release by the CircleCI pipeline.

## Development

1.  Clone the repository.
2.  `cd headlamp-cilium`
3.  `npm install --legacy-peer-deps`
4.  `npm run start`
5.  Run Headlamp desktop and point it to load plugins from the appropriate directory, or manually copy build artifacts.

### Source layout

*   `src/index.tsx` -- registration only (sidebar entries + routes).
*   `src/resources/` -- typed `makeCustomResourceClass` definitions and CRD TypeScript interfaces.
*   `src/components/` -- list and detail views, one file per resource.
*   `src/utils/` -- shared helpers (status mapping, selector/port/CIDR formatting).

### Checks

*   `npm run lint` -- ESLint.
*   `npm run tsc` -- type check.
*   `npm test` -- unit tests.
*   `npm run storybook` -- component stories.
*   `npm run build` -- produce `dist/` for packaging.

## Contributing / Feedback

Please file issues or pull requests on the GitHub repository.

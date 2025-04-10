# Headlamp Cilium Plugin

This plugin integrates [Cilium](https://cilium.io/), a cloud-native networking, observability, and security solution, into the [Headlamp](https://headlamp.dev/) UI. It provides visibility into your Cilium resources directly within Headlamp.

## Overview

Cilium provides eBPF-based networking, security, and observability. Managing and monitoring its components (Network Policies, Endpoints, Identities, Nodes, etc.) often involves `kubectl` or the Cilium CLI. This Headlamp plugin aims to bring essential Cilium resource details and status directly into your primary Kubernetes dashboard, streamlining workflows.

## Features (Planned)

This plugin aims to support viewing the following Cilium resources:

*   **CiliumNetworkPolicies (CNP):** List view and detailed view.
*   **CiliumClusterwideNetworkPolicies (CCNP):** List view and detailed view.
*   **CiliumEndpoints (CEP):** List view and detailed view showing status, identity, networking details, and policy enforcement status.
*   **CiliumIdentities:** List view and detailed view showing security labels.
*   **CiliumNodes:** List view and detailed view showing node addressing, IPAM status, and health.
*   *(Potentially others like CiliumExternalWorkloads, CiliumCIDRGroups, etc. in the future)*

*Note: Detail views are currently basic placeholders showing raw YAML.*

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
    # Replace with your built plugin image (e.g., ghcr.io/your-org/headlamp-cilium:latest)
    image: ghcr.io/your-org/headlamp-cilium:latest
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

1.  **Build the image:** Run from the repository root:
    ```bash
    docker build -t ghcr.io/your-org/headlamp-cilium:my-tag .
    ```
    (Replace `your-org` and `my-tag`).

2.  **Push the image:** (If needed for your cluster)
    ```bash
    docker push ghcr.io/your-org/headlamp-cilium:my-tag
    ```
This image can now be referenced in an initContainer as shown above. A CI workflow (`.github/workflows/ci.yml`) is included as an example for automating this.

## Development

1.  Clone the repository.
2.  `cd headlamp-cilium`
3.  `npm install`
4.  `npm run start`
5.  Run Headlamp desktop and point it to load plugins from the appropriate directory, or manually copy build artifacts.

## Contributing / Feedback

Please file issues or pull requests on the GitHub repository.

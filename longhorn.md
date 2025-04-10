Directory structure:
└── headlamp-longhorn/
    ├── README.md
    ├── Dockerfile
    ├── LICENSE
    ├── package.json
    ├── tsconfig.json
    ├── docs/
    │   └── README.md
    ├── src/
    │   ├── headlamp-plugin.d.ts
    │   └── index.tsx
    └── .github/
        └── workflows/
            └── ci.yml

================================================
File: README.md
================================================
# Headlamp Longhorn Plugin

This plugin integrates [Longhorn](https://longhorn.io/), a cloud-native distributed block storage system for Kubernetes, into the [Headlamp](https://headlamp.dev/) UI. It provides visibility into your Longhorn storage resources directly within Headlamp.

## Overview

Longhorn provides persistent storage for Kubernetes workloads, but managing and monitoring its components (Volumes, Nodes, Backups, etc.) often requires using the separate Longhorn UI or `kubectl`. This Headlamp plugin aims to bring essential Longhorn resource details and status directly into your primary Kubernetes dashboard, streamlining storage management workflows.

## Features

This plugin currently supports viewing the following Longhorn resources:

*   **Volumes:** List view and detailed view showing status, configuration, Kubernetes PV/PVC links, and conditions.
*   **Nodes:** List view and detailed view displaying status (Ready, Schedulable), configuration, attached disk details (including status and specs in a table), and conditions.
*   **Settings:** A grouped view (categorized based on Longhorn documentation) displaying current setting values and their applied status.
*   **Backups:** List view and detailed view showing state, snapshot info, target, size, timestamps, labels, and error messages.
*   **Engine Images:** List view and detailed view displaying state, image reference, version details, node deployment status, and conditions.

## Prerequisites

*   **Headlamp:** You need a running instance of Headlamp (either the desktop app or deployed in-cluster).
*   **Longhorn:** Longhorn must be installed and running in the Kubernetes cluster that Headlamp is connected to.

## Installation

### Desktop App (Recommended)

1.  Navigate to the "Plugins" section in Headlamp.
2.  Find the "Longhorn" plugin in the catalog. *(Note: This assumes the plugin is published to a catalog Headlamp uses)*.
3.  Click "Install".
4.  Reload Headlamp when prompted.

### Desktop App (Manual)

1.  [Build the plugin](./DEVELOPMENT.md#building-for-production) to get the `main.js` file (and potentially other assets in the `dist` directory).
2.  Create the plugin directory structure:
    *   **Linux:** `~/.config/Headlamp/plugins/headlamp-longhorn/`
    *   **macOS:** `~/Library/Application Support/Headlamp/plugins/headlamp-longhorn/`
    *   **Windows:** `%APPDATA%\Headlamp\config\plugins\headlamp-longhorn\`
3.  Copy the contents of the plugin's `dist` folder (including `main.js`) and the `package.json` file into the `headlamp-longhorn` directory created above.
4.  Restart Headlamp.

### In-Cluster Deployment

To use this plugin in an in-cluster Headlamp deployment (when using the official Headlamp image), you need an initContainer to copy the plugin files into a shared volume mounted by the main Headlamp container.

If you followed the steps in "Advanced: Building a Plugin-Files Image" below, you can use your built image. Modify your Headlamp Helm `values.yaml` or Deployment manifest:

```yaml
# Example using Helm values.yaml
# Add this under the main 'headlamp' deployment configuration

initContainers:
  - name: init-longhorn-plugin # Changed name slightly
    # Use the image containing your built plugin files
    # Ensure this image name matches the one you built/is built by CI
    image: ghcr.io/giantswarm/headlamp-longhorn:latest 
    imagePullPolicy: Always
    command:
      - /bin/sh
      - -c
      - |
        echo "Copying Longhorn plugin..."
        # The target directory name MUST match how Headlamp expects to find the plugin
        PLUGIN_TARGET_DIR="/headlamp/plugins/headlamp-longhorn"
        mkdir -p "$PLUGIN_TARGET_DIR"
        # Adjust source path inside the plugin image if necessary (should be /plugins/headlamp-longhorn based on Dockerfile)
        cp -r /plugins/headlamp-longhorn/* "$PLUGIN_TARGET_DIR/"
        echo "Longhorn plugin copied."
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

## Usage

Once installed and Headlamp is connected to a cluster with Longhorn running:

1.  Look for the **Longhorn** entry in the main sidebar menu on the left.
2.  Click on it to expand the sub-menu containing Volumes, Nodes, Settings, Backups, and Engine Images.
3.  Navigate through the different list and detail views.

## Advanced: Building a Plugin-Files Image

Instead of installing the plugin manually, you can build a container image that contains just the necessary files for this plugin (`dist/` directory and `package.json`). This image can then be used with an initContainer (as shown in the In-Cluster Deployment section) to copy the plugin into your main Headlamp deployment.

1.  **Create a Dockerfile:** Place the following `Dockerfile` in the root of the `headlamp-longhorn` plugin directory:

    ```dockerfile
    # Dockerfile
    # Stage 1: Build the headlamp-longhorn plugin
    FROM node:20-alpine as builder

    # Set the working directory
    WORKDIR /plugin

    # Copy package files and install dependencies
    COPY package*.json ./
    RUN npm install

    # Copy the rest of the plugin source code
    COPY . .

    # Build the plugin using the headlamp-plugin tool
    # This creates the necessary files in the /plugin/dist directory
    RUN npm run build

    # Stage 2: Create the final image containing only the built plugin artifacts
    FROM alpine:latest

    # Create the directory structure expected by Headlamp (/plugins/<plugin-folder-name>)
    # Using 'headlamp-longhorn' as the folder name based on repo/directory structure
    RUN mkdir -p /plugins/headlamp-longhorn

    # Copy the built plugin files (dist/) and package.json from the builder stage
    COPY --from=builder /plugin/dist/ /plugins/headlamp-longhorn/
    COPY --from=builder /plugin/package.json /plugins/headlamp-longhorn/

    # Optional: Set permissions if needed, though typically handled by volume mounts/Headlamp itself
    # RUN chown -R <someuser>:<somegroup> /plugins

    # No CMD or ENTRYPOINT needed, this image just holds files.
    ```

2.  **Build the image:** Run this command from the root of the `headlamp-longhorn` plugin directory:

    ```bash
    # Build the image containing only the plugin files
    docker build -t ghcr.io/giantswarm/headlamp-longhorn:my-tag .
    ```
    (Replace `my-tag` with your desired image tag, e.g., `latest` or a version number).

3.  **Push the image:** (If needed for your cluster)
    ```bash
    # Push the image containing only the plugin files
    docker push ghcr.io/giantswarm/headlamp-longhorn:my-tag
    ```

This image can now be referenced in an initContainer as shown in the In-Cluster Deployment section.

**Note:** An image containing just the plugin files is automatically built and pushed to `ghcr.io/giantswarm/headlamp-longhorn` by a [GitHub Actions workflow](.github/workflows/ci.yml) whenever changes are pushed to the `main` branch or a version tag (e.g., `v1.x.x`) is created.

## Development

To run this plugin locally during development:

1.  Clone the repository.
2.  Navigate to the plugin directory (`cd headlamp-longhorn`).
3.  Install dependencies: `npm install`
4.  Start the development server: `npm run start`
5.  Ensure Headlamp (desktop app recommended for development) is running and configured to load plugins from the appropriate directory or that you manually copy the built files to its plugin directory.

## Contributing / Feedback

Encountered a bug or have a feature request? Please file an issue on the [GitHub repository](https://github.com/giantswarm/headlamp-longhorn).



================================================
File: Dockerfile
================================================
# Dockerfile
# Stage 1: Build the headlamp-longhorn plugin
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /plugin

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the plugin source code
COPY . .

# Build the plugin using the headlamp-plugin tool
# This creates the necessary files in the /plugin/dist directory
RUN npm run build

# Stage 2: Create the final image containing only the built plugin artifacts
FROM alpine:latest

# Create the directory structure expected by Headlamp (/plugins/<plugin-folder-name>)
# Using 'headlamp-longhorn' as the folder name based on repo/directory structure
RUN mkdir -p /plugins/headlamp-longhorn

# Copy the built plugin files (dist/) and package.json from the builder stage
COPY --from=builder /plugin/dist/ /plugins/headlamp-longhorn/
COPY --from=builder /plugin/package.json /plugins/headlamp-longhorn/

# Optional: Set permissions if needed, though typically handled by volume mounts/Headlamp itself
# RUN chown -R <someuser>:<somegroup> /plugins

# No CMD or ENTRYPOINT needed, this image just holds files. 


================================================
File: LICENSE
================================================
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.



================================================
File: package.json
================================================
{
  "name": "headlamp-longhorn",
  "version": "0.1.0",
  "description": "Your Headlamp plugin",
  "scripts": {
    "start": "headlamp-plugin start",
    "build": "headlamp-plugin build",
    "format": "headlamp-plugin format",
    "lint": "headlamp-plugin lint",
    "lint-fix": "headlamp-plugin lint --fix",
    "package": "headlamp-plugin package",
    "tsc": "headlamp-plugin tsc",
    "storybook": "headlamp-plugin storybook",
    "storybook-build": "headlamp-plugin storybook-build",
    "test": "headlamp-plugin test"
  },
  "keywords": [
    "headlamp",
    "headlamp-plugin",
    "kubernetes",
    "kubernetes-ui",
    "kubernetes-debugging",
    "plugins"
  ],
  "prettier": "@headlamp-k8s/eslint-config/prettier-config",
  "eslintConfig": {
    "extends": [
      "@headlamp-k8s",
      "prettier",
      "plugin:jsx-a11y/recommended"
    ]
  },
  "overrides": {
    "typescript": "5.6.2"
  },
  "devDependencies": {
    "@kinvolk/headlamp-plugin": "^0.11.4",
    "typedoc": "^0.28.2",
    "typedoc-plugin-markdown": "^4.6.2"
  }
}



================================================
File: tsconfig.json
================================================
{
  "extends": "./node_modules/@kinvolk/headlamp-plugin/config/plugins-tsconfig.json",
  "include": ["./src/**/*"]
}



================================================
File: docs/README.md
================================================
**headlamp-longhorn**

***

# headlamp-longhorn

This is the default template README for [Headlamp Plugins](https://github.com/headlamp-k8s/headlamp).

- The description of your plugin should go here.
- You should also edit the package.json file meta data (like name and description).

## Developing Headlamp plugins

For more information on developing Headlamp plugins, please refer to:

- [Getting Started](https://headlamp.dev/docs/latest/development/plugins/), How to create a new Headlamp plugin.
- [API Reference](https://headlamp.dev/docs/latest/development/api/), API documentation for what you can do
- [UI Component Storybook](https://headlamp.dev/docs/latest/development/frontend/#storybook), pre-existing components you can use when creating your plugin.
- [Plugin Examples](https://github.com/headlamp-k8s/headlamp/tree/main/plugins/examples), Example plugins you can look at to see how it's done.



================================================
File: src/headlamp-plugin.d.ts
================================================
/// <reference types="@kinvolk/headlamp-plugin" />



================================================
File: src/index.tsx
================================================
import {
  registerRoute,
  registerSidebarEntry,
  // Plugin, // Uncomment if you need Plugin class features
} from '@kinvolk/headlamp-plugin/lib';
import {
  ConditionsTable,
  Link,
  Loader,
  MainInfoSection,
  NameValueTable,
  ResourceListView,
  SectionBox,
  StatusLabel,
  Table,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/K8s/crd';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';

// Define functions that return the Longhorn Resource Classes
const longhornGroup = 'longhorn.io';
const longhornVersion = 'v1beta2'; // Using v1beta2 as defined in CRDs

const LonghornVolume = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  singularName: 'Volume',
  pluralName: 'volumes',
});

const LonghornNode = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true, // Assuming Nodes are namespaced based on CRD, adjust if cluster-scoped
  singularName: 'Node',
  pluralName: 'nodes',
});

const LonghornSetting = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true, // Settings CRD scope is Namespaced
  singularName: 'Setting',
  pluralName: 'settings',
});

const LonghornBackup = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true,
  singularName: 'Backup',
  pluralName: 'backups',
});

const LonghornEngineImage = makeCustomResourceClass({
  apiInfo: [{ group: longhornGroup, version: longhornVersion }],
  isNamespaced: true, // EngineImage CRD scope is Namespaced
  singularName: 'EngineImage',
  pluralName: 'engineimages',
});

// Define Detail View Wrapper Components
function VolumeDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornVolume.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading volume: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  // Restore original rendering
  const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};
  const { kubernetesStatus = {} } = status;

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore Title prop works but might show TS error depending on Headlamp version
        title={`Volume: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: status.state || '-' },
          { name: 'Robustness', value: status.robustness || '-' },
          {
            name: 'Node',
            value: status.currentNodeID ? (
              <Link
                routeName="node"
                params={{
                  name: status.currentNodeID,
                  namespace: namespace,
                }}
              >
                {status.currentNodeID}
              </Link>
            ) : (
              '-'
            ),
          },
          { name: 'Size', value: spec.size || '-' },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Status Details">
        <NameValueTable
          rows={[
            { name: 'Actual Size', value: status.actualSize || '-' },
            { name: 'Frontend Disabled', value: String(status.frontendDisabled) },
            { name: 'Is Standby', value: String(status.isStandby) },
            { name: 'Share Endpoint', value: status.shareEndpoint || '-' },
            { name: 'Share State', value: status.shareState || '-' },
            { name: 'Last Backup', value: status.lastBackup || '-' },
            { name: 'Last Backup At', value: status.lastBackupAt || '-' },
            { name: 'Expansion Required', value: String(status.expansionRequired) },
            { name: 'Restore Required', value: String(status.restoreRequired) },
            { name: 'Restore Initiated', value: String(status.restoreInitiated) },
          ]}
        />
      </SectionBox>
      <SectionBox title="Configuration">
        <NameValueTable
          rows={[
            { name: 'Data Engine', value: spec.dataEngine || '-' },
            { name: 'Frontend', value: spec.frontend || '-' },
            { name: 'Number of Replicas', value: spec.numberOfReplicas || '-' },
            { name: 'Data Locality', value: spec.dataLocality || '-' },
            { name: 'Access Mode', value: spec.accessMode || '-' },
            { name: 'Backing Image', value: spec.backingImage || '-' },
            { name: 'Stale Replica Timeout', value: spec.staleReplicaTimeout || '-' },
            { name: 'Encrypted', value: String(spec.encrypted) },
            { name: 'Engine Image', value: spec.image || '-' }, // Engine image used
            { name: 'From Backup', value: spec.fromBackup || '-' },
            { name: 'Disk Selector', value: spec.diskSelector?.join(', ') || '-' },
            { name: 'Node Selector', value: spec.nodeSelector?.join(', ') || '-' },
            { name: 'Disable Revision Counter', value: String(spec.revisionCounterDisabled) },
            { name: 'Replica Auto Balance', value: spec.replicaAutoBalance || '-' },
            { name: 'Unmap Mark SnapChain Removed', value: spec.unmapMarkSnapChainRemoved || '-' },
            { name: 'Snapshot Data Integrity', value: spec.snapshotDataIntegrity || '-' },
            {
              name: 'Freeze Filesystem For Snapshot',
              value: spec.freezeFilesystemForSnapshot || '-',
            },
            { name: 'Backup Target', value: spec.backupTargetName || '-' },
            { name: 'Backup Compression Method', value: spec.backupCompressionMethod || '-' },
          ]}
        />
      </SectionBox>
      <SectionBox title="Kubernetes Status">
        <NameValueTable
          rows={[
            { name: 'Namespace', value: kubernetesStatus.namespace || '-' },
            { name: 'PVC Name', value: kubernetesStatus.pvcName || '-' },
            { name: 'PV Name', value: kubernetesStatus.pvName || '-' },
            { name: 'PV Status', value: kubernetesStatus.pvStatus || '-' },
            { name: 'Last PVCRef At', value: kubernetesStatus.lastPVCRefAt || '-' },
            { name: 'Last PodRef At', value: kubernetesStatus.lastPodRefAt || '-' },
            // TODO: Consider rendering workloadsStatus as a small table if needed
          ]}
        />
      </SectionBox>
      <SectionBox title="Conditions">
        <ConditionsTable resource={item.jsonData} />
      </SectionBox>
      {/* TODO: Add sections for Replicas, Snapshots, etc. linking to respective views if applicable */}
    </>
  );
}

// Define interfaces for Disk Spec and Status (simplified)
interface DiskSpec {
  path?: string;
  diskType?: string;
  allowScheduling?: boolean;
  tags?: string[];
  // Add other spec fields if needed
}

interface DiskStatus {
  diskName?: string;
  diskUUID?: string;
  diskPath?: string;
  diskType?: string;
  storageAvailable?: number | string;
  storageScheduled?: number | string;
  storageMaximum?: number | string;
  conditions?: any[];
  // Add other status fields if needed
}

// Define the Disk Table Component
function NodeDiskTable({ specDisks, statusDisks }: { specDisks: any; statusDisks: any }) {
  const disksData = React.useMemo(() => {
    if (!statusDisks) return [];

    // Create a map from spec disk name to spec for easier lookup
    const specMapByName: { [key: string]: DiskSpec } = {};
    for (const [name, spec] of Object.entries(specDisks || {}) as [string, DiskSpec][]) {
      specMapByName[name] = spec;
    }

    // Combine status and spec based on status.diskName matching the spec key
    return (Object.entries(statusDisks) as [string, DiskStatus][]).map(([uuid, status]) => {
      const matchingSpec: DiskSpec = (status.diskName && specMapByName[status.diskName]) || {};
      // Use status.diskUUID if available, otherwise fallback to the key from the map
      const actualUuid = status.diskUUID || uuid;
      return { uuid: actualUuid, spec: matchingSpec, status };
    });
  }, [specDisks, statusDisks]);

  return (
    <Table
      data={disksData}
      columns={[
        // Use status.diskName as the primary identifier
        {
          header: 'Name',
          accessorFn: (item: { status: DiskStatus }) => item.status?.diskName || '-',
        },
        { header: 'UUID', accessorKey: 'uuid' },
        {
          header: 'Path',
          accessorFn: (item: { status: DiskStatus; spec: DiskSpec }) =>
            item.status?.diskPath || item.spec?.path || '-',
        },
        {
          header: 'Type',
          accessorFn: (item: { status: DiskStatus; spec: DiskSpec }) =>
            item.status?.diskType || item.spec?.diskType || '-',
        },
        {
          header: 'Allow Scheduling',
          accessorFn: (item: { spec: DiskSpec }) => String(item.spec?.allowScheduling ?? '-'),
        },
        {
          header: 'Storage Available',
          // Display raw bytes for now
          accessorFn: (item: { status: DiskStatus }) => item.status?.storageAvailable || '-',
        },
        {
          header: 'Storage Scheduled',
          // Display raw bytes for now
          accessorFn: (item: { status: DiskStatus }) => item.status?.storageScheduled || '-',
        },
        {
          header: 'Storage Maximum',
          // Display raw bytes for now
          accessorFn: (item: { status: DiskStatus }) => item.status?.storageMaximum || '-',
        },
        {
          header: 'Tags',
          accessorFn: (item: { spec: DiskSpec }) => item.spec?.tags?.join(', ') || '-',
        },
        {
          header: 'Status',
          accessorFn: (item: { status: DiskStatus }) => {
            const readyCondition = item.status?.conditions?.find(c => c.type === 'Ready');
            return (
              <StatusLabel status={readyCondition?.status === 'True' ? 'success' : 'error'}>
                {readyCondition?.status || 'Unknown'}
              </StatusLabel>
            );
          },
        },
      ]}
    />
  );
}

function NodeDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornNode.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading node: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};
  const conditions = status.conditions || [];
  const readyCondition = conditions.find((c: any) => c.type === 'Ready');
  const schedulableCondition = conditions.find((c: any) => c.type === 'Schedulable');

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`Node: ${metadata.name}`}
        extraInfo={[
          {
            name: 'Ready',
            value: (
              <StatusLabel status={readyCondition?.status === 'True' ? 'success' : 'error'}>
                {readyCondition?.status || 'Unknown'}
              </StatusLabel>
            ),
          },
          {
            name: 'Schedulable',
            value: (
              <StatusLabel status={schedulableCondition?.status === 'True' ? 'success' : 'error'}>
                {schedulableCondition?.status || 'Unknown'}
              </StatusLabel>
            ),
          },
          { name: 'Allow Scheduling', value: String(spec.allowScheduling ?? '-') },
          { name: 'Region', value: status.region || '-' },
          { name: 'Zone', value: status.zone || '-' },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Configuration">
        <NameValueTable
          rows={[
            { name: 'Tags', value: spec.tags?.join(', ') || '-' },
            { name: 'Instance Manager CPU Request', value: spec.instanceManagerCPURequest || '-' },
            // TODO: Render disks in a better way, maybe a table?
            { name: 'Disks', value: Object.keys(spec.disks || {}).join(', ') || '-' },
          ]}
        />
      </SectionBox>
      <SectionBox title="Status Details">
        <NameValueTable
          rows={[
            { name: 'Auto Evicting', value: String(status.autoEvicting) },
            {
              name: 'Last Periodic Snapshot Check',
              value: status.snapshotCheckStatus?.lastPeriodicCheckedAt || '-',
            },
            // TODO: Render diskStatus in a better way, maybe a table?
            { name: 'Disk Status', value: Object.keys(status.diskStatus || {}).join(', ') || '-' },
          ]}
        />
      </SectionBox>
      <SectionBox title="Disks">
        <NodeDiskTable specDisks={spec.disks} statusDisks={status.diskStatus} />
      </SectionBox>
      <SectionBox title="Conditions">
        <ConditionsTable resource={item.jsonData} />
      </SectionBox>
    </>
  );
}

function BackupDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornBackup.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading backup: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`Backup: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: status.state || '-' },
          { name: 'Snapshot Name', value: status.snapshotName || '-' },
          { name: 'Backup Target', value: status.backupTargetName || '-' },
          { name: 'Volume Name', value: status.volumeName || '-' },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Details">
        <NameValueTable
          rows={[
            { name: 'Size', value: status.size || '-' },
            { name: 'Newly Uploaded Data', value: status.newlyUploadDataSize || '-' },
            { name: 'Re-Uploaded Data', value: status.reUploadedDataSize || '-' },
            { name: 'Snapshot Created At', value: status.snapshotCreatedAt || '-' },
            { name: 'Backup Created At', value: status.backupCreatedAt || '-' },
            { name: 'Last Synced At', value: status.lastSyncedAt || '-' },
            { name: 'Compression Method', value: status.compressionMethod || '-' },
            { name: 'Volume Size', value: status.volumeSize || '-' },
            { name: 'Volume Created At', value: status.volumeCreated || '-' },
            { name: 'Volume Backing Image', value: status.volumeBackingImageName || '-' },
            { name: 'Progress', value: `${status.progress || 0}%` },
            { name: 'Replica Address', value: status.replicaAddress || '-' },
          ]}
        />
      </SectionBox>
      {spec.labels && (
        <SectionBox title="Spec Labels">
          <NameValueTable
            rows={Object.entries(spec.labels).map(([k, v]) => ({ name: k, value: v as string }))}
          />
        </SectionBox>
      )}
      {status.labels && (
        <SectionBox title="Status Labels">
          <NameValueTable
            rows={Object.entries(status.labels).map(([k, v]) => ({ name: k, value: v as string }))}
          />
        </SectionBox>
      )}
      {status.error && (
        <SectionBox title="Error">
          <pre>{status.error}</pre>
        </SectionBox>
      )}
      {status.messages && (
        <SectionBox title="Messages">
          <NameValueTable
            rows={Object.entries(status.messages).map(([k, v]) => ({
              name: k,
              value: v as string,
            }))}
          />
        </SectionBox>
      )}
    </>
  );
}

function EngineImageDetailsView() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [item, error] = LonghornEngineImage.useGet(name, namespace);

  if (error) {
    // @ts-ignore Error type is not well defined
    return <div>Error loading engine image: {(error as Error).message}</div>;
  }
  if (!item) {
    return <div>Loading...</div>;
  }

  const { spec = {}, status = {}, metadata = {} } = item.jsonData || {};

  return (
    <>
      <MainInfoSection
        resource={item}
        // @ts-ignore
        title={`Engine Image: ${metadata.name}`}
        extraInfo={[
          { name: 'State', value: status.state || '-' },
          { name: 'Image', value: spec.image || '-' },
          { name: 'Ref Count', value: status.refCount ?? '-' },
          { name: 'Build Date', value: status.buildDate || '-' },
          { name: 'Incompatible', value: String(status.incompatible) },
        ]}
        // actions={[ /* Add Actions Here */ ]}
      />
      <SectionBox title="Details">
        <NameValueTable
          rows={[
            { name: 'Version', value: status.version || '-' },
            { name: 'Git Commit', value: status.gitCommit || '-' },
            {
              name: 'CLI API Version',
              value: `${status.cliAPIMinVersion || '?'} - ${status.cliAPIVersion || '?'}`,
            },
            {
              name: 'Controller API Version',
              value: `${status.controllerAPIMinVersion || '?'} - ${
                status.controllerAPIVersion || '?'
              }`,
            },
            {
              name: 'Data Format Version',
              value: `${status.dataFormatMinVersion || '?'} - ${status.dataFormatVersion || '?'}`,
            },
            { name: 'No Ref Since', value: status.noRefSince || '-' },
          ]}
        />
      </SectionBox>
      {status.nodeDeploymentMap && (
        <SectionBox title="Node Deployment Status">
          <NameValueTable
            rows={Object.entries(status.nodeDeploymentMap).map(([node, deployed]) => ({
              name: node,
              // @ts-ignore
              value: String(deployed),
            }))}
          />
        </SectionBox>
      )}
      <SectionBox title="Conditions">
        <ConditionsTable resource={item.jsonData} />
      </SectionBox>
    </>
  );
}

// Define routes and sidebar names as constants
const LONGHORN_ROOT_SIDEBAR = 'longhorn';
const LONGHORN_VOLUMES_LIST_ROUTE = 'volumes';
const LONGHORN_VOLUME_DETAILS_ROUTE = 'volume';
const LONGHORN_NODES_LIST_ROUTE = 'nodes';
const LONGHORN_NODE_DETAILS_ROUTE = 'node';
const LONGHORN_SETTINGS_LIST_ROUTE = 'settings';
// const LONGHORN_SETTING_DETAILS_ROUTE = 'longhornSetting'; // No details view for settings yet
const LONGHORN_BACKUPS_LIST_ROUTE = 'backups';
const LONGHORN_BACKUP_DETAILS_ROUTE = 'backup';
const LONGHORN_ENGINE_IMAGES_LIST_ROUTE = 'engineimages';
const LONGHORN_ENGINE_IMAGE_DETAILS_ROUTE = 'engineimage';

// Register Sidebar Entries

registerSidebarEntry({
  parent: null, // Top-level entry
  name: LONGHORN_ROOT_SIDEBAR,
  label: 'Longhorn',
  icon: 'mdi:cow', // Example icon, find appropriate one at https://icon-sets.iconify.design/mdi/
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_VOLUMES_LIST_ROUTE,
  label: 'Volumes',
  url: '/longhorn/volumes',
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_NODES_LIST_ROUTE,
  label: 'Nodes',
  url: '/longhorn/nodes',
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_SETTINGS_LIST_ROUTE,
  label: 'Settings',
  url: '/longhorn/settings',
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_BACKUPS_LIST_ROUTE,
  label: 'Backups',
  url: '/longhorn/backups',
});

registerSidebarEntry({
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  label: 'Engine Images',
  url: '/longhorn/engineimages',
});

// Register Routes and Components

// Volumes List View
registerRoute({
  path: '/longhorn/volumes',
  sidebar: LONGHORN_VOLUMES_LIST_ROUTE,
  name: LONGHORN_VOLUMES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Volumes"
      resourceClass={LonghornVolume}
      columns={[
        // Rely on default name column rendering
        'name',
        // Other columns... (state, robustness, size, node, namespace, age)
        {
          id: 'state',
          label: 'State',
          getter: (volume: KubeObjectInterface) => volume.jsonData?.status?.state || '-',
          sort: true,
        },
        {
          id: 'robustness',
          label: 'Robustness',
          getter: (volume: KubeObjectInterface) => volume.jsonData?.status?.robustness || '-',
          sort: true,
        },
        {
          id: 'size',
          label: 'Size',
          getter: (volume: KubeObjectInterface) => volume.jsonData?.spec?.size || '-',
          sort: true,
        },
        {
          id: 'node',
          label: 'Node',
          getter: (volume: KubeObjectInterface) => volume.jsonData?.status?.currentNodeID || '-',
          sort: true,
        },
        'namespace',
        'age',
      ]}
    />
  ),
});

// Volume Detail View
registerRoute({
  path: '/longhorn/volumes/:namespace/:name',
  sidebar: LONGHORN_VOLUMES_LIST_ROUTE,
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_VOLUME_DETAILS_ROUTE,
  exact: true,
  component: VolumeDetailsView,
});

// Nodes List View
registerRoute({
  path: '/longhorn/nodes',
  sidebar: LONGHORN_NODES_LIST_ROUTE,
  name: LONGHORN_NODES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Nodes"
      resourceClass={LonghornNode}
      columns={[
        // Use default name column rendering
        'name',
        // Other columns...
        {
          id: 'ready',
          label: 'Ready',
          getter: (node: KubeObjectInterface) =>
            node.jsonData?.status?.conditions?.find((c: any) => c.type === 'Ready')?.status || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'allowScheduling',
          label: 'Allow Scheduling',
          getter: (node: KubeObjectInterface) =>
            (node.jsonData?.spec?.allowScheduling ?? '-').toString(), // Access via jsonData
          sort: true,
        },
        {
          id: 'schedulable',
          label: 'Schedulable',
          getter: (node: KubeObjectInterface) =>
            node.jsonData?.status?.conditions?.find((c: any) => c.type === 'Schedulable')?.status ||
            '-', // Access via jsonData
          sort: true,
        },
        'age',
      ]}
    />
  ),
});

// Node Detail View
registerRoute({
  path: '/longhorn/nodes/:namespace/:name',
  sidebar: LONGHORN_NODES_LIST_ROUTE,
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_NODE_DETAILS_ROUTE,
  exact: true,
  component: NodeDetailsView,
});

// --- Settings View Component ---

// Define categories based on Longhorn docs
const settingCategories: { [key: string]: string } = {
  // General
  'node-drain-policy': 'General',
  'detach-manually-attached-volumes-when-cordoned': 'General',
  'auto-cleanup-system-generated-snapshot': 'General',
  'auto-cleanup-recurring-job-backup-snapshot': 'General',
  'auto-delete-pod-when-volume-detached-unexpectedly': 'General',
  'auto-salvage': 'General',
  'concurrent-automatic-engine-upgrade-per-node-limit': 'General',
  'concurrent-volume-backup-restore-per-node-limit': 'General',
  'create-default-disk-labeled-nodes': 'General',
  'default-data-locality': 'General',
  'default-data-path': 'General',
  'default-engine-image': 'General',
  'default-longhorn-static-storage-class': 'General',
  'default-replica-count': 'General',
  'deleting-confirmation-flag': 'General',
  'disable-revision-counter': 'General',
  'upgrade-checker': 'General',
  'upgrade-responder-url': 'General',
  'latest-longhorn-version': 'General',
  'current-longhorn-version': 'General',
  'allow-collecting-longhorn-usage-metrics': 'General',
  'node-down-pod-deletion-policy': 'General',
  'registry-secret': 'General',
  'replica-replenishment-wait-interval': 'General',
  'system-managed-pods-image-pull-policy': 'General',
  'backing-image-cleanup-wait-interval': 'General',
  'backing-image-recovery-wait-interval': 'General',
  'default-min-number-of-backing-image-copies': 'General',
  'engine-replica-timeout': 'General',
  'support-bundle-manager-image': 'General',
  'support-bundle-failed-history-limit': 'General',
  'support-bundle-node-collection-timeout': 'General',
  'fast-replica-rebuild-enabled': 'General',
  'replica-file-sync-http-client-timeout': 'General',
  'long-grpc-timeout': 'General',
  'rwx-volume-fast-failover': 'General',
  'default-backing-image-manager-image': 'General',
  'default-instance-manager-image': 'General',
  'log-level': 'General',
  'stable-longhorn-versions': 'General',
  'crd-api-version': 'General', // Less user-facing, but put in General

  // Snapshot
  'snapshot-data-integrity': 'Snapshot',
  'snapshot-data-integrity-immediate-check-after-snapshot-creation': 'Snapshot',
  'snapshot-data-integrity-cronjob': 'Snapshot',
  'snapshot-max-count': 'Snapshot',
  'freeze-filesystem-for-snapshot': 'Snapshot',

  // Orphan
  'orphan-auto-deletion': 'Orphan',

  // Backups
  'allow-recurring-job-while-volume-detached': 'Backups',
  'backup-execution-timeout': 'Backups',
  'failed-backup-ttl': 'Backups',
  'recurring-failed-jobs-history-limit': 'Backups',
  'recurring-successful-jobs-history-limit': 'Backups',
  'restore-volume-recurring-jobs': 'Backups',
  'backup-compression-method': 'Backups',
  'backup-concurrent-limit': 'Backups',
  'restore-concurrent-limit': 'Backups',

  // Scheduling
  'allow-volume-creation-with-degraded-availability': 'Scheduling',
  'disable-scheduling-on-cordoned-node': 'Scheduling',
  'replica-soft-anti-affinity': 'Scheduling',
  'replica-zone-soft-anti-affinity': 'Scheduling',
  'replica-disk-soft-anti-affinity': 'Scheduling',
  'replica-auto-balance': 'Scheduling',
  'replica-auto-balance-disk-pressure-percentage': 'Scheduling',
  'storage-minimal-available-percentage': 'Scheduling',
  'storage-over-provisioning-percentage': 'Scheduling',
  'storage-reserved-percentage-for-default-disk': 'Scheduling',
  'allow-empty-node-selector-volume': 'Scheduling',
  'allow-empty-disk-selector-volume': 'Scheduling',

  // Danger Zone
  'concurrent-replica-rebuild-per-node-limit': 'Danger Zone',
  'concurrent-backing-image-replenish-per-node-limit': 'Danger Zone',
  'taint-toleration': 'Danger Zone',
  'priority-class': 'Danger Zone',
  'system-managed-components-node-selector': 'Danger Zone',
  'kubernetes-cluster-autoscaler-enabled': 'Danger Zone',
  'storage-network': 'Danger Zone',
  'storage-network-for-rwx-volume-enabled': 'Danger Zone',
  'remove-snapshots-during-filesystem-trim': 'Danger Zone',
  'guaranteed-instance-manager-cpu': 'Danger Zone',
  'disable-snapshot-purge': 'Danger Zone',
  'auto-cleanup-when-delete-backup': 'Danger Zone',
  'v1-data-engine': 'Danger Zone',
  'v2-data-engine': 'Danger Zone',
  'v2-data-engine-guaranteed-instance-manager-cpu': 'Danger Zone',
  'v2-data-engine-cpu-mask': 'Danger Zone',
  'v2-data-engine-hugepage-limit': 'Danger Zone',
  'v2-data-engine-fast-replica-rebuilding': 'Danger Zone',
  'v2-data-engine-log-flags': 'Danger Zone',
  'v2-data-engine-log-level': 'Danger Zone',
};

function getCategory(settingName: string): string {
  return settingCategories[settingName] || 'Other'; // Default to 'Other' if not found
}

const categoryOrder = [
  'General',
  'Snapshot',
  'Orphan',
  'Backups',
  'Scheduling',
  'Danger Zone',
  'Other',
];

// --- Helper TabPanel Component ---
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setting-tabpanel-${index}`}
      aria-labelledby={`setting-tab-${index}`}
      {...other}
    >
      {value === index && (
        // Add some padding to the panel content
        <Box sx={{ pt: 2, pb: 2 }}>{children}</Box>
      )}
    </div>
  );
}

// Function to generate accessibility props for tabs
function a11yProps(index: number) {
  return {
    id: `setting-tab-${index}`,
    'aria-controls': `setting-tabpanel-${index}`,
  };
}

function SettingsView() {
  const [settings, error] = LonghornSetting.useList();
  // State for the active tab index
  const [activeTab, setActiveTab] = React.useState(0);

  const groupedSettings = React.useMemo(() => {
    if (!settings) return null;

    const groups: { [key: string]: KubeObjectInterface[] } = {};
    settings.forEach(setting => {
      const category = getCategory(setting.metadata.name);
      if (!groups[category]) {
        groups[category] = [];
      }
      // Sort settings alphabetically within each group
      groups[category].push(setting);
      groups[category].sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    });

    // Sort groups according to predefined order
    const sortedGroups: { [key: string]: KubeObjectInterface[] } = {};
    categoryOrder.forEach(category => {
      if (groups[category]) {
        sortedGroups[category] = groups[category];
      }
    });
    // Add any remaining categories (like 'Other') at the end
    Object.keys(groups).forEach(category => {
      if (!sortedGroups[category]) {
        sortedGroups[category] = groups[category];
      }
    });

    return sortedGroups;
  }, [settings]);

  // Handler for changing tabs
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (error) {
    // @ts-ignore Allow error message display
    return (
      <Typography color="error">Error loading settings: {(error as Error).message}</Typography>
    );
  }

  if (!groupedSettings) {
    return <Loader title="Loading Longhorn Settings..." />;
  }

  const categories = Object.keys(groupedSettings);

  return (
    // Use Box as the main container
    <Box sx={{ width: '100%' }}>
      {/* Tab Headers */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Longhorn settings categories"
          variant="scrollable" // Allow tabs to scroll if they overflow
          scrollButtons="auto" // Show scroll buttons automatically
        >
          {categories.map((category, index) => (
            <Tab
              key={category}
              label={`${category} (${groupedSettings[category].length})`}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {categories.map((category, index) => (
        <TabPanel key={category} value={activeTab} index={index}>
          <NameValueTable
            rows={groupedSettings[category].map(setting => ({
              name: setting.metadata.name,
              value: (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    width: '100%',
                  }}
                >
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ wordBreak: 'break-word', flexGrow: 1, mr: 1 }}
                  >
                    {(setting.jsonData.value ?? '-').toString()}
                  </Typography>
                  <Box component="span" sx={{ flexShrink: 0, ml: 1 }}>
                    <StatusLabel status={setting.jsonData.status?.applied ? 'success' : 'error'}>
                      {setting.jsonData.status?.applied ? 'applied' : 'not applied'}
                    </StatusLabel>
                  </Box>
                </Box>
              ),
            }))}
          />
        </TabPanel>
      ))}
    </Box>
  );
}

// Settings List View - Updated to use SettingsView component
registerRoute({
  path: '/longhorn/settings',
  sidebar: LONGHORN_SETTINGS_LIST_ROUTE,
  name: LONGHORN_SETTINGS_LIST_ROUTE,
  exact: true,
  component: SettingsView,
});

// Backups List View
registerRoute({
  path: '/longhorn/backups',
  sidebar: LONGHORN_BACKUPS_LIST_ROUTE,
  name: LONGHORN_BACKUPS_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Backups"
      resourceClass={LonghornBackup}
      columns={[
        // Use default name column rendering
        'name',
        // Other columns...
        {
          id: 'snapshotName',
          label: 'Snapshot Name',
          getter: (backup: KubeObjectInterface) => backup.jsonData?.status?.snapshotName || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'snapshotSize',
          label: 'Snapshot Size',
          getter: (backup: KubeObjectInterface) => backup.jsonData?.status?.size || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'backupTarget',
          label: 'Backup Target',
          getter: (backup: KubeObjectInterface) => backup.jsonData?.status?.backupTargetName || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'state',
          label: 'State',
          getter: (backup: KubeObjectInterface) => backup.jsonData?.status?.state || '-', // Access via jsonData
          sort: true,
        },
        'namespace',
        'age',
      ]}
    />
  ),
});

// Backup Detail View
registerRoute({
  path: '/longhorn/backups/:namespace/:name',
  sidebar: LONGHORN_BACKUPS_LIST_ROUTE,
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_BACKUP_DETAILS_ROUTE,
  exact: true,
  component: BackupDetailsView,
});

// Engine Images List View
registerRoute({
  path: '/longhorn/engineimages',
  sidebar: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  name: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  exact: true,
  component: () => (
    <ResourceListView
      title="Longhorn Engine Images"
      resourceClass={LonghornEngineImage}
      columns={[
        // Use default name column rendering
        'name',
        // Other columns...
        {
          id: 'state',
          label: 'State',
          getter: (img: KubeObjectInterface) => img.jsonData?.status?.state || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'image',
          label: 'Image',
          getter: (img: KubeObjectInterface) => img.jsonData?.spec?.image || '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'refCount',
          label: 'Ref Count',
          getter: (img: KubeObjectInterface) => img.jsonData?.status?.refCount ?? '-', // Access via jsonData
          sort: true,
        },
        {
          id: 'buildDate',
          label: 'Build Date',
          getter: (img: KubeObjectInterface) => img.jsonData?.status?.buildDate || '-', // Access via jsonData
          sort: true,
        },
        'age',
      ]}
    />
  ),
});

// Engine Image Detail View
registerRoute({
  path: '/longhorn/engineimages/:namespace/:name',
  sidebar: LONGHORN_ENGINE_IMAGES_LIST_ROUTE,
  parent: LONGHORN_ROOT_SIDEBAR,
  name: LONGHORN_ENGINE_IMAGE_DETAILS_ROUTE,
  exact: true,
  component: EngineImageDetailsView,
});

// Placeholder for other Longhorn resources can be added similarly
// e.g., Backing Images, Recurring Jobs, Snapshots, etc.

console.log('Longhorn Plugin registered.');

// Example of how you might initialize plugin-specific logic
// class LonghornPlugin extends Plugin {
//   initialize(): boolean {
//     console.log('Longhorn Plugin initializing...');
//     // Add more complex initialization logic here if needed
//     return true;
//   }
// }
// Headlamp.registerPlugin('longhorn-plugin-id', new LonghornPlugin());



================================================
File: .github/workflows/ci.yml
================================================
# .github/workflows/ci.yml
name: Build, Test, and Publish Plugin

on:
  push:
    branches:
      - main # Trigger on push to main branch
    tags:
      - 'v*' # Trigger on version tags like v1.0, v2.1.1, etc.
  pull_request: # Also run checks on pull requests (but don't publish)
    branches:
      - main

env:
  # Define the image name for the plugin files container
  IMAGE_NAME: ghcr.io/giantswarm/headlamp-longhorn

jobs:
  build-test-publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      # Needed to push container image to ghcr.io
      packages: write 

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20' # Or your preferred LTS version
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # --- Run Checks ---
      - name: Lint Plugin
        run: npm run lint

      - name: Check Formatting
        run: npm run format -- --check

      - name: Type Check Plugin
        run: npm run tsc
        
      # - name: Run Tests (Optional)
      #   # Uncomment this if you have tests defined in package.json script "test"
      #   run: npm run test 

      # --- Build Plugin ---
      - name: Build Plugin
        # This creates the dist/ directory needed for the Docker build
        run: npm run build

      # --- Build and Publish Docker Image ---
      - name: Set up QEMU
        # Needed for multi-platform builds if enabled later
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        # Only log in when pushing (not on pull requests or non-main pushes without tags)
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.repository_owner }} # giantswarm
          # Use the default GITHUB_TOKEN for authentication
          password: ${{ secrets.GITHUB_TOKEN }} 

      - name: Extract metadata (tags, labels) for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_NAME }}
          # Generate tags based on git events:
          # - 'latest' for main branch push
          # - version tag for tag push (e.g., v1.2.3 -> 1.2.3)
          tags: |
            type=ref,event=branch,pattern=main,suffix=-latest 
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push Docker image (Plugin Files)
        uses: docker/build-push-action@v5
        with:
          context: . # Build from the root of the repo where Dockerfile is
          # Use the Dockerfile that builds only the plugin files
          # (Ensure this Dockerfile exists in your repo root)
          file: ./Dockerfile 
          push: ${{ github.event_name != 'pull_request' }} # Push only if not a pull request
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          # Enable caching to speed up builds
          cache-from: type=gha
          cache-to: type=gha,mode=max 


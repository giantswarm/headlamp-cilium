# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Typed TypeScript interfaces for every Cilium CRD spec/status (no more `any`).
- Unit tests for shared formatting/status utilities and a Storybook story for the policy status label.
- Condition-derived, colored status for `CiliumNetworkPolicy` and `CiliumClusterwideNetworkPolicy` list and detail views, based on the `Valid` condition.

### Changed

- Split the monolithic `src/index.tsx` into `resources/`, `components/`, and `utils/` modules; `index.tsx` now only registers sidebar entries and routes.
- IPAM status and identity labels now render as proper tables instead of raw JSON dumps.
- Refreshed `README.md` to describe the current detail views (removed the stale "raw YAML placeholder" note).

### Removed

- Committed build output (`dist/`) and vibe-coding leftovers (`cilium-crds.yaml`, `llm-plugin.txt`, `longhorn.md`); `dist/` is now gitignored.
- The "Raw Spec" JSON dump on policy detail views and the IPAM JSON dump on node detail views.

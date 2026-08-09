# Implementation Task List: OBJ-08 Personal Local Product CLI Runner & Multi-Repo Productization (`agy-harness`)

<!--
AI INSTRUCTION:
This task list tracks step-by-step implementation for OBJ-08.
- Every task must be completed sequentially.
- Major task groups end with an explicit Verification Step sub-task.
- Use forward slashes (/) and clickable file:/// links for all paths.
-->

## Task Group 1: CLI Runner Entrypoint Creation (`harness/bin/agy-harness.sh`)

- [x] 1.1 Create directory `harness/bin/` if it does not exist.
- [x] 1.2 Implement [harness/bin/agy-harness.sh](file:///d:/dev/agy-os/harness/bin/agy-harness.sh) supporting `deploy`, `verify`, `uninstall`, and `status` subcommands.
- [x] 1.3 Make `harness/bin/agy-harness.sh` executable (`chmod +x harness/bin/agy-harness.sh`).
- [x] 1.4 **Verification Step**: Run `bash harness/bin/agy-harness.sh` without arguments to verify usage help output.

---

## Task Group 2: Hybrid Custom Item Architecture & Verification Updates

- [x] 2.1 Update [harness/agy-script/scripts/install-apply-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/install-apply-agy.js) to preserve target local custom files during baseline deployment.
- [x] 2.2 Update [harness/agy-script/scripts/verify-installation-agy.js](file:///d:/dev/agy-os/harness/agy-script/scripts/verify-installation-agy.js) to report extra target items as `ℹ [LOCAL EXTENSION]` while enforcing 100% baseline item parity.
- [x] 2.3 **Verification Step**: Run `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/test/repo-experiment-01` to confirm 100% baseline parity exit code 0.

---

## Task Group 3: 3-Case Test Matrix Execution Across Test Repositories

- [x] 3.1 **Case 1 Setup & Test ([test/repo-experiment-01](file:///d:/dev/agy-os/test/repo-experiment-01))**:
  - Ensure `test/repo-experiment-01` is deployed (`bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/test/repo-experiment-01`).
  - Add custom agent `.agents/agents/custom-agent-01/agent.md` in `repo-experiment-01`.
  - Re-run `bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/test/repo-experiment-01` and verify `custom-agent-01` is preserved.
  - Run `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/test/repo-experiment-01` and confirm exit code 0 + `[LOCAL EXTENSION]`.

- [x] 3.2 **Case 2 Setup & Test ([test/repo-experiment-02](file:///d:/dev/agy-os/test/repo-experiment-02))**:
  - Prepare `test/repo-experiment-02` in uninstalled state with pre-existing custom agent `.agents/agents/custom-agent-02/agent.md`.
  - Run `bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/test/repo-experiment-02`.
  - Verify `custom-agent-02` is preserved alongside baseline master items.
  - Run `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/test/repo-experiment-02` and confirm exit code 0 + `[LOCAL EXTENSION]`.

- [x] 3.3 **Case 3 Setup & Test ([test/repo-experiment-03](file:///d:/dev/agy-os/test/repo-experiment-03))**:
  - Scaffold minimal fresh test repo `test/repo-experiment-03` (`package.json`, `.gitignore`, `README.md`) with no `.agents/` directory.
  - Run `bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/test/repo-experiment-03`.
  - Run `bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/test/repo-experiment-03` and confirm exit code 0 with 0 missing and 0 extra items.

- [x] 3.4 **Verification Step**: All 3 test cases exit with code 0 and report expected baseline parity and extension markers.

---

## Task Group 4: Primary Production Rollout to OpenSpec Framework

- [x] 4.1 Deploy `.agents/` to [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec):
  ```bash
  bash harness/bin/agy-harness.sh deploy --target-dir d:/dev/agy-os/frameworks/openspec
  ```
- [x] 4.2 Verify installation parity on [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec):
  ```bash
  bash harness/bin/agy-harness.sh verify --target-dir d:/dev/agy-os/frameworks/openspec
  ```
- [x] 4.3 Check status output on [frameworks/openspec](file:///d:/dev/agy-os/frameworks/openspec):
  ```bash
  bash harness/bin/agy-harness.sh status --target-dir d:/dev/agy-os/frameworks/openspec
  ```
- [x] 4.4 **Verification Step**: Confirm `frameworks/openspec/.agents/` contains 100% 1:1 baseline component match and `verify` exits with code 0.

---

## Task Group 5: Documentation Verification & PRD Update

- [x] 5.1 Update [docs/PRD.md](file:///d:/dev/agy-os/docs/PRD.md) to add Objective 08 (OBJ-08) under Strategic Objectives.
- [x] 5.2 **Verification Step**: Confirm all file links in `docs/OBJ-08/` are valid clickable `file:///` URIs using forward slashes.

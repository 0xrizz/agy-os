---
title: "Automated Security Audit & Scanning Workflow"
audience: [AI-Agent, Human-Developer]
scope: "guide/workflow/04-security-audit/security-workflow"
prerequisites:
  - "d:/dev/agy-os/guide/README.md"
  - "d:/dev/agy-os/AGENTS.md"
related_commands:
  - "/security-scan"
---

# Automated Security Audit & Scanning Workflow

## 1. Overview & Architecture

Use Case 04 (**Security Audit & Spec Fuzzing**) defines automated security controls, static application security testing (SAST), secret detection, and runtime hook guardrails to prevent security vulnerabilities and destructive operations across the workspace.

```text
+-------------------------------------------------------------------------+
| Automated Security Audit & Scanning Workflow                            |
| Execution Command: /security-scan                                       |
| Key Subagent: security-reviewer                                         |
| Guardrails: .agents/hooks.json & AgentShield Lifecycle Hooks            |
+-------------------------------------------------------------------------+
```

---

## 2. Key Subagent: `security-reviewer`

The `security-reviewer` subagent performs automated security checks on patch diffs, source code modules, and configuration assets:

### Security Inspection Taxonomy

| Vulnerability Category | Inspection Method & Verification Scope |
|:---|:---|
| **Secret & Credential Leakage** | Scans for API keys, private keys, JWT secrets, passwords, and tokens hardcoded in source code or staged patches. |
| **Injection Vectors** | Detects SQL injection, Command injection, Path traversal, and Unsafe Eval calls. |
| **Authentication & Authorization** | Verifies RBAC enforcement, JWT signature validation, and session expiration handling. |
| **Dependency Security** | Checks third-party libraries against known CVE advisories. |
| **Prompt Injection Protection** | Inspects agent prompt templates for indirect prompt injection risks or instruction override vulnerabilities. |

---

## 3. Hook Guardrails & `.agents/hooks.json` Configuration

Security enforcement is baked directly into the agent execution loop via lifecycle hooks configured in `.agents/hooks.json`.

```json
{
  "hooks": {
    "PreToolCall": [
      {
        "name": "target-repo-read-only-guard",
        "description": "Prevents direct file write or delete tool calls targeting d:/CLAUDE-PROJECT/website",
        "command": "node harness/scripts/guard-target-repo.js"
      },
      {
        "name": "agentshield-security-validator",
        "description": "Scans proposed code modifications for secrets and command injection before execution",
        "command": "node harness/scripts/agentshield-scan.js"
      }
    ],
    "PostToolCall": [
      {
        "name": "patch-staging-auditor",
        "description": "Verifies that all output patch files reside in harness/patches/ with valid forward-slash paths",
        "command": "node harness/scripts/audit-patch-staging.js"
      }
    ]
  }
}
```

### Hook Guardrail Policies
1. **Target Read-Only Enforcement**: PreToolCall hooks intercept `write_to_file`, `replace_file_content`, and shell execution targeting `d:/CLAUDE-PROJECT/website`, aborting execution immediately if a violation is attempted.
2. **AgentShield Integration**: Validates AST changes for dangerous calls (`child_process.exec`, `eval`, `fs.rmdirSync`) prior to file writing.

---

## 4. Execution Workflow & Reporting

Run the security audit command:
```bash
/security-scan
```

### Output Findings Structure (`.agents/security-report.md`)
```markdown
# Security Audit Report

## Audit Scope
- Staged Patches: `d:/dev/agy-os/harness/patches/20260729-user-auth-rate-limit.patch`
- Target Path Scope: `d:/CLAUDE-PROJECT/website/src/auth`

## Scan Findings
- **High Severity**: 0
- **Medium Severity**: 0
- **Low Severity**: 0
- **Secret Scanning**: 0 secrets detected

## Status: SECURE ✅
```

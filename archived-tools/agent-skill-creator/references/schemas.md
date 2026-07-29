# Agent Skill Schemas & Reference Guide

## 1. `SKILL.md` YAML Frontmatter Specification

| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | 1-64 chars, lowercase alphanumeric + hyphens (`[a-z0-9-]`). Must match directory name. |
| `description` | string | Yes | 1-1024 chars. Must specify what skill does and when to use it. |
| `license` | string | No | License identifier (e.g. Apache-2.0, MIT). |
| `compatibility` | string | No | Max 500 chars. Environment & package requirements. |
| `metadata` | map | No | Arbitrary string key-value mapping. |
| `allowed-tools` | string | No | Space-separated pre-approved tool strings. |

## 2. Evaluation File Schema (`evals/evals.json`)

```json
{
  "$schema": "https://agentskills.io/schemas/evals.v1.json",
  "skill_name": "target-skill-name",
  "evals": [
    {
      "id": 1,
      "name": "descriptive-eval-name",
      "prompt": "Full user prompt to simulate",
      "files": [
        "input-sample.txt"
      ],
      "expected_output": "Description of expected result",
      "assertions": [
        {
          "name": "File generated",
          "type": "file_exists",
          "target": "output/result.json"
        },
        {
          "name": "Contains key field",
          "type": "regex_match",
          "target": "output/result.json",
          "pattern": "\"status\":\\s*\"success\""
        }
      ]
    }
  ]
}
```

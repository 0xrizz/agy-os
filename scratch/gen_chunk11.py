import json

data = {
    "nodes": [
        {
            "id": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_doc",
            "label": "UC01-C3: TDD Execution & Patch Staging Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_opsx_apply",
            "label": "/opsx-apply Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_spec_to_test",
            "label": "spec-to-test Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_tdd_guide",
            "label": "tdd-guide Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_build_error_resolver",
            "label": "build-error-resolver Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_target_patch_staging_guardrail",
            "label": "Target Patch Staging Guardrail",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_01_target_patch_management_c4_review_verification_doc",
            "label": "UC01-C4: Review & Verification Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c4_review_verification_review_pr",
            "label": "/review-pr Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c4_review_verification_code_reviewer",
            "label": "code-reviewer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c4_review_verification_security_reviewer",
            "label": "security-reviewer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c4_review_verification_pr_test_analyzer",
            "label": "pr-test-analyzer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c4_review_verification_four_step_spec_compliance_check",
            "label": "4-Step Spec Compliance Check",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_01_target_patch_management_c5_delivery_archiving_doc",
            "label": "UC01-C5: Delivery, Delta Spec Writing, Sync & Archiving Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c5_delivery_archiving_spec_delta_writer",
            "label": "spec-delta-writer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c5_delivery_archiving_opsx_sync",
            "label": "/opsx-sync Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c5_delivery_archiving_opsx_archive",
            "label": "/opsx-archive Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c5_delivery_archiving_spec_freshness_checker",
            "label": "spec-freshness-checker Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c5_delivery_archiving_doc_updater",
            "label": "doc-updater Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_01_target_patch_management_c5_delivery_archiving_hitl_gate_2",
            "label": "Human-in-the-Loop Gate 2 Approval",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_02_feature_development_c1_exploration_analysis_doc",
            "label": "Phase C1: Exploration & System Baseline Analysis Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c1-exploration-analysis.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c1_exploration_analysis_opsx_explore",
            "label": "/opsx-explore Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c1-exploration-analysis.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c1_exploration_analysis_code_explorer",
            "label": "code-explorer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c1-exploration-analysis.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c1_exploration_analysis_spec_miner",
            "label": "spec-miner Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c1-exploration-analysis.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c1_exploration_analysis_target_repo_read_only_invariant",
            "label": "Target Repo Read-Only Boundary Invariant",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c1-exploration-analysis.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_02_feature_development_c2_proposal_delta_spec_doc",
            "label": "Phase C2: Proposal & Delta Spec Definition Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c2-proposal-delta-spec.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c2_proposal_delta_spec_opsx_propose",
            "label": "/opsx-propose Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c2-proposal-delta-spec.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c2_proposal_delta_spec_planner",
            "label": "planner Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c2-proposal-delta-spec.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c2_proposal_delta_spec_architect",
            "label": "architect Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c2-proposal-delta-spec.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c2_proposal_delta_spec_spec_impact_table",
            "label": "Spec Impact Table Standard",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c2-proposal-delta-spec.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c2_proposal_delta_spec_hitl_gate_1",
            "label": "Human-in-the-Loop Gate 1 Approval",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c2-proposal-delta-spec.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_02_feature_development_c3_execution_patch_staging_doc",
            "label": "Phase C3: TDD Execution & Mandatory Patch Staging Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c3_execution_patch_staging_orch_spec_delta",
            "label": "orch-spec-delta Skill",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c3_execution_patch_staging_spec_to_test",
            "label": "spec-to-test Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c3_execution_patch_staging_tdd_guide",
            "label": "tdd-guide Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c3-execution-patch-staging.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_02_feature_development_c4_review_verification_doc",
            "label": "Phase C4: Multi-Agent Parallel Review & Verification Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c4_review_verification_review_pr",
            "label": "/review-pr Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c4_review_verification_code_reviewer",
            "label": "code-reviewer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c4_review_verification_security_reviewer",
            "label": "security-reviewer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c4_review_verification_pr_test_analyzer",
            "label": "pr-test-analyzer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c4-review-verification.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_02_feature_development_c5_delivery_archiving_doc",
            "label": "Phase C5: Delivery, Per-PR Delta Writing & Archiving Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c5_delivery_archiving_spec_delta_writer",
            "label": "spec-delta-writer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c5_delivery_archiving_hitl_gate_2",
            "label": "Human-in-the-Loop Gate 2 Sign-off",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c5_delivery_archiving_opsx_sync",
            "label": "/opsx-sync Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_02_feature_development_c5_delivery_archiving_opsx_archive",
            "label": "/opsx-archive Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c5-delivery-archiving.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_03_code_review_qa_review_workflow_doc",
            "label": "Multi-Agent Parallel Code Review & QA Workflow Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\review-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_03_code_review_qa_review_workflow_lead_review_orchestrator",
            "label": "Lead Review Orchestrator",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\review-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_03_code_review_qa_review_workflow_delegation_completion_contract",
            "label": "Delegation Completion Contract",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\review-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_03_code_review_qa_spec_compliance_doc",
            "label": "4-Step Spec Compliance Verification Algorithm Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\spec-compliance.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_03_code_review_qa_spec_compliance_four_step_spec_compliance_algorithm",
            "label": "4-Step Spec Compliance Verification Algorithm",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\spec-compliance.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_04_security_audit_security_workflow_doc",
            "label": "Automated Security Audit & Scanning Workflow Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\security-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_04_security_audit_security_workflow_security_scan",
            "label": "/security-scan Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\security-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_04_security_audit_security_workflow_security_reviewer",
            "label": "security-reviewer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\security-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_04_security_audit_security_workflow_hooks_json_guardrails",
            "label": "hooks.json Guardrail Configuration",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\security-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_04_security_audit_spec_fuzzing_doc",
            "label": "Semantic Spec Fuzzing with Spec-Fuzzer Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\spec-fuzzing.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_04_security_audit_spec_fuzzing_spec_fuzzer",
            "label": "spec-fuzzer Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\spec-fuzzing.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_04_security_audit_spec_fuzzing_semantic_spec_fuzzing",
            "label": "Semantic Spec Fuzzing",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\spec-fuzzing.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_05_documentation_sync_doc_sync_workflow_doc",
            "label": "Automated Documentation & Codemaps Sync Workflow Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\doc-sync-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_05_documentation_sync_doc_sync_workflow_update_docs",
            "label": "/update-docs Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\doc-sync-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_05_documentation_sync_doc_sync_workflow_update_codemaps",
            "label": "/update-codemaps Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\doc-sync-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_05_documentation_sync_doc_sync_workflow_doc_updater",
            "label": "doc-updater Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\doc-sync-workflow.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },

        {
            "id": "guide_workflow_05_documentation_sync_freshness_audit_doc",
            "label": "Spec Freshness Staleness Auditing & Spec-Guardian Document",
            "file_type": "document",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\freshness-audit.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_05_documentation_sync_freshness_audit_spec_freshness_checker",
            "label": "spec-freshness-checker Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\freshness-audit.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_05_documentation_sync_freshness_audit_spec_guardian",
            "label": "spec-guardian Agent",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\freshness-audit.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_05_documentation_sync_freshness_audit_audit_freshness",
            "label": "/audit-freshness Command",
            "file_type": "concept",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\freshness-audit.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        },
        {
            "id": "guide_workflow_05_documentation_sync_freshness_audit_spec_freshness_score",
            "label": "Spec Freshness Score Metric",
            "file_type": "rationale",
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\freshness-audit.md",
            "source_location": None, "source_url": None, "captured_at": None, "author": None, "contributor": None
        }
    ],
    "edges": [
        {
            "source": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_doc",
            "target": "guide_workflow_01_target_patch_management_c4_review_verification_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_01_target_patch_management_c4_review_verification_doc",
            "target": "guide_workflow_01_target_patch_management_c5_delivery_archiving_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_02_feature_development_c1_exploration_analysis_doc",
            "target": "guide_workflow_02_feature_development_c2_proposal_delta_spec_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c1-exploration-analysis.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_02_feature_development_c2_proposal_delta_spec_doc",
            "target": "guide_workflow_02_feature_development_c3_execution_patch_staging_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c2-proposal-delta-spec.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_02_feature_development_c3_execution_patch_staging_doc",
            "target": "guide_workflow_02_feature_development_c4_review_verification_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c3-execution-patch-staging.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_02_feature_development_c4_review_verification_doc",
            "target": "guide_workflow_02_feature_development_c5_delivery_archiving_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c4-review-verification.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_03_code_review_qa_spec_compliance_doc",
            "target": "guide_workflow_03_code_review_qa_review_workflow_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\spec-compliance.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_04_security_audit_spec_fuzzing_doc",
            "target": "guide_workflow_04_security_audit_security_workflow_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\spec-fuzzing.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_05_documentation_sync_freshness_audit_doc",
            "target": "guide_workflow_05_documentation_sync_doc_sync_workflow_doc",
            "relation": "references",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\freshness-audit.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_target_patch_staging_guardrail",
            "target": "guide_workflow_01_target_patch_management_c3_execution_patch_staging_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_01_target_patch_management_c4_review_verification_four_step_spec_compliance_check",
            "target": "guide_workflow_01_target_patch_management_c4_review_verification_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_01_target_patch_management_c5_delivery_archiving_hitl_gate_2",
            "target": "guide_workflow_01_target_patch_management_c5_delivery_archiving_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_02_feature_development_c1_exploration_analysis_target_repo_read_only_invariant",
            "target": "guide_workflow_02_feature_development_c1_exploration_analysis_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c1-exploration-analysis.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_02_feature_development_c2_proposal_delta_spec_hitl_gate_1",
            "target": "guide_workflow_02_feature_development_c2_proposal_delta_spec_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c2-proposal-delta-spec.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_03_code_review_qa_review_workflow_delegation_completion_contract",
            "target": "guide_workflow_03_code_review_qa_review_workflow_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\review-workflow.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_03_code_review_qa_spec_compliance_four_step_spec_compliance_algorithm",
            "target": "guide_workflow_03_code_review_qa_spec_compliance_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\spec-compliance.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_04_security_audit_security_workflow_hooks_json_guardrails",
            "target": "guide_workflow_04_security_audit_security_workflow_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\security-workflow.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_04_security_audit_spec_fuzzing_semantic_spec_fuzzing",
            "target": "guide_workflow_04_security_audit_spec_fuzzing_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\04-security-audit\spec-fuzzing.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_05_documentation_sync_freshness_audit_spec_freshness_score",
            "target": "guide_workflow_05_documentation_sync_freshness_audit_doc",
            "relation": "rationale_for",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\05-documentation-sync\freshness-audit.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_01_target_patch_management_c4_review_verification_four_step_spec_compliance_check",
            "target": "guide_workflow_03_code_review_qa_spec_compliance_four_step_spec_compliance_algorithm",
            "relation": "semantically_similar_to",
            "confidence": "INFERRED",
            "confidence_score": 0.95,
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c4-review-verification.md",
            "source_location": None, "weight": 1.0
        },
        {
            "source": "guide_workflow_01_target_patch_management_c5_delivery_archiving_hitl_gate_2",
            "target": "guide_workflow_02_feature_development_c5_delivery_archiving_hitl_gate_2",
            "relation": "semantically_similar_to",
            "confidence": "INFERRED",
            "confidence_score": 0.95,
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c5-delivery-archiving.md",
            "source_location": None, "weight": 1.0
        }
    ],
    "hyperedges": [
        {
            "id": "uc01_target_patch_management_lifecycle",
            "label": "Target Patch Management UC01 Lifecycle Stages",
            "nodes": [
                "guide_workflow_01_target_patch_management_c3_execution_patch_staging_doc",
                "guide_workflow_01_target_patch_management_c4_review_verification_doc",
                "guide_workflow_01_target_patch_management_c5_delivery_archiving_doc"
            ],
            "relation": "form",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\01-target-patch-management\c3-execution-patch-staging.md"
        },
        {
            "id": "uc02_feature_development_lifecycle",
            "label": "Feature Development UC02 SDD Lifecycle Phases",
            "nodes": [
                "guide_workflow_02_feature_development_c1_exploration_analysis_doc",
                "guide_workflow_02_feature_development_c2_proposal_delta_spec_doc",
                "guide_workflow_02_feature_development_c3_execution_patch_staging_doc",
                "guide_workflow_02_feature_development_c4_review_verification_doc",
                "guide_workflow_02_feature_development_c5_delivery_archiving_doc"
            ],
            "relation": "form",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\02-feature-development\c1-exploration-analysis.md"
        },
        {
            "id": "code_review_qa_parallel_agents",
            "label": "Multi-Agent Parallel Code Review Suite",
            "nodes": [
                "guide_workflow_03_code_review_qa_review_workflow_lead_review_orchestrator",
                "guide_workflow_01_target_patch_management_c4_review_verification_code_reviewer",
                "guide_workflow_01_target_patch_management_c4_review_verification_security_reviewer",
                "guide_workflow_01_target_patch_management_c4_review_verification_pr_test_analyzer"
            ],
            "relation": "participate_in",
            "confidence": "EXTRACTED",
            "confidence_score": 1.0,
            "source_file": r"D:\dev\agy-os\guide\workflow\03-code-review-qa\review-workflow.md"
        }
    ],
    "input_tokens": 0,
    "output_tokens": 0
}

# Verification
node_ids = {n['id'] for n in data['nodes']}
assert len(node_ids) == len(data['nodes']), 'Duplicate node IDs found!'

for edge in data['edges']:
    assert edge['source'] in node_ids, f"Edge source {edge['source']} not in node IDs"
    assert edge['target'] in node_ids, f"Edge target {edge['target']} not in node IDs"
    assert edge['confidence_score'] != 0.5, 'confidence_score cannot be 0.5'

for hyperedge in data['hyperedges']:
    for nid in hyperedge['nodes']:
        assert nid in node_ids, f"Hyperedge node {nid} not in node IDs"

with open('D:/dev/agy-os/graphify-out/.graphify_chunk_11.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('SUCCESS')

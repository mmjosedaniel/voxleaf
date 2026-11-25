# Main ruleset

GitHub returned repository ruleset 19558631 with the following writable settings before enforcement. The authenticated user reported `current_user_can_bypass: never`. The full GET response is retained locally at `tmp/ci-main-rules-before.json`. To roll back only this rollout, remove the four-context required-status-checks rule from the current ruleset, preserving subsequent independent changes.

```json
{
  "name": "Protect main",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "exclude": [],
      "include": [
        "~DEFAULT_BRANCH"
      ]
    }
  },
  "bypass_actors": [],
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "required_reviewers": [],
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "require_extra_approval_for_unattributed_changes": true,
        "allowed_merge_methods": [
          "squash"
        ]
      }
    }
  ]
}
```

## Enforcement verification

[PR #334](https://github.com/mmjosedaniel/voxleaf/pull/334) passed its four Actions checks at `17c74f7b96ec4a2732aa6d1d3be8aa1c37c68f52`, then merged as `7f1a50ebe45b881a8e2aa89204a83991c3b57430`. Each check's producer was GitHub Actions integration 15368. After comparing a fresh GET to the saved response, the authorized PUT added only a required-status-checks rule. The prior rules, target, conditions, enforcement and empty bypass list compared equal after readback. Strict up-to-date enforcement is false. The service reports `current_user_can_bypass: never`. [Effective rules](https://api.github.com/repos/mmjosedaniel/voxleaf/rules/branches/main)

On November 25, GitHub reported these ordinary open PRs as mergeable at the Git level. Their policy states and the four `gh pr checks --required` results distinguished the outcomes.

| Revision | Policy state | Required check results |
| --- | --- | --- |
| [#324](https://github.com/mmjosedaniel/voxleaf/pull/324) at `2be6293` | BLOCKED | Windows, portable and production graphs failed. Ubuntu Rust succeeded. |
| [#335](https://github.com/mmjosedaniel/voxleaf/pull/335) at `79789ae` | BLOCKED | Windows was pending. Production graphs, Ubuntu Rust and Ubuntu portable succeeded. |
| [#273](https://github.com/mmjosedaniel/voxleaf/pull/273) at `ae0c551` | CLEAN | All four succeeded. |

The legacy `branches/main.protection.required_status_checks` summary continued to show enforcement off after rollout. The effective branch rules endpoint returned the active four-context rule, and GitHub's PR API reported the blocked states above. Use the effective endpoint and PR checks to audit this repository ruleset.

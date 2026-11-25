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

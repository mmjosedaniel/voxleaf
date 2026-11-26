# Archive checks

The persisted [CI-ARCHIVE-R01 report](archive-review.md) matches the issued APPROVE verdict for `912a02606b4e84da93baa0370f0d81f0a3428253`. Its SHA-256 is `005e5e8c213df496efd517a42ceb031486d3973d960446923beb3599dbe298a6`.

After saving the report, normal local Windows PowerShell ran `python -X utf8 tmp/evidence/ci-implementation/check-docs.py tmp/ci-archive` from the primary checkout. It verified 18 documents, 98 local links, seven manifest digests and Git path sets, and twelve registry entries. The archive worktree passed `node scripts/check-evidence.mjs`. Its only change at that point was the reserved review report.

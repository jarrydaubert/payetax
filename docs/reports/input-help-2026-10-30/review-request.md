# Focused independent Claude re-review: v5.2.2

The maintainer reports your independent **APPROVE** and confirmation that the agreed input-panel design is achieved. Please review only the follow-up in [re-review.md](re-review.md).

Worktree: `C:\Users\JGF Desktop\Desktop\payetax-worktrees\input-help-v5.2.2`, branch `fix/input-help-v5.2.2`.
Main base remains `208a19e27ee47661da5bfa4314a20eb91ee330f7`. Nothing is committed or staged.

1. Review [the production-only correction diff](re-review/production-copy-correction.diff): two result paragraphs changed. Confirm that the other-PAYE note accurately distinguishes the suggested strategies' first-pound employee-NI assumption from the usual separate-employer thresholds, preserves qualifications and explains possible overstatement. Note that the separate custom-setup path uses ordinary employee NI; it is unchanged.
2. Confirm that the pension warning correctly describes a possible personal annual-allowance tax charge, its omission from the estimate, all-pension scope, possible carry-forward and lower allowances. It must not imply that the annual allowance automatically caps company Corporation Tax relief. Primary HMRC links and code paths are in the report.
3. Confirm no calculations, numerical expectations, display conditions, layout or style changed. The AST comparison in `re-review/production-structure-check.json` excludes only JSX text and records exactly two changed text nodes. Review the five new dashboard regression cases and the updated focused E2E assertions.
4. Review the screen-reader concern without treating automated evidence as spoken output. `re-review/browser-accessibility-results.json` records DOM and Chromium AX before/open/closed data separately. The focused button has the help description and the explanation region is not ignored, but live screen-reader announcement behaviour is unverified. No speculative accessibility changes were made. Where available, perform the manual AT/browser checks in the report and state the actual observations and versions.

Current verification: 124 focused unit tests, eight focused E2E cases across four projects, four browser/viewport capture combinations, eight clear scoped axe scans, repository checks and production build. New warning screenshots are under `re-review/`; earlier `acceptance-375/` whole-form captures remain evidence of the agreed form design. The root source/evidence manifests identify the current files; pre-correction manifests are retained for comparison.

Leave the accepted input-panel design and separate results-layout/cosmetic decisions untouched. Return **APPROVE** or **CHANGES REQUIRED** with concrete findings and limits. Focused re-review is pending; this brief is not a verdict. Do not commit, push, merge, deploy or monitor hosted CI.

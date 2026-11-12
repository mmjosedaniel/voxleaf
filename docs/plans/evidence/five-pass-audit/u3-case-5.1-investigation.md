# U3 case 5.1: controlled reader investigation

Status: attributed controlled real-DOM RED established at attempt05; correction
in progress. Reader production was unchanged through all five attempts.
Other accepted U1/U2 changes are preserved.
Base/HEAD `a3241571944530d468e2f4f2d37a0a2394a8df84`.

The added synthetic Chromium scenario holds actual automatic-scroll notification
and the scheduled follow-settlement frame, Stops, then releases the notification.
It uses native DOM geometry and caret queries, exact locator persistence/reopen,
and a genuine wheel/reopen control. Instrumentation observes call-through behavior;
it does not invent rectangles, caret results or storage outcomes.

All attempts run in local PowerShell outside the sandbox with pinned Node24.18.0,
pnpm11.15.1 and the configured Playwright runner. Exact commands, browser/build
identities, raw trace/screenshot artifacts and before/after input snapshots remain
under ignored `tmp/evidence/five-pass-audit/u3-5.1-browser-red-*`. The filename
prefix describes attempted reproduction, not an attributed product RED.

| Attempt | Observation | Disposition |
| --- | --- | --- |
| 01 | Initial passive interior-offset setup remained at zero before trigger | Fixture failure; not product RED |
| 02 | Canonical interior locator seeded through existing publication/storage seam; real follow/cancel and persistence/reopen controls passed | Contrary evidence; B sampling not yet established |
| 03 | B sampled by preview location; automatic A movement and canceled follow verified; after driver Stop wait viewport had returned to B | Diagnostic precondition failed, not product RED; actual reflow changed ordering |
| 04 | Event released at Stop-settled DOM observation, with B sampling and A crossing verified; native candidate differed from heard checkpoint, but tracker sampled neither caret nor save | Contrary PASS in simultaneous-reflow scenario |
| 05 | Supported 1600x900 window keeps reader1472x542 and compact bar54.375px stable; delayed event causes actual caret sample and persisted1894 instead of heard1958 | Attributed controlled real-DOM RED; production unchanged |

Attempt04 (`u3-5.1-browser-red-04.log`) ran 20:39:21.375–20:39:28.828 UTC,
exit0, 1/1 focused test passing. Real follow scrollTop changed 4454 to718.
The captured trusted root event and canceled exact held frame were verified.
At release Stop was inactive and Play enabled, A still crossed the reading line,
native candidate offset1894 differed from heard1958, and fresh scroll delivery
reached the root. Application caret/range reads and position writes during replay
were zero. Reopen retained exact heard1958; genuine wheel movement persisted and
reopened successfully. Viewport height changed 64 to117 at Stop, leaving a real
concurrent reflow. These numbers describe synthetic fixture geometry only.

Attempt04 equal input manifest SHA-256:
`DA498E98A8CD1BA4F1FF476587B8CBA0A13566C00E27FC59FCEB68C247E75E6D`.
Built browser artifact manifest SHA-256:
`228596A60F68256CA1A5BA3512749C9CC8215B7D659E1A18774B4B9F5BFED215`.
Test SHA-256 at that execution:
`76F119E3C3A2A0F475729A7DB4BC2AA8559BC846551FDBCEEAE59A9F076CB3E1`.

Attempt05 equal input manifest SHA-256:
`35D220361B984276AA432E57AC1FB3A713745138043085FF0238F3381A671358`.
The actual responsive layout change, identified in CSS and measured in the
browser, removes the earlier concurrent reflow without mocking geometry. The
trusted root event, exact canceled follow frame, sampled B preview, inactive Stop,
enabled Play and distinct native caret are all prerequisites before the failing
full-locator persistence assertion. Only textOffsetCodePoints differs.

No historical PASS reused. No natural occurrence claimed. The attributed RED
supports the bounded planned provenance correction; independent case review and
final G6/G7/G10 acceptance remain pending. Preserve all earlier contrary results.

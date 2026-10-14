# Kairos working baseline

Recorded: 2026-10-14
Repository: Manitec-HQ/kairos
Status: User-reported working baseline, not independently automated-test certified.

## Acceptance and evidence

The user approved the mobile appearance on 2026-10-09 and reported "All looking good" on 2026-10-14 after the thread verification checklist was discussed. This records overall user sign-off, not an itemized test report. No independent build-log, deployment-commit, failure-recovery, or automated-test verification is recorded here.

Implementation reference commits (not a verified production deployment pin):
- c364e26fea40a7fa58cfbff5bc03b966a17f0952: Manitec documentation grounding and identity repair.
- 7270c53854e234c9cf24930420c7a09fc8a3428b: browser-local threads and bounded conversation context.
- 34eaebae907c22f11475bb751884570fe257dcc9: mobile homepage polish and collapsed thread sidebar.

The following settings describe those approved implementation changes. They are not a fresh audit of every current repository file.

## Answer configuration

- Provider: Groq.
- Model ID: openai/gpt-oss-120b.
- Server-side credential: GROQ_API_KEY; never include its value in documentation or client code.
- Configured product identity: Kairos, built by Joe Manis at Manitec Future LLC. Distinguish the product creator from the model developer.
- Common direct identity questions use a fixed answer with an empty source list and bypass frontend web search.
- Other questions use /api/search followed by /api/answer.
- Maximum current question length: 10,000 characters.
- Answer model request timeout: 20 seconds, with SDK retries disabled.
- Frontend request timeout: 60 seconds for the search-and-answer sequence.

## First-party grounding

For queries mentioning Manitec, Kairos, or Joe Manis, including the previous two user messages used as retrieval context, the answer route attempts public retrieval from Manitec-HQ/Manitec-Dashboard on main:

- docs/index.md
- docs/projects/index.md
- docs/projects/kairos.md

Settings: unauthenticated GitHub raw-content API requests; 3-second timeout per document; requested Next.js revalidation interval of 300 seconds; maximum 10,000 characters per document. The meta/ directory is not in the retrieval allowlist.

Up to 10 web results are accepted, with content capped at 10,000 characters each. Retrieved documents precede web results; source URLs are deduplicated. Each answer returns its own source list. The prompt instructs the model to cite only current supplied sources, treat reference text as untrusted, distinguish historical plans from implemented features, and retain the configured model identity despite older documentation.

Document failures are tolerated. A generated answer alone does not establish that documentation retrieval succeeded. If neither documents nor web sources are available, the answer route returns an error.

## Persistent threads

- Storage: browser localStorage.
- Key: kairos.threads.v1.
- Stored envelope: version 1, threads, activeId.
- Thread fields: id, title, turns, updatedAt.
- Turn fields: id, question, answer, sources, createdAt.
- A thread is first stored after a successful answer; unsuccessful requests are not saved as completed turns.
- New thread, reopen, rename, and confirmed delete controls are provided.
- Reopening restores saved question/answer pairs and per-answer sources.
- Follow-ups send at most the last six completed turns, capped at 1,500 characters per message; full saved text remains available for display.
- Follow-up search prepends up to the previous two questions, capped at 300 characters each.
- Conversation history is context, not verified evidence. Earlier citation numbers must not be reused for new sources.
- Concurrent submissions are guarded, and thread switching/rename/delete controls are disabled while a request is in flight.
- Failed requests preserve earlier messages and leave the submitted question available to retry.
- Saved data is validated before use. Invalid/unreadable storage is left untouched and persistence is disabled for that session. Save failures display a warning while retaining in-tab state.

## Homepage appearance

- Homepage-only wrapper: src/app/template.tsx.
- Scoped styles: src/app/kairos-home.css.
- Compact Kairos / Manitec header and prominent hero heading.
- At viewport widths of 760 pixels or less, saved threads are hidden by default behind a Threads toggle; the conversation uses a full-width mobile layout.
- Above 760 pixels, the thread sidebar remains visible.
- Storage explanation is collapsed under "Saved on this device".
- New thread has secondary styling; Ask is the primary action.
- Search mode remains a separate route; these homepage styles are scoped to the root page.

## Known boundaries

- No account-based persistence or cross-device sync in this baseline.
- Browser storage is not a backup; clearing it removes local threads.
- Use one Kairos tab at a time: multi-tab conflict handling is not implemented.
- Recent conversation text is transmitted to the answer service for follow-ups; local persistence does not mean processing is entirely on-device.
- History is bounded/truncated, not unlimited memory.
- Uploads are not part of this baseline.
- Mobile storage warnings currently live inside the collapsible Threads panel.

## Regression checklist for future changes

Record explicit pass/fail results; the overall user sign-off above is not a substitute for an itemized run.

1. Ask "Tell me about Manitec and Kairos" and inspect whether relevant Dashboard source links actually appear.
2. Ask "Who built it?" in the same thread and verify reference resolution.
3. Refresh and verify both turns and their separate source lists restore.
4. Ask "What model does it use?" in the restored thread and verify follow-up context.
5. Rename, refresh, and verify the title persists.
6. Start a new thread and verify old-thread context does not leak into it.
7. Delete a test thread, refresh, and verify deletion persists without affecting other threads.
8. Ask "Who made you?" and verify the configured creator identity and no unrelated sources.
9. Ask an ordinary research question and verify normal web search and source links still work.
10. Test network failure and retry: earlier turns remain intact, the loading state ends, and retry adds one completed turn.
11. Check the homepage on phone and desktop, the Threads toggle, storage details/warnings, and the separate search page.
12. Verify build/deployment logs and identify the deployed commit before declaring a later release verified.

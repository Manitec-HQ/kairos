# Kairos

> *The right answer at the right moment.*

Kairos is an accessible AI search, chat, and document assistant built by [Manitec Future LLC](https://manitec.pw). It exists because useful tools shouldn't punish the people who depend on them.

**Live:** [kairos.manitec.pw](https://kairos.manitec.pw) *(coming soon)*

---

## What it does

- 🔍 **Web search** — cited answers synthesized from live sources
- 📄 **File upload** — PDF, docs, plain text as grounded document context
- 🖼️ **Image upload** — visual question answering
- 🧵 **Persistent threads** — session memory and project context
- 🔗 **Shareable answers** — export or share answer pages

---

## Stack (planned)

| Layer | Choice | Notes |
|---|---|---|
| Front end | Next.js 15 + TypeScript | Clean search-first UI |
| Search | Brave Search API (candidate) | Evaluate first |
| Models | Groq (primary) | Fast, practical, familiar |
| Deployment | Vercel | Consistent with Manitec infra |
| Auth / DB | TBD | Keep minimal for MVP |

---

## MVP scope

### Must ship
- [ ] Web search with source links and answer synthesis
- [ ] File upload (PDF, docs, plain text) for document context
- [ ] Image upload for visual Q&A
- [ ] Persistent project threads or session memory
- [ ] Shareable answer pages or exportable notes

### Can wait
- Multi-agent routing (Hex / Nyx / Witness modes)
- Deep ONE/ECKO governance integration
- Fine-tuned local model layers
- Org-wide workspaces or collaboration features

---

## Two-week build path

| Days | Goal |
|---|---|
| 1–3 | Core loop — search request, cited answer rendering, one upload type |
| 4–7 | Document context — parse, chunk, ground answers against file |
| 8–10 | Image upload + visual Q&A + share/export |
| 11–14 | Public beta shell — homepage live, early access open |

---

## Immediate next steps

- [ ] Scaffold Next.js 15 app
- [ ] Evaluate Brave Search API — pricing, rate limits, response shape
- [ ] Build search → answer → cite core loop
- [ ] Add file upload + parsing (PDF/text first)
- [ ] Deploy to `kairos.manitec.pw` on Vercel

---

## Philosophy

Kairos is part of the [ONE ecosystem](https://github.com/Ecko-7) — the public-facing intelligence layer of Manitec Future LLC. It stands on its own as a product while remaining connected to the broader system being built.

The product exists as both a useful tool and a public statement: *features shouldn’t be pulled from people who built real workflows around them.*

---

*Built in East Tennessee. Shipped with intent.*

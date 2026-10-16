<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Conventions

- Colour-coded (RAG) text must stay legible: use the `--rag-*-ink` tokens in
  `src/styles.css` for text drawn on rating graphics, never the raw `--rag-*`
  fills, because the fills are too light for text. `src/test/rag-contrast.test.ts`
  fails the build if any pair drops below WCAG AA.
- Rating figures are set in large bold type (18.66px bold or bigger), which is
  what lets the inks be as bright as they are — WCAG's large-text bar is 3:1
  while ordinary text still needs 4.5:1. The test asserts both the colours and
  the figure size, so shrinking a figure without deepening its ink fails.

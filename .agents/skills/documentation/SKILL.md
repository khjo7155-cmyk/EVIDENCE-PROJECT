---
name: documentation
description: Owns evidence's writing rules and writes its README and doc comments. Use before writing or changing the README, a guide, or a doc comment.
---

# Documentation

Good writing is the same for every reader: deliver the core point concisely and clearly. Only the reader, and so what the reader needs, differs by document.

## Writing

- Write only what the reader needs and would not otherwise know. Cut padding, repetition, preamble, filler, and closing summaries; completeness means covering what the reader needs, never longer phrasing.
- One point, one sentence, one place. Give the reason when it is not obvious.
- Say what to do rather than what to avoid; when a prohibition is needed, name the concrete pattern.
- Plain English with one term per concept, and no emphasis capitals, em-dashes, emoji in prose, promotional adjectives, stock AI phrasing, or hedging.

## Paragraphs And Lists

A paragraph is one topic. Start a new one when the topic changes and keep sentences on the same topic together; merging topics to save paragraphs and splitting every sentence are both failures. Write each paragraph on one source line.

Use a list for parallel items, for steps whose order changes the result, and for their sub-steps, marking a sublist differently from its parent, such as `-` items under a numbered list. Write an argument whose conditions, reasons, and exceptions depend on each other as prose. Use a table for repeated mappings and a code block for exact commands.

## README

The root `README.md` is the only README to edit; `scripts/copy-readme-and-license.js` copies it and `LICENSE` into the package at `prepack`, so its links must work from npm as well as GitHub.

- It is the finished product's user guide: purpose, installation, configuration, and usage. Leave issues, roadmaps, progress, and validation results to pull requests.
- Show configuration only through `evidence.config.ts`, never JSON or another format.
- Link to upstream `@ttsc/evidence` for the compatibility baseline, and explain a standalone difference where it affects an author. ttsc's website is not this package's documentation host.
- Take every code example from code that runs.

## Doc Comments

JSDoc follows the Writing and Paragraphs And Lists rules above. What a public declaration's comment must say is the contracts [Meaningful documentation](../contracts/common.md#meaningful-documentation) chapter.

- Start with one summary sentence, then a blank comment line and the contract, so the comment explains rather than restates the identifier or type. Separate consecutive documented members with a blank line.
- Document a private helper when its contract or state ownership is needed to follow the code.
- Inside a function, put a comment beside a non-obvious branch, ordering, normalization, or cleanup, stating the invariant or failure it protects rather than narrating the next line.

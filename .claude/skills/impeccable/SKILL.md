---
name: impeccable
description: Claude-Code-Adapter für den kanonischen Impeccable-Skill unter .agents/skills/impeccable.
version: 3.9.1
license: Apache 2.0
allowed-tools:
  - Bash(npx impeccable *)
  - Bash(node .claude/skills/impeccable/scripts/*)
---

# Impeccable — Claude-Code-Adapter

Lies vor der Verwendung den kanonischen Skill unter
`../../../.agents/skills/impeccable/SKILL.md` vollständig und befolge ihn.

Für Claude Code gilt ausschließlich die Pfadübersetzung
`.agents/skills/impeccable/` → `.claude/skills/impeccable/`. Die Unterordner
`reference/` und `scripts/` sind relative Symlinks auf die kanonische
Installation; alle fachlichen Skill-Inhalte bleiben dort zentral gepflegt.

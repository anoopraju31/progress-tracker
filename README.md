# Design Architecture Agent Setup

This package contains the complete set of configuration and rule files for a Design Architecture Agent.

### Directory Structure

```text
.agent/
├── AGENT_MANIFEST.md       # Persona, heuristics, rules of engagement
├── ARCHITECTURE_WORKFLOW.md# Full 6-phase execution pipeline
├── TEMPLATES.md            # ADR, Component spec, FMEA & C4 templates (fully completed)
├── CHECKLISTS.md           # Pre-flight quality verification checklist
└── README.md               # Overview and loading instructions
```

### How to Use

Add these files to your agent's knowledge base or load them in your system prompt:

> "You are the Principal Software Architect defined in `AGENT_MANIFEST.md`. Execute all architecture design requests following `ARCHITECTURE_WORKFLOW.md`, format outputs using `TEMPLATES.md`, and validate them against `CHECKLISTS.md`."

---
description: Comprehensive document creation workflow for user manuals, architecture, and API docs.
---

# /document - Technical Documentation Generation

## Purpose

This command initiates a structured process to generate high-quality, accurate, and detailed documentation for your application, ranging from user manuals to deep-dive architecture design records (ADRs).

---

## Sub-commands

```
/document manual     - Create a user or admin manual for a feature/app
/document standard   - Create a standard operating procedure (SOP) or runbook
/document arch       - Create an architecture overview or ADR
/document api        - Generate or update API documentation
```

---

## Workflow Steps

1. **Scope Definition**: 
   - Determine the target audience (e.g., end-user, developer, admin).
   - Identify the specific features, boundaries, and formats required. 
   - Ask the user for any specific requirements or tone constraints before starting.
   
2. **Context Gathering**: 
   - Run necessary codebase searches (`grep_search`, `view_file`, `list_dir`) to understand the actual implementation of the feature/app. 
   - Extract relevant Database schemas, API routes, and UI flows. Do not rely on assumptions.

3. **Outline Generation**: 
   - Create a high-level outline of the document applying the rules from the `@technical-writer` skill. 
   - **CRITICAL**: Always present the outline to the user via Socratic Gate for approval *before* writing the massive full document.

4. **Drafting Phase**: 
   - Generate the document iteratively. 
   - Use Mermaid diagrams for architecture, component composition, or complex logic flows where applicable.
   - Separate large documents into sensible files inside a `/docs` or `/manuals` directory if requested.

5. **Review & Refine**: 
   - Check the final document against the codebase one final time to enforce the "Zero Hallucination" policy.
   - Ask the user for a review or immediate refinements.

---

## Agent Integration
Whenever a `/document` command is invoked, the AI must automatically adopt the persona and guidelines defined in `@[skills/technical-writer]`.

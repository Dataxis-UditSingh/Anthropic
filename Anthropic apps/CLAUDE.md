# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses `uv` for environment and dependency management.

```bash
# One-time setup
uv venv
uv pip install -e .

# Run the MCP server (stdio transport via FastMCP)
uv run main.py

# Tests
uv run pytest                                            # all tests
uv run pytest tests/test_document.py                     # one file
uv run pytest tests/test_document.py::TestBinaryDocumentToMarkdown::test_binary_document_to_markdown_with_pdf  # one test
```

## Architecture

This is an **MCP (Model Context Protocol) server** exposing document/utility tools to AI assistants. The shape is intentionally minimal — adding a tool is the dominant workflow.

- `main.py` — wires up a `FastMCP("docs")` server and registers each tool via `mcp.tool()(function)`. To expose a new tool, import it here and add another `mcp.tool()(...)` line. Registration is the only place a tool becomes visible to MCP clients; defining a function in `tools/` is not enough.
- `tools/` — one module per tool category (`math.py`, `document.py`). Functions are plain Python; MCP-specific behavior is layered on at registration time, which keeps the tool functions directly unit-testable (see `tests/test_document.py` calling `binary_document_to_markdown` without any MCP scaffolding).
- `tests/fixtures/` — binary test fixtures (e.g. `mcp_docs.docx`, `mcp_docs.pdf`) referenced by relative path from the test file. New document-conversion tests should add fixtures here.

### Tool authoring convention

From the README, tool functions must:

- Use `pydantic.Field(description=...)` for every parameter (the description is what the LLM sees).
- Have a docstring that includes: one-line summary, detailed explanation, **when to use (and when not to)**, and input/output examples. `tools/math.py::add` is the reference example.

Document conversion goes through `markitdown` — pass the file extension (without dot) as the `file_type` argument; it's used to construct a `StreamInfo(extension=...)` hint for the converter.

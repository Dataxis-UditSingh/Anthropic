# Introduction to Model Context Protocol

## CLI_Project Error Resolution

### Issue
When running `uv run main.py` inside `CLI_Project`, the CLI failed on Windows with:

```text
ModuleNotFoundError: No module named 'resource'
```

### Cause
The file `CLI_Project/mcp_client.py` imported Python's `resource` module, which is only available on Unix-like systems. That import fails on Windows before the app can start.

### Fix
- Removed the `import resource` line from `CLI_Project/mcp_client.py`
- Also removed an unused duplicate `read_resource` method implementation

### Result
After this change, the CLI should start past the import phase on Windows. Any new traceback will be a separate runtime error.

### Notes
If another module is missing, check the traceback and verify the active Python environment and dependencies in `CLI_Project/pyproject.toml`.

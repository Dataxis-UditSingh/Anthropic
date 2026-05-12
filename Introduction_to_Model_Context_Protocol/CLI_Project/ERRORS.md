# CLI_Project Error Reference

## Missing `resource` module on Windows

### Symptom
Running `uv run main.py` in `CLI_Project` on Windows raised:

```text
ModuleNotFoundError: No module named 'resource'
```

### Cause
The file `mcp_client.py` imported Python's built-in `resource` module, which exists only on Unix-like systems. This module import fails on Windows before the CLI can start.

### Resolution
- Removed the unused `import resource` line from `mcp_client.py`.
- Cleaned up an accidental duplicate `read_resource` method implementation.

### Notes
- The error happened during `from mcp_client import MCPClient` in `main.py`.
- After this fix, the CLI should proceed past import time and, if any other errors occur, they will be separate runtime issues.

## Suggested follow-up if other errors appear

1. Run the command again:
   ```powershell
   uv run main.py
   ```
2. If a new traceback appears, copy the full output and inspect the last file/line mentioned.
3. For missing modules, confirm dependencies in `pyproject.toml` and your active environment.

***Building with APi***

Note: According to today's date (May 15, 2026), always use model = 'claude-opus-4-5-20251101' and not any other, as this is the latest model.

## Change Log and Fix Instructions

### What changed from the original code
- Original `.env` configuration used `CLAUDE_MODEL="claude-sonnet-4-5"`.
- I updated both `Building_with_the_Claude_API/MCP/.env` and `Building_with_the_Claude_API/ClaudeAPI/MCP/.env` to:
  - `CLAUDE_MODEL="claude-opus-4-5-20251101"`
- This README now documents the required fix so another user can follow it without guessing.

### Why this matters
- The code in `MCP/main.py` and `ClaudeAPI/MCP/main.py` loads the model from `CLAUDE_MODEL` in `.env`.
- If `CLAUDE_MODEL` is empty, the app exits with:
  - `Error: CLAUDE_MODEL cannot be empty. Update .env`
- If the model is still set to the old value, the app may fail or use a deprecated model.

### How to resolve the error step by step
1. Open these files:
   - `Building_with_the_Claude_API/MCP/.env`
   - `Building_with_the_Claude_API/ClaudeAPI/MCP/.env`
2. Replace any old model string such as `claude-sonnet-4-5` with:
   - `claude-opus-4-5-20251101`
3. Confirm `ANTHROPIC_API_KEY` is present and not empty in both `.env` files.
4. If you use UV or Uvicorn, keep `USE_UV=1`; otherwise set `USE_UV=0`.
5. Run the project from the correct folder:
   - `python MCP/main.py`
   - or `python ClaudeAPI/MCP/main.py`

### Additional troubleshooting
- If you still see `Error: CLAUDE_MODEL cannot be empty. Update .env`, make sure the `.env` file is named exactly `.env` and that `dotenv` is loading it.
- Search the repository for `claude-sonnet-4-5` and update any remaining references to `claude-opus-4-5-20251101`.
- If you get an API key error, verify `ANTHROPIC_API_KEY` is correct and has permissions.

### Current code state
- `readme.md` now contains the full fix description and resolution steps.
- Both `.env` files now use `CLAUDE_MODEL="claude-opus-4-5-20251101"`.
- The code entry points in `MCP/main.py` and `ClaudeAPI/MCP/main.py` already read the model value from `.env`.

> Important: As of May 15, 2026, `claude-opus-4-5-20251101` is the required latest model for this repository.
# Claude Code in Action

This repository contains examples and projects demonstrating the use of Claude Code, Anthropic's terminal-based coding assistant.

## Using Claude Code

Claude Code is a powerful tool for coding with Claude AI directly in your terminal. It supports various commands and features to enhance your development workflow.

### Memory Mode

Claude Code includes a memory mode feature that allows you to store persistent context and notes for your projects. This memory is automatically included in Claude's context for future conversations.

#### How to Use Memory Mode

1. Start Claude Code in your project directory:
   ```
   claude
   ```

2. In the Claude CLI, type `/memory` to enter memory mode.

3. Select the memory location (e.g., "project memory" for project-specific notes).

4. Claude Code will open your default editor (e.g., Notepad on Windows) with the memory file.

5. Edit the file with your notes, preferences, or context (e.g., "This project uses Next.js with Prisma and Tailwind CSS").

6. Save and close the editor.

7. The CLI should resume, and the updated memory will be used in future conversations.

#### Known Issue: CLI Terminal Closes on Windows

**Error Description**: On Windows systems, when using the `/memory` command, the Claude CLI terminal may close unexpectedly after opening the editor. This occurs because the default editor (Notepad) runs synchronously, and the CLI process terminates when the editor launches.

**Symptoms**:
- You run `/memory` and select a memory location.
- Notepad opens with the memory file.
- After editing and closing Notepad, the original terminal window with Claude CLI is gone.
- Attempting to "give instructions" in Notepad (treating it like the CLI) does not work, as Notepad is just a text editor, not a command interface.

**Updated Method/Workaround**:
To work around this issue on Windows:

1. Follow steps 1-5 above to edit the memory file.

2. After saving and closing Notepad, the CLI terminal will have closed.

3. Open a new terminal window.

4. Navigate to your project directory (e.g., `cd D:\DataAxis\Anthropic\Claude_Code_in_Action\uigen`).

5. Restart Claude Code: `claude`

6. The updated memory will now be loaded and available in the new session.

**Alternative Solution: Change Your Editor**
To prevent the terminal from closing, configure Claude Code to use a different editor that integrates better with the terminal:

1. Set the `EDITOR` environment variable to a terminal-friendly editor:
   - For VS Code: `set EDITOR=code`
   - For VS Code with wait: `set EDITOR=code --wait`
   - For Vim: `set EDITOR=vim`
   - For Nano: `set EDITOR=nano`

2. Make this permanent by adding the variable to your system environment variables (search for "environment variables" in Windows settings).

3. Restart your terminal and try `/memory` again. The CLI should remain open while you edit.

**Important Notes**:
- Memory mode is for storing static notes and context, not for executing commands.
- Do not attempt to run commands or give instructions in the memory file itself.
- If you encounter issues, ensure you're running the latest version of Claude Code.

### Image Input Notes

Claude CLI does not support pasting copied images directly into the terminal or dragging images into the CLI window. The image viewer or editor may open, but the CLI will not accept the image as an input command or memory entry.

**What to do instead**:
- Save the image to disk.
- Reference the saved image file path in your CLI command or note.
- If you need image-related context, describe the image in text instead of pasting it.

### Other Commands

- `/help` - Display available commands
- `/run <command>` - Execute a shell command
- `/edit <file>` - Edit a file
- `/init` - Initialize project memory (may create MD files in current and parent directories)

For more information, refer to the CLAUDE.md file in the uigen directory or visit the official Claude Code documentation.
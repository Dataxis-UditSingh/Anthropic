"use client";

import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";
import type { ToolInvocation as AIToolInvocation } from "ai";

interface ToolInvocationProps {
  toolInvocation: AIToolInvocation;
}

export function ToolInvocation({ toolInvocation }: ToolInvocationProps): ReactElement {
  const label: string = formatToolLabel(toolInvocation.toolName, toolInvocation.args);
  const isComplete: boolean =
    toolInvocation.state === "result" &&
    Boolean((toolInvocation as { result?: unknown }).result);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}

export function formatToolLabel(
  toolName: string,
  args: Record<string, unknown> | undefined,
): string {
  const command: string | undefined = args?.command as string | undefined;
  const path: string | undefined = args?.path as string | undefined;

  if (toolName === "str_replace_editor") {
    if (!path) return "Working on file";
    switch (command) {
      case "create":
        return `Creating ${path}`;
      case "str_replace":
        return `Editing ${path}`;
      case "insert":
        return `Editing ${path}`;
      case "view":
        return `Viewing ${path}`;
      case "undo_edit":
        return `Reverting ${path}`;
      default:
        return `Editing ${path}`;
    }
  }

  if (toolName === "file_manager") {
    if (!path) return "Managing file";
    const newPath: string | undefined = args?.new_path as string | undefined;
    switch (command) {
      case "rename":
        return newPath ? `Renaming ${path} to ${newPath}` : `Renaming ${path}`;
      case "delete":
        return `Deleting ${path}`;
      default:
        return `Managing ${path}`;
    }
  }

  return toolName;
}

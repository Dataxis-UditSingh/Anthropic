import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocation, formatToolLabel } from "../ToolInvocation";
import type { ToolInvocation as AIToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "partial-call" | "call" | "result" = "call",
  result?: unknown,
): AIToolInvocation {
  return {
    toolCallId: "test-call",
    toolName,
    args,
    state,
    ...(result !== undefined ? { result } : {}),
  } as AIToolInvocation;
}

test("renders 'Creating <path>' for str_replace_editor create", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "/App.jsx",
      })}
    />,
  );

  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("renders 'Editing <path>' for str_replace_editor str_replace", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "str_replace",
        path: "/Card.tsx",
      })}
    />,
  );

  expect(screen.getByText("Editing /Card.tsx")).toBeDefined();
});

test("renders 'Editing <path>' for str_replace_editor insert", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "insert",
        path: "/Card.tsx",
      })}
    />,
  );

  expect(screen.getByText("Editing /Card.tsx")).toBeDefined();
});

test("renders 'Viewing <path>' for str_replace_editor view", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "view",
        path: "/App.jsx",
      })}
    />,
  );

  expect(screen.getByText("Viewing /App.jsx")).toBeDefined();
});

test("renders 'Reverting <path>' for str_replace_editor undo_edit", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "undo_edit",
        path: "/App.jsx",
      })}
    />,
  );

  expect(screen.getByText("Reverting /App.jsx")).toBeDefined();
});

test("renders 'Renaming <path> to <new_path>' for file_manager rename", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "/Old.tsx",
        new_path: "/New.tsx",
      })}
    />,
  );

  expect(screen.getByText("Renaming /Old.tsx to /New.tsx")).toBeDefined();
});

test("renders 'Renaming <path>' when new_path missing", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("file_manager", {
        command: "rename",
        path: "/Old.tsx",
      })}
    />,
  );

  expect(screen.getByText("Renaming /Old.tsx")).toBeDefined();
});

test("renders 'Deleting <path>' for file_manager delete", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("file_manager", {
        command: "delete",
        path: "/Old.tsx",
      })}
    />,
  );

  expect(screen.getByText("Deleting /Old.tsx")).toBeDefined();
});

test("falls back to 'Working on file' when str_replace_editor args missing", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("str_replace_editor", {})}
    />,
  );

  expect(screen.getByText("Working on file")).toBeDefined();
});

test("falls back to 'Managing file' when file_manager args missing", () => {
  render(
    <ToolInvocation toolInvocation={makeInvocation("file_manager", {})} />,
  );

  expect(screen.getByText("Managing file")).toBeDefined();
});

test("falls back to raw tool name for unknown tool", () => {
  render(
    <ToolInvocation
      toolInvocation={makeInvocation("mystery_tool", { path: "/x" })}
    />,
  );

  expect(screen.getByText("mystery_tool")).toBeDefined();
});

test("shows spinner while state is 'call' (no result)", () => {
  const { container } = render(
    <ToolInvocation
      toolInvocation={makeInvocation("str_replace_editor", {
        command: "create",
        path: "/App.jsx",
      })}
    />,
  );

  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows emerald dot when state is 'result' with truthy result", () => {
  const { container } = render(
    <ToolInvocation
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "/App.jsx" },
        "result",
        "ok",
      )}
    />,
  );

  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is 'result' but result is falsy", () => {
  const { container } = render(
    <ToolInvocation
      toolInvocation={makeInvocation(
        "str_replace_editor",
        { command: "create", path: "/App.jsx" },
        "result",
        "",
      )}
    />,
  );

  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("formatToolLabel maps every str_replace_editor command", () => {
  expect(
    formatToolLabel("str_replace_editor", { command: "create", path: "/a" }),
  ).toBe("Creating /a");
  expect(
    formatToolLabel("str_replace_editor", { command: "str_replace", path: "/a" }),
  ).toBe("Editing /a");
  expect(
    formatToolLabel("str_replace_editor", { command: "insert", path: "/a" }),
  ).toBe("Editing /a");
  expect(
    formatToolLabel("str_replace_editor", { command: "view", path: "/a" }),
  ).toBe("Viewing /a");
  expect(
    formatToolLabel("str_replace_editor", { command: "undo_edit", path: "/a" }),
  ).toBe("Reverting /a");
});

test("formatToolLabel maps file_manager commands", () => {
  expect(
    formatToolLabel("file_manager", {
      command: "rename",
      path: "/a",
      new_path: "/b",
    }),
  ).toBe("Renaming /a to /b");
  expect(
    formatToolLabel("file_manager", { command: "delete", path: "/a" }),
  ).toBe("Deleting /a");
});

test("formatToolLabel falls back when args undefined", () => {
  expect(formatToolLabel("str_replace_editor", undefined)).toBe(
    "Working on file",
  );
  expect(formatToolLabel("file_manager", undefined)).toBe("Managing file");
  expect(formatToolLabel("anything_else", undefined)).toBe("anything_else");
});

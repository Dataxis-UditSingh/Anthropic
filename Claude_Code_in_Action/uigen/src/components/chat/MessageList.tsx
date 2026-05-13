"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { User, Sparkles, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ToolInvocation } from "./ToolInvocation";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps): JSX.Element {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 mb-5 shadow-lg shadow-violet-500/20">
          <Sparkles className="h-8 w-8 text-white" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 blur-xl opacity-30 -z-10" />
        </div>
        <p className="text-neutral-900 font-semibold text-lg mb-2 tracking-tight">
          Start a conversation to generate React components
        </p>
        <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
          I can help you create buttons, forms, cards, and more
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-6">
      <div className="space-y-5 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-3 items-start",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/20 flex items-center justify-center ring-1 ring-white/40">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
            )}

            <div
              className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 transition-shadow",
                  message.role === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-violet-500/20 rounded-tr-md"
                    : "bg-white text-neutral-900 border border-neutral-200/80 shadow-sm rounded-tl-md"
                )}
              >
                <div className="text-sm leading-relaxed">
                  {message.parts ? (
                    <>
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return message.role === "user" ? (
                              <span key={partIndex} className="whitespace-pre-wrap">
                                {part.text}
                              </span>
                            ) : (
                              <MarkdownRenderer
                                key={partIndex}
                                content={part.text}
                                className="prose-sm"
                              />
                            );
                          case "reasoning":
                            return (
                              <div
                                key={partIndex}
                                className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80"
                              >
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1.5">
                                  Reasoning
                                </span>
                                <span className="text-sm text-neutral-700 leading-relaxed">
                                  {part.reasoning}
                                </span>
                              </div>
                            );
                          case "tool-invocation":
                            return (
                              <ToolInvocation
                                key={partIndex}
                                toolInvocation={part.toolInvocation}
                              />
                            );
                          case "source":
                            return (
                              <div
                                key={partIndex}
                                className="mt-2 text-xs text-neutral-500 font-mono"
                              >
                                Source: {JSON.stringify(part.source)}
                              </div>
                            );
                          case "step-start":
                            return partIndex > 0 ? (
                              <hr key={partIndex} className="my-3 border-neutral-200/70" />
                            ) : null;
                          default:
                            return null;
                        }
                      })}
                      {isLoading &&
                        message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 && (
                          <div className="flex items-center gap-2 mt-3 text-neutral-500">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
                            <span className="text-sm">Generating...</span>
                          </div>
                        )}
                    </>
                  ) : message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <MarkdownRenderer content={message.content} className="prose-sm" />
                    )
                  ) : isLoading &&
                    message.role === "assistant" &&
                    messages.indexOf(message) === messages.length - 1 ? (
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 pt-0.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-900 shadow-md shadow-neutral-900/10 flex items-center justify-center ring-1 ring-neutral-700/40">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

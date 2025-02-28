"use client";

import type { Companion } from "@prisma/client";
import { type ElementRef, useEffect, useRef, useState } from "react";

import { ChatMessage, type ChatMessageProps } from "./chat-message";

type ChatMessagesProps = {
  messages: ChatMessageProps[];
  isLoading: boolean;
  companion: Companion;
};

export const ChatMessages = ({
  messages = [],
  isLoading,
  companion,
}: ChatMessagesProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null);

  const [fakeLoading, setFakeLoading] = useState(messages.length === 0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Sort messages chronologically to ensure they're displayed in order
  const sortedMessages = [...messages].sort((a, b) => {
    // If messages have timestamps, use them
    if (a.timestamp && b.timestamp) {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    // Otherwise keep the original order (as they were loaded from DB)
    return 0;
  });

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        isLoading={fakeLoading}
        src={companion.src}
        role="system"
        content={`Hello, I am ${companion.name}, ${companion.description}.`}
      />

      {sortedMessages.map((message, index) => (
        <ChatMessage
          key={`${message.content}-${index}`}
          role={message.role}
          content={message.content}
          src={companion.src}
        />
      ))}

      {isLoading && <ChatMessage role="system" src={companion.src} isLoading />}

      <div ref={scrollRef} aria-hidden />
    </div>
  );
};

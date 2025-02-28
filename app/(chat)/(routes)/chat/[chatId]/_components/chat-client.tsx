"use client";

import type { Companion, Message } from "@prisma/client";
import { useCompletion } from "ai/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { ChatForm } from "@/components/chat-form";
import { ChatHeader } from "@/components/chat-header";
import type { ChatMessageProps } from "@/components/chat-message";
import { ChatMessages } from "@/components/chat-messages";

type ChatClientProps = {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
};

export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  
  // Map database messages to ChatMessageProps with timestamps
  const initialMessages = companion.messages.map(message => ({
    role: message.role as "system" | "user",
    content: message.content,
    timestamp: message.createdAt
  }));
  
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages);

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${companion.id}`,
      onFinish: (_prompt, completion) => {
        const systemMessage: ChatMessageProps = {
          role: "system",
          content: completion,
          timestamp: new Date(),
        };

        setMessages((current) => [...current, systemMessage]);
        setInput("");

        router.refresh();
      },
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((current) => [...current, userMessage]);
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader companion={companion} />

      <ChatMessages
        companion={companion}
        isLoading={isLoading}
        messages={messages}
      />

      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};

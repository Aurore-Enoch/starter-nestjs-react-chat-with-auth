import React, { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { useSocket } from "@/contexts/SocketProvider.tsx";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, HeartPulse } from "lucide-react";

const MessageList: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const socket = useSocket();
  const { user } = useAuth();

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => messageService.findAll(),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (socket) {
      socket.on('sendMessageFromBack', (message) => {
        console.log('Received message:', message);
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        scrollToBottom();
      })
      socket.on("messageLiked", (updatedMessage: Message) => {
        console.log("Message liked:", updatedMessage);
        queryClient.setQueryData<Message[]>(["messages"], (oldMessages) =>
          oldMessages?.map((message) =>
            message.id === updatedMessage.id ? updatedMessage : message
          )
        );
      });

      socket.on("messageUnliked", (updatedMessage: Message) => {
        queryClient.setQueryData<Message[]>(["messages"], (oldMessages) =>
          oldMessages?.map((message) =>
            message.id === updatedMessage.id ? updatedMessage : message
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off("messageLiked");
        socket.off("messageUnliked");
        socket.off('sendMessageFromBack');
      }
    };
  }, [socket, queryClient]);

  const handleLike = (messageId: string) => {
    if (socket) {
      socket.emit("likeMessage", { messageId });
    }
  };

  const handleUnlike = (messageId: string) => {
    if (socket) {
      socket.emit("unlikeMessage", { messageId });
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading messages...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading messages. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages?.map((message) => (
        <div key={message.id} className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-700 text-white font-bold">
                {message?.user?.email.charAt(0).toUpperCase()}
              </div>
              <p className="text-pink-400">{message?.user?.email}</p>
            </div>
          <div className="flex justify-between items-center text-sm text-gray-500/60 mt-4">
          <p className="text-gray-800">{message.text}</p>
            <p>
              {formatDistanceToNow((message.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2">
          <button
              onClick={() =>
                (message.likedBy || []).some((likedUser) => likedUser.id === user?.id)
                  ? handleUnlike(message.id)
                  : handleLike(message.id)
              }
              className="flex items-center space-x-2 text-pink-500 hover:underline"
            >
              {(message.likedBy || []).some((likedUser) => likedUser.id === user?.id) ? (
                <HeartPulse className="w-5 h-5 text-pink-600" />
              ) : (
                <Heart className="w-5 h-5 text-gray-500" />
              )}
              <span>{(message.likedBy || []).length}</span>
            </button>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
import React, { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketProvider.tsx";
import { formatDistanceToNow, parseISO, compareDesc } from "date-fns";
import { fr } from "date-fns/locale/fr";
import UserInfo from "./UserInfo";
import LogoutButton from "../LogoutButton";

interface User {
  id: string;
  email: string;
  lastLogin?: string;
  lastLogout?: string;
}

const ChatInfo: React.FC = () => {
  const socket = useSocket();
  const [users, setUser] = useState<User[]>([]);

  const sortUsersByRecentActivity = (users: User[]) => {
    return users.sort((a, b) => {
      const aDate = a.lastLogout ? parseISO(a.lastLogout) : parseISO(a.lastLogin || "");
      const bDate = b.lastLogout ? parseISO(b.lastLogout) : parseISO(b.lastLogin || "");
      return compareDesc(aDate, bDate);
    });
  };

  useEffect(() => {
    if (socket) {
      socket.emit("getUsers");
      socket.on("users", (users: User[]) => {
        const sortedUsers = sortUsersByRecentActivity(users);
        setUser(sortedUsers);
      });

      return () => {
        socket.off("users");
      };
    }
  }, [socket]);

  return (
    <div className="p-4 rounded-lg shadow h-full bg-pink-100">
      <div className="h-4/5">
      <p className="text-center text-2xl font-bold text-pink-800">Mimmob Chat</p>
      <p className="text-center text-pink-600">Welcome to the chat room!</p>
      <ul className="mt-4 space-y-4">
        {users.map((user) => (
          <li key={user.id} className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-white font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span
                className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ring-2 ring-white ${
                  user.lastLogout ? "bg-red-500" : "bg-green-500"
                }`}
              ></span>
            </div>
            <div>
              <p className="text-gray-800 font-medium">{user.email}</p>
              {user.lastLogin && !user.lastLogout && (
                <p className="text-gray-500 text-sm">
                  Connexion{" "}
                  {formatDistanceToNow(parseISO(user.lastLogin), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              )}
              {user.lastLogout && (
                <p className="text-gray-500 text-sm">
                  Déconnexion{" "}
                  {formatDistanceToNow(parseISO(user.lastLogout), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      </div>
      <div className="h-1/5 flex justify-center items-center">
      <UserInfo />
      <LogoutButton />
      </div>
    </div>
  );
}

export default ChatInfo;
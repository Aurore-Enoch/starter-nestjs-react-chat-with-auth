import { useAuth } from "@/contexts/AuthContext";
import MessageForm from "../components/chat/MessageForm";
import MessageList from "../components/chat/MessageList";
import ChatInfo from "../components/chat/ChatInfo";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

   if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl">Please log in to access the chat.</h1>
        <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => navigate('/signin')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="px-auto w-full h-screen bg-pink-200">
      <div className="rounded-lg w-full h-full flex justify-between">
        <div className="w-2/6 flex justify-center items-center m-4">
          <ChatInfo />
        </div>
        <div className="w-4/6 relative p-4 rounded-lg shadow m-4 bg-pink-100">
          <div className="h-5/6">
            <div className="overflow-y-scroll h-full">
              <MessageList />
            </div>
          </div>
          <div className="h-1/6 flex justify-center items-end">
            <div className="w-full gap-4 flex flex-col">
              {user && (
                <div className="">
                  <MessageForm />
                </div>
              )}
              <div className=" flex justify-between">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

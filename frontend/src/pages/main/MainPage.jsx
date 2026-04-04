import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import clsx from "clsx";

import { useAuthStore } from "../../store/authStore";
import { useSocketStore } from "../../store/socketStore.js";

import Sidebar from "./sidebar/Sidebar.jsx";
import ChatArea from "./chatarea/ChatArea.jsx";

function MainPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const connect = useSocketStore((state) => state.connect);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate, connect]);

  useEffect(() => {
    if (!user) return;
    connect();
  }, [user, connect]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatArea />
    </div>
  );
}

//  {/* sidebar*/}
//       <div className="w-80 border-r flex flex-col bg-white">
//         {/*header*/}
//         <div className="p-4 border-b">
//           <h1 className="text-xl font-bold">Chats</h1>
//         </div>

//         <Sidebar />
//       </div>
//       <div>
//         <h1>Home</h1>
//         <h1>Hello {user.username}</h1>
//         <button onClick={() => logout()}>Logout</button>
//         <ChatArea />
//       </div>
export default MainPage;

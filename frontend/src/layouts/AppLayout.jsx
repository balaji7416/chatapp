// layouts/AppLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar.jsx";

function AppLayout() {
  const location = useLocation();
  const isChatView = location.pathname.startsWith("/chat/");

  return (
    <div className="flex h-screen overflow-hidden bg-base-100">
      {/* Sidebar - hidden on mobile when chat is selected */}
      <div
        className={`
          ${isChatView ? "hidden md:block" : "block"} {/* ✅ Clean! */}
          w-full md:w-[375px] md:shrink-0
          border-r border-base-300
          bg-base-100
          overflow-hidden
        `}
      >
        <Sidebar />
      </div>

      {/* Chat Area - hidden on mobile when no chat is selected */}
      <div
        className={`
          ${!isChatView ? "hidden md:flex" : "flex"} {/* ✅ Clean! */}
          flex-1
          min-w-0
          bg-base-100
          overflow-hidden
        `}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;

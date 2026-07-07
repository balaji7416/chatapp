import AuthPage from "./pages/AuthPage.jsx";
import ChatViewPage from "./pages/ChatPage.jsx";
import ChatInfoPage from "./pages/ChatInfoPage.jsx";
import ChatEmptyState from "./pages/ChatEmptyState.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import Toast from "./components/common/Toast.jsx";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useSocketEvents } from "./hooks/useSocketEvents.js";
import { useAuthStore } from "./store/authStore.js";
import { useSocketStore } from "./store/socketStore.js";
import { useEffect } from "react";
//import { useChatStore } from "./store/chatStore.js";

import AppLayout from "./layouts/AppLayout.jsx";
import ChatLayout from "./layouts/ChatLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

function App() {
  const user = useAuthStore((state) => state.user);
  const connect = useSocketStore((state) => state.connect);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isSocketConnected = useSocketStore((state) => state.isConnected);
  // const currConversationId = useChatStore(
  //   (state) => state.currentConversationId,
  // );

  //  Mount socket listeners ONCE at app level
  useSocketEvents();

  // Connect socket when user is authenticated
  useEffect(() => {
    if (user && accessToken && !isSocketConnected) {
      console.log("[App] Connecting socket...");
      connect();
    }
  }, [user, accessToken, isSocketConnected, connect]);

  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Empty state - no chat selected */}
          <Route index element={<ChatEmptyState />} />

          {/* Chat routes with persistent header */}
          <Route path="chat/:id" element={<ChatLayout />}>
            <Route index element={<ChatViewPage />} />
            <Route path="info" element={<ChatInfoPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toast />
    </>
  );
}

export default App;

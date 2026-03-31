import AuthPage from "./pages/auth/AuthPage.jsx";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />}></Route>
      <Route
        path="*"
        element={
          <main style={{ padding: "1rem" }}>
            <p>There's nothing here!</p>
          </main>
        }
      ></Route>
    </Routes>
  );
}

export default App;

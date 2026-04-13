import AuthPage from "./pages/auth/AuthPage.jsx";
import MainPage from "./pages/main/MainPage.jsx";
import { Route, Routes } from "react-router-dom";
import Toast from "./components/Toast.jsx";
import Playground from "./components/Playground.jsx";
function App() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/" element={<MainPage />}></Route>
        <Route path="/play" element={<Playground />}></Route>
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          }
        ></Route>
      </Routes>
      <Toast />
    </>
  );
}

export default App;

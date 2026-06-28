import AuthPage from "./pages/AuthPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import { Route, Routes } from "react-router-dom";
import Toast from "./components/common/Toast.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />}></Route>
        <Route path="/" element={<MainPage />}></Route>
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

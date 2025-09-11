// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterPage from "./pages/Registro";
import LoginPage from "./pages/Login";
import Cliente from "./pages/Cliente";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/cliente" element={<Cliente />} />
      </Routes>
    </Router>
  );
}

export default App;

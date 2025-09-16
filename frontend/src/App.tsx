// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterPage from "./pages/Registro";
import LoginPage from "./pages/Login";
import Cliente from "./pages/Cliente";
import Root from "./pages/Root"; 
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/cliente" element={<Cliente />} />
        <Route path="/root" element={<Root />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;

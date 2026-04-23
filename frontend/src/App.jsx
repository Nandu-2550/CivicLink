import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AuthorityLogin from "./pages/AuthorityLogin";
import CitizenDashboard from "./pages/CitizenDashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/authority-login" element={<AuthorityLogin />} />
        <Route path="/dashboard" element={<CitizenDashboard />} />
        <Route path="/authority-dashboard" element={<AuthorityDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
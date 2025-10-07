import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CodeConverter from "./pages/CodeConverter";
import Lessons from "./pages/Lessons";
import Login from "./pages/LoginPage";

import './App.css';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/LandingPage" element={<LandingPage />} />
                <Route path="/converter" element={<CodeConverter />} />
                <Route path="/lessons" element={<Lessons />} />
            </Routes>
        </Router>
    );
};

export default App;

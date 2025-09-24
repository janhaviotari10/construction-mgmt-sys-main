import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/homepage/Dashboard";
import Body from "./components/homepage/Body";
import Navbar from "./components/homepage/NavBar"; 
//import ExpenseTable from "./components/expense/ExpenseTable";
//import NavBarExpense from "./components/expense/NavBarExpense";
import Documents from "./components/Documents";
import LoginPage from "./LoginPage";
import MainContent from "./MainContent";
import CostEstMain from "./CostEstMain";
import Chatbot from "./components/Chatbot/Chatbot"; // Import the Chatbot component
import Gallery from "./components/homepage/Gallery";
import Meetings from "./components/schedule_meeting/Meetings";
//import Notifications from "./components/schedule_meeting/Notifications";
//import Sidebar from "./components/schedule_meeting/Sidebar";

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State to manage chatbot visibility

  // Function to toggle the chatbot visibility
  const toggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
  };

  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<><Navbar /><Body /></>} />
          <Route path="/home" element={<><Navbar /><Body /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/gallery" element={<Gallery />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expense" element={<>
          <Meetings/> </>} />
          <Route path="/schedule/*" element={<MainContent />} />
          <Route path="/document" element={<Documents />} />
          <Route path="/cost" element={<CostEstMain />} />
        </Routes>

        <Chatbot />
    </Router>
  );
}

export default App;
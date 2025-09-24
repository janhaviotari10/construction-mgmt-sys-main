import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';  // Optional: If you want global styles
import App from './App';  // Import your main app component
import { BrowserRouter } from 'react-router-dom';  // Import BrowserRouter for routing

// Render the App component inside the root div in the public/index.html
ReactDOM.render(
  <BrowserRouter>  {/* Enable routing */}
    <App />
  </BrowserRouter>,
  document.getElementById('root')  // Target root div where React app mounts
);

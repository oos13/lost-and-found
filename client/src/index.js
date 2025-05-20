import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


// Bootstrap CSS (must be first)
import 'bootstrap/dist/css/bootstrap.min.css';

// Your custom theme CSS (must come *after* Bootstrap)
import './styles/theme.css';

// Bootstrap JS (optional, needed for dropdowns, modals, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);





import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css'
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { ToastContainer } from 'react-toastify';
<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>

const rootElement = document.getElementById('root')
if (!rootElement) 
  throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App/>
    <ToastContainer/>
  </React.StrictMode>
);

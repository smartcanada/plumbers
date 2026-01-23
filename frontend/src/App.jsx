import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Dashboard from './Dashboard';
import Clients from './Clients';
import Employees from './Employees';
import Crews from './Crews';
import Inventory from './Inventory';
import Tasks from './Tasks';
import Jobs from './Jobs';
import Scheduler from './Scheduler';
import Invoices from './Invoices';
import Reports from './Reports';

function App() {
  useEffect(() => {
    // On mount, check for saved theme or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/crews" element={<Crews />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;

export default function Dashboard() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  const [isDark, setIsDark] = useState(document.body.classList.contains('dark'));

  const toggleTheme = () => {
    if (document.body.classList.contains('dark')) {
      document.body.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.body.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-indigo-600 tracking-tight">Plumbers App</span>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className={`${isActive('/')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Dashboard</Link>
                <Link to="/clients" className={`${isActive('/clients')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Clients</Link>
                <Link to="/employees" className={`${isActive('/employees')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Employees</Link>
                <Link to="/crews" className={`${isActive('/crews')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Crews</Link>
                <Link to="/inventory" className={`${isActive('/inventory')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Inventory</Link>
                <Link to="/tasks" className={`${isActive('/tasks')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Tasks</Link>
                <Link to="/jobs" className={`${isActive('/jobs')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Jobs</Link>
                <Link to="/scheduler" className={`${isActive('/scheduler')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Scheduler</Link>
                <Link to="/invoices" className={`${isActive('/invoices')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Invoices</Link>
                <Link to="/reports" className={`${isActive('/reports')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Reports</Link>
                <Link to="/settings" className={`${isActive('/settings')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>Settings</Link>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors" aria-label="Toggle Dark Mode">
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/clients" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Clients</h5>
            <p className="font-normal text-gray-700">Manage your client base and addresses.</p>
          </Link>
          <Link to="/employees" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Employees</h5>
            <p className="font-normal text-gray-700">Manage your staff and crews.</p>
          </Link>
          <Link to="/crews" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Crews</h5>
            <p className="font-normal text-gray-700">Organize employees into crews.</p>
          </Link>
          <Link to="/inventory" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Inventory</h5>
            <p className="font-normal text-gray-700">Track parts and materials.</p>
          </Link>
          <Link to="/tasks" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Tasks</h5>
            <p className="font-normal text-gray-700">Manage work orders and jobs.</p>
          </Link>
          <Link to="/jobs" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Jobs</h5>
            <p className="font-normal text-gray-700">Create and manage work orders.</p>
          </Link>
          <Link to="/scheduler" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Scheduler</h5>
            <p className="font-normal text-gray-700">View calendar and crew assignments.</p>
          </Link>
          <Link to="/invoices" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Invoices</h5>
            <p className="font-normal text-gray-700">Create and manage client invoices.</p>
          </Link>
          <Link to="/reports" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Reports</h5>
            <p className="font-normal text-gray-700">View business analytics and performance.</p>
          </Link>
          <Link to="/settings" className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Settings</h5>
            <p className="font-normal text-gray-700">Configure application options.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
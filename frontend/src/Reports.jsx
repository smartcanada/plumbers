import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_URL = '/api';

export default function Reports() {
  const [invoices, setInvoices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [crews, setCrews] = useState([]);

  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, jobsRes, crewsRes] = await Promise.all([
        fetch(`${API_URL}/invoices`),
        fetch(`${API_URL}/jobs`),
        fetch(`${API_URL}/crews`)
      ]);

      if (invRes.ok) setInvoices(await invRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (crewsRes.ok) setCrews(await crewsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Calculations
  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + (i.total_amount || 0), 0);

  const outstandingRevenue = invoices
    .filter(i => i.status !== 'Paid')
    .reduce((sum, i) => sum + (i.total_amount || 0), 0);

  const unsentRevenue = invoices
    .filter(i => i.status === 'Draft')
    .reduce((sum, i) => sum + (i.total_amount || 0), 0);

  const overdueRevenue = invoices
    .filter(i => i.status === 'Overdue')
    .reduce((sum, i) => sum + (i.total_amount || 0), 0);

  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  const scheduledJobs = jobs.filter(j => j.status === 'Scheduled').length;

  const jobsByType = jobs.reduce((acc, job) => {
    const type = job.job_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const getMongoId = (obj) => {
    if (!obj) return null;
    if (obj._id && typeof obj._id === 'object' && obj._id.$oid) return String(obj._id.$oid).trim();
    const id = obj._id || obj.id;
    return id ? String(id).replace(/[^a-fA-F0-9]/g, '') : null;
  };

  const jobsByCrew = crews.map(crew => {
    const count = jobs.filter(j => j.crew_id === getMongoId(crew) && j.status === 'Completed').length;
    return { name: crew.name, count };
  });

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
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">Reports Dashboard</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link to="/jobs" state={{ status: 'Completed' }} className="bg-white overflow-hidden shadow rounded-lg block hover:bg-gray-50 transition-colors">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Completed Jobs</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{completedJobs}</dd>
            </div>
          </Link>
          <Link to="/jobs" state={{ status: 'Scheduled' }} className="bg-white overflow-hidden shadow rounded-lg block hover:bg-gray-50 transition-colors">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Scheduled Jobs</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{scheduledJobs}</dd>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue (Paid)</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${totalRevenue.toFixed(2)}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Unpaid Invoices</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${outstandingRevenue.toFixed(2)}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Unsent Invoices</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${unsentRevenue.toFixed(2)}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Overdue Invoices</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">${overdueRevenue.toFixed(2)}</dd>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Jobs by Type</h3>
            <ul className="divide-y divide-gray-200">
              {Object.entries(jobsByType).map(([type, count]) => (
                <li key={type} className="py-4 flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{type}</span>
                  <span className="text-sm text-gray-500">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Completed Jobs by Crew</h3>
            <ul className="divide-y divide-gray-200">
              {jobsByCrew.map((crew) => (
                <li key={crew.name} className="py-4 flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{crew.name}</span>
                  <span className="text-sm text-gray-500">{crew.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
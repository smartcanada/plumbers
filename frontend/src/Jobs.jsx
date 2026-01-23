import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import moment from 'moment';
import JobForm from './JobForm';
import JobTable from './JobTable';

const API_URL = '/api';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [crews, setCrews] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingJob, setEditingJob] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'work_order_number', direction: 'desc' });

  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setStatusFilter(location.state?.status || 'All');
  }, [location]);

  const fetchData = async () => {
    try {
      const [jobsRes, clientsRes, crewsRes, tasksRes, empsRes, invRes] = await Promise.all([
        fetch(`${API_URL}/jobs`),
        fetch(`${API_URL}/clients`),
        fetch(`${API_URL}/crews`),
        fetch(`${API_URL}/tasks`),
        fetch(`${API_URL}/employees`),
        fetch(`${API_URL}/inventory`)
      ]);

      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (crewsRes.ok) setCrews(await crewsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (empsRes.ok) setEmployees(await empsRes.json());
      if (invRes.ok) setInventory(await invRes.json());
    } catch (error) { console.error('Error fetching data:', error); }
  };

  const getMongoId = (item) => {
      if (!item) return null;
      if (item._id && typeof item._id === 'object' && item._id.$oid) return String(item._id.$oid).trim();
      return String(item._id || item.id).replace(/[^a-fA-F0-9]/g, '');
  };

  const getClientName = (id) => {
    const client = clients.find(c => getMongoId(c) === id);
    return client ? client.name : 'Unknown';
  };

  const openModal = (job = null) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const calculateNextDate = (dateStr, recurrence) => {
    const date = moment(dateStr);
    if (!date.isValid()) return null;
    switch (recurrence) {
      case 'daily': return date.add(1, 'days');
      case 'weekly': return date.add(1, 'weeks');
      case 'bi_weekly': return date.add(2, 'weeks');
      case 'monthly': return date.add(1, 'months');
      case 'quarterly': return date.add(3, 'months');
      case 'bi_annual': return date.add(6, 'months');
      case 'annual': return date.add(1, 'years');
      case 'spring': 
      case 'summer': 
      case 'fall': 
      case 'winter': return date.add(1, 'years');
      default: return null;
    }
  };

  const handleSave = async (jobData) => {
    try {
      const method = editingJob ? 'PUT' : 'POST';
      const id = editingJob ? getMongoId(editingJob) : '';
      const url = editingJob ? `${API_URL}/jobs/${id}` : `${API_URL}/jobs`;
      
      const payload = { ...jobData };
      if (editingJob) payload._id = id;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        closeModal();
        
        // Automatic Rescheduling Logic
        if (jobData.status === 'Completed' && jobData.recurrence && jobData.recurrence !== 'one_time') {
            // Only prompt if the original job wasn't already completed (to avoid double prompts on edits)
            if (!editingJob || editingJob.status !== 'Completed') {
                const nextStart = calculateNextDate(jobData.start_time, jobData.recurrence);
                const nextEnd = calculateNextDate(jobData.end_time, jobData.recurrence);
                
                if (nextStart && window.confirm(`Job marked Completed. This is a recurring (${jobData.recurrence}) job.\n\nSchedule next appointment for ${nextStart.format('MMMM Do, YYYY')}?`)) {
                     const newJob = {
                        ...jobData,
                        _id: undefined, // Clear ID for new creation
                        id: undefined,
                        work_order_number: '', // Let backend generate new WO
                        start_time: nextStart.format('YYYY-MM-DD[T]HH:mm'),
                        end_time: nextEnd ? nextEnd.format('YYYY-MM-DD[T]HH:mm') : null,
                        status: 'Scheduled'
                     };
                     
                     await fetch(`${API_URL}/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newJob) });
                }
            }
        }
        fetchData();
      } else {
        alert("Failed to save job.");
      }
    } catch (error) { console.error('Error saving job:', error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
        const response = await fetch(`${API_URL}/jobs/${id}`, { method: 'DELETE' });
        if (response.ok) fetchData();
    } catch (error) { console.error('Error deleting job:', error); }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredJobs = jobs.filter(job => 
    (job.work_order_number && job.work_order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getClientName(job.client_id).toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(job => statusFilter === 'All' || job.status === statusFilter)
  .sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let valA, valB;
    
    // Handle special fields that need lookup or formatting
    if (sortConfig.key === 'client_id') {
        valA = getClientName(a.client_id).toLowerCase();
        valB = getClientName(b.client_id).toLowerCase();
    } else if (sortConfig.key === 'task_id') {
        valA = (tasks.find(t => getMongoId(t) === a.task_id)?.name || '').toLowerCase();
        valB = (tasks.find(t => getMongoId(t) === b.task_id)?.name || '').toLowerCase();
    } else if (sortConfig.key === 'crew_id') {
        valA = (crews.find(c => getMongoId(c) === a.crew_id)?.name || '').toLowerCase();
        valB = (crews.find(c => getMongoId(c) === b.crew_id)?.name || '').toLowerCase();
    } else if (sortConfig.key === 'technician_id') {
        valA = (employees.find(e => getMongoId(e) === a.technician_id)?.name || '').toLowerCase();
        valB = (employees.find(e => getMongoId(e) === b.technician_id)?.name || '').toLowerCase();
    } else {
        valA = (a[sortConfig.key] || '').toString().toLowerCase();
        valB = (b[sortConfig.key] || '').toString().toLowerCase();
    }

    if (valA < valB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
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
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Jobs</h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Unscheduled">Unscheduled</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><SearchIcon /></div>
              <input type="text" className="block w-full rounded-md border border-gray-300 pl-10 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Search jobs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => openModal()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="mr-2"><PlusIcon /></span> Create Job
            </button>
          </div>
        </div>

        <JobTable 
          jobs={filteredJobs}
          sortConfig={sortConfig}
          onSort={requestSort}
          clients={clients} 
          tasks={tasks} 
          crews={crews} 
          employees={employees} 
          onEdit={openModal} 
          onDelete={handleDelete} 
        />
      </main>

      {isModalOpen && (
        <JobForm 
          job={editingJob}
          clients={clients}
          tasks={tasks}
          crews={crews}
          employees={employees}
          inventory={inventory}
          onSave={handleSave}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}

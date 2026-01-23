import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import { Link, useLocation } from 'react-router-dom';
import JobForm from './JobForm';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);
const API_URL = '/api';

export default function Scheduler() {
  const [events, setEvents] = useState([]);
  const [crews, setCrews] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  useEffect(() => {
    fetchJobs();
    fetchCrews();
    fetchTasks();
    fetchInvoices();
    fetchClients();
    fetchEmployees();
    fetchInventory();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data
          .filter(job => {
             const d = new Date(job.start_time);
             return job.start_time && !isNaN(d.getTime());
          })
          .map(job => {
            const start = new Date(job.start_time);
            // Default to 1 hour duration if end_time is missing
            const end = job.end_time ? new Date(job.end_time) : new Date(start.getTime() + 60 * 60 * 1000);
            return {
              id: job._id || job.id,
              title: job.work_order_number || 'Job',
              start,
              end,
              resource: job
            };
          });
        setEvents(formattedEvents);
      }
    } catch (error) { console.error('Error fetching jobs:', error); }
  };

  const fetchCrews = async () => {
    try {
      const response = await fetch(`${API_URL}/crews`);
      if (response.ok) setCrews(await response.json());
    } catch (error) { console.error('Error fetching crews:', error); }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (response.ok) setTasks(await response.json());
    } catch (error) { console.error('Error fetching tasks:', error); }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices`);
      if (response.ok) setInvoices(await response.json());
    } catch (error) { console.error('Error fetching invoices:', error); }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`);
      if (response.ok) setClients(await response.json());
    } catch (error) { console.error('Error fetching clients:', error); }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`);
      if (response.ok) setEmployees(await response.json());
    } catch (error) { console.error('Error fetching employees:', error); }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory`);
      if (response.ok) setInventory(await response.json());
    } catch (error) { console.error('Error fetching inventory:', error); }
  };

  const getMongoId = (item) => {
      if (!item) return null;
      if (item._id && typeof item._id === 'object' && item._id.$oid) return String(item._id.$oid).trim();
      return String(item._id || item.id).replace(/[^a-fA-F0-9]/g, '');
  };

  const eventPropGetter = (event) => {
    const job = event.resource;
    const jobId = getMongoId(job);
    const isInvoiced = invoices.some(inv => inv.job_id === jobId);
    if (isInvoiced) return { style: { backgroundColor: '#000000' } };

    const crewId = job.crew_id;
    const crew = crews.find(c => getMongoId(c) === crewId);
    const backgroundColor = crew ? crew.color : '#3b82f6';
    return { style: { backgroundColor } };
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

  const handleSelectEvent = (event) => {
    setEditingJob(event.resource);
    setIsModalOpen(true);
  };

  const onEventDrop = async ({ event, start, end }) => {
    const job = event.resource;
    const updatedJob = {
        ...job,
        start_time: moment(start).format('YYYY-MM-DD[T]HH:mm'),
        end_time: moment(end).format('YYYY-MM-DD[T]HH:mm')
    };
    try {
        const response = await fetch(`${API_URL}/jobs/${getMongoId(job)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedJob)
        });
        if (response.ok) fetchJobs();
    } catch (error) { console.error('Error updating job:', error); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
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
        // Check for recurrence logic: If Completed and Recurring, prompt for next job
        if (jobData.status === 'Completed' && jobData.recurrence && jobData.recurrence !== 'one_time') {
            // Only prompt if it wasn't already completed (to avoid double scheduling on minor edits)
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
                     
                     await fetch(`${API_URL}/jobs`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newJob)
                     });
                }
            }
        }
        closeModal();
        fetchJobs();
      } else {
        alert("Failed to save job.");
      }
    } catch (error) {
      console.error('Error saving job:', error);
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
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-[800px] bg-white p-4 rounded-lg shadow">
          <DnDCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onEventDrop={onEventDrop}
            eventPropGetter={eventPropGetter}
            resizable
          />
        </div>
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

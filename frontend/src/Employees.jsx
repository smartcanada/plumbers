import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_URL = '/api';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'Plumber', color: '#3b82f6'
  });

  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const getEmployeeId = (emp) => {
    if (!emp) return null;
    if (emp._id && typeof emp._id === 'object' && emp._id.$oid) {
      return String(emp._id.$oid).trim();
    }
    const id = emp._id || emp.id;
    if (!id) return null;
    return String(id).replace(/[^a-fA-F0-9]/g, '');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (emp = null) => {
    if (emp) {
      setFormData({
        name: emp.name,
        email: emp.email || '',
        phone: emp.phone || '',
        role: emp.role || 'Plumber',
        color: emp.color || '#3b82f6'
      });
      const id = getEmployeeId(emp);
      if (!id) return;
      setEditingId(id);
    } else {
      setFormData({ name: '', email: '', phone: '', role: 'Plumber', color: '#3b82f6' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchEmployees();
      } else {
        const errText = await response.text();
        alert(`Failed to delete employee. Server responded with: ${response.status} ${errText}`);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(`Error deleting employee: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/employees/${editingId}` : `${API_URL}/employees`;
      const payload = editingId ? { ...formData, _id: editingId } : formData;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        closeModal();
        fetchEmployees();
      } else {
        const errText = await response.text();
        alert(`Failed to save employee. Server responded with: ${response.status} ${errText}`);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert("Error saving employee. Check console.");
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-indigo-600 tracking-tight">Plumbers App</span>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className={`${isActive('/')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Dashboard
                </Link>
                <Link to="/clients" className={`${isActive('/clients')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Clients
                </Link>
                <Link to="/employees" className={`${isActive('/employees')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Employees
                </Link>
                <Link to="/crews" className={`${isActive('/crews')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Crews
                </Link>
                <Link to="/inventory" className={`${isActive('/inventory')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Inventory
                </Link>
                <Link to="/tasks" className={`${isActive('/tasks')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Tasks
                </Link>
                <Link to="/jobs" className={`${isActive('/jobs')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Jobs
                </Link>
                <Link to="/scheduler" className={`${isActive('/scheduler')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Scheduler
                </Link>
                <Link to="/invoices" className={`${isActive('/invoices')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Invoices
                </Link>
                <Link to="/reports" className={`${isActive('/reports')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Employees</h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-4">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><SearchIcon /></div>
              <input type="text" className="block w-full rounded-md border border-gray-300 pl-10 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => openModal()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="mr-2"><PlusIcon /></span> Add Employee
            </button>
          </div>
        </div>

        <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentEmployees.map((emp) => (
                <tr key={getEmployeeId(emp)} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3" style={{ backgroundColor: emp.color }}>
                        {emp.name.charAt(0)}
                      </div>
                      {emp.name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{emp.role}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="text-gray-900">{emp.email}</div>
                    <div className="text-gray-500">{emp.phone}</div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => openModal(emp)} className="text-indigo-600 hover:text-indigo-900 mr-4"><EditIcon /></button>
                    <button onClick={() => handleDelete(getEmployeeId(emp))} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500 transition-colors"><XIcon /></button>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input name="name" value={formData.name} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><input name="role" value={formData.role} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input name="phone" value={formData.phone} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label><input name="color" type="color" value={formData.color} onChange={handleChange} className="block w-full h-10 border border-gray-300 rounded-md shadow-sm p-1" /></div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">{editingId ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
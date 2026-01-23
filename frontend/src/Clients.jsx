import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_URL = '/api';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const PhotoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormData = {
    name: '', address1: '', address2: '', city: '', province: '', postal_code: '', phone: '', alt_phone: '', email: '', notes: '',
    alarm_code: '', filter_system: '', sewage: '', photos: [],
    cottage: false, boathouse: false, cabin_1: false, cabin_2: false, garage: false,
    cottage_system_id: '', boathouse_system_id: '', cabin_1_system_id: '', cabin_2_system_id: '', garage_system_id: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  useEffect(() => {
    fetchClients();
    fetchTasks();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (response.ok) setTasks(await response.json());
    } catch (error) { console.error('Error fetching tasks:', error); }
  };

  const getClientId = (client) => {
    if (!client) return null;
    if (client._id && typeof client._id === 'object' && client._id.$oid) {
      return String(client._id.$oid).trim();
    }
    const id = client._id || client.id;
    if (!id) return null;
    
    return String(id).replace(/[^a-fA-F0-9]/g, '');
  };

  const getMongoId = (item) => {
      if (!item) return null;
      if (item._id && typeof item._id === 'object' && item._id.$oid) return String(item._id.$oid).trim();
      return String(item._id || item.id).replace(/[^a-fA-F0-9]/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photos: [...prev.photos, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removePhoto = (index) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/clients/import`, { method: 'POST', body: formData });
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchClients();
      } else {
        alert("Failed to import clients.");
      }
    } catch (error) {
      console.error("Error importing clients:", error);
    }
    e.target.value = null;
  };

  const openModal = (client = null) => {
    if (client) {
      setFormData({
        name: client.name,
        address1: client.address1 || '',
        address2: client.address2 || '',
        city: client.city || '',
        province: client.province || '',
        postal_code: client.postal_code || '',
        phone: client.phone || '',
        alt_phone: client.alt_phone || '',
        email: client.email || '',
        notes: client.notes || '',
        alarm_code: client.alarm_code || '',
        filter_system: client.filter_system || '',
        sewage: client.sewage || '',
        photos: client.photos || [],
        cottage: client.cottage || false,
        boathouse: client.boathouse || false,
        cabin_1: client.cabin_1 || false,
        cabin_2: client.cabin_2 || false, 
        garage: client.garage || false,
        cottage_system_id: client.cottage_system_id || '',
        boathouse_system_id: client.boathouse_system_id || '',
        cabin_1_system_id: client.cabin_1_system_id || '',
        cabin_2_system_id: client.cabin_2_system_id || '',
        garage_system_id: client.garage_system_id || ''
      });
      const id = getClientId(client);
      if (!id) return;
      setEditingId(id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClients();
      } else {
        const errText = await response.text();
        alert(`Failed to delete client. Server responded with: ${response.status} ${errText}`);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert(`Error deleting client: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/clients/${editingId}` : `${API_URL}/clients`;
      
      const payload = editingId ? { ...formData, _id: editingId } : formData;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        closeModal();
        fetchClients();
      } else {
        const errText = await response.text();
        alert(`Failed to save client. Server responded with: ${response.status} ${errText}`);
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert("Error saving client. Check console.");
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a.name.localeCompare(b.name));

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
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Clients
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-4">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-gray-300 pl-10 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="client-upload" />
              <label htmlFor="client-upload" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer">
                <span className="mr-2"><UploadIcon /></span> Import CSV
              </label>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="mr-2"><PlusIcon /></span> Add Client
            </button>
          </div>
        </div>

        <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden flex flex-col h-[75vh]">
        <div className="overflow-auto flex-grow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact Info</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Address</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Properties</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Alarm</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Filter</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sewage</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notes</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 sticky right-0 bg-gray-50 z-20 border-l border-gray-200">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredClients.map((client) => (
              <tr key={getClientId(client)} title={`ID: ${getClientId(client)}`} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out group">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {client.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="text-gray-900">{client.email}</div>
                  <div className="text-gray-500">{client.phone}</div>
                  {client.alt_phone && <div className="text-gray-400 text-xs">Alt: {client.alt_phone}</div>}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="text-gray-900">{client.address1}</div>
                  <div className="text-xs text-gray-400">{client.city}, {client.province} {client.postal_code}</div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {client.cottage && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Cottage</span>}
                    {client.boathouse && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Boathouse</span>}
                    {client.cabin_1 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Cabin 1</span>}
                    {client.cabin_2 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Cabin 2</span>}
                    {client.garage && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Garage</span>}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={client.alarm_code}>
                  {client.alarm_code}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={client.filter_system}>
                  {client.filter_system}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={client.sewage}>
                  {client.sewage}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={client.notes}>
                  {client.notes}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-200">
                  <button onClick={() => openModal(client)} className="text-indigo-600 hover:text-indigo-900 mr-4"><EditIcon /></button>
                  <button onClick={() => handleDelete(getClientId(client))} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-base font-semibold text-gray-900">No clients found</p>
                    <p className="mt-1 text-gray-500">Get started by creating a new client.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">{editingId ? 'Edit Client' : 'Add New Client'}</h3>
                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500 transition-colors"><XIcon /></button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
                      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input name="name" value={formData.name} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input name="email" type="email" value={formData.email} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input name="phone" value={formData.phone} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alt Phone</label>
                          <input name="alt_phone" value={formData.alt_phone} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alarm Code</label>
                          <input name="alarm_code" value={formData.alarm_code} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Filter System</label>
                          <input name="filter_system" value={formData.filter_system} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sewage</label>
                          <input name="sewage" value={formData.sewage} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes: Warnings, preferences ...</label>
                          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Gate codes, warnings, preferences..." />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Service Address</h4>
                      <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                          <input name="address1" value={formData.address1} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-6">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                          <input name="address2" value={formData.address2} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input name="city" value={formData.city} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                          <input name="province" value={formData.province} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <input name="postal_code" value={formData.postal_code} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Properties</h4>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="flex items-center space-x-2 cursor-pointer min-w-[120px]">
                            <input type="checkbox" name="cottage" checked={formData.cottage} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <span className="text-sm font-medium text-gray-700">Cottage</span>
                          </label>
                          {formData.cottage && (
                            <select name="cottage_system_id" value={formData.cottage_system_id} onChange={handleChange} className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm">
                                <option value="">Select System (Task)</option>
                                {tasks.map(t => <option key={getMongoId(t)} value={getMongoId(t)}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="flex items-center space-x-2 cursor-pointer min-w-[120px]">
                            <input type="checkbox" name="boathouse" checked={formData.boathouse} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <span className="text-sm font-medium text-gray-700">Boathouse</span>
                          </label>
                          {formData.boathouse && (
                            <select name="boathouse_system_id" value={formData.boathouse_system_id} onChange={handleChange} className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm">
                                <option value="">Select System (Task)</option>
                                {tasks.map(t => <option key={getMongoId(t)} value={getMongoId(t)}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="flex items-center space-x-2 cursor-pointer min-w-[120px]">
                            <input type="checkbox" name="cabin_1" checked={formData.cabin_1} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <span className="text-sm font-medium text-gray-700">Cabin 1</span>
                          </label>
                          {formData.cabin_1 && (
                            <select name="cabin_1_system_id" value={formData.cabin_1_system_id} onChange={handleChange} className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm">
                                <option value="">Select System (Task)</option>
                                {tasks.map(t => <option key={getMongoId(t)} value={getMongoId(t)}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="flex items-center space-x-2 cursor-pointer min-w-[120px]">
                            <input type="checkbox" name="cabin_2" checked={formData.cabin_2} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <span className="text-sm font-medium text-gray-700">Cabin 2</span>
                          </label>
                          {formData.cabin_2 && (
                            <select name="cabin_2_system_id" value={formData.cabin_2_system_id} onChange={handleChange} className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm">
                                <option value="">Select System (Task)</option>
                                {tasks.map(t => <option key={getMongoId(t)} value={getMongoId(t)}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="flex items-center space-x-2 cursor-pointer min-w-[120px]">
                            <input type="checkbox" name="garage" checked={formData.garage} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                            <span className="text-sm font-medium text-gray-700">Garage</span>
                          </label>
                          {formData.garage && (
                            <select name="garage_system_id" value={formData.garage_system_id} onChange={handleChange} className="block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm">
                                <option value="">Select System (Task)</option>
                                {tasks.map(t => <option key={getMongoId(t)} value={getMongoId(t)}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Photos</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <PhotoIcon />
                              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                              <p className="text-xs text-gray-500">PNG, JPG</p>
                            </div>
                            <input id="photo-upload" type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoUpload} />
                          </label>
                        </div>
                        {formData.photos.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {formData.photos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <img src={photo} alt={`Client photo ${index + 1}`} className="h-24 w-full object-cover rounded-lg" />
                                <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <XIcon />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    {editingId ? 'Update Client' : 'Save Client'}
                  </button>
                  <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

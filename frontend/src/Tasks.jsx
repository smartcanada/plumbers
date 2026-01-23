import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_URL = '/api';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listeningField, setListeningField] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isDark, setIsDark] = useState(document.body.classList.contains('dark'));
  const [formData, setFormData] = useState({
    name: '', category: 'General', description: '', base_price: 0, estimated_duration: 60, inventory_ids: []
  });

  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const [tasksRes, invRes] = await Promise.all([
        fetch(`${API_URL}/tasks`),
        fetch(`${API_URL}/inventory`)
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data);
      } else {
        console.error('Failed to fetch tasks:', await tasksRes.text());
        alert('Error loading tasks from server. Check console for details.');
      }

      if (invRes.ok) {
        setInventory(await invRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Network error loading tasks.');
    }
  };

  const getMongoId = (obj) => {
    if (!obj) return null;
    if (obj._id && typeof obj._id === 'object' && obj._id.$oid) return String(obj._id.$oid).trim();
    const id = obj._id || obj.id;
    return id ? String(id).replace(/[^a-fA-F0-9]/g, '') : null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const startListening = (field) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Browser does not support speech recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListeningField(field);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, [field]: (prev[field] ? prev[field] + ' ' : '') + transcript }));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setListeningField(null);
    };

    recognition.onend = () => setListeningField(null);
    recognition.start();
  };

  const addInventoryItem = (e) => {
    const itemId = e.target.value;
    if (itemId && !formData.inventory_ids.includes(itemId)) {
      setFormData({ ...formData, inventory_ids: [...formData.inventory_ids, itemId] });
    }
    e.target.value = "";
  };

  const removeInventoryItem = (itemId) => {
    setFormData({ ...formData, inventory_ids: formData.inventory_ids.filter(id => id !== itemId) });
  };

  const openModal = (task = null) => {
    if (task) {
      setFormData({
        name: task.name || '',
        category: task.category || 'General',
        description: task.description || '',
        base_price: task.base_price || 0,
        estimated_duration: task.estimated_duration || 60,
        inventory_ids: task.inventory_ids || []
      });
      const id = getMongoId(task);
      if (!id) return;
      setEditingId(id);
    } else {
      setFormData({ name: '', category: 'General', description: '', base_price: 0, estimated_duration: 60, inventory_ids: [] });
      setEditingId(null);
    }
    setSelectedCategory('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task definition?')) return;
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      if (response.ok) fetchTasks();
      else alert(`Failed to delete task: ${await response.text()}`);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/tasks/${editingId}` : `${API_URL}/tasks`;
      
      const payload = {
        ...formData,
        base_price: parseFloat(formData.base_price) || 0,
        estimated_duration: parseInt(formData.estimated_duration) || 60
      };
      if (editingId) payload._id = editingId;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        closeModal();
        fetchTasks();
      } else {
        alert(`Failed to save task: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => 
    (task.name && task.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const taskCategories = ['General', 'Maintenance', 'Labour', 'Vehicle', 'Repairs', 'Rough-In', 'Fixtures'];
  const categories = [...new Set(inventory.map(item => item.category || 'General'))].sort();
  const filteredInventory = selectedCategory 
    ? inventory.filter(item => (item.category || 'General') === selectedCategory)
    : inventory;

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
            <div className="flex items-center">
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors" aria-label="Toggle Dark Mode">
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Task Library</h2>
            <p className="mt-1 text-sm text-gray-500">Define standard services and jobs here.</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-4">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><SearchIcon /></div>
              <input type="text" className="block w-full rounded-md border border-gray-300 pl-10 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => openModal()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="mr-2"><PlusIcon /></span> Add Task
            </button>
          </div>
        </div>

        <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Task Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Base Price</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Duration</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredTasks.map((task) => (
                <tr key={getMongoId(task)} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{task.name}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{task.category || 'General'}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{task.description}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${task.base_price}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{task.estimated_duration} min</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => openModal(task)} className="text-indigo-600 hover:text-indigo-900 mr-4"><EditIcon /></button>
                    <button onClick={() => handleDelete(getMongoId(task))} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (<tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">No tasks found.</td></tr>)}
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{editingId ? 'Edit Task' : 'Add New Task'}</h3>
                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500 transition-colors"><XIcon /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                      <div className="relative rounded-md shadow-sm">
                        <input name="name" value={formData.name} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 sm:text-sm" required placeholder="e.g. Faucet Installation" />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button type="button" onClick={() => startListening('name')} className={`${listeningField === 'name' ? 'text-red-500' : 'text-gray-400 hover:text-gray-500'}`}><MicIcon /></button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                        {taskCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <div className="relative rounded-md shadow-sm">
                        <input name="description" value={formData.description} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 sm:text-sm" />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button type="button" onClick={() => startListening('description')} className={`${listeningField === 'description' ? 'text-red-500' : 'text-gray-400 hover:text-gray-500'}`}><MicIcon /></button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label><input name="base_price" type="number" value={formData.base_price} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" placeholder="0.00 (if itemizing)" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Est. Duration (min)</label><input name="estimated_duration" type="number" value={formData.estimated_duration} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Required Parts</label>
                      <div className="mb-2">
                        <select 
                          value={selectedCategory} 
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm text-gray-600"
                        >
                          <option value="">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <select
                        onChange={addInventoryItem}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm mb-2"
                        defaultValue=""
                      >
                        <option value="" disabled>Select a part to add...</option>
                        {filteredInventory
                          .filter(item => !formData.inventory_ids.includes(getMongoId(item)))
                          .map(item => (
                            <option key={getMongoId(item)} value={getMongoId(item)}>
                              {item.name} {item.model_number ? `(${item.model_number})` : ''}
                            </option>
                          ))}
                      </select>
                      <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border border-gray-100 rounded-md bg-gray-50">
                        {formData.inventory_ids.length === 0 && <span className="text-sm text-gray-400 italic">No parts selected</span>}
                        {formData.inventory_ids.map(itemId => {
                          const item = inventory.find(i => getMongoId(i) === itemId);
                          if (!item) return null;
                          return (
                            <span key={itemId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {item.name}
                              <button
                                type="button"
                                onClick={() => removeInventoryItem(itemId)}
                                className="ml-1.5 inline-flex items-center justify-center text-indigo-400 hover:text-indigo-600 focus:outline-none"
                              >
                                <span className="sr-only">Remove</span>
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
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

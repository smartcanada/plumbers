import { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function JobForm({ job, clients, tasks, crews, employees, inventory, onSave, onCancel }) {
  const defaultJobData = {
    work_order_number: '', client_id: '', crew_id: '', task_id: '', technician_id: '',
    recurrence: 'one_time', status: 'Unscheduled', notes: '', priority: 'Standard', job_type: 'Service', 
    start_time: null, end_time: null, inventory_ids: [], service_locations: []
  };

  const getMongoId = (item) => {
      if (!item) return null;
      if (item._id && typeof item._id === 'object' && item._id.$oid) return String(item._id.$oid).trim();
      return String(item._id || item.id).replace(/[^a-fA-F0-9]/g, '');
  };

  const initializeFormData = () => {
    if (job) {
      return {
        work_order_number: job.work_order_number || '',
        client_id: job.client_id || '',
        crew_id: job.crew_id || '',
        task_id: job.task_id || '',
        technician_id: job.technician_id || '',
        recurrence: job.recurrence || 'one_time',
        status: job.status || 'Scheduled',
        notes: job.notes || '',
        priority: job.priority || 'Standard',
        job_type: job.job_type || 'Service',
        start_time: (job.start_time && typeof job.start_time === 'string') ? new Date(job.start_time) : (job.start_time instanceof Date ? job.start_time : null),
        end_time: (job.end_time && typeof job.end_time === 'string') ? new Date(job.end_time) : (job.end_time instanceof Date ? job.end_time : null),
        inventory_ids: Array.isArray(job.inventory_ids) ? job.inventory_ids : [],
        service_locations: Array.isArray(job.service_locations) ? job.service_locations : []
      };
    }
    return defaultJobData;
  };

  const [formData, setFormData] = useState(initializeFormData());
  const [buildingSelections, setBuildingSelections] = useState({
    cottage: false, boathouse: false, cabin_1: false, cabin_2: false, garage: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, name) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  // Initialize building selections when editing an existing job
  useEffect(() => {
    if (job && job.client_id && clients.length > 0 && tasks.length > 0) {
        const client = clients.find(c => getMongoId(c) === job.client_id);
        if (client) {
            const newSelections = { cottage: false, boathouse: false, cabin_1: false, cabin_2: false, garage: false };
            
            // 1. Try to load from saved service_locations (New Logic)
            if (job.service_locations && Array.isArray(job.service_locations) && job.service_locations.length > 0) {
                job.service_locations.forEach(loc => {
                    if (newSelections.hasOwnProperty(loc)) newSelections[loc] = true;
                });
            } else {
                // 2. Fallback to inventory heuristic (Legacy Logic)
                ['cottage', 'boathouse', 'cabin_1', 'cabin_2', 'garage'].forEach(b => {
                    if (client[b]) {
                        const sysId = client[`${b}_system_id`];
                        const task = tasks.find(t => getMongoId(t) === sysId);
                        if (task && task.inventory_ids && task.inventory_ids.length > 0) {
                            const jobInventory = Array.isArray(job.inventory_ids) ? job.inventory_ids : [];
                            const hasItems = task.inventory_ids.every(id => jobInventory.includes(id));
                            if (hasItems) newSelections[b] = true;
                        }
                    }
                });
            }
            setBuildingSelections(newSelections);
        }
    }
  }, [job, clients, tasks]);

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setFormData({ 
        ...formData, 
        client_id: clientId,
        inventory_ids: [], // Reset inventory when client changes
        service_locations: [] // Reset locations
    });
    setBuildingSelections({ cottage: false, boathouse: false, cabin_1: false, cabin_2: false, garage: false });
  };

  const toggleBuilding = (building) => {
    const client = clients.find(c => getMongoId(c) === formData.client_id);
    if (!client) return;

    const isSelected = buildingSelections[building];
    const systemId = client[`${building}_system_id`];
    
    if (!systemId) {
        // Just toggle the visual check if no system is assigned (no inventory to change)
        setBuildingSelections({ ...buildingSelections, [building]: !isSelected });
        
        // Update service_locations array
        const currentLocations = formData.service_locations || [];
        let newLocations;
        if (!isSelected) newLocations = [...currentLocations, building];
        else newLocations = currentLocations.filter(b => b !== building);
        
        setFormData(prev => ({ ...prev, service_locations: newLocations }));
        return;
    }

    const task = tasks.find(t => getMongoId(t) === systemId);
    if (!task || !task.inventory_ids) return;

    let newInventoryIds = [...formData.inventory_ids];
    const currentLocations = formData.service_locations || [];
    let newLocations;

    if (!isSelected) {
        // Add items
        newInventoryIds = [...newInventoryIds, ...task.inventory_ids];
        newLocations = [...currentLocations, building];
    } else {
        // Remove items (remove one instance of each item in the system)
        let tempIds = [...newInventoryIds];
        task.inventory_ids.forEach(id => {
            const idx = tempIds.indexOf(id);
            if (idx > -1) tempIds.splice(idx, 1);
        });
        newInventoryIds = tempIds;
        newLocations = currentLocations.filter(b => b !== building);
    }

    setFormData({ ...formData, inventory_ids: newInventoryIds, service_locations: newLocations });
    setBuildingSelections({ ...buildingSelections, [building]: !isSelected });
  };

  const handleTaskChange = (e) => {
    const taskId = e.target.value;
    const task = tasks.find(t => getMongoId(t) === taskId);
    
    let newInventoryIds = [...formData.inventory_ids];
    if (task && task.inventory_ids) {
        newInventoryIds = [...newInventoryIds, ...task.inventory_ids];
    }

    setFormData({ ...formData, task_id: taskId, inventory_ids: newInventoryIds });
  };

  const addInventoryItem = (e) => {
    const itemId = e.target.value;
    if (itemId) setFormData({ ...formData, inventory_ids: [...formData.inventory_ids, itemId] });
    e.target.value = "";
  };

  const removeInventoryItem = (index) => {
    setFormData({ ...formData, inventory_ids: formData.inventory_ids.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    
    // Helper to format date as local ISO string (YYYY-MM-DDTHH:mm:ss)
    // This prevents timezone shifts by sending "Wall Time" to the backend
    const toLocalISO = (date) => {
        if (!date) return null;
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 19);
    };

    if (payload.start_time instanceof Date) payload.start_time = toLocalISO(payload.start_time);
    if (payload.end_time instanceof Date) payload.end_time = toLocalISO(payload.end_time);

    if (!payload.start_time) payload.start_time = null;
    if (!payload.end_time) payload.end_time = null;
    onSave(payload);
  };

  const selectedClient = clients.find(c => getMongoId(c) === formData.client_id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{job ? 'Edit Job' : 'Create Job'}</h3>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-500 transition-colors"><XIcon /></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <select name="client_id" value={formData.client_id} onChange={handleClientChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" required>
                        <option value="">Select Client</option>
                        {clients.map(c => <option key={getMongoId(c)} value={getMongoId(c)}>{c.name}</option>)}
                    </select>
                </div>
                
                {selectedClient && (selectedClient.cottage || selectedClient.boathouse || selectedClient.cabin_1 || selectedClient.cabin_2 || selectedClient.garage) && (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Service Location(s)</label>
                        <div className="flex flex-wrap gap-4">
                            {selectedClient.cottage && (
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={buildingSelections.cottage} onChange={() => toggleBuilding('cottage')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm text-gray-700">Cottage</span>
                                </label>
                            )}
                            {selectedClient.boathouse && (
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={buildingSelections.boathouse} onChange={() => toggleBuilding('boathouse')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm text-gray-700">Boathouse</span>
                                </label>
                            )}
                            {selectedClient.cabin_1 && (
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={buildingSelections.cabin_1} onChange={() => toggleBuilding('cabin_1')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm text-gray-700">Cabin 1</span>
                                </label>
                            )}
                            {selectedClient.cabin_2 && (
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={buildingSelections.cabin_2} onChange={() => toggleBuilding('cabin_2')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm text-gray-700">Cabin 2</span>
                                </label>
                            )}
                            {selectedClient.garage && (
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={buildingSelections.garage} onChange={() => toggleBuilding('garage')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span className="ml-2 text-sm text-gray-700">Garage</span>
                                </label>
                            )}
                        </div>
                    </div>
                )}

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Task (Service)</label>
                    <select name="task_id" value={formData.task_id} onChange={handleTaskChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                        <option value="">Select Task</option>
                        {tasks.map(t => <option key={getMongoId(t)} value={getMongoId(t)}>{t.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                            <option value="Unscheduled">Unscheduled</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                            <option value="Standard">Standard</option>
                            <option value="High">High</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                    <select name="recurrence" value={formData.recurrence} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                        <option value="one_time">One Time</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="bi_weekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="bi_annual">Bi-Annual</option>
                        <option value="annual">Annual</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (Optional)</label>
                        <DatePicker
                            selected={formData.start_time}
                            onChange={(date) => handleDateChange(date, 'start_time')}
                            showTimeSelect
                            timeFormat="h:mm aa"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                            wrapperClassName="w-full"
                            placeholderText="Select Start Time"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time (Optional)</label>
                        <DatePicker
                            selected={formData.end_time}
                            onChange={(date) => handleDateChange(date, 'end_time')}
                            showTimeSelect
                            timeFormat="h:mm aa"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                            wrapperClassName="w-full"
                            placeholderText="Select End Time"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Crew</label>
                        <select name="crew_id" value={formData.crew_id} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                            <option value="">Select Crew</option>
                            {crews.map(c => <option key={getMongoId(c)} value={getMongoId(c)}>{c.name}</option>)}
                        </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                        <select name="technician_id" value={formData.technician_id} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                            <option value="">Select Technician</option>
                            {employees.map(e => <option key={getMongoId(e)} value={getMongoId(e)}>{e.name}</option>)}
                        </select>
                    </div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" /></div>
                
                {/* Inventory Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Parts / Inventory</label>
                  <select onChange={addInventoryItem} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm mb-2" defaultValue="">
                    <option value="" disabled>Add a part...</option>
                    {inventory.map(item => (
                        <option key={getMongoId(item)} value={getMongoId(item)}>{item.name} {item.model_number ? `(${item.model_number})` : ''}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border border-gray-100 rounded-md bg-gray-50">
                    {formData.inventory_ids.length === 0 && <span className="text-sm text-gray-400 italic">No parts selected</span>}
                    {formData.inventory_ids.map((itemId, index) => {
                      const item = inventory.find(i => getMongoId(i) === itemId);
                      if (!item) return null;
                      return (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {item.name}
                          <button type="button" onClick={() => removeInventoryItem(index)} className="ml-1.5 inline-flex items-center justify-center text-indigo-400 hover:text-indigo-600 focus:outline-none"><span className="sr-only">Remove</span><svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">{job ? 'Update Job' : 'Save Job'}</button>
              <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

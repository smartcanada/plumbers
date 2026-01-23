import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_URL = '/api';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const PDFIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '', job_id: '', invoice_number: '', description: '', total_amount: 0, status: 'Draft', issue_date: '', due_date: '', paid_date: '', client_signature: '', items: []
  });
  const sigCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, clientsRes, jobsRes, tasksRes, invItemsRes] = await Promise.all([
        fetch(`${API_URL}/invoices`),
        fetch(`${API_URL}/clients`),
        fetch(`${API_URL}/jobs`),
        fetch(`${API_URL}/tasks`),
        fetch(`${API_URL}/inventory`)
      ]);

      if (invRes.ok) setInvoices(await invRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (invItemsRes.ok) setInventory(await invItemsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
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
    
    // Auto-set Paid Date if status changes to Paid
    if (e.target.name === 'status' && e.target.value === 'Paid' && !formData.paid_date) {
      const today = new Date().toISOString().substring(0, 10);
      setFormData(prev => ({ ...prev, status: 'Paid', paid_date: today }));
    }
  };

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    const job = jobs.find(j => getMongoId(j) === jobId);
    
    if (!job) {
        setFormData({ ...formData, job_id: jobId });
        return;
    }

    const task = tasks.find(t => getMongoId(t) === job.task_id);
    const newItems = [];

    // Calculate Actual Duration from Job times
    let durationLabel = '';
    if (job.start_time && job.end_time) {
        const start = new Date(job.start_time);
        const end = new Date(job.end_time);
        const diffMins = Math.round((end - start) / 60000);
        if (diffMins > 0) durationLabel = ` (Actual: ${diffMins} mins)`;
    }

    // Add Task
    if (task) {
        newItems.push({
            description: `${task.name}${durationLabel}`,
            quantity: 1,
            unit_price: task.base_price || 0
        });
    }

    // Add Inventory Items
    if (job.inventory_ids && job.inventory_ids.length > 0) {
        job.inventory_ids.forEach(invId => {
            const item = inventory.find(i => getMongoId(i) === invId);
            if (item) {
                newItems.push({
                    description: item.name,
                    quantity: 1,
                    unit_price: item.selling_price || 0
                });
            }
        });
    }

    const total = newItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    setFormData({
        ...formData,
        job_id: jobId,
        client_id: job.client_id,
        invoice_number: job.work_order_number ? job.work_order_number.replace('WO-', 'INV-') : '',
        description: `Invoice for ${job.work_order_number || 'Job'}`,
        issue_date: job.end_time ? job.end_time.substring(0, 10) : new Date().toISOString().substring(0, 10),
        items: newItems,
        total_amount: total
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Recalculate total
    const total = newItems.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)), 0);
    
    setFormData({ ...formData, items: newItems, total_amount: total });
  };

  // Signature Pad Logic
  const startDrawing = (e) => {
    const canvas = sigCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = sigCanvasRef.current;
      setFormData(prev => ({ ...prev, client_signature: canvas.toDataURL() }));
    }
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, client_signature: '' }));
  };

  const openModal = (invoice = null) => {
    if (invoice) {
      setFormData({
        client_id: invoice.client_id,
        job_id: invoice.job_id || '',
        invoice_number: invoice.invoice_number || '',
        description: invoice.description || '',
        total_amount: invoice.total_amount || 0,
        status: invoice.status || 'Draft',
        items: invoice.items || [],
        issue_date: invoice.issue_date ? invoice.issue_date.substring(0, 10) : '',
        due_date: invoice.due_date ? invoice.due_date.substring(0, 10) : '',
        paid_date: invoice.paid_date ? invoice.paid_date.substring(0, 10) : '',
        client_signature: invoice.client_signature || ''
      });
      const id = getMongoId(invoice);
      if (!id) return;
      setEditingId(id);
    } else {
      setFormData({ client_id: '', job_id: '', invoice_number: '', description: '', total_amount: 0, status: 'Draft', items: [], issue_date: new Date().toISOString().substring(0, 10), due_date: '', paid_date: '', client_signature: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const response = await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
      if (response.ok) fetchData();
      else alert(`Failed to delete invoice: ${await response.text()}`);
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/invoices/${editingId}` : `${API_URL}/invoices`;
      const payload = { ...formData, total_amount: parseFloat(formData.total_amount) };
      
      // Sanitize date fields: ensure empty strings are converted to null
      if (!payload.issue_date) payload.issue_date = null;
      if (!payload.due_date) payload.due_date = null;
      if (!payload.paid_date) payload.paid_date = null;

      if (editingId) payload._id = editingId;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        closeModal();
        fetchData();
      } else {
        alert(`Failed to save invoice: ${await response.text()}`);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const getClientName = (id) => {
    const client = clients.find(c => getMongoId(c) === id);
    return client ? client.name : 'Unknown Client';
  };

  const createInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("INVOICE", 105, 20, { align: "center" });

    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoice_number || 'N/A'}`, 140, 30);
    doc.text(`Date: ${invoice.issue_date ? invoice.issue_date.substring(0, 10) : ''}`, 140, 35);
    doc.text(`Due Date: ${invoice.due_date ? invoice.due_date.substring(0, 10) : ''}`, 140, 40);
    doc.text(`Status: ${invoice.status}`, 140, 45);

    // Client Info
    doc.text("Bill To:", 20, 55);
    const client = clients.find(c => getMongoId(c) === invoice.client_id);
    if (client) {
        doc.setFontSize(12);
        doc.text(client.name, 20, 62);
        doc.setFontSize(10);
        if (client.address1) doc.text(client.address1, 20, 68);
        if (client.city) doc.text(`${client.city}, ${client.province || ''} ${client.postal_code || ''}`, 20, 73);
    } else {
        doc.text("Unknown Client", 20, 62);
    }

    // Items Table
    const tableColumn = ["Description", "Qty", "Price", "Total"];
    const tableRows = (invoice.items || []).map(item => [
      item.description,
      item.quantity,
      `$${parseFloat(item.unit_price || 0).toFixed(2)}`,
      `$${(item.quantity * item.unit_price || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [6, 182, 212] }, // Cyan brand color
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total: $${parseFloat(invoice.total_amount || 0).toFixed(2)}`, 140, finalY);

    // Signature
    if (invoice.client_signature) {
        doc.text("Signature:", 20, finalY + 20);
        doc.addImage(invoice.client_signature, 'PNG', 20, finalY + 25, 60, 20);
    }

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for your business!", 105, finalY + 20, { align: "center" });

    return doc;
  };

  const handlePrint = (invoice) => {
    try {
      const doc = createInvoicePDF(invoice);
      doc.save(`Invoice_${invoice.invoice_number || 'draft'}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please ensure jspdf is installed and check console for errors.");
    }
  };

  const handleEmail = async (invoice) => {
    if (!window.confirm(`Email invoice ${invoice.invoice_number} to client?`)) return;

    try {
      const doc = createInvoicePDF(invoice);
      const pdfBlob = doc.output('blob');
      
      const formData = new FormData();
      formData.append('file', pdfBlob, `Invoice_${invoice.invoice_number}.pdf`);

      const response = await fetch(`${API_URL}/invoices/${getMongoId(invoice)}/email`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchData(); // Refresh to see status update
      } else {
        const err = await response.json();
        alert(`Failed to send email: ${err.detail}`);
      }
    } catch (error) {
      console.error("Email Error:", error);
      alert("Error sending email. Check console.");
    }
  };

  const filteredInvoices = invoices
    .filter(inv => 
      (inv.invoice_number && inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getClientName(inv.client_id).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = a.issue_date ? new Date(a.issue_date) : 0;
      const dateB = b.issue_date ? new Date(b.issue_date) : 0;
      return dateB - dateA;
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
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Invoices</h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 gap-4">
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><SearchIcon /></div>
              <input type="text" className="block w-full rounded-md border border-gray-300 pl-10 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => openModal()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              <span className="mr-2"><PlusIcon /></span> Create Invoice
            </button>
          </div>
        </div>

        <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Invoice #</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Client</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Paid Date</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredInvoices.map((inv) => (
                <tr key={getMongoId(inv)} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{inv.invoice_number}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getClientName(inv.client_id)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inv.issue_date ? inv.issue_date.substring(0, 10) : ''}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${inv.total_amount.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{inv.status}</span></td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{inv.paid_date ? inv.paid_date.substring(0, 10) : '-'}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => handlePrint(inv)} className="text-gray-600 hover:text-gray-900 mr-4"><PDFIcon /></button>
                    <button onClick={() => handleEmail(inv)} className="text-blue-600 hover:text-blue-900 mr-4"><EmailIcon /></button>
                    <button onClick={() => openModal(inv)} className="text-indigo-600 hover:text-indigo-900 mr-4"><EditIcon /></button>
                    <button onClick={() => handleDelete(getMongoId(inv))} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (<tr><td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">No invoices found.</td></tr>)}
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{editingId ? 'Edit Invoice' : 'Create Invoice'}</h3>
                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500 transition-colors"><XIcon /></button>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Job (Optional)</label>
                      <select name="job_id" value={formData.job_id} onChange={handleJobChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                        <option value="">Select Completed Job</option>
                        {jobs
                          .filter(j => j.status === 'Completed' && !invoices.some(inv => inv.job_id === getMongoId(j) && getMongoId(inv) !== editingId))
                          .map(j => <option key={getMongoId(j)} value={getMongoId(j)}>{j.work_order_number || 'Job'} - {j.start_time ? j.start_time.substring(0, 10) : ''}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label><input name="invoice_number" value={formData.invoice_number} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" placeholder="Auto-generated if blank" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                      <select name="client_id" value={formData.client_id} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" required>
                        <option value="">Select Client</option>
                        {clients.map(c => <option key={getMongoId(c)} value={getMongoId(c)}>{c.name}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" rows="3" required /></div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2">
                        {formData.items.map((item, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="flex-grow border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm" placeholder="Description" />
                            <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-16 border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm" placeholder="Qty" />
                            <input type="number" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="w-24 border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm" placeholder="Price" />
                            <div className="w-20 text-right text-sm font-medium text-gray-700">${(item.quantity * item.unit_price).toFixed(2)}</div>
                          </div>
                        ))}
                        {formData.items.length === 0 && <div className="text-sm text-gray-500 italic text-center">No items added. Select a job to populate.</div>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label><input name="total_amount" type="number" step="0.01" value={formData.total_amount} readOnly className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm bg-gray-100" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label><input name="issue_date" type="date" value={formData.issue_date} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input name="due_date" type="date" value={formData.due_date} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" /></div>
                      {formData.status === 'Paid' && (<div><label className="block text-sm font-medium text-gray-700 mb-1">Paid Date</label><input name="paid_date" type="date" value={formData.paid_date} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" /></div>)}
                    </div>

                    {/* Signature Pad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Signature</label>
                      <div className="border border-gray-300 rounded-md bg-gray-50 touch-none">
                        <canvas
                          ref={sigCanvasRef}
                          width={450}
                          height={150}
                          className="w-full h-32 cursor-crosshair"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                      </div>
                      <button type="button" onClick={clearSignature} className="mt-1 text-xs text-red-600 hover:text-red-800">Clear Signature</button>
                      {formData.client_signature && <p className="text-xs text-green-600 mt-1">Signature captured.</p>}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">{editingId ? 'Update' : 'Create'}</button>
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
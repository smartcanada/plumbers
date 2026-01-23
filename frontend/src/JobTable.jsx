const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

export default function JobTable({ jobs, sortConfig, onSort, clients, tasks, crews, employees, onEdit, onDelete }) {
  const getMongoId = (item) => {
      if (!item) return null;
      if (item._id && typeof item._id === 'object' && item._id.$oid) return String(item._id.$oid).trim();
      return String(item._id || item.id).replace(/[^a-fA-F0-9]/g, '');
  };

  const getClientName = (id) => {
    const client = clients.find(c => getMongoId(c) === id);
    return client ? client.name : 'Unknown';
  };

  const getTaskName = (id) => {
    const task = tasks.find(t => getMongoId(t) === id);
    return task ? task.name : '-';
  };

  const getCrewName = (id) => {
    const crew = crews.find(c => getMongoId(c) === id);
    return crew ? crew.name : '-';
  };

  const getTechnicianName = (id) => {
    const emp = employees.find(e => getMongoId(e) === id);
    return emp ? emp.name : '-';
  };

  const getClassNamesFor = (name) => {
    if (!sortConfig) return '';
    return sortConfig.key === name ? (sortConfig.direction === 'asc' ? 'text-indigo-600' : 'text-indigo-600') : '';
  };

  return (
    <div className="bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" onClick={() => onSort('work_order_number')} className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100 ${getClassNamesFor('work_order_number')}`}>WO # {sortConfig?.key === 'work_order_number' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th scope="col" onClick={() => onSort('client_id')} className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 ${getClassNamesFor('client_id')}`}>Client {sortConfig?.key === 'client_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th scope="col" onClick={() => onSort('task_id')} className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 ${getClassNamesFor('task_id')}`}>Task {sortConfig?.key === 'task_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th scope="col" onClick={() => onSort('crew_id')} className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 ${getClassNamesFor('crew_id')}`}>Crew {sortConfig?.key === 'crew_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th scope="col" onClick={() => onSort('technician_id')} className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 ${getClassNamesFor('technician_id')}`}>Technician {sortConfig?.key === 'technician_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th scope="col" onClick={() => onSort('status')} className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 ${getClassNamesFor('status')}`}>Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th scope="col" onClick={() => onSort('start_time')} className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 ${getClassNamesFor('start_time')}`}>Date {sortConfig?.key === 'start_time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {jobs.map((job) => (
            <tr key={getMongoId(job)} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{job.work_order_number}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getClientName(job.client_id)}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getTaskName(job.task_id)}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getCrewName(job.crew_id)}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getTechnicianName(job.technician_id)}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'Completed' ? 'bg-green-100 text-green-800' : job.status === 'Unscheduled' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>{job.status}</span></td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{job.start_time ? new Date(job.start_time).toLocaleDateString() : 'Unscheduled'}</td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <button onClick={() => onEdit(job)} className="text-indigo-600 hover:text-indigo-900 mr-4"><EditIcon /></button>
                <button onClick={() => onDelete(getMongoId(job))} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
              </td>
            </tr>
          ))}
          {jobs.length === 0 && (<tr><td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">No jobs found.</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
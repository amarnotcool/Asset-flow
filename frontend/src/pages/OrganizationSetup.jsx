import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);

  const [departmentName, setDepartmentName] = useState('');
  const [parentDepartment, setParentDepartment] = useState('');

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const { departments, categories, employees, addDepartment, deleteDepartment, addCategory, deleteCategory, promoteEmployee, syncBackendData } = useAppStore();

  useEffect(() => { syncBackendData(); }, []);

  useEffect(() => {
    if (isAddModalOpen) nameInputRef.current?.focus();
  }, [isAddModalOpen, activeTab]);

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setErrorMsg(null);
    setDepartmentName('');
    setCategoryName('');
    setCategoryDescription('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'departments' && departmentName.trim()) {
        await addDepartment({
          name: departmentName.trim(),
          parent_id: parentDepartment ? parseInt(parentDepartment) : null,
        });
      } else if (activeTab === 'categories' && categoryName.trim()) {
        await addCategory({
          name: categoryName.trim(),
          description: categoryDescription.trim() || null,
        });
      }
      handleCloseModal();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create. Please try again.');
    }
    setLoading(false);
  };

  const handlePromoteEmployee = async (emp) => {
    const nextRole =
      emp.role === 'Employee'
        ? 'Asset Manager'
        : emp.role === 'Asset Manager'
        ? 'Department Head'
        : emp.role === 'Department Head'
        ? 'Admin'
        : 'Employee';
    try {
      await promoteEmployee(emp.id, nextRole);
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Organization Setup</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Configure master departments, asset categories, and employee directory roles</p>
        </div>
        {activeTab !== 'employees' && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add {activeTab === 'departments' ? 'Department' : 'Category'}
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="tab-bar px-6 pt-2">
          <button className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`} onClick={() => setActiveTab('departments')}>
            Departments ({departments.length})
          </button>
          <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            Categories ({categories.length})
          </button>
          <button className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>
            Employees Directory ({employees.length})
          </button>
        </div>

        {activeTab === 'departments' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left m-0">
              <thead>
                <tr>
                  <th className="th">Department Name</th>
                  <th className="th">Department Head</th>
                  <th className="th">Parent Dept</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length > 0 ? departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-black/[0.01]">
                    <td className="td"><strong>{dept.name}</strong></td>
                    <td className="td">{dept.head_name || 'Unassigned'}</td>
                    <td className="td">{dept.parent_name || '—'}</td>
                    <td className="td">
                      <span className={`badge ${dept.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                        {dept.status === 'Active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {dept.status}
                      </span>
                    </td>
                    <td className="td text-right">
                      <button onClick={() => deleteDepartment(dept.id)} className="btn btn-outline text-alert-danger border-0 hover:bg-alert-danger-bg p-2" title="Delete Department">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-8 text-center text-text-secondary text-sm">No departments configured. Click "Add Department" to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left m-0">
              <thead>
                <tr>
                  <th className="th">Category Name</th>
                  <th className="th">Description</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-black/[0.01]">
                    <td className="td"><strong>{cat.name}</strong></td>
                    <td className="td">{cat.description || '—'}</td>
                    <td className="td text-right">
                      <button onClick={() => deleteCategory(cat.id)} className="btn btn-outline text-alert-danger border-0 hover:bg-alert-danger-bg p-2" title="Delete Category">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="p-8 text-center text-text-secondary text-sm">No categories configured. Click "Add Category" to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left m-0">
              <thead>
                <tr>
                  <th className="th">Name</th>
                  <th className="th">Email</th>
                  <th className="th">Department</th>
                  <th className="th">Role</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length > 0 ? employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-black/[0.01]">
                    <td className="td"><strong>{emp.name}</strong></td>
                    <td className="td">{emp.email}</td>
                    <td className="td">{emp.department_name || '—'}</td>
                    <td className="td">
                      <span className={`badge ${
                        emp.role === 'Admin' ? 'border border-alert-danger text-alert-danger bg-alert-danger-bg font-bold' :
                        emp.role === 'Department Head' ? 'badge-info' : 
                        emp.role === 'Asset Manager' ? 'badge-success' : 'border border-border-color bg-transparent text-text-primary'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="td">
                      <span className="badge badge-success">{emp.status}</span>
                    </td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePromoteEmployee(emp)}
                          className="btn btn-outline py-1 px-2.5 text-xs font-semibold"
                          title="Click to cycle role"
                        >
                          <ShieldAlert size={13} /> Change Role
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="p-8 text-center text-text-secondary text-sm">No employees found. Users will appear here after they register.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-text-primary">
              Create New {activeTab === 'departments' ? 'Department' : 'Category'}
            </h3>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg border border-alert-danger bg-alert-danger-bg text-alert-danger font-semibold text-xs">{errorMsg}</div>
            )}

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              {activeTab === 'departments' && (
                <>
                  <div>
                    <label className="label">Department Name</label>
                    <input ref={nameInputRef} type="text" className="input" required placeholder="e.g. Finance" value={departmentName} onChange={e => setDepartmentName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Parent Department</label>
                    <select className="select" value={parentDepartment} onChange={e => setParentDepartment(e.target.value)}>
                      <option value="">None (Top Level)</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <div>
                    <label className="label">Category Name</label>
                    <input ref={nameInputRef} type="text" className="input" required placeholder="e.g. Peripherals" value={categoryName} onChange={e => setCategoryName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Description / Scope</label>
                    <textarea className="input" rows={3} placeholder="e.g. Keyboards, mice, docks" value={categoryDescription} onChange={e => setCategoryDescription(e.target.value)} />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-color">
                <button type="button" onClick={handleCloseModal} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Creating...' : `Create ${activeTab === 'departments' ? 'Department' : 'Category'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSetup;

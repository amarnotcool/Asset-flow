import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { orgApi } from '../api';

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const nameInputRef = useRef(null);

  // Simple action-oriented useState variables
  const [departmentName, setDepartmentName] = useState('');
  const [departmentHead, setDepartmentHead] = useState('');
  const [parentDepartment, setParentDepartment] = useState('--');

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeDepartment, setEmployeeDepartment] = useState('Engineering');
  const [employeeRole, setEmployeeRole] = useState('Employee');

  const {
    departments,
    categories,
    employees,
    addDepartment,
    deleteDepartment,
    addCategory,
    deleteCategory,
    addEmployee,
    promoteEmployee,
  } = useAppStore();

  // useEffect + useRef: Auto-focus the first input field when Add Modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      nameInputRef.current?.focus();
    }
  }, [isAddModalOpen, activeTab]);

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setDepartmentName('');
    setDepartmentHead('');
    setCategoryName('');
    setCategoryDescription('');
    setEmployeeName('');
    setEmployeeEmail('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'departments' && departmentName.trim()) {
      const payload = {
        name: departmentName.trim(),
        head: departmentHead.trim() || 'Unassigned',
        parent: parentDepartment,
        status: 'Active',
      };
      try {
        await orgApi.createDepartment(payload);
      } catch {
        // Fallback to dynamic state
      }
      addDepartment(payload);
    } else if (activeTab === 'categories' && categoryName.trim()) {
      const payload = {
        name: categoryName.trim(),
        description: categoryDescription.trim() || 'General equipment',
      };
      try {
        await orgApi.createCategory(payload);
      } catch {
        // Fallback
      }
      addCategory(payload);
    } else if (activeTab === 'employees' && employeeName.trim()) {
      const payload = {
        name: employeeName.trim(),
        email: employeeEmail.trim() || `${employeeName.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        dept: employeeDepartment,
        role: employeeRole,
        status: 'Active',
      };
      addEmployee(payload);
    }
    handleCloseModal();
  };

  const handlePromoteEmployee = async (emp) => {
    const nextRole =
      emp.role === 'Employee'
        ? 'Asset Manager'
        : emp.role === 'Asset Manager'
        ? 'Department Head'
        : 'Employee';
    try {
      await orgApi.updateEmployeeRole(emp.id, nextRole);
    } catch {
      // Fallback
    }
    promoteEmployee(emp.id, nextRole);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0">Organization Setup</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Configure master departments, asset categories, and employee directory roles</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={16} /> Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {/* Tabs */}
        <div className="tab-bar px-6 pt-2">
          <button
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments ({departments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories ({categories.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            Employees Directory ({employees.length})
          </button>
        </div>

        {/* Tab Content: Departments */}
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
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-black/[0.01]">
                    <td className="td"><strong>{dept.name}</strong></td>
                    <td className="td">{dept.head}</td>
                    <td className="td">{dept.parent}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Categories */}
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
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-black/[0.01]">
                    <td className="td"><strong>{cat.name}</strong></td>
                    <td className="td">{cat.description}</td>
                    <td className="td text-right">
                      <button onClick={() => deleteCategory(cat.id)} className="btn btn-outline text-alert-danger border-0 hover:bg-alert-danger-bg p-2" title="Delete Category">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Employees */}
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
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-black/[0.01]">
                    <td className="td"><strong>{emp.name}</strong></td>
                    <td className="td">{emp.email}</td>
                    <td className="td">{emp.dept}</td>
                    <td className="td">
                      <span className={`badge ${
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="card max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-text-primary">
              Create New {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
            </h3>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              {activeTab === 'departments' && (
                <>
                  <div>
                    <label className="label">Department Name</label>
                    <input ref={nameInputRef} type="text" className="input" required placeholder="e.g. Finance" value={departmentName} onChange={e => setDepartmentName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Department Head</label>
                    <input type="text" className="input" placeholder="e.g. Sarah Connor" value={departmentHead} onChange={e => setDepartmentHead(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Parent Department</label>
                    <select className="select" value={parentDepartment} onChange={e => setParentDepartment(e.target.value)}>
                      <option value="--">None (Top Level)</option>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
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

              {activeTab === 'employees' && (
                <>
                  <div>
                    <label className="label">Full Name</label>
                    <input ref={nameInputRef} type="text" className="input" required placeholder="e.g. Rajesh Kumar" value={employeeName} onChange={e => setEmployeeName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" className="input" placeholder="rajesh@company.com" value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <select className="select" value={employeeDepartment} onChange={e => setEmployeeDepartment(e.target.value)}>
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Initial Role</label>
                    <select className="select" value={employeeRole} onChange={e => setEmployeeRole(e.target.value)}>
                      <option value="Employee">Employee</option>
                      <option value="Asset Manager">Asset Manager</option>
                      <option value="Department Head">Department Head</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-color">
                <button type="button" onClick={handleCloseModal} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSetup;

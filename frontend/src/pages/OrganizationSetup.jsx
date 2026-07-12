import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, ShieldAlert, Pencil, Search, ToggleLeft, ToggleRight, Users, FolderTree, Tag } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef(null);
  const [departmentName, setDepartmentName] = useState('');
  const [parentDepartment, setParentDepartment] = useState('');

  // Category form
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeeDepartment, setEmployeeDepartment] = useState('');
  const [employeeRole, setEmployeeRole] = useState('Employee');

  const {
    departments, categories, employees,
    addDepartment, deleteDepartment,
    addCategory, deleteCategory,
    promoteEmployee, syncBackendData
  } = useAppStore();

  useEffect(() => { syncBackendData(); }, []);

  useEffect(() => {
    if (modalMode) {
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [modalMode, activeTab]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    resetForm();
    setModalMode('create');
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    if (activeTab === 'departments') {
      setDepartmentName(item.name);
      setParentDepartment(item.parent_id || '--');
    } else if (activeTab === 'categories') {
      setCategoryName(item.name);
      setCategoryDescription(item.description || '');
    } else {
      setEmployeeName(item.name);
      setEmployeeEmail(item.email);
      setEmployeeDepartment(item.department_name);
      setEmployeeRole(item.role);
    }
    setModalMode('edit');
  };

  const resetForm = () => {
    setDepartmentName(''); setParentDepartment('--');
    setCategoryName(''); setCategoryDescription('');
    setEmployeeName(''); setEmployeeEmail(''); setEmployeeDepartment(departments[0]?.name || ''); setEmployeeRole('Employee');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingItem(null);
    setErrorMsg(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'departments' && departmentName.trim()) {
        await addDepartment({
          name: departmentName.trim(),
          parent_id: parentDepartment !== '--' ? parseInt(parentDepartment) : null,
        });
      } else if (activeTab === 'categories' && categoryName.trim()) {
        await addCategory({
          name: categoryName.trim(),
          description: categoryDescription.trim() || null,
        });
      } else if (activeTab === 'employees' && editingItem) {
        await promoteEmployee(editingItem.id, employeeRole);
      }
      handleCloseModal();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to apply changes. Please try again.');
    }
    setLoading(false);
  };

  const handlePromoteEmployee = async (emp) => {
    const roles = ['Employee', 'Asset Manager', 'Department Head', 'Admin'];
    const currentIdx = roles.indexOf(emp.role);
    const nextRole = roles[(currentIdx + 1) % roles.length];
    try {
      await promoteEmployee(emp.id, nextRole);
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  // Filtered data
  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.head?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.email?.toLowerCase().includes(searchTerm.toLowerCase()) || e.dept?.toLowerCase().includes(searchTerm.toLowerCase()));

  const activeDeptCount = departments.filter(d => d.status === 'Active').length;
  const activeEmpCount = employees.filter(e => e.status === 'Active').length;

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'badge-danger';
      case 'Department Head': return 'badge-info';
      case 'Asset Manager': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'departments': return <FolderTree size={15} />;
      case 'categories': return <Tag size={15} />;
      case 'employees': return <Users size={15} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary m-0 tracking-tight">Organization Setup</h1>
          <p className="text-sm text-text-secondary mt-1 m-0">Configure master departments, asset categories, and the employee directory</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary whitespace-nowrap">
          <Plus size={16} /> Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4 cursor-pointer hover:border-accent-primary transition-colors" onClick={() => setActiveTab('departments')}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-primary/10 text-accent-primary"><FolderTree size={20} /></div>
          <div>
            <p className="text-2xl font-bold text-text-primary m-0">{activeDeptCount}<span className="text-sm font-normal text-text-secondary">/{departments.length}</span></p>
            <p className="text-xs text-text-secondary m-0 font-medium">Active Departments</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 cursor-pointer hover:border-accent-primary transition-colors" onClick={() => setActiveTab('categories')}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-alert-warning-bg text-alert-warning"><Tag size={20} /></div>
          <div>
            <p className="text-2xl font-bold text-text-primary m-0">{categories.length}</p>
            <p className="text-xs text-text-secondary m-0 font-medium">Asset Categories</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 cursor-pointer hover:border-accent-primary transition-colors" onClick={() => setActiveTab('employees')}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-alert-success-bg text-alert-success"><Users size={20} /></div>
          <div>
            <p className="text-2xl font-bold text-text-primary m-0">{activeEmpCount}<span className="text-sm font-normal text-text-secondary">/{employees.length}</span></p>
            <p className="text-xs text-text-secondary m-0 font-medium">Active Employees</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-0 overflow-hidden">
        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-color">
          <div className="tab-bar border-b-0">
            {['departments', 'categories', 'employees'].map(tab => (
              <button key={tab} className={`tab-btn flex items-center gap-2 ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setSearchTerm(''); }}>
                {getTabIcon(tab)}
                {tab === 'departments' ? `Departments (${departments.length})` : tab === 'categories' ? `Categories (${categories.length})` : `Employees (${employees.length})`}
              </button>
            ))}
          </div>
          <div className="px-4 py-2 sm:py-0">
            <div className="relative">
              <Search size={0} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-9 py-1.5 text-xs w-48" />
            </div>
          </div>
        </div>

        {/* ===== DEPARTMENTS TABLE ===== */}
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
                {filteredDepartments.length > 0 ? filteredDepartments.map(dept => (
                  <tr key={dept.id} className="hover:bg-bg-primary/50 transition-colors">
                    <td className="td"><strong className="text-text-primary">{dept.name}</strong></td>
                    <td className="td text-text-secondary">{dept.head_name || 'Unassigned'}</td>
                    <td className="td text-text-secondary">{dept.parent_name || <span className="text-text-secondary/50">—</span>}</td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => deleteDepartment(dept.id)} className="btn btn-outline border-0 p-2 text-text-secondary hover:text-alert-danger" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-8 text-center text-text-secondary text-sm">No departments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== CATEGORIES TABLE ===== */}
        {activeTab === 'categories' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left m-0">
              <thead>
                <tr>
                  <th className="th">Category Name</th>
                  <th className="th">Description</th>
                  <th className="th">Assets Count</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? filteredCategories.map(cat => {
                  const assetCount = useAppStore.getState().assets.filter(a => a.category === cat.name).length;
                  return (
                    <tr key={cat.id} className="hover:bg-bg-primary/50 transition-colors">
                      <td className="td"><strong className="text-text-primary">{cat.name}</strong></td>
                      <td className="td text-text-secondary">{cat.description}</td>
                      <td className="td">
                        <span className="badge badge-info">{assetCount} asset{assetCount !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="td text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => deleteCategory(cat.id)} className="btn btn-outline border-0 p-2 text-text-secondary hover:text-alert-danger" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={4} className="p-8 text-center text-text-secondary text-sm">No categories found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== EMPLOYEES TABLE ===== */}
        {activeTab === 'employees' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left m-0">
              <thead>
                <tr>
                  <th className="th">Employee</th>
                  <th className="th">Department</th>
                  <th className="th">Role</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-bg-primary/50 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary m-0 text-sm">{emp.name}</p>
                          <p className="text-xs text-text-secondary m-0">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td text-text-secondary text-sm">{emp.department_name || '—'}</td>
                    <td className="td">
                      <span className={`badge ${getRoleBadgeClass(emp.role)}`}>{emp.role}</span>
                    </td>
                    <td className="td text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handlePromoteEmployee(emp)} className="btn btn-outline py-1 px-2 text-xs border-0 text-text-secondary hover:text-accent-primary" title="Cycle role">
                          <ShieldAlert size={13} /> Role
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-8 text-center text-text-secondary text-sm">No employees found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== CREATE / EDIT MODAL ===== */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-xl font-bold mb-6 text-text-primary">
              {modalMode === 'edit' ? 'Edit' : 'Create New'} {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Role'}
            </h3>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg border border-alert-danger bg-alert-danger-bg text-alert-danger font-semibold text-xs">{errorMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {activeTab === 'departments' && (
                <>
                  <div>
                    <label className="label">Department Name</label>
                    <input ref={nameInputRef} type="text" className="input" required placeholder="e.g. Finance" value={departmentName} onChange={e => setDepartmentName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Parent Department</label>
                    <select className="select" value={parentDepartment} onChange={e => setParentDepartment(e.target.value)}>
                      <option value="--">None (Top Level)</option>
                      {departments.filter(d => d.id !== editingItem?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-color">
                <button type="button" onClick={handleCloseModal} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Processing...' : (modalMode === 'edit' ? 'Save Changes' : `Create ${activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}`)}
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

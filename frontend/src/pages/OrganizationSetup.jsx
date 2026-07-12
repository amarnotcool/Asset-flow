import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import './OrganizationSetup.css';

const OrganizationSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');

  // Mock Data
  const departments = [
    { id: 1, name: 'Engineering', head: 'Aditi Rao', parent: '--', status: 'Active' },
    { id: 2, name: 'Facilities', head: 'Rohan Mehta', parent: '--', status: 'Active' },
    { id: 3, name: 'Field ops (West)', head: 'Samir Iqbal', parent: 'Field Ops', status: 'Inactive' },
  ];

  const categories = [
    { id: 1, name: 'Electronics', description: 'Laptops, screens, accessories' },
    { id: 2, name: 'Furniture', description: 'Desks, chairs, whiteboards' },
    { id: 3, name: 'Vehicles', description: 'Company cars and vans' },
  ];

  const employees = [
    { id: 1, name: 'Priya Shah', email: 'priya@company.com', dept: 'Engineering', role: 'Employee', status: 'Active' },
    { id: 2, name: 'Arjun Nair', email: 'arjun@company.com', dept: 'Facilities', role: 'Asset Manager', status: 'Active' },
    { id: 3, name: 'Aditi Rao', email: 'aditi@company.com', dept: 'Engineering', role: 'Department Head', status: 'Active' },
  ];

  return (
    <div className="org-setup-page">
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title">Organization Setup</h1>
        <button className="btn btn-primary">
          <Plus size={16} /> Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
        </button>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="tabs mb-4">
          <button 
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button 
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            Employees Directory
          </button>
        </div>

        {/* Tab Content: Departments */}
        {activeTab === 'departments' && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Department Head</th>
                  <th>Parent Dept</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td><strong>{dept.name}</strong></td>
                    <td>{dept.head}</td>
                    <td>{dept.parent}</td>
                    <td>
                      <span className={`badge ${dept.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                        {dept.status === 'Active' ? <CheckCircle size={14} className="mr-1"/> : <XCircle size={14} className="mr-1" />}
                        {dept.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="btn-icon text-primary"><Edit2 size={16} /></button>
                      <button className="btn-icon text-danger"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Categories */}
        {activeTab === 'categories' && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{cat.description}</td>
                    <td className="text-right">
                      <button className="btn-icon text-primary"><Edit2 size={16} /></button>
                      <button className="btn-icon text-danger"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Employees */}
        {activeTab === 'employees' && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.email}</td>
                    <td>{emp.dept}</td>
                    <td>
                      <span className={`badge ${emp.role.includes('Admin') || emp.role.includes('Head') || emp.role.includes('Manager') ? 'badge-primary' : 'badge-outline'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="text-right flex items-center justify-end gap-2">
                       <button className="btn btn-outline" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}>Promote</button>
                      <button className="btn-icon text-primary"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrganizationSetup;

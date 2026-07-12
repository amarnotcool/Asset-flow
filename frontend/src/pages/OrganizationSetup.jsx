import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

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

  const tabBtnClass = (tabName) =>
    `bg-transparent border-0 text-[0.95rem] py-3 px-2 relative transition-colors duration-200 cursor-pointer ${
      activeTab === tabName
        ? 'text-accent-primary font-semibold after:absolute after:-bottom-[2px] after:left-0 after:w-full after:h-[2px] after:bg-accent-primary'
        : 'font-medium text-text-secondary hover:text-text-primary'
    }`;

  const thClass = "p-4 text-xs uppercase text-text-secondary font-semibold border-b border-border-color";
  const tdClass = "p-4 text-sm border-b border-border-color text-text-primary align-middle";
  const btnIconClass = "bg-transparent border-0 p-2 cursor-pointer rounded transition-colors duration-200 inline-flex items-center justify-center hover:bg-bg-primary";

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Organization Setup</h1>
        <button className="btn btn-primary">
          <Plus size={16} /> Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
        </button>
      </div>

      <div className="card">
        {/* Tabs */}
        <div className="flex border-b-2 border-border-color gap-6 mb-4">
          <button 
            className={tabBtnClass('departments')}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button 
            className={tabBtnClass('categories')}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={tabBtnClass('employees')}
            onClick={() => setActiveTab('employees')}
          >
            Employees Directory
          </button>
        </div>

        {/* Tab Content: Departments */}
        {activeTab === 'departments' && (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className={thClass}>Department Name</th>
                  <th className={thClass}>Department Head</th>
                  <th className={thClass}>Parent Dept</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-black/[0.01]">
                    <td className={tdClass}><strong>{dept.name}</strong></td>
                    <td className={tdClass}>{dept.head}</td>
                    <td className={tdClass}>{dept.parent}</td>
                    <td className={tdClass}>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${dept.status === 'Active' ? 'bg-alert-success-bg text-alert-success' : 'bg-[#f1f5f9] text-text-secondary'}`}>
                        {dept.status === 'Active' ? <CheckCircle size={14} className="mr-1"/> : <XCircle size={14} className="mr-1" />}
                        {dept.status}
                      </span>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <button className={`${btnIconClass} text-accent-primary`}><Edit2 size={16} /></button>
                      <button className={`${btnIconClass} text-alert-danger`}><Trash2 size={16} /></button>
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
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className={thClass}>Category Name</th>
                  <th className={thClass}>Description</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-black/[0.01]">
                    <td className={tdClass}><strong>{cat.name}</strong></td>
                    <td className={tdClass}>{cat.description}</td>
                    <td className={`${tdClass} text-right`}>
                      <button className={`${btnIconClass} text-accent-primary`}><Edit2 size={16} /></button>
                      <button className={`${btnIconClass} text-alert-danger`}><Trash2 size={16} /></button>
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
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Department</th>
                  <th className={thClass}>Role</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-black/[0.01]">
                    <td className={tdClass}><strong>{emp.name}</strong></td>
                    <td className={tdClass}>{emp.email}</td>
                    <td className={tdClass}>{emp.dept}</td>
                    <td className={tdClass}>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${emp.role.includes('Admin') || emp.role.includes('Head') || emp.role.includes('Manager') ? 'bg-[#e0f2fe] text-accent-primary' : 'bg-transparent border border-border-color text-text-primary'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${emp.status === 'Active' ? 'bg-alert-success-bg text-alert-success' : 'bg-[#f1f5f9] text-text-secondary'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex items-center justify-end gap-2">
                        <button className="btn btn-outline py-1 px-2 text-xs">Promote</button>
                        <button className={`${btnIconClass} text-accent-primary`}><Edit2 size={16} /></button>
                      </div>
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

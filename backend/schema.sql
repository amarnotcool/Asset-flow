-- AssetFlow Database Schema

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES departments(id),
    status VARCHAR(50) DEFAULT 'Active'
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department_id INT REFERENCES departments(id),
    role VARCHAR(50) DEFAULT 'Employee', -- Employee, Department Head, Asset Manager, Admin
    status VARCHAR(50) DEFAULT 'Active'
);

-- Circular ref: add department_head_id after users table is created
ALTER TABLE departments ADD COLUMN department_head_id INT REFERENCES users(id);

CREATE TABLE asset_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id INT REFERENCES asset_categories(id),
    serial_number VARCHAR(100),
    acquisition_date DATE,
    acquisition_cost DECIMAL(12,2),
    condition VARCHAR(50),      -- New, Good, Fair, Poor
    location VARCHAR(255),
    is_shared BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Available', -- Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
    holder_id INT REFERENCES users(id)      -- currently allocated user
);

CREATE TABLE asset_allocations (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    user_id INT REFERENCES users(id),
    department_id INT REFERENCES departments(id),
    allocated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATE,
    returned_date TIMESTAMP,
    condition_check_in_notes TEXT,
    status VARCHAR(50) DEFAULT 'Active' -- Active, Returned, Overdue
);

CREATE TABLE transfer_requests (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    from_user_id INT REFERENCES users(id),
    to_user_id INT REFERENCES users(id),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    reason TEXT
);

CREATE TABLE resource_bookings (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    user_id INT REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'Upcoming' -- Upcoming, Ongoing, Completed, Cancelled
);

CREATE TABLE maintenance_requests (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    requester_id INT REFERENCES users(id),
    technician_name VARCHAR(255), -- Or technician_id if technicians are users
    issue_description TEXT,
    priority VARCHAR(50), -- Low, Medium, High
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, In Progress, Resolved, Rejected
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolution_notes TEXT
);

CREATE TABLE audit_cycles (
    id SERIAL PRIMARY KEY,
    scope VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Open' -- Open, Closed
);

CREATE TABLE asset_audits (
    id SERIAL PRIMARY KEY,
    cycle_id INT REFERENCES audit_cycles(id),
    asset_id INT REFERENCES assets(id),
    auditor_id INT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Verified, Missing, Damaged
    notes TEXT,
    audit_date TIMESTAMP
);

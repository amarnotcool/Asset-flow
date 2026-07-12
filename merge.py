import sys

def merge_app_store():
    # Read the file
    with open('frontend/src/store/appStore.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    out = []
    in_head = False
    in_theirs = False
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_head = True
            out.append('  // All state starts empty — populated from database\n')
            out.append('  departments: [],\n  categories: [],\n  employees: [],\n  assets: [],\n  allocations: [],\n  transfers: [],\n  bookings: [],\n  maintenanceTickets: [],\n  audits: [],\n')
            # Add the new UI state as empty arrays so the UI doesn't crash if it tries to map over them
            out.append('  transferRequests: [],\n  allocationHistory: [],\n  auditCycles: [],\n  notifications: [],\n  activityLog: [],\n  isLoading: false,\n\n  // Computed Helpers (Stubs for UI compatibility)\n  getOverdueAllocations: () => [],\n  getPendingTransferCount: () => 0,\n  getUnreadNotificationCount: () => 0,\n\n  // ─── SYNC ALL DATA FROM BACKEND ───\n')
            continue
        elif line.startswith('======='):
            in_head = False
            in_theirs = True
            continue
        elif line.startswith('>>>>>>>'):
            in_theirs = False
            continue
            
        if not in_head and not in_theirs:
            out.append(line)

    with open('frontend/src/store/appStore.js', 'w', encoding='utf-8') as f:
        f.writelines(out)
    print("appStore.js merged.")

if __name__ == '__main__':
    merge_app_store()

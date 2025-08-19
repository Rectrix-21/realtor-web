// Mock authentication system for local development
class MockSupabaseAuth {
  constructor() {
    this.users = new Map();
    this.currentSession = null;
    this.listeners = [];
  }

  // Mock user registration
  async signUp({ email, password }) {
    if (this.users.has(email)) {
      return {
        data: null,
        error: { message: "User already exists" },
      };
    }

    const user = {
      id: `mock-user-${Date.now()}`,
      email,
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
    };

    this.users.set(email, { ...user, password });

    return {
      data: { user },
      error: null,
    };
  }

  // Mock user login
  async signInWithPassword({ email, password }) {
    const user = this.users.get(email);

    if (!user || user.password !== password) {
      return {
        data: null,
        error: { message: "Invalid credentials" },
      };
    }

    const session = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      access_token: `mock-token-${Date.now()}`,
      expires_at: Date.now() + 3600000, // 1 hour
    };

    this.currentSession = session;
    this.notifyListeners("SIGNED_IN", session);

    return {
      data: { user: session.user, session },
      error: null,
    };
  }

  // Mock get current session
  async getSession() {
    return {
      data: { session: this.currentSession },
      error: null,
    };
  }

  // Mock sign out
  async signOut() {
    this.currentSession = null;
    this.notifyListeners("SIGNED_OUT", null);
    return { error: null };
  }

  // Mock auth state change listener
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          },
        },
      },
    };
  }

  notifyListeners(event, session) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, session);
      } catch (error) {
        console.error("Auth listener error:", error);
      }
    });
  }

  // Mock update user profile
  async updateUser({ password }) {
    if (!this.currentSession) {
      return {
        data: null,
        error: { message: "Not authenticated" },
      };
    }

    const email = this.currentSession.user.email;
    const user = this.users.get(email);
    
    if (user && password) {
      user.password = password;
      this.users.set(email, user);
    }

    return {
      data: { user: this.currentSession.user },
      error: null,
    };
  }
}

// Mock database operations
class MockSupabaseDatabase {
  constructor() {
    this.tables = {
      Admin: new Map(),
      Buyer: new Map(),
      Property: new Map(),
      ViewingRequests: new Map(),
      Bookmarks: new Map(), // New bookmarks table
    };
    
    this.nextViewingRequestId = 1;
    this.nextBookmarkId = 1; // Counter for bookmark IDs
    
    // Add some sample properties
    this.addSampleProperties();
  }

  addSampleProperties() {
    const sampleProperties = [
      {
        property_id: 1,
        description: "Luxury Downtown Condo",
        rooms: 3,
        washroom: 2,
        sq_feet: 1200,
        price: 450000,
        status: 1,
        garage: 1,
        gym: 0,
        office: 1,
        recreational_room: 0,
        basement_type: "finished",
        property_kind: "condo",
        lot_size: null,
        image_urls: ["/images/house1.jpg", "/images/house1/house1_1.jpg"],
        buyer_id: null,
      },
      {
        property_id: 2,
        description: "Modern Family Home",
        rooms: 4,
        washroom: 3,
        sq_feet: 2100,
        price: 675000,
        status: 1,
        garage: 2,
        gym: 1,
        office: 1,
        recreational_room: 1,
        basement_type: "unfinished",
        property_kind: "house",
        lot_size: 8000,
        image_urls: ["/images/house2.jpg"],
        buyer_id: null,
      },
      {
        property_id: 3,
        description: "Cozy Suburban House",
        rooms: 2,
        washroom: 1,
        sq_feet: 950,
        price: 325000,
        status: 1,
        garage: 1,
        gym: 0,
        office: 0,
        recreational_room: 0,
        basement_type: "none",
        property_kind: "house",
        lot_size: 5500,
        image_urls: ["/images/house3.jpg"],
        buyer_id: null,
      },
    ];

    sampleProperties.forEach((property) => {
      this.tables.Property.set(property.property_id, property);
    });
  }

  from(tableName) {
    return {
      select: (columns = "*") => {
        const filters = [];
        const obj = {
          eq: (column, value) => {
            filters.push({ column, value, operator: 'eq' });
            return obj;
          },
          maybeSingle: async () => {
            const table = this.tables[tableName];
            if (table) {
              for (let [key, record] of table) {
                let matches = true;
                
                // Check all filters
                for (let filter of filters) {
                  let recordValue = record[filter.column];
                  let searchValue = filter.value;
                  
                  // Handle type conversion for property_id
                  if (filter.column === 'property_id') {
                    recordValue = String(recordValue);
                    searchValue = String(searchValue);
                  }
                  
                  if (recordValue !== searchValue) {
                    matches = false;
                    break;
                  }
                }
                
                if (matches) {
                  return { data: record, error: null };
                }
              }
            }
            return { data: null, error: null };
          },
          single: async () => {
            const table = this.tables[tableName];
            if (table) {
              for (let [key, record] of table) {
                let matches = true;
                
                // Check all filters
                for (let filter of filters) {
                  let recordValue = record[filter.column];
                  let searchValue = filter.value;
                  
                  // Handle type conversion for property_id
                  if (filter.column === 'property_id') {
                    recordValue = String(recordValue);
                    searchValue = String(searchValue);
                  }
                  
                  if (recordValue !== searchValue) {
                    matches = false;
                    break;
                  }
                }
                
                if (matches) {
                  return { data: record, error: null };
                }
              }
            }
            return { data: null, error: { message: "Record not found" } };
          },
          order: (column, options) => ({
            then: async (resolve) => {
              const table = this.tables[tableName];
              if (table) {
                let records = Array.from(table.values());
                
                // Apply filters first
                if (filters.length > 0) {
                  records = records.filter(record => {
                    for (let filter of filters) {
                      let recordValue = record[filter.column];
                      let searchValue = filter.value;
                      
                      if (filter.column === 'property_id') {
                        recordValue = String(recordValue);
                        searchValue = String(searchValue);
                      }
                      
                      if (recordValue !== searchValue) {
                        return false;
                      }
                    }
                    return true;
                  });
                }
                
                // Then sort
                if (options?.ascending === false) {
                  records.sort((a, b) => new Date(b[column]) - new Date(a[column]));
                } else {
                  records.sort((a, b) => new Date(a[column]) - new Date(b[column]));
                }
                resolve({ data: records, error: null });
              } else {
                resolve({ data: [], error: null });
              }
            },
          }),
          then: async (resolve) => {
            const table = this.tables[tableName];
            if (table) {
              let records = Array.from(table.values());
              
              // Apply filters
              if (filters.length > 0) {
                records = records.filter(record => {
                  for (let filter of filters) {
                    let recordValue = record[filter.column];
                    let searchValue = filter.value;
                    
                    if (filter.column === 'property_id') {
                      recordValue = String(recordValue);
                      searchValue = String(searchValue);
                    }
                    
                    if (recordValue !== searchValue) {
                      return false;
                    }
                  }
                  return true;
                });
              }
              
              resolve({ data: records, error: null });
            } else {
              resolve({ data: [], error: null });
            }
          },
        };
        return obj;
      },
      insert: (data) => ({
        select: (columns) => ({
          single: async () => {
            const table = this.tables[tableName];
            if (table) {
              let id, record;
              
              if (tableName === 'Bookmarks') {
                id = this.nextBookmarkId++;
                record = { 
                  bookmark_id: id,
                  ...data,
                  created_at: new Date().toISOString()
                };
              } else if (tableName === 'ViewingRequests') {
                id = this.nextViewingRequestId++;
                record = { 
                  request_id: id,
                  ...data,
                  created_at: new Date().toISOString()
                };
              } else {
                id = data.property_id || `${tableName.toLowerCase()}_${Date.now()}`;
                record = { ...data, property_id: id };
              }
              
              table.set(id, record);
              return { data: record, error: null };
            }
            return { data: null, error: { message: "Table not found" } };
          },
        }),
        then: async (resolve) => {
          const table = this.tables[tableName];
          if (table) {
            let id, record;
            
            if (tableName === 'Bookmarks') {
              id = this.nextBookmarkId++;
              record = { 
                bookmark_id: id,
                ...data,
                created_at: new Date().toISOString()
              };
            } else if (tableName === 'ViewingRequests') {
              id = this.nextViewingRequestId++;
              record = { 
                request_id: id,
                ...data,
                created_at: new Date().toISOString()
              };
            } else {
              id = data.property_id || `${tableName.toLowerCase()}_${Date.now()}`;
              record = { ...data, property_id: id };
            }
            
            table.set(id, record);
            resolve({ data: record, error: null });
          } else {
            resolve({ data: null, error: { message: "Table not found" } });
          }
        },
      }),
      update: (data) => ({
        eq: (column, value) => ({
          select: (columns) => ({
            single: async () => {
              const table = this.tables[tableName];
              if (table) {
                for (let [key, record] of table) {
                  // Handle type conversion for property_id
                  let recordValue = record[column];
                  let searchValue = value;
                  
                  if (column === 'property_id') {
                    recordValue = String(recordValue);
                    searchValue = String(searchValue);
                  }
                  
                  if (recordValue === searchValue) {
                    const updatedRecord = { ...record, ...data };
                    table.set(key, updatedRecord);
                    return { data: updatedRecord, error: null };
                  }
                }
              }
              return { data: null, error: { message: "Record not found" } };
            },
          }),
        }),
      }),
      delete: () => {
        const filters = [];
        const obj = {
          eq: (column, value) => {
            filters.push({ column, value, operator: 'eq' });
            return obj;
          },
          then: async (resolve) => {
            const table = this.tables[tableName];
            if (table) {
              let deletedRecords = [];
              
              for (let [key, record] of table) {
                let matches = true;
                
                // Check all filters
                for (let filter of filters) {
                  let recordValue = record[filter.column];
                  let searchValue = filter.value;
                  
                  // Handle type conversion
                  if (filter.column === 'property_id') {
                    recordValue = String(recordValue);
                    searchValue = String(searchValue);
                  }
                  
                  if (recordValue !== searchValue) {
                    matches = false;
                    break;
                  }
                }
                
                if (matches) {
                  table.delete(key);
                  deletedRecords.push(record);
                }
              }
              
              resolve({ data: deletedRecords, error: null });
            } else {
              resolve({ data: [], error: { message: "Table not found" } });
            }
          }
        };
        return obj;
      },
    };
  }
}

// Create mock Supabase client
class MockSupabaseClient {
  constructor() {
    this.auth = new MockSupabaseAuth();
    this.db = new MockSupabaseDatabase();
    this.storage = {
      from: (bucket) => ({
        upload: async (path, file) => {
          // Mock file upload - just return success
          console.log(`Mock upload: ${path} to ${bucket}`);
          return { error: null };
        },
        getPublicUrl: (path) => ({
          data: { publicUrl: `/mock-storage/${path}` },
        }),
        remove: async (paths) => {
          console.log(`Mock remove: ${paths.join(", ")}`);
          return { error: null };
        },
      }),
    };

    // Add some default test users
    this.auth.users.set("admin@test.com", {
      id: "admin-123",
      email: "admin@test.com",
      password: "admin123",
      created_at: new Date().toISOString(),
    });

    this.auth.users.set("user@test.com", {
      id: "user-123",
      email: "user@test.com",
      password: "user123",
      created_at: new Date().toISOString(),
    });

    // Add corresponding role records
    this.db.tables.Admin.set("admin-123", {
      admin_id: "admin-123",
      email: "admin@test.com",
    });

    this.db.tables.Buyer.set("user-123", {
      buyer_id: "user-123",
      email: "user@test.com",
      name: "Test User",
    });
  }

  from(tableName) {
    return this.db.from(tableName);
  }

  // Debug function to view all stored data
  viewAllData() {
    console.log("🗄️ Mock Database Contents:");
    for (const [tableName, table] of Object.entries(this.db.tables)) {
      console.log(`\n📋 ${tableName}:`, Array.from(table.values()));
    }
  }
}

export { MockSupabaseClient };

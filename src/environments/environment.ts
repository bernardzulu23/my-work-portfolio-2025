export const environment = {
  production: false,
  database: {
    // Railway MySQL connection - for local development, use a local MySQL server or proxy
    // Format: mysql://user:password@host:port/database
    host: 'yamanote.proxy.rlwy.net',
    port: 33598,
    username: 'root',
    password: 'qLxsvkmrgwzeTQVDkEPeaTUVKyWTUqJG',
    database: 'railway'
  },
  // API URL for backend
  apiUrl: 'http://localhost:3000/api'
};

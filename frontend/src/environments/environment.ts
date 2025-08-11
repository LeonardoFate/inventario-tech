export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'text/plain'
  ],
  paginacion: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50]
  },
  notificaciones: {
    successDuration: 3000,
    errorDuration: 7000,
    warningDuration: 5000,
    infoDuration: 4000
  },
  features: {
    multipleFileUpload: true,
    advancedSearch: true,
    exportData: true,
    notifications: true
  },
  debug: true
};
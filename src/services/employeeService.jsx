import api from './api';

export const employeeService = {
  // Employee CRUD
  getEmployees: (params) => api.get('/employees/', { params }),
  getEmployeeById: (id) => api.get(`/employees/${id}/`),
  createEmployee: (data) => api.post('/employees/', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}/`, data),
  deleteEmployee: (id) => api.delete(`/employees/${id}/`), // Assuming basic delete is supported
};
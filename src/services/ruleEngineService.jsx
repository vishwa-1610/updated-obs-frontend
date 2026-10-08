import api from '../api';

export const ruleEngineService = {
  // --- 1. Document Templates ---
  getDocuments: async (params = {}) => {
    try {
      const response = await api.get('/ruleengine/documents/', { params });
      return response.data;
    } catch (error) {
      const response = await api.get('/documents/', { params });
      return response.data;
    }
  },

  getDocumentDetail: async (id) => {
    try {
      const response = await api.get(`/ruleengine/documents/${id}/`);
      return response.data;
    } catch (error) {
      const response = await api.get(`/documents/${id}/`);
      return response.data;
    }
  },

  createDocument: async (formData) => {
    const isMultipart = formData instanceof FormData;
    const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    try {
      const response = await api.post('/ruleengine/documents/', formData, config);
      return response.data;
    } catch (error) {
      const response = await api.post('/documents/', formData, config);
      return response.data;
    }
  },

  updateDocument: async (id, data) => {
    const isMultipart = data instanceof FormData;
    const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    try {
      const response = await api.patch(`/ruleengine/documents/${id}/`, data, config);
      return response.data;
    } catch (error) {
      const response = await api.patch(`/documents/${id}/`, data, config);
      return response.data;
    }
  },

  deleteDocument: async (id) => {
    try {
      const response = await api.delete(`/ruleengine/documents/${id}/`);
      return response.data;
    } catch (error) {
      const response = await api.delete(`/documents/${id}/`);
      return response.data;
    }
  },

  // --- 2. Coordinate Fields ---
  getFields: async (docId = null) => {
    const params = docId ? { document: docId } : {};
    try {
      const response = await api.get('/ruleengine/fields/', { params });
      return response.data;
    } catch (error) {
      const response = await api.get('/fields/', { params });
      return response.data;
    }
  },

  createField: async (fieldData) => {
    try {
      const response = await api.post('/ruleengine/fields/', fieldData);
      return response.data;
    } catch (error) {
      const response = await api.post('/fields/', fieldData);
      return response.data;
    }
  },

  updateField: async (id, fieldData) => {
    try {
      const response = await api.patch(`/ruleengine/fields/${id}/`, fieldData);
      return response.data;
    } catch (error) {
      const response = await api.patch(`/fields/${id}/`, fieldData);
      return response.data;
    }
  },

  deleteField: async (id) => {
    try {
      const response = await api.delete(`/ruleengine/fields/${id}/`);
      return response.data;
    } catch (error) {
      const response = await api.delete(`/fields/${id}/`);
      return response.data;
    }
  },

  bulkCreateFields: async (fieldsList) => {
    const response = await api.post('/ruleengine/w4-fields/bulk-create/', fieldsList);
    return response.data;
  },

  // --- 3. Test-Fill Simulation & Auto-fill ---
  testFillDocument: async (docId, payload) => {
    try {
      const response = await api.post(`/ruleengine/documents/${docId}/test_fill/`, payload);
      return response.data;
    } catch (error) {
      const response = await api.post('/ruleengine/w4-fields/fill/', payload);
      return response.data;
    }
  },

  // --- 4. Digital Signatures ---
  getSignatures: async () => {
    try {
      const response = await api.get('/ruleengine/confirmed-list/');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  saveSignature: async (signaturePayload) => {
    const response = await api.post('/ruleengine/save-signature/', signaturePayload);
    return response.data;
  }
};

export default ruleEngineService;

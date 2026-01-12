import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import FormField from '../common/Form/FormField';

const SubcontractorForm = ({ initialData = {}, onSubmit, onCancel, isLoading, isEdit = false }) => {
  const [formData, setFormData] = useState({
    subcontractor_name: '',
    contract_name: '',
    city: '',
    email: '',
    phone_no: '',
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        subcontractor_name: initialData.subcontractor_name || '',
        contract_name: initialData.contract_name || '',
        city: initialData.city || '',
        email: initialData.email || '',
        phone_no: initialData.phone_no || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Subcontractor Name" name="subcontractor_name" value={formData.subcontractor_name} onChange={handleChange} required placeholder="Enter name" />
        <FormField label="Contract Name" name="contract_name" value={formData.contract_name} onChange={handleChange} placeholder="Enter contract name" />
        <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
        <FormField label="Phone No" name="phone_no" value={formData.phone_no} onChange={handleChange} placeholder="Enter phone number" />
        <FormField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300" disabled={isLoading}>
          <X className="h-4 w-4 mr-1 inline" /> Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700" disabled={isLoading}>
          <Save className="h-4 w-4 mr-1 inline" /> {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default SubcontractorForm;
import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import FormField from '../common/Form/FormField';

const EmployeeForm = ({ initialData = {}, onSubmit, onCancel, isLoading, isEdit = false }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        dob: initialData.dob || '',
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
        <FormField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="Enter first name" />
        <FormField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Enter last name" />
        <FormField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} placeholder="Select DOB" />
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

export default EmployeeForm;
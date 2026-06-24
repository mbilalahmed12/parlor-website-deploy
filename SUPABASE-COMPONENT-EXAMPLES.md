// Example: Updated Services Admin Component using Supabase
// Replace frontend/components/admin/Services.js with this

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { services, storage } from '@/lib/supabase';

export default function Services() {
  const [serviceList, setServiceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', price: '', duration_minutes: 30 });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await services.getAll();
      setServiceList(data);
    } catch (error) {
      toast.error('Failed to fetch services');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await services.update(editing, form);
        toast.success('Service updated!');
      } else {
        await services.create(form);
        toast.success('Service created!');
      }
      setForm({ name: '', category: '', price: '', duration_minutes: 30 });
      setEditing(null);
      fetchServices();
    } catch (error) {
      toast.error(error.message || 'Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setForm(service);
    setEditing(service.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await services.delete(id);
      toast.success('Service deleted!');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Services</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Service name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="px-4 py-2 border rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
            required
            className="px-4 py-2 border rounded"
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
            className="px-4 py-2 border rounded"
          />
        </div>
        <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded">
          {editing ? 'Update' : 'Create'} Service
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({ name: '', category: '', price: '', duration_minutes: 30 });
            }}
            className="ml-2 px-6 py-2 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-6">Loading services...</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Duration</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceList.map((service) => (
                <tr key={service.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{service.name}</td>
                  <td className="px-4 py-2">{service.category}</td>
                  <td className="px-4 py-2">${service.price}</td>
                  <td className="px-4 py-2">{service.duration_minutes} min</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

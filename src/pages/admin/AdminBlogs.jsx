import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from "../../context/ProtectedRoute";
import { StorageService } from "../../services/storage";
import { Plus, Edit, Trash2, Loader2, Save, X, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlogs() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminBlogsContent />
    </ProtectedRoute>
  );
}

function AdminBlogsContent() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState({ title: '', content: '', imageUrl: '', status: 'published' });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = StorageService.getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://lms-backend-g1cy.onrender.com/api'}/blogs/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = StorageService.getToken();
      const url = currentBlog.id 
        ? `${import.meta.env.VITE_API_URL || 'https://lms-backend-g1cy.onrender.com/api'}/blogs/${currentBlog.id}`
        : `${import.meta.env.VITE_API_URL || 'https://lms-backend-g1cy.onrender.com/api'}/blogs`;
      
      const method = currentBlog.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(currentBlog)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(currentBlog.id ? 'Blog updated' : 'Blog created');
        setIsEditing(false);
        fetchBlogs();
      } else {
        toast.error(data.message || 'Failed to save blog');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      const token = StorageService.getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://lms-backend-g1cy.onrender.com/api'}/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Blog deleted');
        fetchBlogs();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to delete blog');
    }
  };

  if (loading && !isEditing) {
    return <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
          <BookOpen className="w-8 h-8" /> Manage Blogs
        </h1>
        {!isEditing && (
          <button 
            onClick={() => { setCurrentBlog({ title: '', content: '', imageUrl: '', status: 'published' }); setIsEditing(true); }}
            className="flex items-center gap-2 px-6 py-3 signature-gradient text-white rounded-xl font-bold shadow-lg hover:opacity-90"
          >
            <Plus className="w-5 h-5" /> New Blog
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-surface-container-low border border-surface-dim/20 rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">{currentBlog.id ? 'Edit Blog' : 'Create Blog'}</h2>
            <button onClick={() => setIsEditing(false)} className="p-2 bg-surface-dim rounded-full text-on-surface-variant hover:text-error transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Title</label>
              <input 
                required
                type="text" 
                value={currentBlog.title}
                onChange={e => setCurrentBlog({...currentBlog, title: e.target.value})}
                className="w-full px-4 py-3 bg-surface-container border border-surface-dim rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Image URL (optional)</label>
              <input 
                type="text" 
                value={currentBlog.imageUrl}
                onChange={e => setCurrentBlog({...currentBlog, imageUrl: e.target.value})}
                className="w-full px-4 py-3 bg-surface-container border border-surface-dim rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Content (HTML supported)</label>
              <textarea 
                required
                rows={10}
                value={currentBlog.content}
                onChange={e => setCurrentBlog({...currentBlog, content: e.target.value})}
                className="w-full px-4 py-3 bg-surface-container border border-surface-dim rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-on-surface mb-2">Status</label>
              <select 
                value={currentBlog.status}
                onChange={e => setCurrentBlog({...currentBlog, status: e.target.value})}
                className="w-full px-4 py-3 bg-surface-container border border-surface-dim rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-4 pt-4 border-t border-surface-dim/20">
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-surface-dim rounded-xl font-bold hover:bg-surface-dim">
                Cancel
              </button>
              <button type="submit" className="flex items-center gap-2 px-8 py-3 signature-gradient text-white rounded-xl font-bold shadow-lg hover:opacity-90">
                <Save className="w-5 h-5" /> Save Blog
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-surface-container-low border border-surface-dim/20 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-primary mb-2 line-clamp-2">{blog.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${blog.status === 'published' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-yellow-500/20 text-yellow-600'}`}>
                  {blog.status.toUpperCase()}
                </span>
                <span className="text-xs text-on-surface-variant">{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-surface-dim/20 flex justify-end gap-3">
                <button onClick={() => { setCurrentBlog(blog); setIsEditing(true); }} className="p-2 text-secondary hover:bg-surface-dim rounded-lg transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(blog.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {blogs.length === 0 && (
            <div className="col-span-full text-center py-12 text-on-surface-variant font-bold">
              No blogs found. Create one to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

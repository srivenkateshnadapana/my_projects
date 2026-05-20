import React, { useState, useEffect } from "react";
import { AdminProtectedRoute } from "../../context/AdminProtectedRoute";
import { StorageService } from "../../services/storage";
import { api } from "../../services/api";
import { Plus, Edit, Trash2, Loader2, Save, X, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlogs() {
  return (
    <AdminProtectedRoute>
      <AdminBlogsContent />
    </AdminProtectedRoute>
  );
}

function AdminBlogsContent() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState({
    title: "",
    content: "",
    imageUrl: "",
    status: "published",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = StorageService.getToken();
      const data = await api.blogs.adminGetAll(token);
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = StorageService.getToken();
      const res = currentBlog.id
        ? await api.blogs.update(currentBlog.id, currentBlog, token)
        : await api.blogs.create(currentBlog, token);

      if (res.success) {
        toast.success(currentBlog.id ? "Blog updated" : "Blog created");
        setIsEditing(false);
        fetchBlogs();
      } else {
        toast.error(res.message || "Failed to save blog");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const token = StorageService.getToken();
      const res = await api.blogs.delete(id, token);
      if (res.success) {
        toast.success("Blog deleted");
        fetchBlogs();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center gap-3">
            <BookOpen className="w-10 h-10" /> Manage Blogs
          </h1>
          {!isEditing && (
            <button
              onClick={() => {
                setCurrentBlog({
                  title: "",
                  content: "",
                  imageUrl: "",
                  status: "published",
                });
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-6 py-3 signature-gradient text-white rounded-xl font-bold shadow-lg hover:opacity-90"
            >
              <Plus className="w-5 h-5" /> New Blog
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-surface-container-lowest border border-surface-dim/20 rounded-[3rem] p-8 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-surface-dim/10 pb-6">
              <h2 className="text-2xl font-headline font-bold text-primary">
                {currentBlog.id ? "Edit Blog" : "Create Blog"}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 bg-surface-container rounded-full text-secondary hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                    Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={currentBlog.title}
                    onChange={(e) =>
                      setCurrentBlog({ ...currentBlog, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Enter blog title"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={currentBlog.imageUrl}
                    onChange={(e) =>
                      setCurrentBlog({
                        ...currentBlog,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                    Publishing Status
                  </label>
                  <select
                    value={currentBlog.status}
                    onChange={(e) =>
                      setCurrentBlog({ ...currentBlog, status: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none font-bold text-primary"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Content (Markdown/HTML supported) *
                </label>
                <textarea
                  required
                  rows={12}
                  value={currentBlog.content}
                  onChange={(e) =>
                    setCurrentBlog({ ...currentBlog, content: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 focus:ring-2 focus:ring-primary focus:outline-none font-mono text-sm"
                  placeholder="Write your blog content here..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-surface-dim/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 rounded-xl font-bold text-secondary hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-10 py-3 signature-gradient text-white rounded-xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  <Save className="w-5 h-5" />{" "}
                  {currentBlog.id ? "Save Changes" : "Publish Blog"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-surface-container-lowest border border-surface-dim/10 rounded-[2rem] overflow-hidden flex flex-col hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="h-48 bg-surface-container overflow-hidden">
                  <img
                    src={
                      blog.imageUrl ||
                      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
                    }
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        blog.status === "published"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {blog.status}
                    </span>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-primary mb-4 line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>

                  <div className="mt-auto pt-6 border-t border-surface-dim/10 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setCurrentBlog(blog);
                        setIsEditing(true);
                      }}
                      className="p-3 text-secondary hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="p-3 text-error/60 hover:text-error hover:bg-error/5 rounded-2xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {blogs.length === 0 && (
              <div className="col-span-full text-center py-24 bg-surface-container-lowest rounded-[3rem] border border-dashed border-surface-dim/30">
                <BookOpen className="w-16 h-16 text-surface-dim mx-auto mb-4" />
                <h3 className="text-xl font-headline font-bold text-secondary">
                  No blogs found
                </h3>
                <p className="text-outline text-sm mt-2">
                  Initialize your thoughts by creating your first blog post.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

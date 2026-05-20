import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Loader2, BookOpen } from "lucide-react";
import { api } from "../../services/api";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await api.blogs.getBySlug(slug);
      if (res.success) {
        setBlog(res.data);
      } else {
        setError("Blog not found");
      }
    } catch (err) {
      console.error("Failed to fetch blog", err);
      setError(err.message || "An error occurred while loading the blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-20 px-8 text-center">
        <h2 className="text-2xl font-bold text-error mb-4">
          {error || "Blog not found"}
        </h2>
        <button
          onClick={() => navigate("/blog")}
          className="text-primary hover:underline"
        >
          Return to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-primary hover:text-secondary font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>

        {blog.imageUrl && (
          <div className="w-full h-64 md:h-96 rounded-[2rem] overflow-hidden mb-12 shadow-xl">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="bg-surface-container-low border border-surface-dim/20 p-8 md:p-12 rounded-[3rem] shadow-sm">
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-6">
            <div className="flex items-center gap-2 bg-surface-dim/30 px-4 py-2 rounded-full">
              <Calendar className="w-4 h-4 text-primary" />
              {new Date(blog.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 bg-surface-dim/30 px-4 py-2 rounded-full">
              <User className="w-4 h-4 text-primary" />
              {blog.author?.name || "Admin"}
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-12 leading-tight">
            {blog.title}
          </h1>

          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:text-primary prose-a:text-secondary hover:prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>
    </div>
  );
}

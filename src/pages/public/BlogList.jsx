import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { Calendar, User, ArrowRight, Loader2, BookOpen } from "lucide-react";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.blogs.getAll();
      if (res.success) {
        setBlogs(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
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

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-6">
            Latest Knowledge
          </h1>
          <p className="text-lg text-on-surface font-medium">
            Stay updated with the latest trends, tips, and insights from our
            experts.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-[3rem] border border-surface-dim/20">
            <BookOpen className="w-16 h-16 text-surface-dim mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary mb-2">
              No blogs found
            </h3>
            <p className="text-on-surface-variant">
              Check back later for new content!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-surface-container-low border border-surface-dim/20 rounded-[2rem] overflow-hidden flex flex-col group hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
              >
                {blog.imageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <BookOpen className="w-12 h-12 text-primary/20" />
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs font-bold text-on-surface uppercase tracking-wider mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <h3 className="text-xl font-headline font-bold text-primary mb-4 line-clamp-2 transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-on-surface mb-6 line-clamp-3 text-sm flex-1 leading-relaxed">
                    {blog.content.replace(/<[^>]+>/g, "").substring(0, 150)}...
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-surface-dim/20">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {blog.author?.name?.charAt(0) || "A"}
                      </div>
                      <span className="text-sm font-bold text-on-surface">
                        {blog.author?.name || "Admin"}
                      </span>
                    </div>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

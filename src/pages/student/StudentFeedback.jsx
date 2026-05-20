import * as React from "react";
import { ProtectedRoute } from "../../context/ProtectedRoute";
import { StorageService } from "../../services/storage";
import { api } from "../../services/api";
import { MessageCircle, Star, Send } from "lucide-react";
import { toast } from "sonner";

export default function StudentFeedback() {
  return (
    <ProtectedRoute>
      <StudentFeedbackContent />
    </ProtectedRoute>
  );
}

function StudentFeedbackContent() {
  const [content, setContent] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [submitting, setSubmitting] = React.useState(false);
  const token = StorageService.getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter your feedback.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.feedbacks.submit({ content, rating }, token);
      if (res.success) {
        toast.success("Feedback submitted successfully. Thank you!");
        setContent("");
        setRating(5);
      }
    } catch (err) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-8 font-body">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2.5rem] border border-surface-dim/20 shadow-xl shadow-primary/5">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">
            We Value Your Feedback
          </h1>
          <p className="text-secondary mb-8">
            Share your learning experience with us. Your feedback helps us
            improve and might be featured on our homepage!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary mb-3">
                How would you rate your experience?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${rating >= star ? "text-amber-400 fill-current" : "text-surface-dim fill-current"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Your Feedback
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us what you liked and how we can improve..."
                className="w-full h-40 bg-surface-container border border-surface-dim/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 signature-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

import React from "react";
import { Star, Send, Loader2 } from "lucide-react";

export function FeedbackModal({
  show,
  onClose,
  feedbackForm,
  setFeedbackForm,
  handleFeedbackSubmit,
  submittingFeedback,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container transition-colors text-secondary"
        >
          ✕
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
            <Star className="w-8 h-8 fill-current text-amber-400" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-primary mb-2">
            Congratulations!
          </h2>
          <p className="text-secondary text-sm">
            You have earned your certificate. We'd love to hear your feedback on
            the course!
          </p>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-primary mb-3 text-center">
              Rate your experience
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFeedbackForm((p) => ({ ...p, rating: star }))
                  }
                  className="focus:outline-none hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${feedbackForm.rating >= star ? "text-amber-400 fill-current" : "text-surface-dim fill-current"}`}
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
              value={feedbackForm.content}
              onChange={(e) =>
                setFeedbackForm((p) => ({ ...p, content: e.target.value }))
              }
              placeholder="Tell us what you liked and how we can improve..."
              className="w-full h-32 bg-surface-container border border-surface-dim/30 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submittingFeedback}
            className="w-full py-4 signature-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
          >
            {submittingFeedback ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" /> Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

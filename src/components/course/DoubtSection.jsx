import React from 'react';
import { MessageCircle, Loader2, Send } from 'lucide-react';

export function DoubtSection({ 
  doubts, 
  doubtsLoading, 
  activeItem, 
  doubtForm, 
  setDoubtForm, 
  handlePostDoubt, 
  postingDoubt 
}) {
  return (
    <div className="flex-grow overflow-y-auto no-scrollbar p-5 space-y-4">
      {/* Post Doubt Form */}
      <form onSubmit={handlePostDoubt} className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-dim/20 space-y-3">
        <p className="text-xs font-bold text-outline uppercase tracking-widest">Ask a Question</p>
        {activeItem && <p className="text-[10px] text-secondary truncate">Re: {activeItem.title}</p>}
        <input
          type="text" 
          required 
          value={doubtForm.subject}
          onChange={e => setDoubtForm(p => ({ ...p, subject: e.target.value }))}
          placeholder="Subject of your doubt..."
          className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 text-primary text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-outline/50"
        />
        <textarea 
          rows={3} 
          required 
          value={doubtForm.message}
          onChange={e => setDoubtForm(p => ({ ...p, message: e.target.value }))}
          placeholder="Describe your question in detail..."
          className="w-full px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/20 text-primary text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-outline/50 resize-none"
        />
        <button 
          type="submit" 
          disabled={postingDoubt} 
          className="w-full py-3 signature-gradient text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow"
        >
          {postingDoubt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post Question
        </button>
      </form>

      {/* Past Doubts */}
      {doubtsLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : doubts.length === 0 ? (
        <div className="text-center py-8 text-outline text-sm">No doubts raised yet for this course.</div>
      ) : doubts.map(t => (
        <div key={t.id} className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-dim/20 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-primary leading-tight">{t.subject}</p>
            <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${
              t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' :
              t.status === 'in-progress' ? 'bg-amber-500/10 text-amber-600' :
              'bg-blue-500/10 text-blue-600'
            }`}>{t.status}</span>
          </div>
          <p className="text-xs text-on-surface-variant line-clamp-2">{t.message}</p>
          {t.adminResponse && (
            <div className="mt-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Answer</p>
              <p className="text-xs text-primary">{t.adminResponse}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

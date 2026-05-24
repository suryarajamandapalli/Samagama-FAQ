'use client';

import React, { useState, useEffect } from 'react';
import { fetchThreads, fetchCategories, createThread } from '../../services/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Plus, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Folder,
  Search,
  Bot,
  UserCheck,
  X
} from 'lucide-react';

export default function CommunityPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Minimal create thread form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const data = await fetchThreads(
        selectedCategory || undefined, 
        'recent', 
        searchQuery.trim() || undefined
      );
      setThreads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  // Live search debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadThreads();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim() || !formCategory) {
      setFormError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      // Auto generate a short title from the doubt description
      const generatedTitle = doubtText.trim().length > 50 
        ? `${doubtText.trim().slice(0, 50)}...` 
        : doubtText.trim();
        
      const newThread = await createThread(generatedTitle, doubtText.trim(), formCategory, []);
      
      setDoubtText('');
      setFormCategory('');
      setShowCreateForm(false);
      
      // Immediately redirect the student to the active chat screen
      router.push(`/community/${newThread.id}`);
    } catch (err: any) {
      console.error(err);
      setFormError('Failed to start a new chat. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans max-w-3xl mx-auto pb-12">
      
      {/* Sleek Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-indigo-650" />
            <span>Support Chat Hub</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-sm">
            Chat with the automated assistant, and escalate to our human mentor queue if you need live staff assistance.
          </p>
        </div>

        <button
          onClick={() => {
            setShowCreateForm(true);
            setFormError(null);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4.5 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer select-none self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>New Doubt Chat</span>
        </button>
      </div>

      {/* Simplified Doubt Chat List & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doubt tickets..."
            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650/15 transition-colors"
          />
        </div>

        {/* Category quick dropdown selector */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-slate-200 text-slate-500 font-bold text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-650 cursor-pointer select-none"
        >
          <option value="">ALL TOPICS</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Doubt tickets Feed */}
      {loading && threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-2">
          <div className="h-6 w-6 border-2 border-indigo-500/10 border-t-indigo-650 rounded-full animate-spin" />
          <p className="text-[10px] font-medium text-slate-400">Loading timeline...</p>
        </div>
      ) : threads.length > 0 ? (
        <div className="space-y-2.5">
          {threads.map((thread) => {
            const isResolved = thread.status === 'resolved';
            const isEscalated = thread.status === 'escalated';
            const studentName = thread.user_email ? thread.user_email.split('@')[0] : 'student';
            
            return (
              <Link
                key={thread.id}
                href={`/community/${thread.id}`}
                className="block bg-white border border-slate-200/80 hover:border-slate-300 p-4.5 rounded-2xl transition-all duration-150 group relative shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    
                    {/* Simplified Metadata Header */}
                    <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="text-slate-550">{studentName}</span>
                      <span>•</span>
                      <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                      {thread.category_name && (
                        <>
                          <span>•</span>
                          <span className="flex items-center space-x-0.5 text-slate-400">
                            <Folder className="h-2.5 w-2.5" />
                            <span>{thread.category_name}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Doubt details */}
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-650 transition-colors leading-snug truncate">
                      {thread.content}
                    </h3>
                  </div>

                  {/* Sleek Ticket status badge */}
                  <div className="flex-shrink-0 self-center">
                    {isResolved ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>RESOLVED</span>
                      </span>
                    ) : isEscalated ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                        <UserCheck className="h-3 w-3" />
                        <span>MENTOR JOINED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Bot className="h-3 w-3" />
                        <span>AI ANSWERED</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/85 rounded-3xl p-16 text-center shadow-xs">
          <MessageSquare className="h-8 w-8 text-slate-350 mx-auto mb-2.5" />
          <p className="text-xs font-bold text-slate-700">No active doubt chats</p>
          <p className="text-[10px] text-slate-450 max-w-xs mx-auto mt-1 mb-4 leading-relaxed">
            Have a question about NOC, badges, or certificates? Open a chat and get instant responses.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs py-2 px-4.5 rounded-xl shadow-xs transition-colors"
          >
            Start Doubt Chat
          </button>
        </div>
      )}

      {/* ULTRA SIMPLIFIED NEW DOUBT CHAT DIALOG MODAL */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/15 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            onClick={() => setShowCreateForm(false)} 
            className="absolute inset-0 z-0"
          />
          <form 
            onSubmit={handleCreateSubmit} 
            className="relative z-10 w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 animate-in scale-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Start a Doubt Chat</h3>
              <button 
                type="button"
                onClick={() => setShowCreateForm(false)} 
                className="h-8 w-8 rounded-lg hover:bg-slate-150 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-2.5 rounded-lg text-[10px] font-bold text-center">
                {formError}
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 pl-0.5">Doubt Topic</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-655 p-3 rounded-xl focus:outline-none focus:border-indigo-650 text-xs font-bold cursor-pointer"
                  required
                >
                  <option value="">Select Topic...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1 pl-0.5">What is your doubt?</label>
                <textarea
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  placeholder="Describe what you need help with in detail..."
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-650/15 focus:border-indigo-650 text-xs font-medium resize-none leading-relaxed placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="w-1/2 bg-slate-100 hover:bg-slate-150 text-slate-600 text-xs font-semibold py-3 rounded-xl transition-colors cursor-pointer select-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold py-3 rounded-xl shadow-md shadow-slate-900/5 transition-colors cursor-pointer select-none"
              >
                {loading ? 'Creating...' : 'Start Chat'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

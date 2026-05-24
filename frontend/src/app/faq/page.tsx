'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchFAQs, fetchCategories, searchFAQs } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  AlertCircle, 
  BookOpen, 
  Copy,
  Mail,
  Award,
  Laptop,
  Briefcase,
  FileText,
  X,
  Check,
  Compass,
  ArrowRight,
  HelpCircle,
  Hash,
  Star,
  Activity,
  Flame,
  ArrowUpRight,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';

// Subtopic keywords dictionary to filter FAQs inside categories dynamically
const SUBTOPICS_MAP: Record<string, { name: string; key: string }[]> = {
  noc: [
    { name: 'Dates & Deadlines', key: 'date' },
    { name: 'HOD Signatures', key: 'sign' },
    { name: 'Format & Template', key: 'format' },
    { name: 'Upload Issues', key: 'upload' },
    { name: 'Verification Path', key: 'verify' }
  ],
  internship: [
    { name: 'Stipend Details', key: 'stipend' },
    { name: 'Duration & Extensions', key: 'month' },
    { name: 'Timeline / Start', key: 'start' },
    { name: 'Accepting Offer', key: 'accept' },
    { name: 'Work Prerequisites', key: 'laptop' }
  ],
  'offer-letter': [
    { name: 'Opt-in/Accept', key: 'accept' },
    { name: 'Signatures Required', key: 'sign' },
    { name: 'Late Join Requests', key: 'join' },
    { name: 'Mistakes / Edits', key: 'correct' }
  ],
  vibe: [
    { name: 'Portal Credentials', key: 'login' },
    { name: 'Git & Repo Sync', key: 'git' },
    { name: 'Docker Environment', key: 'docker' },
    { name: 'Weekly Tasks', key: 'week' }
  ],
  'technical-issues': [
    { name: 'SSH Port Access', key: 'ssh' },
    { name: 'Key Pair Setup', key: 'key' },
    { name: 'Docker Failures', key: 'docker' },
    { name: 'WSL / WSL2 Configuration', key: 'wsl' }
  ],
  certificates: [
    { name: 'Criteria & Score', key: 'score' },
    { name: 'Completion Badge', key: 'badge' },
    { name: 'Letter of Rec', key: 'lor' },
    { name: 'Courier & Delivery', key: 'address' }
  ],
  general: [
    { name: 'Leave Policy', key: 'leave' },
    { name: 'Office Hours', key: 'hour' },
    { name: 'Contact Info', key: 'contact' },
    { name: 'Yaksha Platform', key: 'yaksha' }
  ]
};

export default function FAQPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Data states
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, 'helpful' | 'not-helpful'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Traversal & Hover States
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [isStackHovered, setIsStackHovered] = useState(false);
  
  // Spotlight Search States
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [spotlightResults, setSpotlightResults] = useState<any[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [faqData, catData] = await Promise.all([
        fetchFAQs(),
        fetchCategories()
      ]);
      setFaqs(faqData);
      setCategories(catData);
    } catch (e) {
      console.error('Failed to load FAQs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcut Ctrl+K to toggle Spotlight Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSpotlight(prev => !prev);
        setSpotlightQuery('');
        setFocusedIndex(0);
      }
      if (e.key === 'Escape') {
        setShowSpotlight(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Spotlight Search filtering
  useEffect(() => {
    if (!spotlightQuery.trim()) {
      setSpotlightResults([]);
      return;
    }
    const query = spotlightQuery.toLowerCase();
    const matches = faqs.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    ).slice(0, 5);
    setSpotlightResults(matches);
    setFocusedIndex(0);
  }, [spotlightQuery, faqs]);

  // Handle Spotlight select
  const handleSpotlightSelect = (faq: any) => {
    const cat = categories.find(c => c.id === faq.category_id);
    setSelectedCategory(cat || categories[0]);
    setExpandedFaqId(faq.id);
    setSelectedSubtopic(null);
    setShowSpotlight(false);
    
    // Smooth scroll to timeline
    setTimeout(() => {
      document.getElementById('faq-viewer-timeline')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // Particles network canvas implementation (Light Mode Optimized)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrameId: number;
    const particles: any[] = [];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, radius: 160 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      alpha: number;
      color: string;
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.size = Math.random() * 2 + 0.8;
        this.alpha = Math.random() * 0.25 + 0.15;
        this.color = '99, 102, 241'; // Indigo 500
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Magnet attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.0;
          this.y -= (dy / dist) * force * 1.0;
        }
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 45; i++) {
      particles.push(new Particle());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw delicate web lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleFeedback = (faqId: string, type: 'helpful' | 'not-helpful', e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedback(prev => ({ ...prev, [faqId]: type }));
  };

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'noc': return FileText;
      case 'offer-letter': return Mail;
      case 'certificates': return Award;
      case 'vibe': return Sparkles;
      case 'technical-issues': return Laptop;
      case 'internship': return Briefcase;
      default: return BookOpen;
    }
  };

  // Light mode category styling mapping
  const getCategoryColor = (slug: string) => {
    switch (slug) {
      case 'noc': return 'from-rose-50/80 to-white text-rose-600 border-rose-200/80 shadow-rose-100/10';
      case 'offer-letter': return 'from-amber-50/80 to-white text-amber-600 border-amber-200/80 shadow-amber-100/10';
      case 'certificates': return 'from-emerald-50/80 to-white text-emerald-600 border-emerald-200/80 shadow-emerald-100/10';
      case 'vibe': return 'from-indigo-50/80 to-white text-indigo-650 border-indigo-200/80 shadow-indigo-100/10';
      case 'technical-issues': return 'from-purple-50/80 to-white text-purple-650 border-purple-200/80 shadow-purple-100/10';
      case 'internship': return 'from-teal-50/80 to-white text-teal-600 border-teal-200/80 shadow-teal-100/10';
      default: return 'from-slate-50 to-white text-slate-600 border-slate-200/80 shadow-slate-100/10';
    }
  };

  const getCategoryThemeColors = (slug: string) => {
    switch (slug) {
      case 'noc': return { bg: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500' };
      case 'offer-letter': return { bg: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' };
      case 'certificates': return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' };
      case 'vibe': return { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', dot: 'bg-indigo-500' };
      case 'technical-issues': return { bg: 'bg-purple-50 text-purple-600 border-purple-100', dot: 'bg-purple-500' };
      case 'internship': return { bg: 'bg-teal-50 text-teal-600 border-teal-100', dot: 'bg-teal-500' };
      default: return { bg: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-500' };
    }
  };

  // Subtopic list for selected category
  const activeSubtopics = useMemo(() => {
    if (!selectedCategory) return [];
    return SUBTOPICS_MAP[selectedCategory.slug] || [];
  }, [selectedCategory]);

  // Filtered FAQs listing under category & selected subtopic
  const visibleFAQs = useMemo(() => {
    if (!selectedCategory) return [];
    return faqs.filter(faq => {
      const matchCat = faq.category_id === selectedCategory.id;
      if (!matchCat) return false;
      if (!selectedSubtopic) return true;
      
      const query = selectedSubtopic.toLowerCase();
      return faq.question.toLowerCase().includes(query) || 
             faq.answer.toLowerCase().includes(query);
    });
  }, [faqs, selectedCategory, selectedSubtopic]);

  // Trending FAQs (e.g. ones with high priority)
  const trendingFAQs = useMemo(() => {
    return faqs.slice(0, 3);
  }, [faqs]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 selection:bg-indigo-500/10 selection:text-indigo-700 overflow-x-hidden relative font-sans select-none -mx-4 -my-8 px-4 py-8">
      
      {/* Dynamic light particles background layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80" />
      
      {/* Soft background light glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_40%,rgba(168,85,247,0.03),transparent_40%)] pointer-events-none z-0" />

      {/* FLOATING HEADER CONTROLS */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8 relative z-20">
        <div className="flex items-center space-x-2">
          <Compass className="h-5 w-5 text-indigo-650 animate-spin-slow" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-700 bg-indigo-500/5 px-2.5 py-1 rounded border border-indigo-500/10">
            Yaksha System
          </span>
        </div>

        {/* Shortcut activation button */}
        <button
          onClick={() => { setShowSpotlight(true); setSpotlightQuery(''); }}
          className="bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <span>Spotlight Search</span>
          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[8px] border border-slate-200">Ctrl + K</span>
        </button>
      </div>

      {/* 1. HERO SECTION */}
      <div className="max-w-5xl mx-auto text-center py-10 space-y-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold block">
            CINEMATIC KNOWLEDGE ENGINE
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
            Ask Yaksha Anything.
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-medium">
            Reinventing FAQ exploration. Hover over the tilted deck to expand categories, click to zoom into details, or hit Spotlight.
          </p>
        </motion.div>

        {/* Large Search Trigger */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl mx-auto pt-2"
        >
          <div 
            onClick={() => { setShowSpotlight(true); setSpotlightQuery(''); }}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 shadow-md pl-5 pr-4 py-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
          >
            <div className="flex items-center space-x-3 text-slate-400">
              <Search className="h-4.5 w-4.5 group-hover:text-indigo-650 transition-colors" />
              <span className="text-xs sm:text-sm font-semibold text-slate-450">Search topics, subtopics or guidelines...</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-bold">
              <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">Ctrl</span>
              <span>+</span>
              <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">K</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. DYNAMIC EXPLODED 3D STACK OR EXPANDED CATEGORY UNIVERSE */}
      <div className="max-w-4xl mx-auto py-8 relative z-10">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            
            /* 3D TILTED STACK VIEW (Light themed glass) */
            <motion.div
              key="3d-stack-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-xl min-h-[460px] mx-auto flex items-center justify-center select-none cursor-pointer"
              onMouseEnter={() => setIsStackHovered(true)}
              onMouseLeave={() => setIsStackHovered(false)}
            >
              <div 
                className="relative w-full h-[400px] flex items-center justify-center"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {categories.map((cat, idx) => {
                  const IconComponent = getCategoryIcon(cat.slug);
                  const themeClass = getCategoryColor(cat.slug);
                  const subtopics = SUBTOPICS_MAP[cat.slug] || [];

                  // Compute dynamic staggered 3D translation styles based on hover state
                  const yOffset = isStackHovered ? (idx - 3) * 64 : -idx * 15;
                  const zOffset = isStackHovered ? -idx * 8 : -idx * 25;
                  const scale = isStackHovered ? 1.02 : 1 - idx * 0.045;
                  const rotateX = isStackHovered ? 12 : 20;
                  const rotateY = isStackHovered ? -8 : -15;
                  const rotateZ = isStackHovered ? 2 : 4;

                  return (
                    <motion.div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedSubtopic(null);
                        setExpandedFaqId(null);
                      }}
                      animate={{
                        y: yOffset,
                        z: zOffset,
                        scale: scale,
                        rotateX: rotateX,
                        rotateY: rotateY,
                        rotateZ: rotateZ,
                        opacity: 1
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 110,
                        damping: 18,
                        mass: 0.9
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                      }}
                      className={`absolute z-[${10 - idx}] w-full max-w-md bg-gradient-to-br ${themeClass} border rounded-3xl p-5 shadow-lg flex items-center justify-between transition-all group duration-300`}
                    >
                      {/* Exploded stacked card elements */}
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/40 group-hover:scale-110 transition-transform">
                          <IconComponent className="h-5.5 w-5.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                            {cat.name}
                          </h3>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                            Category Layer {idx + 1}
                          </span>
                        </div>
                      </div>

                      {/* Right side floating tags shown on hover spread */}
                      <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[180px] justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {subtopics.slice(0, 2).map((sub, sIdx) => (
                          <span key={sIdx} className="text-[8px] font-extrabold bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-lg text-slate-500">
                            {sub.name}
                          </span>
                        ))}
                        {subtopics.length > 2 && (
                          <span className="text-[8px] font-extrabold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-lg text-indigo-650">
                            +{subtopics.length - 2}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            
            /* 3. LAYERED CATEGORY EXPANSION VIEW (Flat interactive staging panel in light mode) */
            <motion.div
              key="category-expansion"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-white border border-slate-200/80 rounded-[36px] p-6 sm:p-8 relative overflow-hidden space-y-8 shadow-md"
            >
              {/* Back navigation */}
              <div className="flex items-center justify-between border-b border-slate-150 pb-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-2 transition-colors cursor-pointer select-none"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                  <span>Return to Deck</span>
                </button>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Exploding layers details</span>
                </div>
              </div>

              {/* Big Focused Zoomed category header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-3xl bg-gradient-to-br ${getCategoryColor(selectedCategory.slug)} border shadow-md flex-shrink-0`}>
                    {React.createElement(getCategoryIcon(selectedCategory.slug), { className: 'h-6 w-6' })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">
                      {selectedCategory.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed font-medium">
                      Select subtopic chips to explore visual storytelling guidelines.
                    </p>
                  </div>
                </div>
                
                <span className="text-[9px] uppercase font-extrabold tracking-widest px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-indigo-650">
                  {visibleFAQs.length} Guidelines Matching
                </span>
              </div>

              {/* Dynamic neural chip subtopics list */}
              <div className="space-y-3.5 pt-2">
                <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest pl-0.5 block">
                  Filter by Subtopic
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setSelectedSubtopic(null)}
                    className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer select-none ${
                      selectedSubtopic === null
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    Show All
                  </button>
                  {activeSubtopics.map((sub: any) => {
                    const isSelected = selectedSubtopic === sub.key;
                    return (
                      <button
                        key={sub.key}
                        onClick={() => setSelectedSubtopic(isSelected ? null : sub.key)}
                        className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer select-none flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10 scale-102'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <Hash className="h-3 w-3 opacity-60" />
                        <span>{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OVERHAULED FAQ REPRESENTATION: CINEMATIC STORYBOARD GRID */}
              <div id="faq-viewer-timeline" className="pt-6 border-t border-slate-150">
                <AnimatePresence mode="popLayout">
                  {visibleFAQs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {visibleFAQs.map((faq, idx) => {
                        const isExpanded = expandedFaqId === faq.id;
                        const hasFeedback = feedback[faq.id];
                        const isCopied = copiedId === faq.id;
                        const theme = getCategoryThemeColors(selectedCategory.slug);

                        return (
                          <motion.div
                            key={faq.id}
                            layout="position"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.35, delay: idx * 0.04 }}
                            onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                            className={`bg-white border-2 rounded-[28px] p-6 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                              isExpanded 
                                ? 'border-indigo-400 shadow-md ring-2 ring-indigo-500/5 col-span-2' 
                                : 'border-slate-200/80 hover:border-indigo-200 hover:shadow-md'
                            }`}
                          >
                            <div className="space-y-4">
                              
                              {/* Pill category tag */}
                              <div className="flex items-center justify-between">
                                <span className={`text-[8.5px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${theme.bg}`}>
                                  GUIDELINE {faq.original_id || 'FAQ'}
                                </span>
                                
                                <div className="flex items-center space-x-1.5 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                                  <span className={`h-2 w-2 rounded-full ${theme.dot} ${isExpanded ? 'animate-ping' : ''}`} />
                                  <span>{isExpanded ? 'Active Guide' : 'Read Guide'}</span>
                                </div>
                              </div>

                              {/* Question Heading */}
                              <h4 className="text-slate-900 font-extrabold text-sm sm:text-base leading-snug group-hover:text-indigo-650 transition-colors">
                                {faq.question}
                              </h4>

                              {/* Answer Text with preview logic */}
                              <div className="relative">
                                <p className={`text-slate-600 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-line select-text ${
                                  !isExpanded ? 'line-clamp-3' : ''
                                }`}>
                                  {faq.answer}
                                </p>
                                
                                {/* Truncation fade when not expanded */}
                                {!isExpanded && faq.answer.length > 180 && (
                                  <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                )}
                              </div>
                            </div>

                            {/* Utility actions inside the card, displayed or expanded */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-6 pt-4 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[9px] text-slate-450 font-bold uppercase tracking-wider select-none"
                                >
                                  {/* Feedback upvote */}
                                  <div className="flex items-center space-x-2">
                                    <span>Was this document helpful?</span>
                                    <button
                                      onClick={(e) => handleFeedback(faq.id, 'helpful', e)}
                                      className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer select-none ${
                                        hasFeedback === 'helpful'
                                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                                      }`}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={(e) => handleFeedback(faq.id, 'not-helpful', e)}
                                      className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer select-none ${
                                        hasFeedback === 'not-helpful'
                                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                                      }`}
                                    >
                                      No
                                    </button>
                                  </div>

                                  {/* Link Copy button */}
                                  <button
                                    onClick={(e) => handleCopy(faq.answer, faq.id, e)}
                                    className="flex items-center space-x-1.5 text-slate-500 hover:text-indigo-650 transition-colors cursor-pointer self-start sm:self-center"
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        <span className="text-emerald-600 font-extrabold">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy Link</span>
                                      </>
                                    )}
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Click expand prompt shown at bottom of closed cards */}
                            {!isExpanded && (
                              <div className="mt-4 flex items-center space-x-1.5 text-[9px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                                <span>View document</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-[28px] p-14 text-center bg-white shadow-xs">
                      <AlertCircle className="h-7 w-7 text-slate-400 mx-auto mb-2 animate-pulse" />
                      <h5 className="text-xs font-bold text-slate-700">No guidelines matching</h5>
                      <p className="text-[10px] text-slate-450 mt-1 max-w-[220px] mx-auto leading-relaxed">
                        We couldn't find matches under this subtopic keyword. Try toggling other chips.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. APPLE-LIKE STORYTELLING SCROLL SECTIONS */}
      <div className="max-w-4xl mx-auto py-16 space-y-24 relative z-10 border-t border-slate-200/60 mt-8">
        
        {/* SECTION 1: TRENDING TOPICS */}
        <div className="space-y-8">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-widest pl-0.5 flex items-center space-x-1">
              <Flame className="h-3.5 w-3.5 animate-pulse text-amber-500" />
              <span>Trending Queries</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Highly Searched Guidelines
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Quick access to rules and documents that other interns are checking right now.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {trendingFAQs.map((faq) => {
              const cat = categories.find(c => c.id === faq.category_id);
              const theme = getCategoryThemeColors(cat?.slug || 'general');

              return (
                <div 
                  key={faq.id}
                  onClick={() => {
                    setSelectedCategory(cat || categories[0]);
                    setExpandedFaqId(faq.id);
                    setSelectedSubtopic(null);
                    document.getElementById('faq-viewer-timeline')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white border border-slate-200/80 hover:border-indigo-200 p-5 rounded-2xl space-y-4 hover:bg-slate-50/20 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">
                      <span>INDEXED FAQ</span>
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500/10" />
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-xs leading-snug group-hover:text-indigo-650 transition-colors line-clamp-3">
                      {faq.question}
                    </h4>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider pt-2 group-hover:translate-x-1.5 transition-transform duration-350">
                    <span>Explore</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: AI SMART DISCOVERY */}
        <div className="bg-gradient-to-tr from-indigo-50/50 via-white to-purple-50/50 border border-slate-200 p-6 sm:p-8 rounded-[32px] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-lg">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-750 bg-indigo-555/5 px-2.5 py-1 rounded border border-indigo-500/10 inline-block">
              AI Smart discovery
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Can't locate what you need in the stack?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Yaksha integrates vector semantic search with official guidelines to answer custom, open-ended doubts. Open the Solver screen to ask directly.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-slate-800 shadow-md transition-all select-none self-start sm:self-center"
          >
            <span>Ask Yaksha Bot</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>

      {/* 6. APPLE SPOTLIGHT SEARCH DIALOG MODAL (Light Mode) */}
      <AnimatePresence>
        {showSpotlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/10 backdrop-blur-md"
          >
            {/* Backdrop click closer */}
            <div 
              onClick={() => setShowSpotlight(false)}
              className="absolute inset-0 z-0"
            />
            
            <motion.div
              initial={{ scale: 0.96, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Search field */}
              <div className="p-4 border-b border-slate-100 flex items-center space-x-3.5 bg-slate-50/50">
                <Search className="h-5 w-5 text-indigo-650 flex-shrink-0 animate-pulse" />
                <input
                  type="text"
                  value={spotlightQuery}
                  onChange={(e) => setSpotlightQuery(e.target.value)}
                  placeholder="Ask any doubt or type keyword (e.g. NOC signatures)..."
                  className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 font-semibold text-sm focus:outline-none"
                  autoFocus
                />
                <button 
                  onClick={() => setShowSpotlight(false)}
                  className="h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Spotlight Suggestions/Results feed */}
              <div className="max-h-[300px] overflow-y-auto p-2.5">
                {spotlightResults.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 px-3.5 pb-1 block">
                      Matches Found
                    </span>
                    {spotlightResults.map((faq, idx) => (
                      <button
                        key={faq.id}
                        onClick={() => handleSpotlightSelect(faq)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer select-none ${
                          focusedIndex === idx 
                            ? 'bg-slate-50 text-indigo-700 font-bold' 
                            : 'text-slate-600 hover:bg-slate-50/50'
                        }`}
                        onMouseEnter={() => setFocusedIndex(idx)}
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-4">
                          <BookOpen className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                          <span className="truncate text-slate-700">{faq.question}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : spotlightQuery.trim() ? (
                  <div className="p-8 text-center text-slate-500 space-y-1">
                    <AlertCircle className="h-5 w-5 mx-auto text-slate-400 animate-bounce" />
                    <p className="text-xs font-bold">No direct guidelines found</p>
                    <p className="text-[10px] text-slate-450 max-w-[200px] mx-auto">
                      Press Escape to exit and try browsing deck categories.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-2.5">
                    {/* Default suggested searches */}
                    <div>
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-450 px-1 pb-2 block">
                        Trending Searches
                      </span>
                      <div className="space-y-1">
                        {trendingFAQs.map((faq) => (
                          <button
                            key={faq.id}
                            onClick={() => handleSpotlightSelect(faq)}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-slate-600 hover:text-indigo-750 hover:bg-slate-50/50 flex items-center space-x-3 text-xs transition-all select-none"
                          >
                            <Flame className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                            <span className="truncate font-semibold">{faq.question}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Spotlight footer shortcut instructions */}
              <div className="px-4.5 py-2.5 bg-slate-50/80 border-t border-slate-100 text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Select with mouse click</span>
                <span>ESC to Close</span>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

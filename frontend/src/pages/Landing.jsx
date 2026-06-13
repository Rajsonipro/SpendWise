import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  TrendingUp, Shield, ArrowRight, CheckCircle, BarChart3,
  Scan, CreditCard, Sparkles,
  Menu, X, PieChart, Zap,
  ChevronDown, Star, Bot,
  Users
} from 'lucide-react';

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  const recentTxns = [
    { name: 'Grocery Store', amount: '₹2,450', type: 'expense', time: '2h ago', category: 'Food' },
    { name: 'Salary Credit', amount: '₹75,000', type: 'income', time: 'Today', category: 'Income' },
    { name: 'Netflix', amount: '₹499', type: 'expense', time: '1d ago', category: 'Subscription' },
    { name: 'Uber Ride', amount: '₹320', type: 'expense', time: '3h ago', category: 'Transport' },
  ];

  const budgetCategories = [
    { name: 'Food & Drinks', spent: 8500, limit: 12000, color: 'bg-indigo-500' },
    { name: 'Shopping', spent: 4200, limit: 8000, color: 'bg-emerald-500' },
    { name: 'Transport', spent: 3200, limit: 5000, color: 'bg-amber-500' },
  ];

  const features = [
    {
      icon: CreditCard,
      title: 'Smart Tracking',
      desc: 'Log expenses with AI-powered categorization. Just type or snap a receipt — we handle the rest.',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      desc: 'Beautiful charts that reveal your spending patterns and help you make smarter decisions.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Budget Controls',
      desc: 'Set spending limits and get real-time alerts before you overshoot your monthly budget.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: Scan,
      title: 'AI Receipt Scan',
      desc: 'Snap a photo of any receipt — AI extracts merchant, amount, date, and category instantly.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'Instant Insights',
      desc: 'Get daily AI-powered tips and spending summaries delivered right to your dashboard.',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Shared Budgets',
      desc: 'Split expenses and track shared budgets with family or roommates in real time.',
      gradient: 'from-rose-500 to-pink-600'
    },
  ];

  const perks = [
    'Free forever — no hidden charges or credit cards needed',
    'AI-powered receipt scanning with 99% accuracy',
    'Real-time spending alerts and smart budget nudges',
    'Beautiful, interactive charts and insights',
    'Export your data anytime as CSV or PDF',
    'End-to-end encrypted, bank-grade security',
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Freelance Designer',
      initials: 'PS',
      text: 'SpendWise transformed how I manage my finances. The AI categorization is incredibly accurate and saves me hours each month.',
      rating: 5,
    },
    {
      name: 'Rahul Mehta',
      role: 'Software Engineer',
      initials: 'RM',
      text: 'I cut unnecessary spending by 30% in just two months. The budget alerts keep me on track without being annoying.',
      rating: 5,
    },
    {
      name: 'Ananya Patel',
      role: 'Small Business Owner',
      initials: 'AP',
      text: 'From receipt scanning to tax-ready exports, it handles everything. The analytics give me insights I never had before.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'How does the AI receipt scanner work?',
      a: 'Simply snap a photo of any receipt and our AI extracts the merchant, amount, date, and category automatically using advanced OCR and machine learning with 99% accuracy.',
    },
    {
      q: 'Is my financial data secure?',
      a: 'Absolutely. We use bank-grade AES-256 encryption for all data at rest and TLS 1.3 for data in transit. We never share your data with third parties.',
    },
    {
      q: 'Can I track subscriptions automatically?',
      a: 'Yes! Our smart subscription tracker identifies recurring payments from your transaction history and alerts you about upcoming renewals and unused subscriptions.',
    },
    {
      q: 'Is SpendWise really free?',
      a: 'Yes, SpendWise is completely free. No hidden charges, no credit card required. Premium features may be added in the future but the core app remains free.',
    },
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all duration-300">
                <TrendingUp size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">SpendWise</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <span className="text-lg font-bold text-gray-900">Menu</span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 space-y-1">
                  {[...navLinks].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
                    >
                      {link.label}
                    </a>
                  ))}
                  <hr className="my-3 border-gray-100" />
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 mt-2 text-sm font-semibold text-white bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl text-center transition-all"
                  >
                    Get Started Free
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── HERO SECTION ─── */}
      <motion.section style={{ opacity: heroOpacity }} className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-50/60 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-blue-50/40 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-indigo-100/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6"
              >
                <Sparkles size={14} className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">AI-Powered Personal Finance</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.08] mb-6">
                Manage Money{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400">
                  Smarter
                </span>
                <br />
                with AI-Powered Insights
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8 max-w-lg">
                Track expenses, set budgets, scan receipts with AI, and get intelligent insights to achieve your financial goals.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200"
                >
                  View Demo
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </a>
              </div>

              <div className="flex flex-wrap gap-6">
                {[
                  { icon: Shield, text: 'Secure', sub: 'AES-256 Encrypted' },
                  { icon: BarChart3, text: 'Real-time', sub: 'Live Analytics' },
                  { icon: Zap, text: 'AI Powered', sub: 'Smart Insights' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-50">
                        <Icon size={14} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.text}</p>
                        <p className="text-xs text-gray-400">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-400 ml-2">Dashboard</span>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-white">
                      <p className="text-xs font-medium text-indigo-200 mb-1">Total Balance</p>
                      <p className="text-xl font-bold">₹2,45,800</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <TrendingUp size={10} className="text-emerald-300" />
                        <span className="text-xs text-emerald-200">+12.5%</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-medium text-gray-400 mb-1">Income</p>
                      <p className="text-lg font-bold text-gray-900">₹1,82,000</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-gray-400">This month</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-medium text-gray-400 mb-1">Expenses</p>
                      <p className="text-lg font-bold text-gray-900">₹1,12,450</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-xs text-gray-400">This month</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-xs font-semibold text-gray-700">Monthly Budget</p>
                        <span className="text-xs text-gray-400">68% used</span>
                      </div>
                      <div className="space-y-2.5">
                        {budgetCategories.slice(0, 2).map((cat, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 font-medium">{cat.name}</span>
                              <span className="text-gray-400">₹{cat.spent.toLocaleString()} / ₹{cat.limit.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                                style={{ width: `${(cat.spent / cat.limit) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Spending by Category</p>
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="48.7 48.7" strokeDashoffset="0" strokeLinecap="round" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="24.3 48.7" strokeDashoffset="-48.7" strokeLinecap="round" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="12.2 48.7" strokeDashoffset="-73" strokeLinecap="round" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="12.2 48.7" strokeDashoffset="-85.2" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PieChart size={20} className="text-indigo-600" />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1.5">
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /><span className="text-[10px] text-gray-500">Food</span></div>
                        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[10px] text-gray-500">Bills</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-2.5">Recent Transactions</p>
                      <div className="space-y-2">
                        {recentTxns.map((txn, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2 h-2 rounded-full ${txn.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <div>
                                <p className="text-xs font-medium text-gray-900">{txn.name}</p>
                                <p className="text-[10px] text-gray-400">{txn.category} · {txn.time}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-semibold ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {txn.type === 'income' ? '+' : '-'}{txn.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-amber-100">
                          <Bot size={14} className="text-amber-600" />
                        </div>
                        <span className="text-xs font-semibold text-amber-800">AI Insight</span>
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Your dining spending increased 23% this month. Consider setting a restaurant budget.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-3 -right-3 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2"
              >
                <div className="flex -space-x-1">
                  {['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'].map((c, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-white`} />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-600">2,000+ active users</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-700 mb-4">
              <Sparkles size={14} />
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              From AI-powered scanning to smart budgeting — SpendWise gives you complete control over your finances.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} w-fit shadow-lg shadow-indigo-500/15 mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Why Choose SpendWise?
            </h2>
            <p className="text-gray-500 text-lg">Thousands trust us to manage their finances smarter every day.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-3">
            {perks.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50"
              >
                <div className="p-1 rounded-full bg-emerald-100 shrink-0">
                  <CheckCircle size={16} className="text-emerald-600" />
                </div>
                <span className="text-gray-700 font-medium text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-700 mb-4">
              <Star size={14} />
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Loved by Thousands
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Here's what our users say about managing their money with SpendWise.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-lg">Got questions? We've got answers.</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-gray-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-white" />
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-white" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Ready to Take Control?
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto text-lg">
              Join thousands of users who are already managing their finances smarter with SpendWise.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:shadow-2xl hover:shadow-black/10 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              Create Account Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            <span className="text-sm font-bold text-gray-900">SpendWise</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 SpendWise. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">Testimonials</a>
            <a href="#faq" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

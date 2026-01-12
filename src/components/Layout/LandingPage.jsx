import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, Shield, Zap, Globe, 
  FileText, Users, Layout, ChevronRight,
  Mail, Phone, MapPin, Lock, FileCheck, Layers
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

// --- 1. SMOOTH SCROLL HELPER ---
const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    const offset = 90;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// --- 2. ADVANCED SCROLL REVEAL ---
const ScrollReveal = ({ children, className = "", delay = 0, direction = "up" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  const getTransform = () => {
    if (!isVisible) {
      if (direction === "up") return "translate-y-20 opacity-0";
      if (direction === "down") return "-translate-y-20 opacity-0";
      if (direction === "left") return "-translate-x-20 opacity-0";
      if (direction === "right") return "translate-x-20 opacity-0";
      if (direction === "scale") return "scale-90 opacity-0";
    }
    return "translate-y-0 translate-x-0 scale-100 opacity-100";
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${getTransform()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- 3. BACKGROUND ---
const AnimatedBackground = ({ isDarkMode }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none fixed z-0">
    <div className={`absolute top-[-10%] left-[-10%] w-[900px] h-[900px] rounded-full blur-[130px] opacity-[0.12] animate-pulse ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
    <div className={`absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full blur-[120px] opacity-[0.12] animate-pulse ${isDarkMode ? 'bg-indigo-600' : 'bg-blue-300'}`}></div>
    <style>{`
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-float-delay { animation: float 8s ease-in-out infinite; animation-delay: 1s; }
      @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      .animate-scroll { animation: scroll 60s linear infinite; }
    `}</style>
  </div>
);

// --- 4. IMAGE MARQUEE ---
const ImageMarquee = ({ isDarkMode }) => {
  // Professional, Onboarding-related imagery
  const images = [
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80", // Teamwork
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80", // Meeting
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80", // Professional
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80", // Collaboration
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80", // Digital
  ];

  return (
    <div className="w-full overflow-hidden py-16 relative z-10 opacity-80 hover:opacity-100 transition-opacity duration-500">
       {/* Fade Edges */}
       <div className={`absolute inset-y-0 left-0 w-32 z-20 bg-gradient-to-r ${isDarkMode ? 'from-gray-900 to-transparent' : 'from-slate-50 to-transparent'}`}></div>
       <div className={`absolute inset-y-0 right-0 w-32 z-20 bg-gradient-to-l ${isDarkMode ? 'from-gray-900 to-transparent' : 'from-slate-50 to-transparent'}`}></div>
       
       <div className="flex w-max animate-scroll">
         {[...images, ...images, ...images].map((img, i) => (
           <div key={i} className="mx-4 w-[400px] h-[250px] relative rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition-transform duration-500">
              <img src={img} alt="Office" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-blue-900/10 hover:bg-transparent transition-colors"></div>
           </div>
         ))}
       </div>
    </div>
  );
};

const LandingPage = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const bgGradient = isDarkMode ? 'bg-gray-900' : 'bg-slate-50';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = isDarkMode ? 'bg-gray-800/40 border-gray-700 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md';

  return (
    <div className={`min-h-screen flex flex-col ${bgGradient} transition-colors duration-500 overflow-x-hidden relative font-sans selection:bg-blue-500/30`}>
      
      <AnimatedBackground isDarkMode={isDarkMode} />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${textPrimary}`}>OnboardFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Privacy', 'Terms', 'Contact'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className={`text-sm font-medium hover:text-blue-500 transition-colors ${textSecondary}`}>{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className={`hidden md:block font-medium hover:text-blue-500 transition-colors ${textSecondary}`}>Sign In</button>
            <button onClick={() => navigate('/onboarding')} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center">
              Dashboard <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <ScrollReveal>
              <div className={`inline-flex items-center px-4 py-1.5 rounded-full border mb-8 ${isDarkMode ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-white border-blue-200 text-blue-700'}`}>
                <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                <span className="text-xs font-bold tracking-wide uppercase">The Future of HR</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] ${textPrimary}`}>
                Onboarding <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Reimagined.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <p className={`text-lg md:text-xl mb-10 leading-relaxed ${textSecondary}`}>
                A seamless experience for new hires and HR teams. Automate compliance, verify identity, and manage documents in one secure platform.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={300} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={() => navigate('/company-register')} className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center">
                Get Started <ArrowRight className="ml-2" />
              </button>
              <button className={`px-8 py-4 rounded-2xl border font-bold text-lg backdrop-blur-sm transition-all hover:-translate-y-1 ${isDarkMode ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-slate-700 hover:bg-white'}`}>
                Learn More
              </button>
            </ScrollReveal>
          </div>

          {/* Image Composition (Hero Grid) */}
          <div className="relative h-[600px] hidden lg:block">
            {/* Image 1: Tall Main */}
            <div className="absolute top-0 right-0 w-[60%] h-[80%] rounded-[2rem] overflow-hidden shadow-2xl animate-float z-10 border-4 border-white/10">
               <img src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800&q=80" alt="Office Vibe" className="w-full h-full object-cover" />
            </div>
            {/* Image 2: Wide Bottom */}
            <div className="absolute bottom-0 left-10 w-[60%] h-[40%] rounded-[2rem] overflow-hidden shadow-2xl animate-float-delay z-20 border-4 border-white/10">
               <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Data Analytics" className="w-full h-full object-cover" />
            </div>
            {/* Abstract Decorative Element */}
            <div className="absolute top-20 left-0 w-40 h-40 bg-blue-600/20 backdrop-blur-xl rounded-full z-0 animate-pulse"></div>
          </div>
        </div>
      </main>

      {/* --- INFINITE MARQUEE --- */}
      <ImageMarquee isDarkMode={isDarkMode} />

      {/* --- FEATURES GRID --- */}
      <section id="features" className={`relative z-10 py-32 px-6 ${isDarkMode ? 'bg-black/20' : 'bg-white/40'}`}>
        <div className="max-w-7xl mx-auto">
            <ScrollReveal>
                <div className="text-center mb-20">
                    <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${textPrimary}`}>Unified Workflow</h2>
                    <p className={`text-xl ${textSecondary} max-w-2xl mx-auto`}>
                        From offer letter to payroll, we handle the complexity so you can focus on people.
                    </p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard icon={FileText} title="Smart Forms" desc="Automated tax forms (W-4, State) generated instantly." delay={0} isDarkMode={isDarkMode} cardBg={cardBg} />
                <FeatureCard icon={Shield} title="Identity Verify" desc="Bank-grade security checks for I-9 compliance." delay={100} isDarkMode={isDarkMode} cardBg={cardBg} />
                <FeatureCard icon={Globe} title="Remote Ready" desc="Built for distributed teams across all 50 states." delay={200} isDarkMode={isDarkMode} cardBg={cardBg} />
                <FeatureCard icon={Users} title="Team Sync" desc="Keep stakeholders aligned with real-time status updates." delay={300} isDarkMode={isDarkMode} cardBg={cardBg} />
                <FeatureCard icon={Layers} title="Central Hub" desc="One dashboard for all candidate documents and data." delay={400} isDarkMode={isDarkMode} cardBg={cardBg} />
                <FeatureCard icon={CheckCircle2} title="Auto-Compliance" desc="We flag missing info before it becomes a problem." delay={500} isDarkMode={isDarkMode} cardBg={cardBg} />
            </div>
        </div>
      </section>

      {/* --- PRIVACY SECTION (ZIG ZAG) --- */}
      <section id="privacy" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <ScrollReveal direction="right" className="order-2 lg:order-1">
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px] border border-white/10 group">
                        <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80" alt="Security" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-blue-900/30"></div>
                        <div className="absolute bottom-8 left-8 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20">
                            <Lock className="text-white mb-2" size={32}/>
                            <p className="text-white font-bold">Bank-Grade Encryption</p>
                        </div>
                    </div>
                </ScrollReveal>
                
                <div className="order-1 lg:order-2">
                    <ScrollReveal>
                        <h2 className={`text-4xl font-bold mb-6 ${textPrimary}`}>Your Privacy, <br />Our Priority.</h2>
                        <div className={`space-y-6 ${textSecondary} text-lg leading-relaxed`}>
                            <p>We believe that trust is the foundation of onboarding. That's why we employ AES-256 encryption for every piece of data you entrust to us.</p>
                            <ul className="space-y-4">
                                <li className="flex items-start"><CheckCircle2 className="text-blue-500 mr-3 mt-1" size={20}/> <span>Data is encrypted at rest and in transit.</span></li>
                                <li className="flex items-start"><CheckCircle2 className="text-blue-500 mr-3 mt-1" size={20}/> <span>Strict access controls for HR administrators.</span></li>
                                <li className="flex items-start"><CheckCircle2 className="text-blue-500 mr-3 mt-1" size={20}/> <span>Regular third-party security audits (SOC2).</span></li>
                            </ul>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
      </section>

      {/* --- TERMS SECTION (ZIG ZAG) --- */}
      <section id="terms" className={`py-32 px-6 relative z-10 ${isDarkMode ? 'bg-black/20' : 'bg-blue-50/50'}`}>
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <ScrollReveal>
                        <h2 className={`text-4xl font-bold mb-6 ${textPrimary}`}>Transparent Terms <br />of Service.</h2>
                        <div className={`space-y-6 ${textSecondary} text-lg leading-relaxed`}>
                            <p>No hidden clauses, no data selling. Our terms are designed to protect your business and your employees.</p>
                            <div className={`p-6 rounded-2xl border ${cardBg}`}>
                                <h4 className={`font-bold mb-2 ${textPrimary}`}>License & Usage</h4>
                                <p className="text-sm">Granted solely for internal business operations. You own your data; we just process it securely.</p>
                            </div>
                            <div className={`p-6 rounded-2xl border ${cardBg}`}>
                                <h4 className={`font-bold mb-2 ${textPrimary}`}>Compliance Guarantee</h4>
                                <p className="text-sm">We keep our forms updated with the latest state and federal regulations so you don't have to.</p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                <ScrollReveal direction="left">
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px] border border-white/10 group">
                        <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80" alt="Contracts" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-indigo-900/20"></div>
                        <div className="absolute top-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
                            <FileCheck className="text-blue-600 mb-2" size={32}/>
                            <p className="text-slate-900 font-bold">Compliant & Legal</p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-32 px-6 relative z-10">
        <ScrollReveal direction="up" className="max-w-6xl mx-auto">
            <div className={`rounded-[3rem] overflow-hidden shadow-2xl relative`}>
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80" alt="Office Background" className="w-full h-full object-cover opacity-20" />
                    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900/90' : 'bg-blue-900/90'}`}></div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 p-12 lg:p-20 items-center">
                    <div className="text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to upgrade your workflow?</h2>
                        <p className="text-blue-100 text-lg mb-10">Our support team is ready to help you set up your enterprise workspace.</p>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><Mail size={24} /></div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Email Us</p>
                                    <p className="text-lg font-medium">support@onboardflow.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm"><MapPin size={24} /></div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Visit Us</p>
                                    <p className="text-lg font-medium">123 Tech Park, Chennai</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`p-8 rounded-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</label>
                                <input type="text" className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`} placeholder="Jane Doe" />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email Address</label>
                                <input type="email" className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`} placeholder="jane@company.com" />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Message</label>
                                <textarea rows="3" className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`} placeholder="How can we help?"></textarea>
                            </div>
                            <button className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-lg shadow-blue-500/20">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ScrollReveal>
      </section>

      {/* --- FOOTER --- */}
      <footer className={`relative z-10 py-12 px-6 border-t ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                    <Zap size={16} fill="currentColor" />
                </div>
                <span className={`font-bold text-lg ${textPrimary}`}>OnboardFlow</span>
            </div>
            <p className={`text-sm ${textSecondary}`}>© 2026 UBE Global. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

// --- SUB COMPONENTS ---

const FeatureCard = ({ icon: Icon, title, desc, delay, isDarkMode, cardBg }) => (
    <ScrollReveal delay={delay} direction="up">
        <div className={`group p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 relative overflow-hidden ${cardBg} shadow-lg h-full`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Icon size={28} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <p className={`leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
        </div>
    </ScrollReveal>
);

export default LandingPage;
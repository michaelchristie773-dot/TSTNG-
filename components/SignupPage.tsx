import React, { useState, useEffect } from 'react';

interface SignupPageProps {
  onComplete: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onComplete }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length > 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setLoadingProvider(provider);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="w-full h-full flex bg-[#020617] overflow-hidden">
      {/* Left Side: Cinematic Studio */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-center px-20 overflow-hidden bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b]">
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-indigo-500 animate-pulse opacity-20" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 4}px`, height: `${Math.random() * 4}px`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 7}s` }} />
          ))}
        </div>
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Powered by Gemini 2.5</span>
          </div>
          <h1 className="text-6xl font-black text-white leading-tight"> The Future of <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400"> Vocal Identity. </span> </h1>
          <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-light"> Access next-generation neural synthesis. Create multi-speaker scripts, clone voices, and export professional audio in seconds. </p>
          <div className="pt-12 grid grid-cols-2 gap-8">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"><p className="text-4xl font-bold text-white mb-1">30+</p><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Neural Voices</p></div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"><p className="text-4xl font-bold text-white mb-1">0.8s</p><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Latency</p></div>
          </div>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Access Studio</h2>
            <p className="text-slate-500 text-sm">Synchronize with your preferred identity provider.</p>
          </div>

          <div className="space-y-4">
            {/* Primary Provider */}
            <button 
              onClick={() => handleSocialLogin('Google')} 
              disabled={isLoading} 
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-xl disabled:opacity-50 text-sm group"
            >
              {loadingProvider === 'Google' ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loadingProvider === 'Google' ? 'Handshaking...' : 'Continue with Google'}
            </button>

            {/* Secondary Providers Grid */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => handleSocialLogin('Apple')}
                disabled={isLoading}
                title="Apple ID"
                className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all group active:scale-95 disabled:opacity-50"
              >
                {loadingProvider === 'Apple' ? (
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.671-1.48 3.675-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2.002-.156-3.312 1.091-4.299 1.091zm.065-1.675c.819-1.002 1.378-2.392 1.221-3.779-1.183.052-2.61.793-3.468 1.79-.767.883-1.442 2.312-1.26 3.649 1.312.104 2.65-.637 3.507-1.66z"/>
                  </svg>
                )}
              </button>

              <button 
                onClick={() => handleSocialLogin('GitHub')}
                disabled={isLoading}
                title="GitHub"
                className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-slate-800 hover:text-white transition-all group active:scale-95 disabled:opacity-50"
              >
                {loadingProvider === 'GitHub' ? (
                  <div className="w-4 h-4 border-2 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                )}
              </button>

              <button 
                onClick={() => handleSocialLogin('Microsoft')}
                disabled={isLoading}
                title="Microsoft"
                className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600 hover:text-white transition-all group active:scale-95 disabled:opacity-50"
              >
                {loadingProvider === 'Microsoft' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 23 23">
                    <path d="M11.4 0H0v11.4h11.4V0zm11.6 0H11.6v11.4h11.4V0zM11.4 11.6H0V23h11.4V11.6zm11.6 0H11.6V23h11.4V11.6z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Interface Access</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Vector Identity</label>
              <input 
                required 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-700 text-sm" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Neural Node Address</label>
              <input 
                required 
                type="email" 
                placeholder="name@studio.ai" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-700 text-sm" 
              />
            </div>
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Keyphrase</label>
              <div className="relative">
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-700 text-sm" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-4 mt-2 rounded-2xl font-black text-white uppercase tracking-[0.2em] shadow-2xl transition-all relative overflow-hidden group ${isLoading ? 'bg-indigo-900 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.01] active:scale-95'}`}
            > 
              {isLoading && !loadingProvider ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Calibrating...</span>
                </div>
              ) : 'Initialize Studio'} 
            </button>
          </form>
          
          <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            By initializing, you accept the <span className="text-indigo-500/60 hover:text-indigo-400 cursor-pointer">Neural Protocols</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
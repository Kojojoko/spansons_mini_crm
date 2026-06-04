import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setErrorMsg(res.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen overflow-hidden flex">
      <main className="flex min-h-screen w-full">
        {/* Left Side: Narrative & Visuals */}
        <section className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-tertiary to-secondary overflow-hidden items-center justify-center p-edge-margin">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]"></div>
          </div>
          {/* Floating 3D-like Abstract Shapes */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 -rotate-12 absolute -translate-x-48 -translate-y-24"></div>
            </div>
            <div className="animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="w-48 h-48 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 absolute translate-x-32 translate-y-32"></div>
            </div>
            <div className="animate-float" style={{ animationDelay: '0.8s' }}>
              <svg className="absolute -translate-x-12 translate-y-[-160px] w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          <div className="relative z-10 max-w-lg text-white fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 font-label-md text-label-md mb-6 backdrop-blur-sm">
                Version 2.4.0 Now Live
              </span>
              <h1 className="font-headline-xl text-headline-xl mb-6 leading-tight">
                Manage your leads with intelligence.
              </h1>
              <p className="font-body-lg text-body-lg text-white/80 leading-relaxed">
                Experience the next generation of customer relationship management. Streamlined workflows, predictive analytics, and a seamless interface designed for high-performance teams.
              </p>
            </div>
            <div className="flex gap-8 mt-12 pt-12 border-t border-white/10">
              <div>
                <p className="font-headline-md text-headline-md">10k+</p>
                <p className="font-label-sm text-label-sm text-white/60">Active Leads</p>
              </div>
              <div>
                <p className="font-headline-md text-headline-md">99.9%</p>
                <p className="font-label-sm text-label-sm text-white/60">Uptime Rate</p>
              </div>
              <div>
                <p className="font-headline-md text-headline-md">24/7</p>
                <p className="font-label-sm text-label-sm text-white/60">Concierge Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-gutter relative bg-surface">
          {/* Mobile Header Logo */}
          <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined">dataset</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-on-surface">SPANDSONS</span>
          </div>

          <div className="w-full max-w-[440px] fade-in" style={{ animationDelay: '0.4s' }}>
            <header className="mb-10 text-center lg:text-left">
              <div className="hidden lg:flex items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
                </div>
                <span className="font-headline-md text-headline-md font-bold text-on-surface">SPANDSONS</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome back</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Please enter your details to access your workspace.</p>
            </header>

            {/* Glassmorphic Card */}
            <div className="glass-card p-8 rounded-xl shadow-2xl shadow-primary/5">
              {errorMsg && (
                <div className="mb-6 p-4 bg-error-container text-error rounded-lg font-body-md border border-error/10">
                  {errorMsg}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">Email address</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-border-subtle rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                    <a className="font-label-md text-label-md text-primary hover:underline" href="#forgot">Forgot password?</a>
                  </div>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                    <input
                      className="w-full pl-12 pr-12 py-3 bg-surface-container-low border border-border-subtle rounded-lg font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    className="w-5 h-5 rounded border-border-subtle text-primary focus:ring-primary/20 transition-all cursor-pointer"
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember me for 30 days</label>
                </div>

                <button
                  className={`w-full py-4 bg-primary text-white font-label-md text-label-md rounded-lg shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group ${
                    successMsg ? 'bg-status-won hover:bg-status-won shadow-status-won/20' : ''
                  }`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    successMsg ? (
                      <>
                        <span className="material-symbols-outlined">check_circle</span>
                        Success!
                      </>
                    ) : (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    )
                  ) : (
                    <>
                      Log in to Dashboard
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-subtle"></div>
                </div>
                <div className="relative flex justify-center text-label-sm uppercase tracking-wider">
                  <span className="bg-white/50 backdrop-blur-sm px-4 text-outline">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3 py-3 border border-border-subtle rounded-lg hover:bg-white transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-primary">cloud_queue</span>
                  <span className="font-label-md text-label-md">Google</span>
                </button>
                <button className="flex items-center justify-center gap-3 py-3 border border-border-subtle rounded-lg hover:bg-white transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-on-surface">terminal</span>
                  <span className="font-label-md text-label-md">SSO</span>
                </button>
              </div>
            </div>

            <footer className="mt-10 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Don't have an account?{' '}
                <Link className="text-primary font-bold hover:underline" to="/register">Get started for free</Link>
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;

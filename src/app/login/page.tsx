"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, MapPin, Shield } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp, adminSignIn } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password, displayName);
        if (err) { setError(err); return; }
        setSuccess("Account created! Check your email to confirm, then log in.");
        setIsSignUp(false);
      } else {
        const { error: err } = await signIn(email, password);
        if (err) { setError(err); return; }
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error: err } = adminSignIn(adminUsername, adminPassword);
      if (err) {
        setError(err);
        return;
      }
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white text-2xl font-black shadow-xl mb-4">
            U
          </div>
          <h1 className="text-2xl font-bold text-slate-800">UniMap</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
            <MapPin size={14} className="text-amber-500" />
            Community-powered universal map
          </p>
        </div>

        {/* Mode Toggle — User vs Admin */}
        <div className="flex items-center justify-center gap-1 mb-4">
          <button
            onClick={() => { setIsAdminMode(false); setError(null); setSuccess(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!isAdminMode
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white/80 text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
          >
            <User size={13} className="inline mr-1.5 -mt-0.5" />
            User Login
          </button>
          <button
            onClick={() => { setIsAdminMode(true); setIsSignUp(false); setError(null); setSuccess(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isAdminMode
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md"
              : "bg-white/80 text-slate-500 hover:bg-white hover:text-slate-700"
              }`}
          >
            <Shield size={13} className="inline mr-1.5 -mt-0.5" />
            Admin Login
          </button>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6 md:p-8">
          {isAdminMode ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={18} className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-800">Admin Access</h2>
              </div>
              <p className="text-sm text-slate-400 mb-6">Sign in with admin credentials</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-800 mb-1">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                {isSignUp ? "Join the community to contribute" : "Sign in to your account"}
              </p>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-fade-up">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium animate-fade-up">
              {success}
            </div>
          )}

          {isAdminMode ? (
            /* ── Admin Login Form ── */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Username"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white transition-all"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Please wait...</>
                ) : (
                  <>Access Dashboard <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          ) : (
            /* ── User Login/SignUp Form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Please wait...</>
                ) : (
                  <>{isSignUp ? "Sign Up" : "Sign In"} <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {!isAdminMode && (
            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>

        {/* Back to map */}
        <div className="text-center mt-4">
          <a href="/" className="text-sm text-slate-400 hover:text-slate-600 transition inline-flex items-center gap-1">
            <ArrowRight size={12} className="rotate-180" />
            Back to map
          </a>
        </div>
      </div>
    </div>
  );
}

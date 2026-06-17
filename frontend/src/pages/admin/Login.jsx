import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={location.state?.from || "/admin"} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back.");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Login failed";
      toast.error(typeof msg === "string" ? msg : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="admin-login-page">
      <div className="hidden md:flex md:w-1/2 bg-stone-900 text-stone-100 p-12 flex-col justify-between">
        <Logo dark size="lg" />
        <div>
          <h1 className="editorial-h2 text-stone-50 text-5xl md:text-6xl">Studio Inai</h1>
          <p className="mt-4 font-sans text-stone-400 max-w-md">Admin console — manage content, projects, bookings and enquiries.</p>
        </div>
        <div className="overline text-stone-500">© Studio Inai · Chennai</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-stone-50">
        <form onSubmit={onSubmit} className="w-full max-w-sm" data-testid="admin-login-form">
          <div className="md:hidden mb-10"><Logo /></div>
          <div className="overline text-stone-500">Sign In</div>
          <h2 className="editorial-h2 text-4xl mt-3">Welcome back.</h2>

          <div className="mt-10 space-y-6">
            <div>
              <label className="overline text-stone-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="admin-email-input"
                className="mt-2 w-full bg-transparent border-b border-stone-300 font-sans py-2 focus:border-stone-900"
              />
            </div>
            <div>
              <label className="overline text-stone-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="admin-password-input"
                className="mt-2 w-full bg-transparent border-b border-stone-300 font-sans py-2 focus:border-stone-900"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              data-testid="admin-login-submit"
              className="w-full font-display text-sm tracking-wide px-8 py-3.5 bg-stone-900 text-stone-50 hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

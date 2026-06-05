import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  // Stats state
  const [stats, setStats] = useState({
    totalLeads: 0,
    userLeads: 0,
    globalTotalLeads: 0,
    activeLeads: 0,
    wonDeals: 0,
    lostLeads: 0
  });
  const [statusBreakdown, setStatusBreakdown] = useState({
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Won: 0,
    Lost: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Edit profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync user details on load/change
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Fetch lead metrics
  useEffect(() => {
    const fetchLeadMetrics = async () => {
      try {
        setLoadingStats(true);
        const res = await API.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          if (res.data.statusBreakdown) {
            setStatusBreakdown({
              ...statusBreakdown,
              ...res.data.statusBreakdown
            });
          }
        }
      } catch (err) {
        console.error('Failed to load user lead metrics:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchLeadMetrics();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await updateProfile(name, email, password || undefined);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return 'U';
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Format creation date
  const getJoinedDate = () => {
    const dateSrc = user?.createdAt || user?.joinedAt;
    if (!dateSrc) return 'June 2026';
    const date = new Date(dateSrc);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-gutter fade-in">
      {/* Header */}
      <div>
        <h2 className="font-headline-xl text-headline-xl text-on-surface">User Profile</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your account settings and review your workspace productivity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Profile Stats Summary Panel */}
        <div className="space-y-gutter lg:col-span-1">
          {/* Avatar card */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full border-4 border-primary-container bg-primary/10 flex items-center justify-center font-bold text-primary text-4xl shadow-md">
              {getInitials(user?.name)}
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{user?.name}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-70">Sales Account Executive</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant opacity-50 mt-1">Member since {getJoinedDate()}</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h4 className="font-headline-md text-headline-md font-bold text-on-surface border-b border-border-subtle pb-3">Pipeline Performance</h4>
            
            {loadingStats ? (
              <div className="py-6 flex justify-center">
                <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Leads Added By You */}
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                    Leads Added By You
                  </span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">{stats.userLeads}</span>
                </div>

                {/* Total Leads */}
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
                    Total Leads
                  </span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">{stats.totalLeads}</span>
                </div>

                {/* Won Deals */}
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-status-won">check_circle</span>
                    Won Deals
                  </span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">{stats.wonDeals}</span>
                </div>

                {/* Active Pipelines */}
                <div className="flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-status-new">hourglass_empty</span>
                    Active Pipeline Prospects
                  </span>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">{stats.activeLeads}</span>
                </div>

                {/* Pipeline Breakdown Progress bars */}
                <div className="pt-4 border-t border-border-subtle space-y-3">
                  <h5 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant opacity-60">Status Breakdown</h5>
                  
                  {/* New */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>New</span>
                      <span>{statusBreakdown.New} ({stats.totalLeads > 0 ? Math.round((statusBreakdown.New / stats.totalLeads) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${stats.totalLeads > 0 ? (statusBreakdown.New / stats.totalLeads) * 100 : 0}%` }}
                        className="h-full bg-status-new transition-all duration-500"
                      ></div>
                    </div>
                  </div>

                  {/* Contacted */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>Contacted</span>
                      <span>{statusBreakdown.Contacted} ({stats.totalLeads > 0 ? Math.round((statusBreakdown.Contacted / stats.totalLeads) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${stats.totalLeads > 0 ? (statusBreakdown.Contacted / stats.totalLeads) * 100 : 0}%` }}
                        className="h-full bg-status-contacted transition-all duration-500"
                      ></div>
                    </div>
                  </div>

                  {/* Qualified */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>Qualified</span>
                      <span>{statusBreakdown.Qualified} ({stats.totalLeads > 0 ? Math.round((statusBreakdown.Qualified / stats.totalLeads) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${stats.totalLeads > 0 ? (statusBreakdown.Qualified / stats.totalLeads) * 100 : 0}%` }}
                        className="h-full bg-status-qualified transition-all duration-500"
                      ></div>
                    </div>
                  </div>

                  {/* Won */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>Won</span>
                      <span>{statusBreakdown.Won} ({stats.totalLeads > 0 ? Math.round((statusBreakdown.Won / stats.totalLeads) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${stats.totalLeads > 0 ? (statusBreakdown.Won / stats.totalLeads) * 100 : 0}%` }}
                        className="h-full bg-status-won transition-all duration-500"
                      ></div>
                    </div>
                  </div>

                  {/* Lost */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span>Lost</span>
                      <span>{statusBreakdown.Lost} ({stats.totalLeads > 0 ? Math.round((statusBreakdown.Lost / stats.totalLeads) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${stats.totalLeads > 0 ? (statusBreakdown.Lost / stats.totalLeads) * 100 : 0}%` }}
                        className="h-full bg-status-lost transition-all duration-500"
                      ></div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 md:p-8 rounded-2xl h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Account Credentials</h3>
                <p className="font-body-md text-body-md text-on-surface-variant opacity-70 mt-1">Update your basic name and set a new password if needed.</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-error-container text-error rounded-xl text-body-md border border-error/15 fade-in">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-status-won/10 text-status-won rounded-xl text-body-md border border-status-won/15 fade-in">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name-input" className="block font-label-md text-label-md text-on-surface-variant font-bold">Full Name</label>
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md"
                      placeholder="Your Full Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email-input" className="block font-label-md text-label-md text-on-surface-variant font-bold">Email Address</label>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl text-on-surface-variant opacity-60 outline-none text-body-md cursor-not-allowed"
                      placeholder="your.email@example.com"
                    />
                    <p className="font-label-sm text-label-sm text-on-surface-variant opacity-50">Email edits are restricted for security configuration.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface mb-4">Change Password</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant opacity-70 mb-4">Leave password fields blank if you do not wish to update your login password.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label htmlFor="password-input" className="block font-label-md text-label-md text-on-surface-variant font-bold">New Password</label>
                      <input
                        id="password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md"
                        placeholder="At least 6 characters"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirm-password-input" className="block font-label-md text-label-md text-on-surface-variant font-bold">Confirm New Password</label>
                      <input
                        id="confirm-password-input"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md"
                        placeholder="Re-type new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-label-md text-label-md shadow-lg shadow-primary/25 hover:bg-primary/95 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {submitting && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Save Profile Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

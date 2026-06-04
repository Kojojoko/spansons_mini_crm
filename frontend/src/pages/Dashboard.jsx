import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    wonDeals: 0,
    lostLeads: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentLeads(res.data.recentLeads);
        setChartData(res.data.chartData);
        setStatusBreakdown(res.data.statusBreakdown);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [location.search]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await API.patch(`/leads/${leadId}/status`, { status: newStatus });
      if (res.data.success) {
        setActiveDropdownId(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleEditClick = (leadId) => {
    navigate(`?modal=edit&id=${leadId}`);
  };

  // Helper to calculate conversion rate
  const getConversionRate = () => {
    if (stats.totalLeads === 0) return '0.0%';
    const rate = (stats.wonDeals / stats.totalLeads) * 100;
    return `${rate.toFixed(1)}%`;
  };

  // Helper to get status pill styles
  const getStatusStyle = (status) => {
    switch (status) {
      case 'New':
        return 'bg-status-new/10 text-status-new';
      case 'Contacted':
        return 'bg-status-contacted/10 text-status-contacted';
      case 'Qualified':
        return 'bg-status-qualified/10 text-status-qualified';
      case 'Won':
        return 'bg-status-won/10 text-status-won';
      case 'Lost':
        return 'bg-status-lost/10 text-status-lost';
      default:
        return 'bg-surface-variant/40 text-on-surface-variant';
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Find max chart count to scale bars
  const maxChartCount = Math.max(...chartData.map(d => d.count), 5);

  return (
    <div className="space-y-gutter fade-in">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Dashboard</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Here is a summary of your workspace leads pipeline.</p>
        </div>
        <button
          onClick={() => navigate('?modal=new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/45 transition-all active:scale-95 text-sm self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Lead
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-error-container text-error rounded-lg text-body-md border border-error/10">
          {errorMsg}
        </div>
      )}

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
          <div className="w-12 h-12 bg-status-new/10 text-status-new rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Total Leads</p>
            <p className="font-headline-md text-headline-md font-bold mt-0.5">{stats.totalLeads}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
          <div className="w-12 h-12 bg-status-qualified/10 text-status-qualified rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Active Leads</p>
            <p className="font-headline-md text-headline-md font-bold mt-0.5">{stats.activeLeads}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
          <div className="w-12 h-12 bg-status-won/10 text-status-won rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Won Deals</p>
            <p className="font-headline-md text-headline-md font-bold mt-0.5">{stats.wonDeals}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
          <div className="w-12 h-12 bg-status-contacted/10 text-status-contacted rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">auto_graph</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Conversion</p>
            <p className="font-headline-md text-headline-md font-bold mt-0.5">{getConversionRate()}</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Lead Gen Trend Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6">Lead Generation Trend</h3>
          
          {/* Custom SVG/HTML Bar Chart */}
          <div className="flex-grow flex items-end gap-3 h-64 border-b border-outline-variant/30 pb-2">
            {chartData.map((d, index) => {
              const heightPercent = `${(d.count / maxChartCount) * 100}%`;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-inverse-surface text-inverse-on-surface text-label-sm py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-10 whitespace-nowrap">
                    {d.count} Leads
                  </div>
                  {/* Bar */}
                  <div 
                    style={{ height: heightPercent }}
                    className="w-full bg-gradient-to-t from-primary to-primary-fixed-dim rounded-t-lg transition-all duration-500 hover:from-primary/90 hover:to-primary-fixed group-hover:scale-y-[1.02] origin-bottom shadow-sm shadow-primary/10"
                  ></div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant opacity-60 mt-2">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Timeline / Status list */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-6">Recent Activity Timeline</h3>
            <div className="space-y-4">
              {recentLeads.slice(0, 4).map((lead, i) => (
                <div key={lead._id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {i + 1}
                    </div>
                    {i < 3 && <div className="w-0.5 flex-grow bg-outline-variant/40 my-1"></div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      {lead.name}
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant opacity-75">
                      Added under status <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusStyle(lead.status)}`}>{lead.status}</span>
                    </p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant opacity-50 mt-0.5">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-on-surface-variant opacity-60 py-6 text-center">No recent activities available.</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => navigate('/leads')}
            className="w-full mt-6 py-2.5 border border-border-subtle rounded-xl font-label-md text-label-md hover:bg-surface-variant/40 transition-all text-center text-on-surface-variant font-bold"
          >
            View All Leads
          </button>
        </div>
      </div>

      {/* Recent Leads Table Card */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <header className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-container-low/20">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Recent Leads</h3>
          <button 
            onClick={() => navigate('/leads')}
            className="font-label-md text-label-md text-primary font-bold hover:underline"
          >
            Manage Pipeline
          </button>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Prospect Name</th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Deal Value</th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recentLeads.map((lead) => (
                <tr key={lead._id} className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-body-md text-body-md font-semibold text-on-surface">{lead.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">
                        {lead.phone || 'No phone'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                    {lead.company || '—'}
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4 font-body-md text-body-md font-semibold text-on-surface">
                    ${lead.value?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 relative">
                    {/* Status Badge Dropdown Trigger */}
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === lead._id ? null : lead._id);
                        }}
                        className={`px-3 py-1 font-label-sm text-label-sm rounded-full flex items-center gap-1 hover:brightness-95 transition-all ${getStatusStyle(lead.status)}`}
                      >
                        {lead.status}
                        <span className="material-symbols-outlined text-[12px]">arrow_drop_down</span>
                      </button>

                      {/* Dropdown Options */}
                      {activeDropdownId === lead._id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdownId(null)}
                          ></div>
                          <div className="absolute left-0 mt-1.5 w-36 rounded-lg bg-white border border-outline-variant shadow-lg z-20 py-1 overflow-hidden">
                            {['New', 'Contacted', 'Qualified', 'Won', 'Lost'].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(lead._id, s)}
                                className={`w-full text-left px-4 py-2 font-label-sm text-label-sm hover:bg-surface-container transition-colors ${
                                  lead.status === s ? 'font-bold text-primary' : 'text-on-surface-variant'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(lead._id)}
                        className="p-2 hover:bg-surface-container text-on-surface-variant rounded-lg transition-colors"
                        title="Edit Details"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-on-surface-variant opacity-60">
                    No leads registered yet. Click "New Lead" to start your pipeline.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

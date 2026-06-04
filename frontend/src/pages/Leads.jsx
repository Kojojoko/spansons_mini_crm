import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';

const Leads = ({ globalSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filtering and pagination states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [limit] = useState(5); // 5 leads per page matching Stitch designs

  // Quick stats
  const [stats, setStats] = useState({
    total: 0,
    qualified: 0,
    contacted: 0,
    conversion: '0.0%'
  });

  // Action states
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Sync global search from Layout header
  useEffect(() => {
    if (globalSearch !== undefined) {
      setSearch(globalSearch);
      setPage(1); // reset to page 1 on search
    }
  }, [globalSearch]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leads', {
        params: {
          search,
          status: statusFilter,
          page,
          limit
        }
      });

      if (res.data.success) {
        setLeads(res.data.leads);
        setTotalPages(res.data.totalPages);
        setTotalLeads(res.data.totalLeads);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch leads list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      if (res.data.success) {
        const s = res.data.stats;
        const conversionVal = s.totalLeads > 0 ? ((s.wonDeals / s.totalLeads) * 100).toFixed(1) : '0.0';
        setStats({
          total: s.totalLeads,
          qualified: res.data.statusBreakdown.Qualified || 0,
          contacted: res.data.statusBreakdown.Contacted || 0,
          conversion: `${conversionVal}%`
        });
      }
    } catch (err) {
      console.error('Failed to load quick stats:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, page, location.search]);

  useEffect(() => {
    fetchStats();
  }, [leads]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await API.patch(`/leads/${leadId}/status`, { status: newStatus });
      if (res.data.success) {
        setActiveDropdownId(null);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      const res = await API.delete(`/leads/${leadToDelete._id}`);
      if (res.data.success) {
        setLeadToDelete(null);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete lead.');
    } finally {
      setDeleting(false);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    
    // Header Row
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Value', 'Notes', 'Created At'];
    
    // Data Rows
    const rows = leads.map(l => [
      l.name,
      l.company || '',
      l.email,
      l.phone || '',
      l.status,
      l.value || 0,
      l.notes || '',
      new Date(l.createdAt).toLocaleDateString()
    ]);
    
    // Construct CSV String with proper RFC 4180 escaping
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => {
          const str = String(val);
          // If the field contains commas, quotes, or newlines, wrap it in double quotes and escape existing quotes
          if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      )
    ].join('\r\n');
    
    const blob = new Blob(["\ufeff", csvContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `spandsons_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Defer revocation to ensure browser downloader starts reading the stream
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New': return 'bg-status-new/10 text-status-new';
      case 'Contacted': return 'bg-status-contacted/10 text-status-contacted';
      case 'Qualified': return 'bg-status-qualified/10 text-status-qualified';
      case 'Won': return 'bg-status-won/10 text-status-won';
      case 'Lost': return 'bg-status-lost/10 text-status-lost';
      default: return 'bg-surface-variant/40 text-on-surface-variant';
    }
  };

  return (
    <div className="space-y-gutter fade-in">
      {/* Header and Control Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">Leads Pipeline</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage and track your sales pipeline prospects.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Status selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-white border border-border-subtle rounded-xl font-label-md text-label-md text-on-surface-variant focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none pr-10"
            >
              <option value="All">All Pipelines</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 pointer-events-none">arrow_drop_down</span>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={leads.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            Export CSV
          </button>
          
          <button
            onClick={() => navigate('?modal=new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-label-md text-label-md shadow-lg shadow-primary/25 hover:bg-primary/95 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add Lead
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-status-new/10 text-status-new rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Total Leads</p>
            <p className="font-headline-md text-headline-md font-bold mt-0.5">{stats.total}</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-status-qualified/10 text-status-qualified rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Qualified</p>
            <p className="font-headline-md text-headline-md font-bold mt-0.5">{stats.qualified}</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-status-contacted/10 text-status-contacted rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">call</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Contacted</p>
            <p className="font-headline-md text-headline-md font-bold mt-0.5">{stats.contacted}</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-status-won/10 text-status-won rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined">auto_graph</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Conversion</p>
            <p className="font-headline-md text-headline-md font-bold mt-0.5">{stats.conversion}</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-error-container text-error rounded-lg text-body-md border border-error/10">
          {errorMsg}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider">Pipeline Status</th>
                  <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant opacity-60 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-body-md text-body-md font-semibold text-on-surface">{lead.name}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant opacity-50 mt-0.5">
                          Added {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                      {lead.company || '—'}
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                      {lead.email}
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                      {lead.phone || '—'}
                    </td>
                    <td className="px-6 py-4 relative">
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
                        
                        {activeDropdownId === lead._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
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
                          onClick={() => navigate(`?modal=edit&id=${lead._id}`)}
                          className="p-2 hover:bg-surface-container text-on-surface-variant rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => setLeadToDelete(lead)}
                          className="p-2 hover:bg-error-container text-error rounded-lg transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-on-surface-variant opacity-60">
                      No leads match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-surface-container-low/30 border-t border-border-subtle flex items-center justify-between">
            <p className="font-label-sm text-label-sm text-on-surface-variant opacity-65">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalLeads)} of {totalLeads} leads
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-label-sm text-label-sm transition-colors ${
                    page === i + 1
                      ? 'bg-primary text-white font-bold'
                      : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setLeadToDelete(null)}></div>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative z-10 space-y-4">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-error">warning</span>
              Delete Lead
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Are you sure you want to permanently delete lead <span className="font-bold">{leadToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 border border-border-subtle rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 bg-error text-white rounded-xl font-bold shadow-lg shadow-error/15 hover:bg-error/95 flex items-center gap-1 active:scale-95"
              >
                {deleting && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;

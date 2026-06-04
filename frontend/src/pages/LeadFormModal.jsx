import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';

const LeadFormModal = ({ onSaveSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const modalType = searchParams.get('modal');
  const leadId = searchParams.get('id');

  const isOpen = modalType === 'new' || modalType === 'edit';

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('New');
  const [value, setValue] = useState(0);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch lead data if editing
  useEffect(() => {
    if (isOpen && modalType === 'edit' && leadId) {
      const fetchLead = async () => {
        setFetching(true);
        setErrorMsg('');
        try {
          // Since getLeads returns paginated data, we can query by ID or fetch all to find it, 
          // or add an endpoint. Let's look at leadController.js - wait, we only implemented
          // PUT, DELETE, PATCH, and GET leads. We didn't implement GET /api/leads/:id!
          // We can fetch `/api/leads` with search=email or we can query our current pages' leads, 
          // or we can hit the GET /api/leads and filter in JS! Let's fetch GET /api/leads with page=1, limit=100
          // to locate the lead, or let's quickly check. If we didn't add a single GET route, let's fetch all leads and filter in memory.
          const res = await API.get('/leads', { params: { limit: 100 } });
          if (res.data.success) {
            const lead = res.data.leads.find(l => l._id === leadId);
            if (lead) {
              setName(lead.name);
              setCompany(lead.company || '');
              setEmail(lead.email);
              setPhone(lead.phone || '');
              setStatus(lead.status || 'New');
              setValue(lead.value || 0);
              setNotes(lead.notes || '');
            } else {
              setErrorMsg('Lead not found in current view.');
            }
          }
        } catch (err) {
          setErrorMsg('Failed to load lead details.');
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchLead();
    } else {
      // Reset form fields for new lead
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setStatus('New');
      setValue(0);
      setNotes('');
      setErrorMsg('');
    }
  }, [isOpen, modalType, leadId]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Remove query params to close modal
    const params = new URLSearchParams(location.search);
    params.delete('modal');
    params.delete('id');
    navigate({ search: params.toString() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMsg('Name and Email are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const payload = {
      name,
      company,
      email,
      phone,
      status,
      value: Number(value),
      notes
    };

    try {
      let res;
      if (modalType === 'new') {
        res = await API.post('/leads', payload);
      } else {
        res = await API.put(`/leads/${leadId}`, payload);
      }

      if (res.data.success) {
        if (onSaveSuccess) onSaveSuccess();
        handleClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save lead. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 modal-overlay"
        onClick={handleClose}
      ></div>

      {/* Modal Dialog */}
      <div className="glass-panel w-full max-w-xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              {modalType === 'new' ? 'Create New Lead' : 'Edit Lead Details'}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-75 mt-0.5">
              {modalType === 'new' ? 'Add a new prospect to your sales pipeline.' : `Update prospect information.`}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-all active:scale-90"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          {fetching ? (
            <div className="py-12 flex justify-center items-center">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-error-container text-error rounded-lg text-body-md border border-error/10">
                  {errorMsg}
                </div>
              )}

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lead Name */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="lead-name">Lead Name *</label>
                  <input
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    id="lead-name"
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Company */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="company-name">Company Name</label>
                  <input
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    id="company-name"
                    type="text"
                    placeholder="e.g. Nexus Dynamics"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="lead-email">Email Address *</label>
                  <input
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    id="lead-email"
                    type="email"
                    placeholder="s.jenkins@nexus.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="lead-phone">Phone Number</label>
                  <input
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    id="lead-phone"
                    type="tel"
                    placeholder="+1 (555) 012-3456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1">Pipeline Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['New', 'Contacted', 'Qualified'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`py-2 px-3 rounded-lg border font-label-md text-label-md text-center transition-all ${
                          status === s
                            ? 'bg-primary/10 border-primary text-primary font-bold'
                            : 'border-border-subtle hover:bg-surface-variant/40 text-on-surface-variant'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                    {['Won', 'Lost'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`py-2 px-3 rounded-lg border font-label-md text-label-md text-center transition-all ${
                          status === s
                            ? s === 'Won'
                              ? 'bg-status-won/10 border-status-won text-status-won font-bold'
                              : 'bg-status-lost/10 border-status-lost text-status-lost font-bold'
                            : 'border-border-subtle hover:bg-surface-variant/40 text-on-surface-variant'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lead Value */}
                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="lead-value">Deal Value ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 font-body-md">$</span>
                    <input
                      className="w-full pl-8 pr-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      id="lead-value"
                      type="number"
                      placeholder="0"
                      min="0"
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="lead-notes">Internal Notes & Description</label>
                <textarea
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none h-28"
                  id="lead-notes"
                  placeholder="Record discussions, deal size details, key decision makers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <footer className="pt-4 border-t border-outline-variant/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 border border-border-subtle rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant/40 active:scale-95 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 active:scale-95 transition-all flex items-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Save Lead
                </button>
              </footer>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadFormModal;

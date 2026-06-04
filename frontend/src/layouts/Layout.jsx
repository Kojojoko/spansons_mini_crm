import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ onSearchChange, searchValue }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNewLeadClick = () => {
    navigate('?modal=new');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md relative">
      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-surface-glass border-r border-outline-variant shadow-sm z-50 flex flex-col p-4 gap-element-gap transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mb-8 px-2 flex justify-between items-center">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">SPANDSONS</h1>
            <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60">MINI CRM</p>
          </div>
          {/* Mobile close button */}
          <button 
            className="lg:hidden p-1 text-on-surface-variant hover:bg-surface-variant rounded-full"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-grow space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg active:scale-95 ${
              isActive('/dashboard')
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </Link>
          
          <Link
            to="/leads"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg active:scale-95 ${
              isActive('/leads')
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
          >
            <span className="material-symbols-outlined">person_search</span>
            <span className="font-body-md text-body-md">Leads</span>
          </Link>
        </nav>

        <button 
          onClick={handleNewLeadClick}
          className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/95 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          New Lead
        </button>

        <div className="mt-auto border-t border-outline-variant pt-4">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 transition-all rounded-lg active:scale-95 text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md text-body-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-surface-glass border-b border-outline-variant shadow-sm z-40 flex justify-between items-center px-4 md:px-edge-margin backdrop-blur-xl">
          <div className="flex items-center gap-3 flex-grow max-w-md">
            {/* Mobile menu trigger */}
            <button 
              className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-variant rounded-full"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input
                className="bg-transparent border-none p-0 focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant/50"
                placeholder="Search leads, companies, or emails..."
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-4">
            <div className="flex items-center gap-4">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-label-md text-label-md font-bold text-on-surface leading-tight">
                  {user?.name || 'Alex Sterling'}
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
                  Sales Manager
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary/10 flex items-center justify-center font-bold text-primary font-headline-md shadow-sm">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'AS'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="pt-24 pb-12 px-4 md:px-edge-margin space-y-8 max-w-container-max w-full mx-auto flex-grow">
          <Outlet />
        </main>
      </div>

      {/* Ambient background decoration */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 left-64 -z-10 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
};

export default Layout;

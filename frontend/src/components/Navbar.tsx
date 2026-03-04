import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-card-gradient border-b border-navy-700/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Left — Logo + Title */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 border border-cyan-400/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.93l-.71-.71" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight leading-none">ColdChain</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest">Monitor</p>
          </div>
        </Link>

        {/* Center — Search */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search units, sensors..."
              className="w-full bg-navy-800 border border-navy-700/50 rounded-lg pl-10 pr-4 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
            />
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Add button */}
          <button className="flex items-center gap-1.5 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20 text-cyan-400 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Unit
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full bg-navy-700 border border-navy-600 hover:border-cyan-400/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-navy-800 border border-navy-700/50 rounded-lg shadow-card overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-navy-700/40">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-gray-500 mt-0.5">admin@coldchain.com</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {/* Settings */}
                  <button className="w-full px-4 py-2 flex items-center gap-3 text-sm text-gray-300 hover:bg-navy-700/50 transition-colors">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>

                  {/* Theme toggle */}
                  <button className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-300 hover:bg-navy-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                      Dark Mode
                    </div>
                    <div className="w-9 h-5 bg-cyan-400/20 rounded-full relative flex-shrink-0 border border-cyan-400/30">
                      <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-navy-700/40">
                  <button className="w-full px-4 py-2 flex items-center gap-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}

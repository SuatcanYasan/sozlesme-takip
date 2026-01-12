import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-xs md:text-sm text-gray-600 gap-2">
          <div>
            <p>© 2026 Sözleşme Yönetim Sistemi</p>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <span className="text-center">Firebase & React ile güçlendirilmiştir</span>
            <span className="text-gray-400 hidden md:inline">•</span>
            <a href="mailto:suatcanysn@gmail.com" className="text-blue-600 hover:text-blue-800 transition">
              İletişim
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


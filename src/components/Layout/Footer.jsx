import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <p>© 2026 Sözleşme Yönetim Sistemi</p>
          </div>
          <div className="flex items-center space-x-4">
            <span>Firebase & React ile güçlendirilmiştir</span>
            <span className="text-gray-400">•</span>
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


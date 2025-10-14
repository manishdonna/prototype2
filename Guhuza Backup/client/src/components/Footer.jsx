// client/src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">About Guhuza</h3>
            <p className="text-gray-300 text-sm">
              AI-powered staffing platform connecting employers with qualified candidates through real-time matching technology.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.guhuza.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
                  Main Website
                </a>
              </li>
              <li>
                <a href="https://linktr.ee/guhuza" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
                  Social Media
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ AI Job Description Analysis</li>
              <li>✓ Smart Builder</li>
              <li>✓ Quality Scoring</li>
              <li>✓ Real-time Suggestions</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>© 2025 Guhuza. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
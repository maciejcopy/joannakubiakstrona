import React from 'react';
import { Phone, Mail, Facebook, Instagram } from 'lucide-react';

const TopBar: React.FC = () => {
  return (
    <div className="bg-warm-beige py-2 text-sm hidden md:block">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Kontakt */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-light-green" />
              <span className="text-gray-600">+48 729 933 833</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-light-green" />
              <span className="text-gray-600">kontakt@joannakubiakpsycholog.pl</span>
            </div>
          </div>

          {/* Social media i ikony */}
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <a
                href="https://www.facebook.com/profile.php?id=61584924865771"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-dark-green rounded-full flex items-center justify-center hover:bg-light-green transition-colors cursor-pointer"
              >
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://www.instagram.com/joannakubiak_psycholog/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-dark-green rounded-full flex items-center justify-center hover:bg-light-green transition-colors cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

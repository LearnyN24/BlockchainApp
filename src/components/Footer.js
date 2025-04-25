import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedinIn,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone, faHospital, faUserPlus, faSignInAlt } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Developer Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 text-teal-500">Developer Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faEnvelope} className="text-teal-500" />
                <a href="mailto:passablemaremudze2001@gmail.com" 
                   className="hover:text-teal-500 transition-colors">
                  passablemaremudze2001@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faPhone} className="text-teal-500" />
                <a href="tel:+263786927492" 
                   className="hover:text-teal-500 transition-colors">
                  +263786927492
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faHospital} className="text-teal-500" />
                <span className="hover:text-teal-500 transition-colors">
                  686 Medium Density Chipinge, Zimbabwe
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 text-teal-500">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="flex items-center space-x-2 hover:text-teal-500 transition-colors">
                  <FontAwesomeIcon icon={faHospital} className="text-teal-500" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/AboutPage" className="flex items-center space-x-2 hover:text-teal-500 transition-colors">
                  <FontAwesomeIcon icon={faHospital} className="text-teal-500" />
                  <span>About Project</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="flex items-center space-x-2 hover:text-teal-500 transition-colors">
                  <FontAwesomeIcon icon={faUserPlus} className="text-teal-500" />
                  <span>Register</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="flex items-center space-x-2 hover:text-teal-500 transition-colors">
                  <FontAwesomeIcon icon={faSignInAlt} className="text-teal-500" />
                  <span>Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Social Links */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4 text-teal-500">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/faraichikochi" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="hover:text-teal-500 transition-colors text-2xl">
                <FontAwesomeIcon icon={faGithub} />
              </a>
              <a href="https://linkedin.com/in/faraichikochi" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="hover:text-teal-500 transition-colors text-2xl">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a href="https://twitter.com/faraichikochi" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="hover:text-teal-500 transition-colors text-2xl">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-black py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Blockchain Health System. Developed by{" "}
            <span className="text-teal-500">Farai Chikochi</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

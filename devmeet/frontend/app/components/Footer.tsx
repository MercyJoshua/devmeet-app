import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaYoutube, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="text-white py-12 w-full bg-transparent mt-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Logo and Newsletter Subscription */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">DevMeet</h2>
          <p className="mb-2">Subscribe to our developer newsletter</p>
          <p className="mb-6 text-gray-400">Get tips, technical guides, and best practices. Twice a month. Right in your inbox.</p>
          <form className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="email"
              placeholder="you@company.com"
              className="bg-white text-gray-900 py-2 px-4 rounded-l-md focus:outline-none"
            />
            <button className="bg-purple-600 text-white px-6 py-2 font-medium rounded-md hover:bg-purple-700 transition">
              Subscribe
            </button>
          </form>
        </div>

        {/* Key Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Features</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-400 hover:text-white">Team Collaboration</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Project Management</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Code Editor</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Video Conferencing</Link></li>
          </ul>
        </div>

        {/* Learn More */}
        <div>
          <h3 className="text-lg font-bold mb-4">Learn More</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-400 hover:text-white">Documentation</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">API Reference</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Support</Link></li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-gray-400 hover:text-white">About Us</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Careers</Link></li>
            <li><Link href="#" className="text-gray-400 hover:text-white">Contact</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 m-4 border-t border-gray-700 pt-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Footer Left */}
          <div className="text-gray-400 text-sm">
            <p>© 2025 DevMeet, Inc. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link href="#" className="hover:text-white">Terms</Link>
              <Link href="#" className="hover:text-white">Privacy</Link>
              <Link href="#" className="hover:text-white">Sitemap</Link>
            </div>
          </div>
          {/* Social Icons */}
          <div className="flex space-x-6 text-gray-400">
            <Link href="#" className="hover:text-white"><FaTwitter size={20} /></Link>
            <Link href="#" className="hover:text-white"><FaLinkedin size={20} /></Link>
            <Link href="#" className="hover:text-white"><FaYoutube size={20} /></Link>
            <Link href="#" className="hover:text-white"><FaInstagram size={20} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
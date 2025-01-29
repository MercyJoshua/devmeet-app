"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-transparent text-white p-4">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image
            src="/assets/images/Devmeet.png" 
            alt="DevMeet Logo"
            width={80} 
            height={50} 
            
          />
        </div>

        {/* Hamburger Icon for mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-emerald-400 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
              ></path>
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={`hidden md:flex space-x-6 items-center ${isMenuOpen ? 'block' : 'hidden'}`}>
          <Link href="/" className="text-purple-500 hover:text-stone-300">
            Home
          </Link>

          {/* Features Dropdown */}
          <div className="relative group">
            <Link href="#" className="text-purple-500 hover:text-stone-300">
              Features
            </Link>
            <div className="absolute hidden group-hover:block bg-white shadow-lg mt-2 rounded-lg w-40">
              <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Code Editor
              </Link>
              <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Video Conferencing
              </Link>
              <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Team Communication
              </Link>
            </div>
          </div>

          <Link href="/about" className="text-purple-500 hover:text-stone-300">
            About
          </Link>

          <Link href="/auth/SignIn" className="text-purple-500 hover:text-stone-300">
            Sign In
          </Link>

          <Link href="/auth/SignUpForm" className="text-purple-500 border border-emerald-400 px-2 py-1 rounded hover:text-stone-300">
            Sign Up
          </Link>
        </nav>
      </div>

      {/* Mobile Navigation Links */}
      {isMenuOpen && (
        <nav className="md:hidden bg-gray-900 p-4 space-y-2">
          <Link href="/" className="text-purple-500 hover:text-stone-300">
            Home
          </Link>

          <div className="relative group">
            <Link href="#" className="block text-purple-500 hover:text-stone-300">
              Features
            </Link>
            <div className="bg-white shadow-lg mt-2 rounded-lg w-full">
              <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Code Editor
              </Link>
              <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Video Conferencing
              </Link>
              <Link href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Team Communication
              </Link>
            </div>
          </div>

          <Link href="/about" className="block text-purple-500 hover:text-stone-300">
            About
          </Link>

          <Link href="/auth/SignIn" className="block text-purple-500 hover:text-stone-300">
            Sign In
          </Link>

          <Link href="/auth/Sign UpForm" className="block text-purple-500 border border-emerald-400 px-2 py-1 rounded hover:text-stone-300">
            Sign Up
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
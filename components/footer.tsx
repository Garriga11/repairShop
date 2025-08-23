import React from 'react';
import Link from 'next/link';
import Image from "next/image";
import logo from "@/public/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
        <Image className="h-16 w-16 mb-3" src={logo} alt="logo" />
        <nav className="mb-4 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/dashboard/admin" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <Link href="/ticket" className="hover:text-blue-600 transition-colors">Tickets</Link>
          <Link href="/inventory" className="hover:text-blue-600 transition-colors">Inventory</Link>
          <Link href="/revenue" className="hover:text-blue-600 transition-colors">Revenue</Link>
        </nav>
        <p className="text-xs text-gray-400">© 2025 G19 PROGRAMS. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
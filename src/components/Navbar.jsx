import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Navbar = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        scrollY > 10 ? 'shadow-md' : ''
      }`}
    >
      <nav className="max-w-screen-xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-semibold text-gray-800">SpanTeq</span>
          </Link>

          <ul className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Features', id: 'features' },
              { label: 'About Us', id: 'about' },
              { label: 'Contact', id: 'contact' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className="hover:text-indigo-600 transition"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: CTA Button */}
        <Link
          to="/login"
          className="hidden md:inline-block bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Ready to Get Started?
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Image Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        {/* Background Image */}
        <img
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
          alt="Background"
          className="w-full h-[600px] object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-indigo-900 bg-opacity-60"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 z-10">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2 }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            Welcome to <span className="text-white">SpanTeq</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-lg sm:text-xl text-indigo-100 mb-6"
          >
            A Simple, Smart Way to Manage Your Consulting Team
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="max-w-3xl text-sm sm:text-base text-indigo-100 mb-8 leading-relaxed"
          >
            SpanTeq isn’t for job seekers. It’s for the people behind the scenes —
            the recruiters, consultants, and admins who keep everything running.
            If you’re juggling timesheets, submissions, PTO requests, and invoices —
            SpanTeq keeps it all in one place. No messy spreadsheets. No chasing people.
            Just clean workflows and total visibility.
          </motion.p>

          <motion.a
            href="#get-started"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.7 }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold transition"
          >
            Ready to Get Started?
          </motion.a>
        </div>
      </div>
    </section>
  );
};

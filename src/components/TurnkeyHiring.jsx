import { motion } from 'framer-motion';
import { FaRegClock, FaUserPlus, FaFileInvoice } from 'react-icons/fa';

const features = [
  {
    icon: <FaRegClock className="text-indigo-600 text-4xl" />,
    title: 'Consultant Hours',
    desc: 'A consultant logs their hours — ✅',
  },
  {
    icon: <FaUserPlus className="text-indigo-600 text-4xl" />,
    title: 'Profile Submissions',
    desc: 'A recruiter submits a profile — ✅',
  },
  {
    icon: <FaFileInvoice className="text-indigo-600 text-4xl" />,
    title: 'Financial Visibility',
    desc: 'An admin sees revenue and pay details — ✅',
  },
];

const HiringModule = () => {
  return (
    <section className="px-6 lg:px-16 py-20 bg-white">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Side - Title & Text */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            <span role="img" aria-label="lightbulb">💡</span> What Does <span className="text-black">SpanTeq</span> <span className="text-indigo-600">Actually Do?</span>
          </h2>
          <p className="text-gray-400 text-lg">
            We help your team work better — together.
          </p>
        </motion.div>

        {/* Right Side - Image */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <img
            src="https://images.unsplash.com/photo-1590650046871-92c887180603"
            alt="Team working"
            className="rounded-xl shadow-lg w-full"
          />
        </motion.div>
      </div>

      {/* Feature Cards */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((feat, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border shadow-sm px-6 py-8 flex flex-col items-center text-center"
          >
            <div className="mb-4">{feat.icon}</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              {feat.title}
            </h4>
            <p className="text-sm text-gray-600">{feat.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 mt-8 max-w-xl mx-auto">
        Everyone knows what’s going on. Everything’s tracked. Nothing slips through the cracks.
      </p>
    </section>
  );
};

export default HiringModule;

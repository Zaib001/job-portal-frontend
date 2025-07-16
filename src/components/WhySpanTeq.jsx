import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { HiLockClosed } from 'react-icons/hi';
import { PiPlantDuotone } from 'react-icons/pi';

const whySpanTeq = [
  'Built just for consulting and staffing teams',
  'Clean, easy-to-use dashboards',
  'Role-based access for security',
  'Everything synced and stored in the cloud',
];

const whyLoveIt = [
  'Less back-and-forth',
  'Fewer manual errors',
  'Everything in one place',
  'More time for actual work',
];

const WhySpanTeq = () => {
  return (
    <section className="px-6 lg:px-16 py-16 bg-white space-y-12">
      {/* Section 1 */}
      <motion.div
        className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl p-8 grid grid-cols-1 md:grid-cols-2 items-center gap-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <HiLockClosed className="text-yellow-500 text-xl" />
            What Makes SpanTeq Different?
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            You don’t need 5 different tools. You just need SpanTeq.
          </p>
          <ul className="space-y-2">
            {whySpanTeq.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <FaCheckCircle className="text-indigo-600 mt-1" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/7447/7447709.png"
            alt="Cloud security"
            className="rounded-xl h-[50vh] w-full object-cover object-center"
          />
        </div>
      </motion.div>

      {/* Section 2 */}
      <motion.div
        className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl p-8 grid grid-cols-1 md:grid-cols-2 items-center gap-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <div>
          <img
            src="https://images.pexels.com/photos/4065625/pexels-photo-4065625.jpeg?auto=compress&dpr=2&h=500"
            alt="Happy customer"
            className="rounded-xl h-[50vh] w-full object-cover object-center"
          />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <PiPlantDuotone className="text-green-600 text-xl" />
            Why You’ll Love It
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Whether you’re managing 3 consultants or 30, SpanTeq scales with you.
          </p>
          <ul className="space-y-2">
            {whyLoveIt.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <FaCheckCircle className="text-indigo-600 mt-1" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
};

export default WhySpanTeq;

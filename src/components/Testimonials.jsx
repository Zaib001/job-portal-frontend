import { motion } from 'framer-motion';
import { FaUserTie, FaHandshake, FaUserCog } from 'react-icons/fa';

const roles = [
  {
    Icon: FaUserTie,
    title: 'Consultants',
    image: 'https://images.pexels.com/photos/3184326/pexels-photo-3184326.jpeg?auto=compress&dpr=2&h=100',
    items: [
      'Track your work hours',
      'Request time off',
      'See where your resume was submitted',
      'Chat with your recruiter',
    ],
  },
  {
    Icon: FaHandshake,
    title: 'Recruiters',
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&dpr=2&h=100',
    items: [
      'Keep track of your candidates',
      'Submit profiles to clients',
      'Manage timesheets and PTO in one spot',
    ],
  },
  {
    Icon: FaUserCog,
    title: 'Admins',
    image: 'https://images.pexels.com/photos/3184463/pexels-photo-3184463.jpeg?auto=compress&dpr=2&h=100',
    items: [
      'See how much was paid out',
      'Track invoices and revenue',
      'View profit across the team or per project',
    ],
  },
];

const Testimonials = () => {
  return (
    <section className="bg-white px-6 lg:px-16 py-20">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 flex justify-center items-center gap-2">
          <FaUserTie className="text-indigo-600 text-2xl" />
          Who It’s For
        </h2>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        {roles.map((role, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition"
          >
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <img
                src={role.image}
                alt={role.title}
                className="rounded-full w-16 h-16 object-cover border-2 border-indigo-600"
              />
            </div>

            {/* Title with Icon */}
            <h3 className="text-md font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <role.Icon className="text-indigo-600 text-xl" /> {role.title}
            </h3>

            {/* Items */}
            <ul className="text-sm text-gray-600 space-y-1">
              {role.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;

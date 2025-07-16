import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="relative bg-indigo-900 text-white py-16 mt-16 overflow-hidden">
      {/* Background Blur Shape */}
      <div
        className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-500 opacity-30 rounded-full blur-3xl"
        style={{ zIndex: 0 }}
      ></div>
      <div
        className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-500 opacity-30 rounded-full blur-3xl"
        style={{ zIndex: 0 }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
          Ready to connect with top recruiters?
        </h2>
        <p className="mt-3 text-lg text-indigo-100">
          Find pre-vetted professionals and fill roles faster with AI-powered matching.
        </p>
        <div className="mt-6">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow hover:bg-gray-100 transition"
          >
            Join Now
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;

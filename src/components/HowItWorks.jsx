import React from "react";
import { motion } from "framer-motion";

const benefits = [
  {
    topic: "Single Contract",
    platform: "CBREX facilitates single contracts for hiring through various vendors",
    traditional: "The hassle of signing multiple contracts with recruiting agencies",
  },
  {
    topic: "Communication",
    platform: "Centralized agency communication through Ctalk, making collaboration easy, quick, and effective",
    traditional: "Collaboration with agencies is fragmented across multiple channels, such as email, phone, chat",
  },
  {
    topic: "Agency Empanelment",
    platform: "No hassle of agency empanelment. Leverage the marketplace vendors or route new vendor requests through the platform",
    traditional: "Handling and processing multiple vendor empanelment requests can be cumbersome",
  },
  {
    topic: "Screened Talent",
    platform: "Get access to top-notch talent, meticulously vetted through three levels of screening on the CBREX platform",
    traditional: "Huge inflow of unfiltered and low-quality resumes",
  },
  {
    topic: "Digital Invoicing",
    platform: "Embrace the future with complete digital invoicing to streamline digital talent sourcing",
    traditional: "Manual invoice processing is a thing of the past",
  },
  {
    topic: "Time",
    platform: "Automated recruitment workflows boost recruiter productivity, saving considerable time",
    traditional: "Valuable time spent on repetitive tasks, such as sending follow-up emails and scheduling interviews",
  },
];

// Animation variants
const rowVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8 },
  }),
};

const HowItWorks = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-16 py-16 bg-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
        Benefits of Hiring on CBREX Recruitment Platform
      </h2>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 text-gray-900 text-base">
          <div className="font-semibold px-4 py-3 border-b md:border-none">Topic</div>
          <div className="font-semibold px-4 py-3 text-center bg-orange-50 rounded-t-md border border-gray-200">
            CBREX Recruitment Platform
          </div>
          <div className="font-semibold px-4 py-3 text-left md:text-right">
            Traditional Hiring Methods
            <br />
            <span className="text-sm font-normal text-gray-500">
              (RPO, Independent recruiting agencies, etc)
            </span>
          </div>

          {benefits.map((item, index) => (
            <motion.div
              key={index}
              className="contents"
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={rowVariants}
            >
              <div className="border-t border-gray-200 px-4 py-6 font-medium text-gray-700">
                {item.topic}
              </div>

              <div className="border-t border-l border-r border-gray-200 px-6 py-4 bg-orange-50 text-orange-800 leading-relaxed text-sm">
                {item.platform}
              </div>

              <div className="border-t border-gray-200 px-4 py-4 text-gray-800 leading-relaxed text-sm md:text-right">
                {item.traditional}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

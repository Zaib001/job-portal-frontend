import { motion } from "framer-motion";
import JobCard from "./JobCard";
import logo from "../assets/logo.svg";
import logo1 from "../assets/logo1.svg";
import logo2 from "../assets/logo2.svg";

const jobs = [
  {
    title: "Senior UX Designer",
    type: "Contract",
    location: "New York, USA",
    logo: logo,
  },
  {
    title: "Digital Marketer",
    type: "Full Time",
    location: "New York, USA",
    logo: logo1,
  },
  {
    title: "Junior JS Developer",
    type: "Full Time",
    location: "Remote",
    logo: logo2,
  },
  {
    title: "Senior Software Developer",
    type: "Full Time",
    location: "New York, USA",
    logo: logo,
  },
  {
    title: "Product Designer",
    type: "Full Time",
    location: "Remote",
    logo: logo2,
  },
  {
    title: "Full-Stack Developer",
    type: "Full Time",
    location: "Texas, USA",
    logo: logo1,
  },
];

// Animation variants
const animationVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.15,
    },
  }),
};

const FeaturedJobs = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Jobs</h2>
      <p className="text-gray-500 mb-8 max-w-xl mx-auto">
        Discover exciting opportunities posted by top companies. Get hired fast through smart matching.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {jobs.map((job, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={animationVariants}
          >
            <JobCard {...job} />
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <a href="/jobs" className="text-indigo-600 font-medium hover:underline text-sm">
          See all 8,849 jobs →
        </a>
      </div>
    </section>
  );
};

export default FeaturedJobs;

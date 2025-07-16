import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import { Hero } from "../components/Hero";
import FeaturedJobs from "../components/FeaturedJobs";
import Footer from "../components/Footer";
import CTA from "../components/CTA";
import { motion } from "framer-motion";
import HiringModule from "../components/TurnkeyHiring";
import WhySpanTeq from "../components/WhySpanTeq";

const sectionVariants = {
  hiddenLeft: { opacity: 0, x: -50 },
  hiddenRight: { opacity: 0, x: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.2,
    },
  }),
};

const Home = () => {
  const jobs = [
    { title: "Frontend Developer", company: "HireUp", location: "Remote" },
    { title: "Recruitment Manager", company: "TalentBridge", location: "London" },
    { title: "UI/UX Designer", company: "DesignCrew", location: "Berlin" },
  ];

  return (
    <>
      <div className="overflow-x-hidden">
        <Navbar />

        <div id="hero">
          <Hero />
        </div>

       

        {/* <motion.div
          initial="hiddenRight"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div id="featured">
            <FeaturedJobs animationVariants={sectionVariants} />
          </div>
        </motion.div> */}
{/* 
        <motion.div
          initial="hiddenLeft"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div id="how-it-works">
            <HowItWorks />
          </div>
        </motion.div> */}
        
          <div id="features">
            <HiringModule />
          </div>
       

        <motion.div
          initial="hiddenRight"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{}}
        >
          <div id="about">
            <Testimonials animationVariants={sectionVariants} />
          </div>
        </motion.div>
        <motion.div
          initial="hiddenRight"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{}}
        >
          <div id="contact">
            <WhySpanTeq animationVariants={sectionVariants} />
          </div>
        </motion.div>

        <motion.div
          initial="hiddenLeft"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div id="cta">
            <CTA />
          </div>
        </motion.div>

        <div id="footer">
          <Footer />
        </div>

      </div>
    </>
  );
};

export default Home;

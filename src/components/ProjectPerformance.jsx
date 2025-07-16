import { motion } from "framer-motion";

const consultants = [
  { name: "Alice Johnson", project: "Project X", revenue: "$85,000" },
  { name: "Bob Williams", project: "Project Y", revenue: "$110,000" },
  { name: "Charlie Brown", project: "Project Z", revenue: "$62,000" },
  { name: "Diana Miller", project: "Project X", revenue: "$98,000" },
  { name: "Eve Davis", project: "Project A", revenue: "$75,000" },
  { name: "Frank White", project: "Project B", revenue: "$130,000" },
  { name: "Grace Taylor", project: "Project C", revenue: "$55,000" },
  { name: "Henry Green", project: "Project D", revenue: "$90,000" },
];

const partnerLogos = [
  "https://cdn-icons-png.flaticon.com/512/5968/5968705.png", // Slack
  "https://cdn-icons-png.flaticon.com/512/888/888879.png",    // Dropbox
  "https://cdn-icons-png.flaticon.com/512/733/733585.png",    // GitHub
  "https://cdn-icons-png.flaticon.com/512/732/732221.png",    // Figma
  "https://cdn-icons-png.flaticon.com/512/733/733609.png",    // Google Drive
  "https://cdn-icons-png.flaticon.com/512/270/270798.png",    // Google Analytics
  "https://cdn-icons-png.flaticon.com/512/5968/5968672.png",  // Zoom
  "https://cdn-icons-png.flaticon.com/512/1048/1048953.png"   // Adobe
];


const ProjectPerformance = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
      {/* Consultant Project Table */}
      <motion.div
        className="lg:col-span-2 bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Consultant Project Performance
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Overview of consultant project performance.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase border-b">
              <tr>
                <th className="py-2 pr-6">Consultant</th>
                <th className="py-2 pr-6">Project</th>
                <th className="py-2">Revenue</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-100">
              {consultants.map((c, i) => (
                <tr key={i}>
                  <td className="py-3 pr-6 font-medium">{c.name}</td>
                  <td className="py-3 pr-6">{c.project}</td>
                  <td className="py-3">{c.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Partner Logos */}
      <motion.div
        className="bg-white rounded-xl shadow-md p-6 "
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Our Partners</h3>
        <p className="text-sm text-gray-500 mb-4">
          Trusted by leading organizations.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 items-center">
          {partnerLogos.map((logo, i) => (
            <img
              key={i}
              src={logo}
              alt={`Partner ${i + 1}`}
              className="h-10 w-10 object-contain mx-auto"
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ProjectPerformance;

export default function AboutUs() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Section 1 */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Text */}
        <div className="space-y-6">
          <p className="text-sm font-semibold text-blue-500">Our Story</p>
          <h2 className="text-3xl md:text-7xl font-bold">
            Fostering a Community of Lifelong Learners
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Education University started with a vision to make learning
            accessible, engaging, and collaborative. We believe that education
            is a journey, not a destination. Our platform provides a space for
            students and educators to create, share, and take assessments,
            helping to solidify knowledge and uncover new areas of learning. We
            are more than just a platform; we are a community dedicated to
            growth and the pursuit of knowledge.
          </p>
        </div>

        <div className="space-y-6">
          <img
            src="/src/assets/AboutUs.jpg"
            alt="Working"
            className="rounded-2xl shadow-lg w-full h-90 object-cover  "
          />
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 shadow">
              <h3 className="text-2xl font-bold text-blue-500">8+</h3>
              <p className="text-sm">Years of Experience</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 shadow">
              <h3 className="text-2xl font-bold text-blue-500">10K+</h3>
              <p className="text-sm">Assessments</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 shadow">
              <h3 className="text-2xl font-bold text-blue-500">30K+</h3>
              <p className="text-sm">Positive Reviews</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 shadow">
              <h3 className="text-2xl font-bold text-blue-500">100K+</h3>
              <p className="text-sm">Trusted Learners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Vision & Mission */}
      <section className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-blue-500">Our Vision</p>
            <h3 className="text-2xl font-bold">
              Knowledge Sharing for a Brighter Future
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              To be the leading platform for educational assessment and
              collaborative learning, fostering a global community where
              knowledge is accessible to all. We aim to empower a new generation
              of learners who are curious, skilled, and prepared for the
              challenges of tomorrow.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-blue-500">Our Mission</p>
            <h3 className="text-2xl font-bold">
              Accessible Learning Through Interaction
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our mission is to provide an intuitive and powerful platform for
              creating, attempting, and analyzing assessments. We are committed
              to helping individuals and institutions benchmark skills, track
              learning progress, and cultivate a culture of continuous
              improvement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

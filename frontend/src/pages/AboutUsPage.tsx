import React from "react";

export default function AboutUs() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      {/* Section 1 */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Text */}
        <div className="space-y-6">
          <p className="text-sm font-semibold text-blue-500">How It Started</p>
          <h2 className="text-3xl md:text-7xl font-bold">
            Our Dream is Global Learning Transformation
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Kaasth was founded by Robert Anderson, a passionate lifelong
            learner, and Maria Sanchez, an visionary educator. Their shared
            dream was to create a digital haven of knowledge accessible to all.
            United by their belief in the transformational power of education,
            they embarked on a journey to build Kaasth. With relentless
            dedication, they gathered a team of experts and launched this
            innovative platform, creating a global community of eager learners,
            all connected by the desire to explore, learn, and grow.
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
              <h3 className="text-2xl font-bold text-blue-500">8.5</h3>
              <p className="text-sm">Years Experience</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 shadow">
              <h3 className="text-2xl font-bold text-blue-500">10K</h3>
              <p className="text-sm">Quizzes</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 shadow">
              <h3 className="text-2xl font-bold text-blue-500">30K</h3>
              <p className="text-sm">Positive Reviews</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 shadow">
              <h3 className="text-2xl font-bold text-blue-500">100K</h3>
              <p className="text-sm">Trusted Students</p>
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
              Empowering Lives Through Education
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our unwavering vision is to empower lives through accessible,
              high-quality education. By fostering a global community of
              lifelong learners, we aim to inspire personal growth, drive
              innovation, and shape a brighter future for all.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-blue-500">Our Mission</p>
            <h3 className="text-2xl font-bold">Learning for All, Everywhere</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our mission is to make learning accessible to everyone,
              everywhere. We strive to build a global community of lifelong
              learners, enabling personal growth, driving innovation, and
              shaping the world with knowledge.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

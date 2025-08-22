import { Link } from "react-router-dom";

function UnAuthHomePage() {
  return (
    <div className="min-h-screen flex flex-col text-gray-900 dark:bg-gray-900 dark:text-gray-100 transtion-colors bg-gray-50">
      {/* Hero */}
      <section
        className="relative w-full h-[85vh] flex items-center justify-center text-center px-6 bg-cover bg-center "
        style={{ backgroundImage: "url('src/assets/hero-image.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 bg-opacity-40" />
        {/* Content */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight ">
            Learn Smarter, One Quiz at a Time!
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200 ">
            Attemp quizzes to test your knowledge and grow with others.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow shadow-md"
            >
              Login
            </Link>
            <Link
              to="/about"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow shadow-md"
            >
              About us
            </Link>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 px-6 text-center bg-white dark:bg-gray-800">
        <h2 className="text-3xl font-bold mb-8">Our Achievements</h2>
        <div className="flex flex-col md:flex-row justify-center gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="text-4xl font-bold text-blue-600">10K+</h3>
            <p className="text-gray-700 dark:text-gray-300">Quizzes Created</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-600">100K+</h3>
            <p className="text-gray-700 dark:text-gray-300">Learners Joined</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-blue-600">5K+</h3>
            <p className="text-gray-700 dark:text-gray-300">Community Reviews</p>
          </div>
        </div>
      </section>

      {/* Online Learning Expertise Section */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Left Image */}
          <div className="flex-1 flex justify-center">
            <img
              src="src/assets/learning.jpg"
              alt="Learning Expertise"
              className=" max-w-2xl"
            />
          </div>
          {/* Right Content */}
          <div className="flex-1 text-left">
            <h4 className="text-blue-600 font-semibold uppercase tracking-wide mb-2">
              Learn Anything
            </h4>
            <h2 className="text-3xl font-bold mb-6">
              Benefits About Online Learning Expertise
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-0">
                <h3 className="text-lg font-semibold mb-1">Online Courses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Access a wide range of interactive and engaging online courses.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-0">
                <h3 className="text-lg font-semibold mb-1">Earn Certificates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Showcase your achievements with recognized certificates.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-0">
                <h3 className="text-lg font-semibold mb-1">Learn with Experts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Gain knowledge directly from experienced instructors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center bg-blue-600 text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Ready to get started?
        </h2>
        <p className="mb-6 text-lg max-w-xl mx-auto text-lg">
          Join a growing community of learners and start youre journey today.
        </p>
        <Link
          to="/register"
          className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg shadow shadow-md"
        >
          Sign up free
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white dark:bg-gray-900 text-black dark:text-gray-400 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} All rights reserved</p>
        <div className="mt-3 flex justify-center gap-6 text-sm">
          <Link to="#" className="dark:hover:text-white hover:text-blue-500 text-sm">
            Privacy policy
          </Link>
          <Link to="#" className="dark:hover:text-white hover:text-blue-500 text-sm">
            Terms
          </Link>
          <Link to="/about" className="dark:hover:text-white hover:text-blue-500 text-sm">
            About Us
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default UnAuthHomePage;

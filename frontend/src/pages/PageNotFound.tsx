import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4">
      <h1 className="text-9xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
      >
        Go Home
      </Link>
    </div>
  );
}

export default PageNotFound;

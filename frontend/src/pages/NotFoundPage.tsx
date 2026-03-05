import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-300">404</h1>
      <p className="text-xl text-gray-500 dark:text-gray-600">Page not found</p>
      <Link to="/" className="text-cyan-600 dark:text-blue-600 hover:underline">
        Go home
      </Link>
    </div>
  );
}

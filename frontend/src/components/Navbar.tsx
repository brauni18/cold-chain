import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-gray-900 hover:text-blue-600">
          MyApp
        </Link>
        <div className="flex gap-4 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-900">Home</Link>
        </div>
      </div>
    </nav>
  );
}

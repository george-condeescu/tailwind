import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';

import {
  Handshake,
  Home,
  Users,
  Settings,
  FileText,
  FileStack,
  Mail,
  ChevronRight,
  Layers,
  Search,
  Key,
  Landmark,
  Boxes,
  LayoutDashboard,
  Library,
} from 'lucide-react';

// Left Menu Component
export default function LeftMenu({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { user } = useAuth();

  // Fetch documents count for badge (example)
  const query = useQuery({
    queryKey: ['documentsCount', user?.id],
    queryFn: async () => {
      const response = await api.get(`/documents/user/${user.id}/inbox/count`);
      return response.data;
    },
    enabled: !!user?.id, // Only run if user.id is truthy
  });

  const documentsCount = query.data ?? 0;

  const menuItems = [
    {
      icon: Home,
      label: 'Inbox',
      active: true,
      href: '/inbox',
      admin: false,
    },

    {
      icon: FileText,
      label: 'Registru nou',
      active: false,
      href: '/addDocument',
      admin: false,
    },
    {
      icon: Boxes,
      label: 'Revizie nouă',
      active: false,
      href: '/revizie-document',
      admin: false,
    },

    {
      icon: Library,
      label: 'Registre proprii',
      active: false,
      href: '/lista-registre',
      admin: false,
    },

    {
      icon: Layers,
      label: 'Documente proprii',
      active: false,
      href: '/lista-documente',
      badge: documentsCount || 0,
      admin: false,
    },
    {
      icon: Search,
      label: 'Căutare documente',
      active: false,
      href: '/search',
      admin: false,
    },
    {
      icon: Key,
      label: 'Mapa de semnat',
      active: false,
      href: '/mapa',
      admin: false,
    },
    {
      icon: Mail,
      label: 'Rapoarte',
      active: false,
      href: '/rapoarte',
      admin: false,
    },

    {
      icon: Users,
      label: 'Utilizatori',
      active: false,
      href: '/admin/users',
      admin: true,
    },
    {
      icon: Landmark,
      label: 'Departamente',
      active: false,
      href: '/admin/departments',
      admin: true,
    },
    {
      icon: Handshake,
      label: 'Parteneri',
      active: false,
      href: '/admin/partners',
      admin: true,
    },
    {
      icon: LayoutDashboard,
      label: 'Toate registrele',
      active: false,
      href: '/admin/registers',
      admin: true,
    },
    {
      icon: FileStack,
      label: 'Toate documentele',
      active: false,
      href: '/admin/documents',
      admin: true,
    },
    {
      icon: Settings,
      label: 'Dashboard',
      active: false,
      href: '/admin/dashboard',
      admin: true,
    },
    {
      icon: FileStack,
      label: 'Golește Cache',
      active: false,
      href: '/admin/flush-cache',
      admin: true,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) =>
            user && user.is_admin === 1 ? (
              <Link
                key={index}
                to={item.href}
                className={`
                  flex items-center justify-between px-4 py-2 rounded-lg transition-all
                ${
                  item.active
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                {parseInt(item.badge, 10) > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.active && <ChevronRight size={18} />}
              </Link>
            ) : (
              !item.admin && (
                <Link
                  key={index}
                  to={item.href}
                  className={`
                    flex items-center justify-between px-4 py-2 rounded-lg transition-all
                  ${
                    item.active
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {parseInt(item.badge, 10) > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.active && <ChevronRight size={18} />}
                </Link>
              )
            ),
          )}
        </nav>

        <div className="p-2 border-t border-gray-200">
          <div className="bg-linear-to-r from-green-400 to-blue-500 p-4 rounded-lg">
            <p className="text-sm text-gray-700 font-semibold mb-2">
              Ai nevoie de ajutor?
            </p>
            <p className="text-xs text-gray-600 mb-3 rounded-3xl">
              Contactează echipa de suport
            </p>
            <button className="w-full bg-blue-600 text-white text-sm py-2 hover:bg-blue-700 transition-colors rounded-3xl">
              Contact Suport
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

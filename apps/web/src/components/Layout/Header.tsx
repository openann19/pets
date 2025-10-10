import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HeartIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  PlusIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  UserIcon as UserSolid,
  MapPinIcon as MapPinSolid,
} from '@heroicons/react/24/solid';
import ThemeToggle from '../ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    {
      name: 'Discover',
      path: '/swipe',
      iconSolid: HeartSolid,
    },
    {
      name: 'Map',
      path: '/map',
      icon: MapPinIcon,
      iconSolid: MapPinSolid,
    },
    {
      name: 'Matches',
      path: '/matches',
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatSolid,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserIcon,
      iconSolid: UserSolid,
    },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl">🐾</div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              PawfectMatch
            </span>
            {user?.premium.isActive && (
              <SparklesIcon className="w-5 h-5 text-yellow-500" />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = isActive(item.path) ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-pink-600 bg-pink-50'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Add Pet Button */}
            <Link
              href="/pets/new"
              className="flex items-center space-x-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Pet</span>
            </Link>

            {/* Premium Button */}
            {!user?.premium.isActive && (
              <Link
                href="/premium"
                className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Premium</span>
              </Link>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                <span className="hidden lg:inline">{user?.firstName}</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigationItems.map((item) => {
                const Icon = isActive(item.path) ? item.iconSolid : item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.path)
                        ? 'text-pink-600 bg-pink-50'
                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Actions */}
              <div className="pt-4 space-y-2">
                <Link
                  href="/pets/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-2 rounded-md text-base font-medium"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Pet</span>
                </Link>
                
                {!user?.premium.isActive && (
                  <Link
                    href="/premium"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-md text-base font-medium"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    <span>Upgrade to Premium</span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
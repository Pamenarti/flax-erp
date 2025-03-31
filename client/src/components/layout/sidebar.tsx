import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Module } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Package,
  User,
  Settings,
  Home,
  LogOut,
  HelpCircle,
  LayoutDashboard,
  LineChart,
  CreditCard,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  isMobileSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

export default function Sidebar({ isMobileSidebarOpen, onCloseSidebar }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  
  const { data: credits } = useQuery<{ credits: number }>({
    queryKey: ["/api/user/credits"],
  });
  
  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ["/api/user/modules"],
  });

  // Close sidebar when clicking a link on mobile
  const handleNavigation = (path: string) => {
    setLocation(path);
    if (window.innerWidth < 1024) {
      onCloseSidebar();
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Create sidebar class based on mobile state
  const sidebarClasses = `fixed inset-y-0 right-0 bg-white w-80 shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto lg:translate-x-0 ${
    isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
  }`;

  return (
    <div className={sidebarClasses}>
      <div className="h-full flex flex-col">
        {/* Mobile sidebar header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <span className="text-xl font-bold text-primary">Flax<span className="text-gray-800">-ERP</span></span>
          <button
            onClick={onCloseSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 py-6 overflow-y-auto">
          {/* User profile section */}
          <div className="px-4 mb-6">
            <div className="flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="text-base font-medium text-gray-800">{user?.username}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="ml-2 text-sm font-medium text-gray-700">{credits?.credits || 0} Credits</span>
              </div>
              <Button className="mt-2 w-full justify-center" size="sm">
                Add Credits
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-4 space-y-1">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                location === '/dashboard'
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className={`mr-3 h-5 w-5 ${
                location === '/dashboard' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              Dashboard
            </button>

            <button
              onClick={() => handleNavigation('/my-modules')}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                location === '/my-modules'
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className={`mr-3 h-5 w-5 ${
                location === '/my-modules' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              My Modules
            </button>

            <button
              onClick={() => handleNavigation('/modules')}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                location === '/modules'
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Package className={`mr-3 h-5 w-5 ${
                location === '/modules' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              Marketplace
            </button>

            <button
              onClick={() => handleNavigation('/reports')}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50`}
            >
              <LineChart className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Reports
            </button>

            <button
              onClick={() => handleNavigation('/support')}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50`}
            >
              <HelpCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Help & Support
            </button>
          </div>

          {modules.length > 0 && (
            <div className="px-4 mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                My Modules
              </h3>
              <div className="mt-1 space-y-1">
                {modules.map(module => (
                  <button
                    key={module.id}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <span className="truncate">{module.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
            Settings
          </button>
          <button 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="text-sm font-medium text-gray-500 hover:text-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

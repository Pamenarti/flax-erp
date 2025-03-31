import { useState } from "react";
import Sidebar from "./sidebar";
import { Link } from "wouter";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { data: credits } = useQuery<{ credits: number }>({
    queryKey: ["/api/user/credits"],
  });

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden w-full fixed top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href="/dashboard">
              <span className="text-xl font-bold text-primary cursor-pointer">Flax<span className="text-gray-800">-ERP</span></span>
            </Link>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:mr-80">
        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white shadow-sm w-full z-10">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/dashboard">
                    <span className="text-xl font-bold text-primary cursor-pointer">Flax<span className="text-gray-800">-ERP</span></span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <button type="button" className="relative inline-flex items-center p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  </button>
                </div>
                <div className="ml-3 relative">
                  <div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-700">{user?.username}</div>
                  <div className="text-xs text-gray-500">Credits: {credits?.credits || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 mt-16 lg:mt-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      <Sidebar 
        isMobileSidebarOpen={isMobileSidebarOpen} 
        onCloseSidebar={() => setIsMobileSidebarOpen(false)} 
      />
    </div>
  );
}

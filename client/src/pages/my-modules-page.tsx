import { useQuery } from "@tanstack/react-query";
import { Module } from "@shared/schema";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Package, Settings } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import ModuleList from "@/components/modules/module-list";

export default function MyModulesPage() {
  const { data: modules = [], isLoading } = useQuery<Module[]>({
    queryKey: ["/api/user/modules"],
  });

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Modules
            </h2>
            <p className="text-gray-500 mt-1">
              Manage your activated modules
            </p>
          </div>
          
          <Link href="/modules">
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Browse More Modules
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="bg-white overflow-hidden shadow rounded-lg h-24 animate-pulse"
              >
                <div className="h-full bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : modules.length > 0 ? (
          <ModuleList modules={modules} />
        ) : (
          <Card>
            <CardContent className="py-10 flex flex-col items-center justify-center">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <CardTitle className="text-xl mb-2">No Modules Activated</CardTitle>
              <CardDescription className="text-center max-w-md mb-6">
                You haven't activated any modules yet. Browse the marketplace to find and activate modules for your business needs.
              </CardDescription>
              <Link href="/modules">
                <Button>
                  Explore Modules
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

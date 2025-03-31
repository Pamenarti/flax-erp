import { useQuery, useMutation } from "@tanstack/react-query";
import { Module } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ModuleCard from "@/components/modules/module-card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ModulesPage() {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const { data: modules = [], isLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
  });
  
  const { data: userModules = [] } = useQuery<Module[]>({
    queryKey: ["/api/user/modules"],
  });
  
  const { data: userCredits } = useQuery<{ credits: number }>({
    queryKey: ["/api/user/credits"],
  });

  const activateModuleMutation = useMutation({
    mutationFn: async (moduleId: number) => {
      const res = await apiRequest("POST", `/api/modules/${moduleId}/activate`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      toast({
        title: "Module activated",
        description: "The module has been successfully activated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Activation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Extract unique categories from modules
  const categories = [...new Set(modules.map(module => module.category))];
  
  // Filter modules by category if filter is active
  const filteredModules = categoryFilter
    ? modules.filter(module => module.category === categoryFilter)
    : modules;

  // Check if a module is already activated
  const isModuleActivated = (moduleId: number) => {
    return userModules.some(module => module.id === moduleId);
  };

  const activateModule = (moduleId: number) => {
    activateModuleMutation.mutate(moduleId);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Module Marketplace
            </h2>
            <p className="text-gray-500 mt-1">
              Available Credits: <span className="font-semibold">{userCredits?.credits || 0}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1 text-sm rounded-full ${
                categoryFilter === null
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1 text-sm rounded-full ${
                  categoryFilter === category
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="bg-white overflow-hidden shadow rounded-lg h-64 animate-pulse"
              >
                <div className="h-full bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                isActivated={isModuleActivated(module.id)}
                userCredits={userCredits?.credits || 0}
                onActivate={() => activateModule(module.id)}
                isPending={activateModuleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

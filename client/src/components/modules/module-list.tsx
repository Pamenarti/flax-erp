import { Module } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  ClipboardList,
  CheckCircle,
  Calendar,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface ModuleListProps {
  modules: Module[];
}

// Map of module icons by category
const moduleIcons: Record<string, React.ReactNode> = {
  "Finance": <DollarSign className="h-5 w-5 text-primary" />,
  "Sales": <ShoppingBag className="h-5 w-5 text-secondary-500" />,
  "Operations": <Package className="h-5 w-5 text-green-500" />,
  "Human Resources": <Users className="h-5 w-5 text-red-500" />,
  "Projects": <ClipboardList className="h-5 w-5 text-yellow-500" />,
  "Quality": <CheckCircle className="h-5 w-5 text-indigo-500" />
};

// Map of background colors by category
const moduleBgColors: Record<string, string> = {
  "Finance": "bg-primary-100",
  "Sales": "bg-secondary-100",
  "Operations": "bg-green-100",
  "Human Resources": "bg-red-100",
  "Projects": "bg-yellow-100",
  "Quality": "bg-indigo-100"
};

export default function ModuleList({ modules }: ModuleListProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-200">
          {modules.map((module) => {
            // Get the appropriate icon and background color
            const icon = moduleIcons[module.category] || <Package className="h-5 w-5 text-primary" />;
            const bgColor = moduleBgColors[module.category] || "bg-primary-100";
            
            return (
              <li key={module.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${bgColor} rounded-md p-2`}>
                          {icon}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{module.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active
                        </Badge>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <div className="flex items-center mr-6">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>Activated on {module.category}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>Last used: Today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

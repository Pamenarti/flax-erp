import { Module } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  ClipboardList,
  CheckCircle,
  Loader2
} from "lucide-react";

interface ModuleCardProps {
  module: Module;
  isActivated: boolean;
  userCredits: number;
  onActivate: () => void;
  isPending: boolean;
}

// Map of module icons by category
const moduleIcons: Record<string, React.ReactNode> = {
  "Finance": <DollarSign className="h-6 w-6 text-primary" />,
  "Sales": <ShoppingBag className="h-6 w-6 text-secondary-500" />,
  "Operations": <Package className="h-6 w-6 text-green-500" />,
  "Human Resources": <Users className="h-6 w-6 text-red-500" />,
  "Projects": <ClipboardList className="h-6 w-6 text-yellow-500" />,
  "Quality": <CheckCircle className="h-6 w-6 text-indigo-500" />
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

export default function ModuleCard({ 
  module, 
  isActivated, 
  userCredits, 
  onActivate,
  isPending
}: ModuleCardProps) {
  // Determine if user has enough credits
  const hasEnoughCredits = userCredits >= module.price;
  
  // Get the appropriate icon and background color
  const icon = moduleIcons[module.category] || <Package className="h-6 w-6 text-primary" />;
  const bgColor = moduleBgColors[module.category] || "bg-primary-100";

  return (
    <Card className="overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 h-14">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{module.name}</h3>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            {module.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-primary">{module.price} Credits</span>
        </div>
        <div>
          {isActivated ? (
            <Button variant="secondary" size="sm" disabled>
              Activated
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              disabled={!hasEnoughCredits || isPending}
              onClick={onActivate}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Activating...
                </>
              ) : hasEnoughCredits ? (
                "Activate"
              ) : (
                "Insufficient Credits"
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Activity, Module } from "@shared/schema";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Clock, CreditCard, LayoutDashboard, Package } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ["/api/user/modules"],
  });
  
  const { data: credits } = useQuery<{ credits: number }>({
    queryKey: ["/api/user/credits"],
  });
  
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/user/activities"],
  });

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6">
        {/* Dashboard Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button variant="outline" className="px-4 py-2">
              Add Credits
            </Button>
            <Link href="/modules">
              <Button className="px-4 py-2">
                Explore Modules
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Active Modules */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Modules
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {modules.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/my-modules" className="font-medium text-primary hover:text-primary-600">
                  View all
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Available Credits */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Available Credits
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {credits?.credits || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-600">
                  Purchase more
                </a>
              </div>
            </CardFooter>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Recent Activity
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {activities.length} actions
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-600">
                  View all
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* My Modules Section */}
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            My Modules
          </h3>
          
          <Card>
            <CardContent className="p-0">
              {modules.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {modules.map((module) => (
                    <li key={module.id}>
                      <a href="#" className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <p className="ml-3 text-sm font-medium text-gray-900">{module.name}</p>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </p>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No modules activated yet</h3>
                  <p className="text-gray-500 mb-4">Purchase and activate modules to enhance your ERP system.</p>
                  <Link href="/modules">
                    <Button variant="outline">Browse Modules</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          
          <Card>
            <CardContent className="p-0">
              {activities.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <li key={activity.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary truncate">
                            {activity.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="text-sm text-gray-500">
                              {activity.details}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No recent activity</h3>
                  <p className="text-gray-500">Activity will be recorded as you use the system.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

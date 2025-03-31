import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ClipboardList, 
  CheckCircle,
  Plus,
  GitBranch,
  Shield,
  Zap
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary">Flax<span className="text-gray-800">-ERP</span></span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" className="border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </a>
                <a href="#featuredModules" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Features
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Pricing
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About
                </a>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4">
                {user ? (
                  <Button variant="default" onClick={() => setLocation("/dashboard")}>
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setLocation("/auth")}>
                      Login
                    </Button>
                    <Button variant="default" onClick={() => setLocation("/auth")}>
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Streamline your business with</span>{" "}
                  <span className="block text-primary xl:inline">Flax-ERP</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  A modern, modular ERP system designed to help businesses of all sizes manage operations efficiently with customizable modules for every need.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="#featuredModules">
                      <Button variant="default" size="lg" className="w-full lg:w-auto">
                        Explore Modules
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/auth">
                      <Button variant="outline" size="lg" className="w-full lg:w-auto">
                        Live Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center sm:h-72 md:h-96 lg:w-full lg:h-full">
            <div className="p-8 bg-white/80 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-10 w-10 text-primary" />
                  </div>
                  <div className="p-4 bg-secondary-50 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-secondary-500" />
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg flex items-center justify-center">
                    <Package className="h-10 w-10 text-green-500" />
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg flex items-center justify-center">
                    <Users className="h-10 w-10 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run your business
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Flax-ERP provides a comprehensive set of tools that can be customized to fit your specific business needs.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Modular Architecture</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Add only the modules you need, when you need them. No bloated software with features you don't use.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Credit-Based System</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Purchase modules with credits, making it easy to scale your ERP system as your business grows.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Fast Integration</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Modules integrate seamlessly with each other, ensuring data flows smoothly across your entire system.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure Platform</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Built with security in mind, protecting your valuable business data at every level.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Featured Modules */}
      <div id="featuredModules" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Modules</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Popular ERP Modules
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Browse our most popular modules to enhance your business operations.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Module 1 */}
            <div className="bg-white overflow-hidden shadow rounded-lg transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-5 h-14">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Finance Management</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Complete financial management with general accounting, receivables, payables, and budgeting.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-primary">500 Credits</span>
                </div>
                <div>
                  <Button variant="default" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>

            {/* Module 2 */}
            <div className="bg-white overflow-hidden shadow rounded-lg transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                    <ShoppingBag className="h-6 w-6 text-secondary-500" />
                  </div>
                  <div className="ml-5 h-14">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Sales Management</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Manage your sales pipeline, from lead generation to order fulfillment and customer service.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-primary">400 Credits</span>
                </div>
                <div>
                  <Button variant="default" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>

            {/* Module 3 */}
            <div className="bg-white overflow-hidden shadow rounded-lg transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <Package className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-5 h-14">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Inventory Management</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Track inventory levels, orders, sales, and deliveries with multiple warehouse support.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-primary">350 Credits</span>
                </div>
                <div>
                  <Button variant="default" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>

            {/* Module 4 */}
            <div className="bg-white overflow-hidden shadow rounded-lg transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <Users className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="ml-5 h-14">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">HR Management</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Manage employee records, time tracking, performance reviews, and payroll processing.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-primary">450 Credits</span>
                </div>
                <div>
                  <Button variant="default" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>

            {/* Module 5 */}
            <div className="bg-white overflow-hidden shadow rounded-lg transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <ClipboardList className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-5 h-14">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Project Management</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Plan, execute, and track projects with task assignment, Gantt charts, and resource allocation.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-primary">300 Credits</span>
                </div>
                <div>
                  <Button variant="default" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>

            {/* Module 6 */}
            <div className="bg-white overflow-hidden shadow rounded-lg transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="ml-5 h-14">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Quality Management</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Ensure consistent quality with inspection planning, quality controls, and non-conformance tracking.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-primary">400 Credits</span>
                </div>
                <div>
                  <Button variant="default" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button variant="default" className="inline-flex items-center">
              View All Modules
              <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-200">Create your account today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/auth">
                <Button variant="secondary" size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button variant="default" size="lg">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                About
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Blog
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Modules
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Contact
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Support
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Privacy
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Terms
              </a>
            </div>
          </nav>
          <div className="mt-8 flex justify-center space-x-6">
            {/* Social Icons */}
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>

            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2023 Flax-ERP, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { FaUsers, FaShoppingCart, FaBox, FaRoute, FaSync } from 'react-icons/fa';

interface User {
    name: string;
    role: string;
    email: string;
}

interface DashboardData {
    stats: {
        totalOrders: number;
        totalProducts: number;
        totalShops: number;
        totalRoutes: number;
    };
    recentSales: Array<{ date: string; amount: number }>;
    productPerformance: Array<{ name: string; sales: number }>;
}

const LoadingWidget = () => (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
);

const StatCard = ({ icon: Icon, title, value, isLoading, color = "blue" }: any) => {
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className="text-2xl font-bold">{value?.toLocaleString()}</p>
                </div>
                <Icon className={`text-3xl text-${color}-500`} />
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [greeting, setGreeting] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setRefreshing(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get<DashboardData>('/api/dashboard', {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            setDashboardData(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error fetching dashboard data');
            console.error('Dashboard data fetch error:', err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        try {
            const userData = localStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }

        fetchDashboardData();

        // Set up auto-refresh every 5 minutes
        const refreshInterval = setInterval(fetchDashboardData, 300000);
        return () => clearInterval(refreshInterval);
    }, []);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="p-6 bg-gray-100 min-h-screen">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <button 
                        onClick={fetchDashboardData}
                        disabled={refreshing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors ${refreshing ? 'opacity-50' : ''}`}
                    >
                        <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
                <div className="text-xl text-gray-600">
                    {greeting}, <span className="font-semibold">{user.name}</span>!
                </div>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={FaShoppingCart}
                    title="Total Orders"
                    value={dashboardData?.stats.totalOrders}
                    isLoading={isLoading}
                    color="blue"
                />
                <StatCard 
                    icon={FaBox}
                    title="Total Products"
                    value={dashboardData?.stats.totalProducts}
                    isLoading={isLoading}
                    color="green"
                />
                <StatCard 
                    icon={FaUsers}
                    title="Total Shops"
                    value={dashboardData?.stats.totalShops}
                    isLoading={isLoading}
                    color="purple"
                />
                <StatCard 
                    icon={FaRoute}
                    title="Active Routes"
                    value={dashboardData?.stats.totalRoutes}
                    isLoading={isLoading}
                    color="orange"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Sales</h2>
                    {isLoading ? (
                        <LoadingWidget />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardData?.recentSales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `Rs:${value.toLocaleString()}`}
                                />
                                <Tooltip 
                                    formatter={(value: any) => [`Rs:${value.toLocaleString()}`, 'Sales']}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#8884d8" 
                                    strokeWidth={2}
                                    dot={{ fill: '#8884d8' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Product Performance</h2>
                    {isLoading ? (
                        <LoadingWidget />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dashboardData?.productPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis 
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip />
                                <Bar 
                                    dataKey="sales" 
                                    fill="#8884d8"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </main>
    );
}
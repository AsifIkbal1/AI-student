import React, { useEffect, useState } from "react";
import { 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Clock
} from "lucide-react";
import { collection, query, getDocs, limit, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { cn } from "../lib/utils";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalCreditsUsed: 0,
    apiCost: 0,
    totalApiCredits: 1000000,
    remainingApiCredits: 850000
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [userUsage, setUserUsage] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Real-time stats
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snap) => {
      setStats(prev => ({ ...prev, totalUsers: snap.size }));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeConfig = onSnapshot(doc(db, "system", "config"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStats(prev => ({
          ...prev,
          totalApiCredits: data.totalApiCredits || 1000000,
          remainingApiCredits: data.remainingApiCredits || 850000,
          totalCreditsUsed: (data.totalApiCredits || 1000000) - (data.remainingApiCredits || 850000)
        }));
      }
    }, (error) => console.error("Config listener error:", error));

    const unsubscribeLogs = onSnapshot(
      query(collection(db, "usageLogs"), orderBy("timestamp", "desc"), limit(100)),
      (snap) => {
        const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentLogs(logs.slice(0, 10));

        // Calculate Cost and User Usage
        let totalCost = 0;
        const userMap: any = {};
        
        logs.forEach((log: any) => {
          let cost = 0;
          const promptTokens = log.promptTokens || 0;
          const completionTokens = log.completionTokens || 0;

          if (log.tool === "summarizeVideo") {
            cost = (promptTokens * 3.5 / 1000000) + (completionTokens * 10.5 / 1000000);
          } else if (["solveDoubt", "AICodeHelper-debug"].includes(log.tool)) {
            cost = (promptTokens * 5.0 / 1000000) + (completionTokens * 15.0 / 1000000);
          } else {
            cost = (promptTokens * 0.15 / 1000000) + (completionTokens * 0.60 / 1000000);
          }
          
          totalCost += cost;

          if (!userMap[log.uid]) {
            userMap[log.uid] = { 
              uid: log.uid, 
              totalTokens: 0, 
              tools: {}, 
              lastSeen: log.timestamp 
            };
          }
          userMap[log.uid].totalTokens += log.totalTokens || 0;
          userMap[log.uid].tools[log.tool] = (userMap[log.uid].tools[log.tool] || 0) + 1;
        });

        setStats(prev => ({ ...prev, apiCost: Number(totalCost.toFixed(4)) }));
        setUserUsage(Object.values(userMap));
      },
      (error) => console.error("Usage logs listener error:", error)
    );

    const unsubscribeLoginLogs = onSnapshot(
      query(collection(db, "loginLogs"), orderBy("timestamp", "desc"), limit(20)),
      (snap) => {
        setLoginLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    // Mock chart data
    setChartData([
      { name: "Mon", usage: 400, cost: 240 },
      { name: "Tue", usage: 300, cost: 139 },
      { name: "Wed", usage: 200, cost: 980 },
      { name: "Thu", usage: 278, cost: 390 },
      { name: "Fri", usage: 189, cost: 480 },
      { name: "Sat", usage: 239, cost: 380 },
      { name: "Sun", usage: 349, cost: 430 },
    ]);

    return () => {
      unsubscribeUsers();
      unsubscribeConfig();
      unsubscribeLogs();
      unsubscribeLoginLogs();
    };
  }, []);

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isBlocked: !currentStatus
      });
    } catch (error) {
      console.error("Error toggling block status:", error);
    }
  };

  const toggleApproveUser = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isApproved: !currentStatus
      });
    } catch (error) {
      console.error("Error toggling approval status:", error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-blue-50 p-3 rounded-xl">
          <Icon className="text-blue-600" size={24} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Monitor platform performance and user activity</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full md:w-64 bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend="up" trendValue="12%" />
        <StatCard title="Total API Credits" value={stats.totalApiCredits.toLocaleString()} icon={CreditCard} trend="up" trendValue="0%" />
        <StatCard title="Credits Remaining" value={stats.remainingApiCredits.toLocaleString()} icon={Activity} trend="down" trendValue="15%" />
      </div>

      <div className="grid grid-cols-1 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">User Management</h3>
            <span className="text-xs font-medium text-gray-400">{users.length} Total Users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-4 px-4">User</th>
                  <th className="pb-4 px-4">Role</th>
                  <th className="pb-4 px-4">Credits</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-semibold text-gray-900">{user.displayName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        user.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-700">{user.credits}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit",
                          user.isBlocked ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit",
                          user.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {user.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => toggleApproveUser(user.id, !!user.isApproved)}
                          className={cn(
                            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1",
                            user.isApproved 
                              ? "bg-amber-100 text-amber-600 hover:bg-amber-200" 
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          )}
                        >
                          {user.isApproved ? "Revoke Access" : "Approve Access"}
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => toggleBlockUser(user.id, !!user.isBlocked)}
                            className={cn(
                              "px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
                              user.isBlocked 
                                ? "bg-emerald-50 text-emerald-600" 
                                : "bg-red-600 text-white hover:bg-red-700"
                            )}
                          >
                            {user.isBlocked ? "Unblock" : "Block"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center lg:text-left">Login History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-4 px-4">Email</th>
                  <th className="pb-4 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loginLogs.map((log) => (
                  <tr key={log.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{log.email}</td>
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Usage Analytics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="usage" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

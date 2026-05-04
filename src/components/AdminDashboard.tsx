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
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
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
  const [manualPayments, setManualPayments] = useState<any[]>([]);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit' | 'support' | 'settings'>('overview');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [settings, setSettings] = useState<{ [key: string]: string }>({ maintenance_mode: 'false' });
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleBanUser = async (uid: string, currentStatus: string) => {
    const action = currentStatus === 'banned' ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${uid}/${action}`, { method: 'POST' });
      if (res.ok) {
        setUsers(users.map(u => u.uid === uid ? { ...u, status: action === 'ban' ? 'banned' : 'active' } : u));
      }
    } catch (err) {
      console.error(`Error trying to ${action} user:`, err);
    }
  };

  const handleRoleChange = async (uid: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to make this user an ${newRole}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${uid}/role`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error("Error changing role:", err);
    }
  };

  const handleReplyTicket = async (id: string) => {
    const reply = replyText[id];
    if (!reply || !reply.trim()) return;
    
    try {
      const res = await fetch(`/api/admin/support/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply })
      });
      
      if (res.ok) {
        setSupportTickets(supportTickets.map(t => t.id === id ? { ...t, status: 'closed', reply } : t));
        setReplyText(prev => {
          const newTexts = { ...prev };
          delete newTexts[id];
          return newTexts;
        });
        alert('Reply sent successfully');
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    }
  };

  const handleUpdateSettings = async (key: string, value: string) => {
    try {
      const res = await fetch(`/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { [key]: value } })
      });
      if (res.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
        alert('Setting updated successfully');
      }
    } catch (err) {
      console.error("Failed to update setting:", err);
    }
  };

  useEffect(() => {
    // Real-time stats
    const unsubscribeUsers = () => {}; // Firebase users listener removed in favor of MySQL

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

    // Listen to ALL usage logs for stats calculation (Real-time)
    const unsubscribeStats = onSnapshot(collection(db, "usageLogs"), (snap) => {
      let totalTokensUsed = 0;
      let totalCost = 0;
      const userMap: any = {};
      
      snap.docs.forEach((doc) => {
        const log = doc.data();
        const tokens = log.totalTokens || 0;
        totalTokensUsed += tokens;

        // Calculate Cost
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

        // User Map for activity
        if (!userMap[log.uid]) {
          userMap[log.uid] = { 
            uid: log.uid, 
            totalTokens: 0, 
            tools: {}, 
            lastSeen: log.timestamp 
          };
        }
        userMap[log.uid].totalTokens += tokens;
        userMap[log.uid].tools[log.tool] = (userMap[log.uid].tools[log.tool] || 0) + 1;
      });

      setStats(prev => ({
        ...prev,
        totalCreditsUsed: totalTokensUsed,
        remainingApiCredits: prev.totalApiCredits - totalTokensUsed,
        apiCost: Number(totalCost.toFixed(4))
      }));
      setUserUsage(Object.values(userMap));
    });

    // Recent logs listener (limited for UI)
    const unsubscribeRecentLogs = onSnapshot(
      query(collection(db, "usageLogs"), orderBy("timestamp", "desc"), limit(10)),
      (snap) => {
        setRecentLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubscribeLoginLogs = onSnapshot(
      query(collection(db, "loginLogs"), orderBy("timestamp", "desc"), limit(20)),
      (snap) => {
        setLoginLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    const fetchManualPayments = async () => {
      try {
        const response = await fetch("/api/payment/manual/all");
        if (!response.ok) throw new Error("Failed to fetch payments");
        const data = await response.json();
        setManualPayments(data);
        setPaymentError(null);
      } catch (error: any) {
        console.error("Error fetching manual payments:", error);
        setPaymentError(error.message);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    const fetchAdminData = async () => {
      try {
        const [usersRes, logsRes, supportRes, settingsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/audit-logs"),
          fetch("/api/admin/support"),
          fetch("/api/settings")
        ]);
        
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data);
          setStats(prev => ({ ...prev, totalUsers: data.length }));
        }
        
        if (logsRes.ok) {
          setAuditLogs(await logsRes.json());
        }

        if (supportRes.ok) {
          setSupportTickets(await supportRes.json());
        }

        if (settingsRes.ok) {
          setSettings(await settingsRes.json());
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    fetchManualPayments();
    fetchAnalytics();
    fetchAdminData();
    const paymentInterval = setInterval(fetchManualPayments, 30000); // Auto refresh every 30s

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
      unsubscribeStats();
      unsubscribeRecentLogs();
      unsubscribeLoginLogs();
      clearInterval(paymentInterval);
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

  const handleApprovePayment = async (paymentId: string, payment: any) => {
    if (!window.confirm("Are you sure you want to approve this payment and activate the subscription?")) return;
    try {
      const response = await fetch("/api/payment/manual/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          uid: payment.uid,
          planId: payment.planId,
          interval: payment.interval
        })
      });

      if (!response.ok) throw new Error("Failed to approve payment");
      
      // Refresh list
      const updatedResponse = await fetch("/api/payment/manual/all");
      const updatedData = await updatedResponse.json();
      setManualPayments(updatedData);
      
      alert("Payment approved successfully");
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment");
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!window.confirm("Are you sure you want to reject this payment?")) return;
    try {
      const response = await fetch("/api/payment/manual/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId })
      });

      if (!response.ok) throw new Error("Failed to reject payment");

      // Refresh list
      const updatedResponse = await fetch("/api/payment/manual/all");
      const updatedData = await updatedResponse.json();
      setManualPayments(updatedData);

      alert("Payment rejected");
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Failed to reject payment");
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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Monitor platform performance and user activity</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => window.open('/api/admin/backup', '_blank')}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Download Backup
          </button>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full md:w-64 bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 mb-8 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn("pb-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors", activeTab === 'overview' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900")}
        >
          Overview & Stats
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={cn("pb-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors", activeTab === 'users' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900")}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={cn("pb-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors", activeTab === 'audit' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900")}
        >
          Audit Logs
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={cn("pb-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors", activeTab === 'support' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900")}
        >
          Support Tickets
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn("pb-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors", activeTab === 'settings' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900")}
        >
          Settings
        </button>
      </div>

      {activeTab === 'overview' && (
        <>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend="up" trendValue="12%" />
        <StatCard title="Total Revenue" value={`৳${analytics?.totalRevenue || 0}`} icon={CreditCard} trend="up" trendValue="0%" />
        <StatCard title="Total API Credits" value={stats.totalApiCredits.toLocaleString()} icon={Activity} trend="up" trendValue="0%" />
        <StatCard title="Credits Remaining" value={stats.remainingApiCredits.toLocaleString()} icon={Clock} trend="down" trendValue="15%" />
      </div>

      <div className="grid grid-cols-1 gap-8 mb-10">
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Activity Trend</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyUsage}>
                    <defs>
                      <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '3 3' }}
                    />
                    <Area type="monotone" dataKey="actions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActions)" name="Total Actions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Top Features</h3>
              <div className="h-[300px] w-full">
                {analytics.topFeatures?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.topFeatures}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.topFeatures.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No activity data yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Payment Requests Table */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Manual Payment Requests</h3>
            <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{manualPayments.filter(p => p.status === 'pending').length} Pending</span>
          </div>
          {paymentError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-bold">
              Error loading payments: {paymentError}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-4 px-4">User</th>
                  <th className="pb-4 px-4">Plan & Amount</th>
                  <th className="pb-4 px-4">Method & TrxID</th>
                  <th className="pb-4 px-4">Date</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {manualPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No payment requests found.</td>
                  </tr>
                ) : manualPayments.map((payment) => (
                  <tr key={payment.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{payment.displayName || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{payment.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900 capitalize">{payment.planId} ({payment.interval})</p>
                      <p className="text-xs text-gray-500">৳{payment.amount}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-blue-600 uppercase">{payment.method}</p>
                      <p className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">{payment.transactionId}</p>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {payment.timestamp ? new Date(payment.timestamp.seconds * 1000).toLocaleString() : "Just now"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit",
                        payment.status === "approved" ? "bg-emerald-50 text-emerald-600" : 
                        payment.status === "rejected" ? "bg-red-50 text-red-600" : 
                        "bg-amber-50 text-amber-600"
                      )}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {payment.status === "pending" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprovePayment(payment.id, payment)}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPayment(payment.id)}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
      )}

      {activeTab === 'users' && (
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
                  <th className="pb-4 px-4">Joined</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.uid} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />}
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
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase w-fit",
                        user.status === 'banned' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleRoleChange(user.uid, user.role)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                        >
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleBanUser(user.uid, user.status)}
                          className={cn(
                            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
                            user.status === 'banned' 
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          )}
                        >
                          {user.status === 'banned' ? "Unban" : "Ban"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'audit' && (
      <div className="grid grid-cols-1 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Audit Logs</h3>
            <span className="text-xs font-medium text-gray-400">{auditLogs.length} Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-4 px-4">User</th>
                  <th className="pb-4 px-4">Feature</th>
                  <th className="pb-4 px-4">Action</th>
                  <th className="pb-4 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auditLogs.map((log: any) => (
                  <tr key={log.id} className="text-sm hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{log.email || log.uid}</td>
                    <td className="py-4 px-4 text-blue-600 font-semibold">{log.feature}</td>
                    <td className="py-4 px-4 text-gray-600">{log.action}</td>
                    <td className="py-4 px-4 text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'support' && (
      <div className="grid grid-cols-1 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Support Tickets</h3>
            <span className="text-xs font-medium text-gray-400">{supportTickets.length} Tickets</span>
          </div>
          <div className="space-y-4">
            {supportTickets.map(ticket => (
              <div key={ticket.id} className="border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{ticket.subject}</h3>
                    <p className="text-xs text-gray-500">{ticket.email}</p>
                  </div>
                  <span className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase",
                    ticket.status === 'open' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{ticket.message}</p>
                
                {ticket.status === 'open' ? (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={replyText[ticket.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                      placeholder="Type your reply..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleReplyTicket(ticket.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500 mt-4">
                    <p className="text-xs font-bold text-blue-600 mb-1">Your Reply:</p>
                    <p className="text-gray-700 text-sm">{ticket.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {activeTab === 'settings' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">System Control</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border border-red-100 bg-red-50/50 rounded-2xl">
              <div>
                <h4 className="font-bold text-gray-900">Maintenance Mode</h4>
                <p className="text-xs text-gray-500 mt-1">When enabled, all users will be blocked from accessing the app.</p>
              </div>
              <button
                onClick={() => handleUpdateSettings('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-colors w-24",
                  settings.maintenance_mode === 'true' 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                )}
              >
                {settings.maintenance_mode === 'true' ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-100 bg-gray-50 rounded-2xl">
              <div>
                <h4 className="font-bold text-gray-900">Signups Enabled</h4>
                <p className="text-xs text-gray-500 mt-1">Allow new users to register.</p>
              </div>
              <button
                onClick={() => handleUpdateSettings('signups_enabled', settings.signups_enabled === 'false' ? 'true' : 'false')}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-colors w-24",
                  settings.signups_enabled !== 'false' 
                    ? "bg-emerald-600 text-white" 
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                )}
              >
                {settings.signups_enabled !== 'false' ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

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

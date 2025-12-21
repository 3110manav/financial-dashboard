"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const DashboardCharts = () => {
  const [data, setData] = useState<any>({
    age: [],
    gender: [],
    trend: [],
    spenders: [],
    heatmap: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [ageRes, genderRes, trendRes, spendersRes, heatmapRes] = await Promise.all([
          fetch('/api/analytics/age-groups'),
          fetch('/api/analytics/gender'),
          fetch('/api/analytics/monthly-trend'),
          fetch('/api/analytics/top-spenders'),
          fetch('/api/analytics/heatmap'),
        ]);

        const age = await ageRes.json();
        const gender = await genderRes.json();
        const trend = await trendRes.json();
        const spenders = await spendersRes.json();
        const heatmap = await heatmapRes.json();

        setData({ age, gender, trend, spenders, heatmap });
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  if (loading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Monthly Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-1 md:col-span-2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Financial Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="credit" stroke="#10b981" name="Credits" />
              <Line type="monotone" dataKey="debit" stroke="#ef4444" name="Debits" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Age Groups */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Transactions by Age Group</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.age}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Gender Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.gender}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.gender.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Spenders */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Spenders</h3>
        <div className="space-y-4">
          {data.spenders.map((user: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <span className="font-medium text-slate-700">{user.name}</span>
              </div>
              <span className="font-bold text-slate-900">${user.total_spent.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Heatmap (Day of Week) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity by Day</h3>
        <div className="h-72 mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.heatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

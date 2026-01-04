import { DashboardCharts, TransactionTable } from "@/components";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <LayoutDashboard className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">FinBoard</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500">Analytics and transaction history</p>
                </div>

                <DashboardCharts />
                <TransactionTable />
            </main>
        </div>
    );
}

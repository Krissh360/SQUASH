import { useState, useEffect, useCallback, useMemo } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../components/ui/Toast";
import { fetchStats, fetchIssues } from "../api/issues";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Bug,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const SEVERITY_COLORS = {
  LOW: "var(--chart-4)",
  MEDIUM: "var(--chart-3)",
  HIGH: "var(--chart-2)",
  CRITICAL: "var(--chart-1)",
};

export default function Dashboard({ refreshTrigger, onSelectIssue }) {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, issuesRes] = await Promise.all([
        fetchStats(),
        fetchIssues(),
      ]);
      setStats(statsRes);
      setAllIssues(issuesRes || []);

      // 5 newest issues sorted by createdAt or id
      const sorted = [...(issuesRes || [])].sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA || b.id - a.id;
      });
      setRecentIssues(sorted.slice(0, 5));
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, refreshTrigger]);

  // Status chart data
  const statusChartData = useMemo(() => {
    if (!stats || !stats.byStatus) return [];
    return [
      { name: "Open", count: stats.byStatus.OPEN || 0, fill: "var(--chart-2)" },
      { name: "In Progress", count: stats.byStatus.IN_PROGRESS || 0, fill: "var(--chart-2)" },
      { name: "Resolved", count: stats.byStatus.RESOLVED || 0, fill: "var(--chart-2)" },
      { name: "Closed", count: stats.byStatus.CLOSED || 0, fill: "var(--chart-2)" },
    ];
  }, [stats]);

  // Severity chart data
  const severityChartData = useMemo(() => {
    if (!stats || !stats.bySeverity) return [];
    return [
      { name: "Low", count: stats.bySeverity.LOW || 0, fill: "var(--chart-4)" },
      { name: "Medium", count: stats.bySeverity.MEDIUM || 0, fill: "var(--chart-3)" },
      { name: "High", count: stats.bySeverity.HIGH || 0, fill: "var(--chart-2)" },
      { name: "Critical", count: stats.bySeverity.CRITICAL || 0, fill: "var(--chart-1)" },
    ];
  }, [stats]);

  // Sparkline data for Total & Open cards (synthesized from actual issue createdAt timeline)
  const sparklineData = useMemo(() => {
    if (!allIssues || allIssues.length === 0) {
      return [
        { v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }
      ];
    }
    // Group issues by recent chronological chunks
    const sorted = [...allIssues].sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );
    let cumulative = 0;
    return sorted.map((item, idx) => {
      cumulative += 1;
      return { idx: idx + 1, v: cumulative };
    });
  }, [allIssues]);

  const sparklineOpenData = useMemo(() => {
    const openIssues = allIssues.filter(
      (i) => i.status === "OPEN" || i.status === "IN_PROGRESS"
    );
    if (openIssues.length === 0) {
      return [{ v: 0 }, { v: 1 }, { v: 0 }, { v: 1 }];
    }
    return openIssues.map((_, idx) => ({ idx: idx + 1, v: idx + 1 }));
  }, [allIssues]);

  const resolvedAndClosedCount =
    (stats?.byStatus?.RESOLVED || 0) + (stats?.byStatus?.CLOSED || 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const isEmpty = stats?.total === 0;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Dashboard
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Real-time metrics and triage health for the SQUASH bug tracker.
        </p>
      </div>

      {isEmpty ? (
        <Card className="p-12 text-center space-y-3">
          <Bug className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h2 className="text-lg font-semibold text-foreground">
            No bugs yet. Nothing to squash.
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your tracking database has no reported issues yet. Use the "New issue"
            button in the top navigation to add one.
          </p>
        </Card>
      ) : (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Issues */}
            <Card className="relative overflow-hidden flex flex-col justify-between">
              <div>
                <CardTitle className="flex items-center justify-between">
                  <span>Total Issues</span>
                  <Bug className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
                <div className="mt-2 text-3xl font-extrabold text-foreground">
                  {stats?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-chart-2" />
                  All tracked tickets to date
                </p>
              </div>

              {/* Sparkline in card */}
              <div className="h-10 w-full mt-3 -mb-3 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--chart-2)"
                      strokeWidth={1.5}
                      fill="url(#totalGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Open */}
            <Card className="relative overflow-hidden flex flex-col justify-between">
              <div>
                <CardTitle className="flex items-center justify-between">
                  <span>Open</span>
                  <AlertCircle className="h-4 w-4 text-chart-1" />
                </CardTitle>
                <div className="mt-2 text-3xl font-extrabold text-foreground">
                  {stats?.byStatus?.OPEN || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting triage & investigation
                </p>
              </div>

              {/* Sparkline in card */}
              <div className="h-10 w-full mt-3 -mb-3 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineOpenData}>
                    <defs>
                      <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--chart-1)"
                      strokeWidth={1.5}
                      fill="url(#openGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* In Progress */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardTitle className="flex items-center justify-between">
                  <span>In Progress</span>
                  <Clock className="h-4 w-4 text-chart-3" />
                </CardTitle>
                <div className="mt-2 text-3xl font-extrabold text-foreground">
                  {stats?.byStatus?.IN_PROGRESS || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active engineering work
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                <span>Active load</span>
                <span className="font-semibold text-foreground">
                  {stats?.total
                    ? `${Math.round(((stats.byStatus.IN_PROGRESS || 0) / stats.total) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </Card>

            {/* Resolved / Closed */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardTitle className="flex items-center justify-between">
                  <span>Resolved / Closed</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardTitle>
                <div className="mt-2 text-3xl font-extrabold text-foreground">
                  {resolvedAndClosedCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed & verified fixes
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                <span>Resolution rate</span>
                <span className="font-semibold text-emerald-400">
                  {stats?.total
                    ? `${Math.round((resolvedAndClosedCount / stats.total) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issues by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Issues by status</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Distribution across workflow states
                </p>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                        fontSize: "12px",
                      }}
                      cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                    />
                    <Bar
                      dataKey="count"
                      name="Issues"
                      fill="var(--chart-2)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Issues by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Issues by severity</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Impact classification according to palette tokens
                </p>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={severityChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                        fontSize: "12px",
                      }}
                      cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                    />
                    {/* Render each bar with its mapped severity color */}
                    <Bar
                      dataKey="count"
                      name="Issues"
                      radius={[4, 4, 0, 0]}
                      fill="var(--chart-2)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Issues List Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent issues</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Latest 5 tickets reported
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                {recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-2 hover:bg-muted/30 rounded-md transition-colors cursor-pointer gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0">
                        #{issue.id}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {issue.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <Badge type="severity" value={issue.severity} />
                      <Badge type="status" value={issue.status} />
                      <span className="text-xs text-muted-foreground hidden md:inline">
                        {issue.assignee ? issue.assignee : "Unassigned"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

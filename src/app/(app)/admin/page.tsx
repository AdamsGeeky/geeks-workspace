"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users, BookOpen, Megaphone, Trophy, TrendingUp,
  ShieldCheck, ChevronRight, Plus, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

const MOCK_STATS = {
  total_students: 132,
  total_mentors: 14,
  active_cohorts: 2,
  pending_submissions: 17,
  open_assignments: 8,
  announcements_this_month: 5,
  community_posts_today: 23,
  challenges_active: 4,
};

const MOCK_RECENT_SUBMISSIONS = [
  { id: "s1", student: "Kwame Asante", assignment: "REST API Design", submitted_at: "2025-06-10T14:30:00Z", status: "pending" },
  { id: "s2", student: "Ama Owusu", assignment: "Docker Fundamentals", submitted_at: "2025-06-10T11:00:00Z", status: "graded" },
  { id: "s3", student: "Kofi Boateng", assignment: "REST API Design", submitted_at: "2025-06-09T18:45:00Z", status: "pending" },
  { id: "s4", student: "Efua Darko", assignment: "PostgreSQL Deep Dive", submitted_at: "2025-06-09T16:20:00Z", status: "graded" },
  { id: "s5", student: "Zara Mensah", assignment: "REST API Design", submitted_at: "2025-06-09T09:10:00Z", status: "pending" },
];

const MOCK_QUICK_ACTIONS = [
  { label: "Create Announcement", icon: Megaphone, href: "/announcements" },
  { label: "New Assignment", icon: BookOpen, href: "/assignments" },
  { label: "Add Challenge", icon: Trophy, href: "/challenges" },
  { label: "Manage Users", icon: Users, href: "/admin/users" },
];

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: number | string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            {sub && <p className="text-xs text-primary mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/stats");
        return res.data;
      } catch {
        return MOCK_STATS;
      }
    },
  });

  const { data: submissions, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-recent-submissions"],
    queryFn: async () => {
      try {
        const res = await api.get("/admin/submissions/recent");
        return res.data;
      } catch {
        return MOCK_RECENT_SUBMISSIONS;
      }
    },
  });

  const s = stats ?? MOCK_STATS;
  const recentSubs: typeof MOCK_RECENT_SUBMISSIONS = submissions ?? MOCK_RECENT_SUBMISSIONS;

  if (user?.role !== "Admin") {
    return (
      <div className="p-4 md:p-6 max-w-screen-lg mx-auto">
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            You do not have permission to access this page. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">Platform overview and management tools.</p>
        </div>
      </div>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-4 pb-4"><Skeleton className="h-14 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Students" value={s.total_students} />
          <StatCard icon={Users} label="Total Mentors" value={s.total_mentors} />
          <StatCard icon={BookOpen} label="Active Cohorts" value={s.active_cohorts} />
          <StatCard icon={AlertCircle} label="Pending Reviews" value={s.pending_submissions} sub="Need attention" />
          <StatCard icon={BookOpen} label="Open Assignments" value={s.open_assignments} />
          <StatCard icon={Megaphone} label="Announcements" value={s.announcements_this_month} sub="This month" />
          <StatCard icon={TrendingUp} label="Posts Today" value={s.community_posts_today} />
          <StatCard icon={Trophy} label="Active Challenges" value={s.challenges_active} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent submissions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Submissions</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Latest student submissions awaiting review</CardDescription>
                </div>
                <Link href="/assignments">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View all <ChevronRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border pb-2">
              {subsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="py-3 flex items-center gap-3">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))
                : recentSubs.map((sub) => (
                    <div key={sub.id} className="py-3 flex items-center gap-3">
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                        {sub.student.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sub.student}</p>
                        <p className="text-xs text-muted-foreground truncate">{sub.assignment}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={sub.status === "pending" ? "outline" : "secondary"}
                          className={`text-xs ${sub.status === "pending" ? "border-amber-400 text-amber-600" : ""}`}
                        >
                          {sub.status}
                        </Badge>
                        {sub.status === "pending" && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {MOCK_QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
                <Link key={label} href={href}>
                  <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                    <Icon className="size-4 text-muted-foreground" />
                    {label}
                    <Plus className="size-3 ml-auto text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Admin Sections</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border pb-2">
              {[
                { label: "User Management", href: "/admin/users", icon: Users },
                { label: "Cohort Management", href: "/cohorts", icon: BookOpen },
                { label: "Submission Reviews", href: "/assignments", icon: BookOpen },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={label} href={href} className="flex items-center gap-2 py-2.5 hover:text-primary transition-colors text-sm">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span>{label}</span>
                  <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

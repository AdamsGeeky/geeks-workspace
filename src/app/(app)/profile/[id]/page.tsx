"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Mail, Github, Twitter, Globe, Trophy, BookOpen,
  CheckCircle2, Star, Edit2, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

const MOCK_PROFILE = {
  id: "me",
  name: "Kwame Asante",
  username: "kwame.dev",
  email: "kwame@geekink.io",
  role: "Student",
  cohort: "Cohort 4 — Backend Track",
  bio: "Passionate backend engineer learning to build scalable systems. Currently focused on distributed computing and cloud architecture. Open to mentorship and collaboration.",
  avatar_url: null,
  github: "kwame-dev",
  twitter: "kwamebuilds",
  website: "https://kwame.dev",
  xp: 4315,
  level: 12,
  next_level_xp: 5000,
  joined_at: "2024-09-01",
  completed_assignments: 18,
  total_assignments: 22,
  completed_challenges: 3,
  streak: 7,
  badges: [
    { id: "1", name: "Python Master", icon: "🐍", earned_at: "2025-01-15" },
    { id: "2", name: "Team Player", icon: "🤝", earned_at: "2025-02-10" },
    { id: "3", name: "Early Bird", icon: "🌅", earned_at: "2024-10-01" },
    { id: "4", name: "100-Day Streak", icon: "🔥", earned_at: "2024-12-25" },
  ],
  recent_activity: [
    { type: "assignment", title: "Submitted 'REST API Design'", date: "2025-06-10" },
    { type: "challenge", title: "Completed Day 8 of Python Bootcamp", date: "2025-06-09" },
    { type: "post", title: "Posted in Community: 'Async patterns in Python'", date: "2025-06-08" },
    { type: "assignment", title: "Submitted 'Docker Fundamentals'", date: "2025-06-05" },
    { type: "badge", title: "Earned 'Python Master' badge", date: "2025-01-15" },
  ],
};

function ProfileSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Skeleton className="size-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const isOwnProfile = !params?.id || params.id === "me" || params.id === currentUser?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", params?.id],
    queryFn: async () => {
      try {
        const res = await api.get(`/users/${params?.id ?? "me"}/profile`);
        return res.data;
      } catch {
        return MOCK_PROFILE;
      }
    },
  });

  const p = profile ?? MOCK_PROFILE;
  const levelProgress = Math.round((p.xp / p.next_level_xp) * 100);
  const assignmentProgress = Math.round((p.completed_assignments / p.total_assignments) * 100);

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-lg mx-auto">
      {/* Profile card */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative shrink-0">
              <UserAvatar name={p.name} avatarUrl={p.avatar_url} size="xl" />
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors">
                  <Edit2 className="size-3.5" />
                  <span className="sr-only">Edit avatar</span>
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
                <RoleBadge role={p.role as "Student" | "Mentor" | "Admin"} />
              </div>
              <p className="text-sm text-muted-foreground">@{p.username} · {p.cohort}</p>
              <p className="text-sm text-foreground leading-relaxed max-w-2xl">{p.bio}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Joined {new Date(p.joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                {p.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    <a href={`mailto:${p.email}`} className="hover:text-foreground transition-colors">{p.email}</a>
                  </div>
                )}
                {p.github && (
                  <div className="flex items-center gap-1.5">
                    <Github className="size-3.5" />
                    <a href={`https://github.com/${p.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                      {p.github}
                    </a>
                  </div>
                )}
                {p.twitter && (
                  <div className="flex items-center gap-1.5">
                    <Twitter className="size-3.5" />
                    <a href={`https://twitter.com/${p.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                      @{p.twitter}
                    </a>
                  </div>
                )}
                {p.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="size-3.5" />
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                      {p.website.replace("https://", "")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <div className="shrink-0">
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit2 className="size-3.5" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
              <Star className="size-4 fill-amber-500" />
              <span className="text-2xl font-bold text-foreground">{p.xp.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">Lv. {p.level}</p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-2xl font-bold">{p.streak}</span>
              <span className="text-xl">🔥</span>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
              <CheckCircle2 className="size-4" />
              <span className="text-2xl font-bold text-foreground">{p.completed_challenges}</span>
            </div>
            <p className="text-xs text-muted-foreground">Challenges Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Level progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Level Progress</span>
            <span className="text-muted-foreground font-normal">{p.xp.toLocaleString()} / {p.next_level_xp.toLocaleString()} XP</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{p.next_level_xp - p.xp} XP to reach Level {p.level + 1}</p>
        </CardContent>
      </Card>

      {/* Tabs: Badges, Activity, Assignments */}
      <Tabs defaultValue="badges">
        <TabsList>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-4">
          {p.badges.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center text-muted-foreground text-sm">
                No badges earned yet. Complete challenges to earn your first badge.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {p.badges.map((badge: typeof MOCK_PROFILE.badges[0]) => (
                <Card key={badge.id} className="text-center hover:shadow-sm transition-shadow">
                  <CardContent className="pt-4 pb-4 flex flex-col items-center gap-2">
                    <span className="text-3xl">{badge.icon}</span>
                    <p className="text-sm font-medium leading-tight">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(badge.earned_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="pt-4 pb-4 divide-y divide-border">
              {p.recent_activity.map((item: typeof MOCK_PROFILE.recent_activity[0], idx: number) => (
                <div key={idx} className="py-3 flex items-start gap-3">
                  <div className="mt-0.5 size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {item.type === "assignment" && <BookOpen className="size-3.5 text-muted-foreground" />}
                    {item.type === "challenge" && <Trophy className="size-3.5 text-amber-500" />}
                    {item.type === "post" && <Globe className="size-3.5 text-primary" />}
                    {item.type === "badge" && <Star className="size-3.5 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <Card>
            <CardContent className="pt-4 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Assignment Completion</p>
                <p className="text-sm text-muted-foreground">{p.completed_assignments}/{p.total_assignments}</p>
              </div>
              <Progress value={assignmentProgress} className="h-2" />
              <Separator />
              <p className="text-sm text-muted-foreground text-center py-4">
                Full assignment history coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

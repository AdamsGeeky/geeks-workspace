"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Users, BookOpen, ChevronLeft, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { api } from "@/lib/api";

const MOCK_COHORT_DETAIL = {
  id: "1",
  name: "Cohort 4 — Backend Track",
  description: "Advanced backend development covering Node.js, Python, databases, APIs, and cloud deployment.",
  track: "Backend",
  status: "Active",
  start_date: "2024-09-01",
  end_date: "2025-06-30",
  members: [
    { id: "u1", name: "Kwame Asante", role: "Student", xp: 4315, avatar_url: null },
    { id: "u2", name: "Ama Owusu", role: "Student", xp: 4820, avatar_url: null },
    { id: "u3", name: "Kofi Boateng", role: "Student", xp: 3620, avatar_url: null },
    { id: "u4", name: "Efua Darko", role: "Student", xp: 3200, avatar_url: null },
    { id: "m1", name: "Dr. Samuel Osei", role: "Mentor", xp: 0, avatar_url: null },
    { id: "m2", name: "Nana Adjei", role: "Mentor", xp: 0, avatar_url: null },
  ],
  assignments: [
    { id: "a1", title: "REST API Design", due_date: "2025-06-20", status: "Active" },
    { id: "a2", title: "Docker Fundamentals", due_date: "2025-06-10", status: "Closed" },
    { id: "a3", title: "PostgreSQL Deep Dive", due_date: "2025-06-30", status: "Active" },
  ],
};

export default function CohortDetailPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["cohort", params?.id],
    queryFn: async () => {
      try {
        const res = await api.get(`/cohorts/${params?.id}`);
        return res.data;
      } catch {
        return MOCK_COHORT_DETAIL;
      }
    },
  });

  const cohort = data ?? MOCK_COHORT_DETAIL;
  const students = cohort.members.filter((m: typeof MOCK_COHORT_DETAIL.members[0]) => m.role === "Student");
  const mentors = cohort.members.filter((m: typeof MOCK_COHORT_DETAIL.members[0]) => m.role === "Mentor");

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-lg mx-auto">
      <Link href="/cohorts">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ChevronLeft className="size-4" /> Back to Cohorts
        </Button>
      </Link>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="default">{cohort.track}</Badge>
            <Badge variant={cohort.status === "Active" ? "default" : "secondary"}>{cohort.status}</Badge>
          </div>
          <CardTitle className="text-xl">{cohort.name}</CardTitle>
          <CardDescription>{cohort.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-muted-foreground">Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{mentors.length}</p>
              <p className="text-muted-foreground">Mentors</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{cohort.assignments.length}</p>
              <p className="text-muted-foreground">Assignments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members" className="gap-1.5">
            <Users className="size-4" /> Members
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5">
            <BookOpen className="size-4" /> Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4 space-y-6">
          {/* Mentors */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mentors</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {mentors.map((member: typeof MOCK_COHORT_DETAIL.members[0]) => (
                <Card key={member.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="pt-4 pb-4 flex items-center gap-3">
                    <UserAvatar name={member.name} avatarUrl={member.avatar_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <RoleBadge role={member.role as "Mentor"} />
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 size-8">
                      <Mail className="size-4" />
                      <span className="sr-only">Message {member.name}</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Students */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Students ({students.length})
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {students.map((member: typeof MOCK_COHORT_DETAIL.members[0]) => (
                <Link key={member.id} href={`/profile/${member.id}`}>
                  <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="pt-4 pb-4 flex items-center gap-3">
                      <UserAvatar name={member.name} avatarUrl={member.avatar_url} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.xp.toLocaleString()} XP</p>
                      </div>
                      <RoleBadge role={member.role as "Student"} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="mt-4 space-y-3">
          {cohort.assignments.map((a: typeof MOCK_COHORT_DETAIL.assignments[0]) => (
            <Link key={a.id} href={`/assignments/${a.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="pt-4 pb-4 flex items-center gap-3">
                  <BookOpen className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(a.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <Badge variant={a.status === "Active" ? "default" : "secondary"} className="text-xs shrink-0">
                    {a.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

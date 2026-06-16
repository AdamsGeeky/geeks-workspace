"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

const MOCK_COHORTS = [
  {
    id: "1",
    name: "Cohort 4 — Backend Track",
    description: "Advanced backend development covering Node.js, Python, databases, APIs, and cloud deployment.",
    track: "Backend",
    status: "Active",
    start_date: "2024-09-01",
    end_date: "2025-06-30",
    student_count: 32,
    mentor_count: 4,
    assignment_count: 22,
    is_mine: true,
  },
  {
    id: "2",
    name: "Cohort 4 — Frontend Track",
    description: "Modern frontend engineering with React, TypeScript, accessibility, and performance optimization.",
    track: "Frontend",
    status: "Active",
    start_date: "2024-09-01",
    end_date: "2025-06-30",
    student_count: 28,
    mentor_count: 3,
    assignment_count: 19,
    is_mine: false,
  },
  {
    id: "3",
    name: "Cohort 3 — Fullstack Track",
    description: "End-to-end product development: fullstack apps, design systems, and deployment pipelines.",
    track: "Fullstack",
    status: "Completed",
    start_date: "2024-01-15",
    end_date: "2024-08-31",
    student_count: 41,
    mentor_count: 5,
    assignment_count: 30,
    is_mine: false,
  },
  {
    id: "4",
    name: "Cohort 5 — Data & ML Track",
    description: "Foundations of data science and machine learning with Python, pandas, and scikit-learn.",
    track: "Data & ML",
    status: "Upcoming",
    start_date: "2025-09-01",
    end_date: "2026-05-31",
    student_count: 0,
    mentor_count: 2,
    assignment_count: 0,
    is_mine: false,
  },
];

const trackColor: Record<string, string> = {
  Backend: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Frontend: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Fullstack: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Data & ML": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Active: "default",
  Completed: "secondary",
  Upcoming: "outline",
};

function CohortCard({ cohort }: { cohort: (typeof MOCK_COHORTS)[0] }) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${cohort.is_mine ? "ring-1 ring-primary" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trackColor[cohort.track] ?? "bg-muted text-muted-foreground"}`}>
                {cohort.track}
              </span>
              <Badge variant={statusVariant[cohort.status] ?? "outline"} className="text-xs">
                {cohort.status}
              </Badge>
              {cohort.is_mine && (
                <Badge className="text-xs bg-primary text-primary-foreground">Your Cohort</Badge>
              )}
            </div>
            <CardTitle className="text-base">{cohort.name}</CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">{cohort.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <Users className="size-4 text-muted-foreground mb-1" />
            <span className="font-semibold">{cohort.student_count}</span>
            <span className="text-xs text-muted-foreground">Students</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <Users className="size-4 text-muted-foreground mb-1" />
            <span className="font-semibold">{cohort.mentor_count}</span>
            <span className="text-xs text-muted-foreground">Mentors</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted/50">
            <BookOpen className="size-4 text-muted-foreground mb-1" />
            <span className="font-semibold">{cohort.assignment_count}</span>
            <span className="text-xs text-muted-foreground">Assignments</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(cohort.start_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })} —{" "}
          {new Date(cohort.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </div>
        <Link href={`/cohorts/${cohort.id}`}>
          <Button variant={cohort.is_mine ? "default" : "outline"} size="sm" className="w-full gap-1">
            View Cohort <ChevronRight className="size-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function CohortsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cohorts"],
    queryFn: async () => {
      try {
        const res = await api.get("/cohorts");
        return res.data;
      } catch {
        return MOCK_COHORTS;
      }
    },
  });

  const cohorts: typeof MOCK_COHORTS = data ?? MOCK_COHORTS;
  const filtered = cohorts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.track.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cohorts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Explore all learning cohorts and their members.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search cohorts or tracks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="gap-3 flex flex-col">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, Users, Star, Lock, CheckCircle2, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { api } from "@/lib/api";

// --- Mock data ---
const MOCK_CHALLENGES = [
  {
    id: "1",
    title: "30-Day Python Bootcamp",
    description: "Complete 30 Python challenges to earn the Python Master badge. Each day a new challenge drops.",
    difficulty: "Beginner",
    category: "Python",
    participants: 148,
    xp_reward: 1500,
    badge_reward: "Python Master",
    deadline: "2025-08-01",
    progress: 8,
    total_steps: 30,
    status: "active",
    joined: true,
  },
  {
    id: "2",
    title: "UI/UX Design Sprint",
    description: "Build 5 production-grade UI components from Figma designs and get feedback from mentors.",
    difficulty: "Intermediate",
    category: "Design",
    participants: 76,
    xp_reward: 800,
    badge_reward: "Design Pro",
    deadline: "2025-07-15",
    progress: 3,
    total_steps: 5,
    status: "active",
    joined: true,
  },
  {
    id: "3",
    title: "Algorithms Grind",
    description: "Solve 50 algorithmic problems across arrays, trees, graphs, and dynamic programming.",
    difficulty: "Advanced",
    category: "Algorithms",
    participants: 112,
    xp_reward: 2500,
    badge_reward: "Algorithm Ace",
    deadline: "2025-09-30",
    progress: 0,
    total_steps: 50,
    status: "active",
    joined: false,
  },
  {
    id: "4",
    title: "Open Source Contributor",
    description: "Make 3 meaningful pull requests to an open-source project and document your contributions.",
    difficulty: "Intermediate",
    category: "Open Source",
    participants: 34,
    xp_reward: 1200,
    badge_reward: "OSS Contributor",
    deadline: "2025-10-15",
    progress: 0,
    total_steps: 3,
    status: "active",
    joined: false,
  },
  {
    id: "5",
    title: "HTML/CSS Fundamentals",
    description: "Master the foundations by rebuilding 10 classic website layouts from scratch.",
    difficulty: "Beginner",
    category: "Frontend",
    participants: 203,
    xp_reward: 600,
    badge_reward: "Frontend Foundation",
    deadline: "2025-06-30",
    progress: 10,
    total_steps: 10,
    status: "completed",
    joined: true,
  },
];

const difficultyColor: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function ChallengeCard({ challenge }: { challenge: (typeof MOCK_CHALLENGES)[0] }) {
  const progressPct = Math.round((challenge.progress / challenge.total_steps) * 100);
  const isCompleted = challenge.status === "completed";

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
              <Badge variant="outline" className="text-xs">{challenge.category}</Badge>
              {isCompleted && (
                <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                  <CheckCircle2 className="size-3" /> Done
                </Badge>
              )}
            </div>
            <CardTitle className="text-base leading-snug">{challenge.title}</CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="size-4 fill-amber-500" />
              <span className="text-sm font-semibold">{challenge.xp_reward} XP</span>
            </div>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">{challenge.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {challenge.joined && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{challenge.progress}/{challenge.total_steps} steps</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="size-4 shrink-0" />
            <span>{challenge.participants} participants</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 shrink-0" />
            <span>Due {new Date(challenge.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Trophy className="size-4 shrink-0 text-amber-500" />
            <span>Badge: <span className="font-medium text-foreground">{challenge.badge_reward}</span></span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        {isCompleted ? (
          <Button variant="outline" className="w-full" disabled>
            <CheckCircle2 className="size-4 mr-2 text-primary" />
            Completed
          </Button>
        ) : challenge.joined ? (
          <Button className="w-full bg-primary hover:bg-primary/90">
            Continue Challenge
            <ChevronRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button variant="outline" className="w-full">
            Join Challenge
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ChallengeSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3 gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="flex-1 gap-3 flex flex-col">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

// Leaderboard sidebar
const MOCK_LEADERBOARD = [
  { rank: 1, name: "Ama Owusu", xp: 4820, avatar: "AO" },
  { rank: 2, name: "Kwame Asante", xp: 4315, avatar: "KA" },
  { rank: 3, name: "Zara Mensah", xp: 3980, avatar: "ZM" },
  { rank: 4, name: "Kofi Boateng", xp: 3620, avatar: "KB" },
  { rank: 5, name: "Efua Darko", xp: 3200, avatar: "ED" },
];

const rankColors = ["text-amber-500", "text-slate-400", "text-orange-600"];

export default function ChallengesPage() {
  const [tab, setTab] = useState("all");

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      try {
        const res = await api.get("/challenges");
        return res.data;
      } catch {
        return MOCK_CHALLENGES;
      }
    },
  });

  const list: typeof MOCK_CHALLENGES = challenges ?? MOCK_CHALLENGES;

  const filtered =
    tab === "all"
      ? list
      : tab === "joined"
      ? list.filter((c) => c.joined && c.status !== "completed")
      : tab === "completed"
      ? list.filter((c) => c.status === "completed")
      : list.filter((c) => !c.joined);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Complete challenges to earn XP and unlock badges.</p>
        </div>
        <Button variant="outline" size="sm" className="self-start sm:self-auto gap-2">
          <Filter className="size-4" />
          Filter
        </Button>
      </div>

      {/* XP Summary banner */}
      <Card className="bg-primary text-primary-foreground border-0">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="size-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/70">Your Total XP</p>
                <p className="text-3xl font-bold">2,300</p>
              </div>
            </div>
            <div className="sm:ml-auto flex flex-wrap gap-6 text-sm">
              <div className="text-center">
                <p className="text-white/70">Completed</p>
                <p className="text-xl font-bold">1</p>
              </div>
              <div className="text-center">
                <p className="text-white/70">In Progress</p>
                <p className="text-xl font-bold">2</p>
              </div>
              <div className="text-center">
                <p className="text-white/70">Badges Earned</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="joined">In Progress</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <ChallengeSkeleton key={i} />)}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={<Lock className="size-8 text-muted-foreground" />}
                  title="Nothing here yet"
                  description="Check back soon or explore other challenge categories."
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filtered.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Leaderboard sidebar */}
        <aside className="lg:w-64 shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                Leaderboard
              </CardTitle>
              <CardDescription className="text-xs">Top XP earners this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              {MOCK_LEADERBOARD.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-4 text-right shrink-0 ${rankColors[entry.rank - 1] ?? "text-muted-foreground"}`}>
                    {entry.rank}
                  </span>
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                    {entry.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

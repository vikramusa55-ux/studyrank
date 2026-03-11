import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Timer, Trophy, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import TasksPage from "./pages/TasksPage";
import TimerPage from "./pages/TimerPage";

export default function App() {
  const [activeTab, setActiveTab] = useState("timer");
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/assets/generated/studyrank-logo-transparent.dim_80x80.png"
              alt="StudyRank"
              className="w-9 h-9"
            />
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                Study<span className="text-accent">Rank</span>
              </span>
              <p className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:block">
                Focus. Progress. Rank up.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isInitializing ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse-ring" />
                  <span className="text-sm text-muted-foreground">
                    Connected
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="border-border hover:border-destructive hover:text-destructive text-xs"
                  data-ocid="auth.button"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                data-ocid="auth.primary_button"
              >
                {isLoggingIn ? "Connecting..." : "Sign In"}
              </Button>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-8 bg-secondary/50 border border-border p-1 h-auto gap-1">
            <TabsTrigger
              value="timer"
              className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-muted-foreground font-medium transition-all"
              data-ocid="nav.tab"
            >
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Timer</span>
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-muted-foreground font-medium transition-all"
              data-ocid="nav.tab"
            >
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-muted-foreground font-medium transition-all"
              data-ocid="nav.tab"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow text-muted-foreground font-medium transition-all"
              data-ocid="nav.tab"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer">
            <TimerPage />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksPage />
          </TabsContent>
          <TabsContent value="leaderboard">
            <LeaderboardPage />
          </TabsContent>
          <TabsContent value="profile">
            <ProfilePage />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}

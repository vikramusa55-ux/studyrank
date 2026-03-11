import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CheckSquare, Clock, Medal, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLeaderboard, useMyProfile } from "../hooks/useQueries";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-9 h-9 rounded-full rank-1 flex items-center justify-center shrink-0 shadow-glow-gold">
        <span className="font-display font-black text-sm text-white">1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-9 h-9 rounded-full rank-2 flex items-center justify-center shrink-0">
        <span className="font-display font-black text-sm text-white">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-9 h-9 rounded-full rank-3 flex items-center justify-center shrink-0">
        <span className="font-display font-black text-sm text-white">3</span>
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
      <span className="font-mono text-sm text-muted-foreground">{rank}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: leaderboard = [], isLoading } = useLeaderboard();
  const { data: myProfile } = useMyProfile();
  const { identity } = useInternetIdentity();

  // Sort by total points descending
  const sorted = [...leaderboard].sort(
    (a, b) => Number(b.totalPoints) - Number(a.totalPoints),
  );

  const myUsername = myProfile?.username;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">
            Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Updated every 30 seconds
          </p>
        </div>
      </div>

      {/* Top 3 podium */}
      {!isLoading && sorted.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          {/* 2nd place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "bg-card border rounded-xl p-4 text-center flex flex-col items-center gap-2 mt-6",
              sorted[1]?.username === myUsername
                ? "border-primary shadow-glow"
                : "border-border",
            )}
            data-ocid="leaderboard.item.2"
          >
            <div className="w-10 h-10 rounded-full rank-2 flex items-center justify-center">
              <span className="font-display font-black text-sm text-white">
                2
              </span>
            </div>
            <Medal className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground truncate w-full text-center">
              {sorted[1]?.username || "—"}
            </span>
            <span className="text-lg font-display font-bold text-foreground">
              {Number(sorted[1]?.totalPoints ?? 0)}
            </span>
            <span className="text-[10px] text-muted-foreground">points</span>
          </motion.div>

          {/* 1st place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.0 }}
            className={cn(
              "bg-card border rounded-xl p-4 text-center flex flex-col items-center gap-2 -mt-2",
              sorted[0]?.username === myUsername
                ? "border-primary shadow-glow"
                : "border-accent/40",
            )}
            data-ocid="leaderboard.item.1"
          >
            <div className="w-12 h-12 rounded-full rank-1 flex items-center justify-center shadow-glow-gold">
              <span className="font-display font-black text-base text-white">
                1
              </span>
            </div>
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-xs font-semibold text-foreground truncate w-full text-center">
              {sorted[0]?.username || "—"}
            </span>
            <span className="text-2xl font-display font-bold text-accent text-gold-gradient">
              {Number(sorted[0]?.totalPoints ?? 0)}
            </span>
            <span className="text-[10px] text-muted-foreground">points</span>
          </motion.div>

          {/* 3rd place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "bg-card border rounded-xl p-4 text-center flex flex-col items-center gap-2 mt-8",
              sorted[2]?.username === myUsername
                ? "border-primary shadow-glow"
                : "border-border",
            )}
            data-ocid="leaderboard.item.3"
          >
            <div className="w-10 h-10 rounded-full rank-3 flex items-center justify-center">
              <span className="font-display font-black text-sm text-white">
                3
              </span>
            </div>
            <Medal className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground truncate w-full text-center">
              {sorted[2]?.username || "—"}
            </span>
            <span className="text-lg font-display font-bold text-foreground">
              {Number(sorted[2]?.totalPoints ?? 0)}
            </span>
            <span className="text-[10px] text-muted-foreground">points</span>
          </motion.div>
        </div>
      )}

      {/* Full table */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="leaderboard.table"
      >
        {/* Column headers */}
        <div className="grid grid-cols-[2.5rem_1fr_auto_auto_auto] gap-2 sm:gap-4 px-4 py-2 border-b border-border bg-muted/20">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            #
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Student
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">
            Tasks
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">
            Study
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Points
          </span>
        </div>

        {isLoading && (
          <div className="p-4 space-y-3" data-ocid="leaderboard.loading_state">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <div
            className="py-16 text-center flex flex-col items-center gap-3"
            data-ocid="leaderboard.empty_state"
          >
            <Trophy className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">No students yet</p>
            <p className="text-sm text-muted-foreground/60">
              Be the first to earn points!
            </p>
          </div>
        )}

        {!isLoading &&
          sorted.map((user, idx) => {
            const rank = idx + 1;
            const isMe =
              identity && user.username === myUsername && !!myUsername;
            return (
              <motion.div
                key={user.username || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={cn(
                  "grid grid-cols-[2.5rem_1fr_auto_auto_auto] gap-2 sm:gap-4 px-4 py-3 border-b border-border/50 last:border-0 items-center transition-colors hover:bg-muted/20",
                  isMe && "bg-primary/10 hover:bg-primary/15",
                )}
                data-ocid="leaderboard.row"
              >
                <RankBadge rank={rank} />
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "font-medium truncate",
                      isMe ? "text-primary" : "text-foreground",
                    )}
                  >
                    {user.username || `Student ${idx + 1}`}
                  </span>
                  {isMe && (
                    <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold shrink-0">
                      YOU
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{Number(user.tasksCompletedToday)}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Number(user.totalStudyMinutes)}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap
                    className={cn(
                      "w-3.5 h-3.5",
                      rank <= 3 ? "text-accent" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono font-bold text-sm",
                      rank <= 3 ? "text-accent" : "text-foreground",
                    )}
                  >
                    {Number(user.totalPoints)}
                  </span>
                </div>
              </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
}

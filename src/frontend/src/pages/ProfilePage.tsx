import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  Clock,
  Edit2,
  Loader2,
  Save,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyProfile, useSetUsername } from "../hooks/useQueries";

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          accent ? "bg-accent/20" : "bg-primary/20",
        )}
      >
        <Icon
          className={cn("w-5 h-5", accent ? "text-accent" : "text-primary")}
        />
      </div>
      <div>
        <div
          className={cn(
            "text-3xl font-display font-bold",
            accent ? "text-accent" : "text-foreground",
          )}
        >
          {value}
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const { mutate: setUsername, isPending: isSaving } = useSetUsername();
  const { identity, login, loginStatus } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (profile?.username) {
      setDisplayName(profile.username);
    }
  }, [profile?.username]);

  const handleSave = () => {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    setUsername(trimmed, {
      onSuccess: () => {
        toast.success("Display name updated!");
        setEditing(false);
      },
      onError: () => toast.error("Could not update name."),
    });
  };

  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-20 flex flex-col items-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Sign in to view profile
          </h2>
          <p className="text-muted-foreground">
            Connect with Internet Identity to track your progress and compete on
            the leaderboard.
          </p>
        </div>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8"
          data-ocid="profile.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Sign In to Continue"
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto flex flex-col gap-8"
    >
      {/* Profile header */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/60 to-primary/20 border border-primary/30 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <>
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="h-8 text-lg font-display font-bold bg-muted border-border max-w-xs"
                    placeholder="Your display name"
                    autoFocus
                    data-ocid="profile.input"
                  />
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary text-primary-foreground h-8"
                    data-ocid="profile.save_button"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(false);
                      setDisplayName(profile?.username || "");
                    }}
                    className="h-8 text-muted-foreground"
                    data-ocid="profile.cancel_button"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-2xl text-foreground truncate">
                    {profile?.username || "Anonymous Student"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    data-ocid="profile.edit_button"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {identity?.getPrincipal().toString().slice(0, 20)}...
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          data-ocid="profile.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Zap}
            label="Total Points"
            value={Number(profile?.totalPoints ?? 0)}
            accent
          />
          <StatCard
            icon={Clock}
            label="Study Minutes"
            value={Number(profile?.totalStudyMinutes ?? 0)}
          />
          <StatCard
            icon={CheckSquare}
            label="Completed Today"
            value={Number(profile?.tasksCompletedToday ?? 0)}
            accent
          />
        </div>
      )}

      {/* Name setup prompt */}
      {!isLoading && !profile?.username && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-primary/10 border border-primary/30 rounded-xl p-5"
          data-ocid="profile.card"
        >
          <h3 className="font-display font-semibold text-foreground mb-1">
            Set your display name
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add a name to appear on the leaderboard and compete with others.
          </p>
          <div className="flex gap-2">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="e.g. Alex Chen"
              className="bg-card border-border h-10"
              data-ocid="profile.input"
            />
            <Button
              onClick={handleSave}
              disabled={isSaving || !displayName.trim()}
              className="bg-primary text-primary-foreground h-10 shrink-0"
              data-ocid="profile.submit_button"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Name"
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Points explanation */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          How points work
        </h3>
        <ul className="space-y-2">
          {[
            { action: "Complete a task", pts: "+10 points" },
            { action: "1 minute of study", pts: "+1 point" },
            { action: "25-min Pomodoro", pts: "+25 points" },
            { action: "60-min deep work", pts: "+60 points" },
          ].map((item) => (
            <li
              key={item.action}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{item.action}</span>
              <span className="font-mono font-bold text-accent">
                {item.pts}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Clock, Pause, Play, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLogStudySession } from "../hooks/useQueries";

const PRESETS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "60 min", seconds: 60 * 60 },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return {
    mm: String(m).padStart(2, "0"),
    ss: String(s).padStart(2, "0"),
  };
}

export default function TimerPage() {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionLogged, setSessionLogged] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { mutate: logSession, isPending: isLogging } = useLogStudySession();

  const isCountdown = !isFreeMode;
  const isComplete = isCountdown && remaining === 0;
  const displaySeconds = isCountdown ? remaining : elapsed;
  const { mm, ss } = formatTime(displaySeconds);

  const progress = isCountdown
    ? ((totalSeconds - remaining) / totalSeconds) * 100
    : Math.min((elapsed / (60 * 120)) * 100, 100);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (isCountdown) {
          setRemaining((prev) => {
            if (prev <= 1) {
              clearTimer();
              setRunning(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setElapsed((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [running, isCountdown, clearTimer]);

  useEffect(() => {
    if (isComplete && !sessionLogged) {
      const minutes = Math.floor(totalSeconds / 60);
      logSession(BigInt(minutes), {
        onSuccess: () => {
          toast.success(`Session logged! +${minutes} points earned.`, {
            description: `${minutes} minute study session recorded.`,
          });
          setSessionLogged(true);
        },
        onError: () => {
          toast.error("Could not log session. Please sign in.");
        },
      });
    }
  }, [isComplete, sessionLogged, totalSeconds, logSession]);

  const handleStart = () => {
    setRunning(true);
    setSessionLogged(false);
  };

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setSessionLogged(false);
    if (isCountdown) {
      setRemaining(totalSeconds);
    } else {
      setElapsed(0);
    }
  };

  const handlePreset = (idx: number) => {
    setSelectedPreset(idx);
    setIsFreeMode(false);
    setRunning(false);
    setSessionLogged(false);
    setTotalSeconds(PRESETS[idx].seconds);
    setRemaining(PRESETS[idx].seconds);
  };

  const handleFreeMode = () => {
    setIsFreeMode(true);
    setRunning(false);
    setSessionLogged(false);
    setElapsed(0);
  };

  const handleLogManual = () => {
    const minutes = Math.max(1, Math.floor(elapsed / 60));
    logSession(BigInt(minutes), {
      onSuccess: () => {
        toast.success(`Session logged! +${minutes} points earned.`);
        setSessionLogged(true);
        setRunning(false);
        setElapsed(0);
      },
      onError: () => toast.error("Could not log session. Please sign in."),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8"
    >
      {/* Mode selector */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {PRESETS.map((p, i) => (
          <Button
            key={p.label}
            variant={
              !isFreeMode && selectedPreset === i ? "default" : "outline"
            }
            size="sm"
            onClick={() => handlePreset(i)}
            disabled={running}
            className={cn(
              "font-mono font-medium transition-all",
              !isFreeMode && selectedPreset === i
                ? "bg-primary text-primary-foreground shadow-glow"
                : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
            )}
            data-ocid="timer.button"
          >
            {p.label}
          </Button>
        ))}
        <Button
          variant={isFreeMode ? "default" : "outline"}
          size="sm"
          onClick={handleFreeMode}
          disabled={running}
          className={cn(
            "font-medium transition-all",
            isFreeMode
              ? "bg-accent text-accent-foreground shadow-glow-gold"
              : "border-border text-muted-foreground hover:border-accent hover:text-foreground",
          )}
          data-ocid="timer.toggle"
        >
          Free Mode
        </Button>
      </div>

      {/* Timer display */}
      <div className="relative">
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          className="absolute inset-0 -rotate-90"
          aria-label="Study timer progress ring"
          role="img"
        >
          <circle
            cx="140"
            cy="140"
            r="128"
            fill="none"
            stroke="oklch(0.22 0.04 268)"
            strokeWidth="4"
          />
          <circle
            cx="140"
            cy="140"
            r="128"
            fill="none"
            stroke={isFreeMode ? "oklch(0.78 0.17 72)" : "oklch(0.58 0.19 272)"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 128}`}
            strokeDashoffset={`${2 * Math.PI * 128 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>

        <div className="w-[280px] h-[280px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <Check className="w-16 h-16 text-accent" />
                <span className="font-display font-bold text-2xl text-accent">
                  Complete!
                </span>
              </motion.div>
            ) : (
              <motion.div key="digits" className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "font-mono font-bold text-7xl sm:text-8xl tracking-tight",
                    running
                      ? isFreeMode
                        ? "timer-glow-active text-accent"
                        : "timer-glow text-foreground"
                      : "text-foreground/90",
                  )}
                >
                  {mm}
                </span>
                <span className="font-mono font-bold text-5xl sm:text-6xl text-muted-foreground animate-pulse-ring">
                  :
                </span>
                <span
                  className={cn(
                    "font-mono font-bold text-7xl sm:text-8xl tracking-tight",
                    running
                      ? isFreeMode
                        ? "timer-glow-active text-accent"
                        : "timer-glow text-foreground"
                      : "text-foreground/90",
                  )}
                >
                  {ss}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-2 flex items-center gap-1.5 text-muted-foreground text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isFreeMode ? "Free study" : running ? "Studying..." : "Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="w-12 h-12 rounded-full border-border hover:border-destructive hover:text-destructive"
          data-ocid="timer.secondary_button"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        {!running ? (
          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
            <Button
              size="lg"
              onClick={handleStart}
              disabled={isComplete}
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow text-lg font-bold"
              data-ocid="timer.primary_button"
            >
              <Play className="w-8 h-8 fill-current" />
            </Button>
          </motion.div>
        ) : (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={handlePause}
              className="w-20 h-20 rounded-full bg-secondary border border-border hover:bg-muted text-foreground text-lg font-bold"
              data-ocid="timer.primary_button"
            >
              <Pause className="w-8 h-8 fill-current" />
            </Button>
          </motion.div>
        )}

        {isFreeMode && elapsed > 0 && !running && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogManual}
            disabled={isLogging}
            className="w-12 h-12 rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            data-ocid="timer.save_button"
          >
            <Check className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-4 text-center"
          data-ocid="timer.card"
        >
          <div className="text-2xl font-mono font-bold text-accent">
            {isFreeMode
              ? Math.floor(elapsed / 60)
              : Math.floor((totalSeconds - remaining) / 60)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Min elapsed</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-4 text-center"
          data-ocid="timer.card"
        >
          <div className="text-2xl font-mono font-bold text-primary">
            {isFreeMode
              ? Math.floor(elapsed / 60)
              : Math.floor((totalSeconds - remaining) / 60)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Points earned
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-lg p-4 text-center"
          data-ocid="timer.card"
        >
          <div className="text-2xl font-mono font-bold text-foreground">
            {isFreeMode ? "\u221e" : `${Math.round(progress)}%`}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Progress</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

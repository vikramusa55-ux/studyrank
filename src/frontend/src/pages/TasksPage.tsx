import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCompleteTask,
  useCreateTask,
  useDeleteTask,
  useMyProfile,
  useTasks,
} from "../hooks/useQueries";

export default function TasksPage() {
  const [newTask, setNewTask] = useState("");
  const { data: tasks = [], isLoading } = useTasks();
  const { data: profile } = useMyProfile();
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const {
    mutate: completeTask,
    isPending: isCompleting,
    variables: completingTitle,
  } = useCompleteTask();
  const {
    mutate: deleteTask,
    isPending: isDeleting,
    variables: deletingTitle,
  } = useDeleteTask();

  const todayCompleted = Number(profile?.tasksCompletedToday ?? 0);
  const totalPoints = Number(profile?.totalPoints ?? 0);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleAdd = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    createTask(trimmed, {
      onSuccess: () => {
        setNewTask("");
        toast.success("Task added!");
      },
      onError: () => toast.error("Could not add task. Please sign in."),
    });
  };

  const handleComplete = (title: string) => {
    completeTask(title, {
      onSuccess: () =>
        toast.success("+10 points earned!", {
          description: `"${title}" completed.`,
        }),
      onError: () => toast.error("Could not complete task."),
    });
  };

  const handleDelete = (title: string) => {
    deleteTask(title, {
      onError: () => toast.error("Could not delete task."),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto flex flex-col gap-6"
    >
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-foreground">
              {todayCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Done today</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-accent">
              {totalPoints}
            </div>
            <div className="text-xs text-muted-foreground">Total points</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-foreground">
              {pendingTasks.length}
            </div>
            <div className="text-xs text-muted-foreground">Pending tasks</div>
          </div>
        </div>
      </div>

      {/* Add task input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task for today..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="bg-card border-border focus:border-primary placeholder:text-muted-foreground/60 h-11"
          data-ocid="todo.input"
        />
        <Button
          onClick={handleAdd}
          disabled={isCreating || !newTask.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-5"
          data-ocid="todo.add_button"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3" data-ocid="tasks.loading_state">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 bg-card border border-border rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading &&
        pendingTasks.length === 0 &&
        completedTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 flex flex-col items-center gap-3"
            data-ocid="tasks.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No tasks yet</p>
            <p className="text-sm text-muted-foreground/60">
              Add your first task above to start earning points
            </p>
          </motion.div>
        )}

      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Pending
          </h3>
          <ul className="space-y-2">
            <AnimatePresence>
              {pendingTasks.map((task, idx) => (
                <motion.li
                  key={task.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 hover:border-primary/40 transition-colors"
                  data-ocid={`todo.item.${idx + 1}`}
                >
                  <button
                    type="button"
                    onClick={() => handleComplete(task.title)}
                    disabled={isCompleting && completingTitle === task.title}
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    data-ocid={`todo.checkbox.${idx + 1}`}
                  >
                    {isCompleting && completingTitle === task.title ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <span className="flex-1 text-foreground font-medium truncate">
                    {task.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-accent border-accent/30 text-xs shrink-0"
                  >
                    +10 pts
                  </Badge>
                  <button
                    type="button"
                    onClick={() => handleDelete(task.title)}
                    disabled={isDeleting && deletingTitle === task.title}
                    className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    data-ocid={`todo.delete_button.${idx + 1}`}
                  >
                    {isDeleting && deletingTitle === task.title ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Completed
          </h3>
          <ul className="space-y-2">
            <AnimatePresence>
              {completedTasks.map((task, idx) => (
                <motion.li
                  key={task.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 bg-card/50 border border-border/50 rounded-lg px-4 py-3"
                  data-ocid={`todo.item.${pendingTasks.length + idx + 1}`}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span
                    className={cn(
                      "flex-1 text-muted-foreground line-through text-sm truncate",
                    )}
                  >
                    {task.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/30 text-xs shrink-0"
                  >
                    Done
                  </Badge>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </motion.div>
  );
}

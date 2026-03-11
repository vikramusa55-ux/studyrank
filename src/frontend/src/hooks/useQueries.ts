import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PublicUserProfile, Task } from "../backend";
import { TaskUpdateAction } from "../backend";
import { useActor } from "./useActor";

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicUserProfile>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<PublicUserProfile[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("No actor");
      return actor.createTask(title);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTask(title, TaskUpdateAction.complete);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTask(title, TaskUpdateAction.delete_);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useLogStudySession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (minutes: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.logStudySession(minutes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useSetUsername() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("No actor");
      return actor.setUsername(username);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

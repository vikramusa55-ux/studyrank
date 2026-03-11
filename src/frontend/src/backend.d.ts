import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    title: string;
    completed: boolean;
}
export interface PublicUserProfile {
    tasks: Array<Task>;
    username: string;
    tasksCompletedToday: bigint;
    totalStudyMinutes: bigint;
    totalPoints: bigint;
}
export enum TaskUpdateAction {
    delete_ = "delete",
    complete = "complete"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(title: string): Promise<void>;
    dailyTaskReset(): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<PublicUserProfile>>;
    getMyProfile(): Promise<PublicUserProfile>;
    getPublicUserProfile(user: Principal): Promise<PublicUserProfile>;
    getTasks(): Promise<Array<Task>>;
    isCallerAdmin(): Promise<boolean>;
    logStudySession(minutes: bigint): Promise<void>;
    setUsername(username: string): Promise<void>;
    updateTask(taskTitle: string, action: TaskUpdateAction): Promise<void>;
}

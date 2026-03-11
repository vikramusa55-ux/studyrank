# StudyRank

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Student profile with username setup
- Study timer (pomodoro-style or free timer) that logs study time
- Daily tasks manager: add, complete, and delete tasks
- Points system: completing a task earns points
- Leaderboard: ranks all students by total points, showing daily tasks completed and study time
- Persistent data stored in backend (tasks, points, study sessions, user profiles)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: User profiles, tasks (CRUD), study sessions, points tracking, leaderboard query
2. Frontend: 4 main views - Timer, Tasks, Leaderboard, Profile
3. Navigation between views
4. Timer page: start/pause/reset countdown or stopwatch, log session on stop
5. Tasks page: add daily tasks, mark complete (awards points), delete tasks
6. Leaderboard page: ranked list of all users by total points with stats
7. Profile page: set display name, view personal stats

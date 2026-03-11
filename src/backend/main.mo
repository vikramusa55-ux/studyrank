import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Task = {
    title : Text;
    completed : Bool;
  };

  module Task {
    public func compare(a : Task, b : Task) : Order.Order {
      a.title.compare(b.title);
    };
  };

  type UserProfile = {
    username : Text;
    totalPoints : Nat;
    totalStudyMinutes : Nat;
    tasksCompletedToday : Nat;
    tasks : [Task];
    lastResetTime : Int;
  };

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      switch (Nat.compare(b.totalPoints, a.totalPoints)) {
        case (#equal) { Text.compare(a.username, b.username) };
        case (order) { order };
      };
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  func needsReset(profile : UserProfile) : Bool {
    let now = Time.now();
    let oneDayNanos = 86_400_000_000_000;
    now - profile.lastResetTime >= oneDayNanos;
  };

  func resetTasks(profile : UserProfile) : UserProfile {
    {
      profile with
      tasks = profile.tasks.map(func(task) { { task with completed = false } });
      tasksCompletedToday = 0;
      lastResetTime = Time.now();
    };
  };

  public type PublicUserProfile = {
    username : Text;
    totalPoints : Nat;
    totalStudyMinutes : Nat;
    tasksCompletedToday : Nat;
    tasks : [Task];
  };

  module PublicUserProfile {
    public func compare(a : PublicUserProfile, b : PublicUserProfile) : Order.Order {
      switch (Nat.compare(b.totalPoints, a.totalPoints)) {
        case (#equal) { Text.compare(a.username, b.username) };
        case (order) { order };
      };
    };
  };

  public query ({ caller }) func getLeaderboard() : async [PublicUserProfile] {
    userProfiles.entries().toArray().map(
      func((_, profile)) {
        {
          username = profile.username;
          totalPoints = profile.totalPoints;
          totalStudyMinutes = profile.totalStudyMinutes;
          tasksCompletedToday = profile.tasksCompletedToday;
          tasks = profile.tasks;
        };
      }
    ).sort();
  };

  public query ({ caller }) func getPublicUserProfile(user : Principal) : async PublicUserProfile {
    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    {
      username = profile.username;
      totalPoints = profile.totalPoints;
      totalStudyMinutes = profile.totalStudyMinutes;
      tasksCompletedToday = profile.tasksCompletedToday;
      tasks = profile.tasks;
    };
  };

  public query ({ caller }) func getMyProfile() : async PublicUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };

    let currentProfile = if (needsReset(profile)) { resetTasks(profile) } else { profile };

    {
      username = currentProfile.username;
      totalPoints = currentProfile.totalPoints;
      totalStudyMinutes = currentProfile.totalStudyMinutes;
      tasksCompletedToday = currentProfile.tasksCompletedToday;
      tasks = currentProfile.tasks;
    };
  };

  public shared ({ caller }) func setUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their username");
    };

    let newProfile = {
      username;
      totalPoints = 0;
      totalStudyMinutes = 0;
      tasksCompletedToday = 0;
      tasks = [];
      lastResetTime = Time.now();
    };
    userProfiles.add(caller, newProfile);
  };

  public type TaskUpdateAction = { #complete; #delete };

  public shared ({ caller }) func updateTask(taskTitle : Text, action : TaskUpdateAction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };

    let currentProfile = if (needsReset(profile)) { resetTasks(profile) } else { profile };

    let (newTasks, pointsAdjustment) = switch (action) {
      case (#complete) {
        let updatedTasks = currentProfile.tasks.map(func(task) { if (task.title == taskTitle) { { task with completed = true } } else { task } });
        (updatedTasks, 10);
      };
      case (#delete) {
        let updatedTasks = currentProfile.tasks.filter(func(task) { task.title != taskTitle });
        (updatedTasks, 0);
      };
    };

    let newProfile = {
      currentProfile with
      tasks = newTasks;
      totalPoints = currentProfile.totalPoints + pointsAdjustment;
    };
    userProfiles.add(caller, newProfile);
  };

  public shared ({ caller }) func createTask(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };

    let currentProfile = if (needsReset(profile)) { resetTasks(profile) } else { profile };
    let newTask = { title; completed = false };
    let newTasks = currentProfile.tasks.concat([newTask]);
    let newProfile = { currentProfile with tasks = newTasks };
    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their tasks");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
    if (needsReset(profile)) {
      return [];
    };
    profile.tasks;
  };

  public shared ({ caller }) func logStudySession(minutes : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log study sessions");
    };

    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };

    let newProfile = {
      profile with
      totalPoints = profile.totalPoints + minutes;
      totalStudyMinutes = profile.totalStudyMinutes + minutes;
    };
    userProfiles.add(caller, newProfile);
  };

  public shared ({ caller }) func dailyTaskReset() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset tasks");
    };

    for ((user, profile) in userProfiles.entries()) {
      userProfiles.add(user, resetTasks(profile));
    };
  };
};

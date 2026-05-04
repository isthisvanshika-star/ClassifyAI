import { Role } from "@/generated/prisma";

export type AllowedDMTargets = Role[];
//imp  === DM RULES ===
export const DM_RULES: Record<Role, AllowedDMTargets> = {
  STUDENT: ["STUDENT", "TEACHER", "ASSISTANT"],
  TEACHER: ["STUDENT", "TEACHER", "ASSISTANT"],
  ASSISTANT: ["STUDENT", "TEACHER", "ASSISTANT", "ADMIN"],
  ADMIN: ["ASSISTANT"],
};

//imp  === GROUP RULES ===
export const GROUP_CREATION_ALLOWED: Role[] = [
  "STUDENT",
  "TEACHER",
  "ASSISTANT",
];

//? roles that can be used in a student-created group....
export const STUDENT_GROUP_ALLOWED_ROLES: Role[] = ["STUDENT"];

//? roles that can be in a teacher-created group....
export const TEACHER_GROUP_ALLOWED_ROLES: Role[] = ["TEACHER", "STUDENT"];

//? teacher-only group  -_-  no students/assistant/admin
export const TEACHER_ONLY_GROUP_ROLES: Role[] = ["TEACHER"];

//imp === HELPERS===
//?  can userA send a DM to userB....?
export function canDM(senderRole: Role, targetRole: Role): boolean {
  return DM_RULES[senderRole]?.includes(targetRole) ?? false;
}

//? can this role create a group....?
export function canCreateGroup(role: Role): boolean {
  return GROUP_CREATION_ALLOWED.includes(role);
}

//? given creator role and group type, which roles are allowed as members?
export function getAllowedGroupMemberRoles(
  creatorRole: Role,
  isTeacherOnlyGroup: boolean,
): Role[] {
  if (creatorRole === "STUDENT") return STUDENT_GROUP_ALLOWED_ROLES;
  if (creatorRole === "TEACHER") {
    return isTeacherOnlyGroup
      ? TEACHER_ONLY_GROUP_ROLES
      : TEACHER_GROUP_ALLOWED_ROLES;
  }
  if (creatorRole === "ASSISTANT") {
    return ["STUDENT", "TEACHER", "ASSISTANT"];
  }
  return [];
}

//? can this role join a group without invitation....?
export function canJoinGroupFreely(role: Role): boolean {
  return role === "ASSISTANT" || role === "ADMIN";
}

//? validate all participants in a group against RBAC rules....
export function validateGroupParticipants(
  creatorRole: Role,
  participantRoles: Role[],
  isTeacherOnlyGroup: boolean,
): { valid: boolean; reason?: string } {
  const allowedRoles = getAllowedGroupMemberRoles(
    creatorRole,
    isTeacherOnlyGroup,
  );

  for (const role of participantRoles) {
    if (!allowedRoles.includes(role)) {
      return {
        valid: false,
        reason: `Role ${role} is not allowed in this group type.`,
      };
    }
  }

  return { valid: true };
}

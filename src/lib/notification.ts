import { logActivity } from "./helper";
import { prisma } from "./prisma";
/**
 * Create, edit, or delete in-app notifications.
 * @param action - "create" | "edit" | "delete"
 * @param userIds - One or more user IDs to apply the notification to.
 * @param title - The notification title (for create/edit).
 * @param body - The notification message (for create/edit).
 * @param meta - Optional metadata (e.g., link).
 * @param actor - The user performing the action, e.g. { id, name }.
 */
export async function createInAppNotification(
  action: "create" | "edit" | "delete" | string,
  userIds: string | string[],
  title: string,
  body: string,
  meta?: { link: string },
  actor?: { id: string; name: string }
) {
  try {
    const userIdsArray = Array.isArray(userIds) ? userIds : [userIds];
    if (userIdsArray.length === 0) return;
    switch (action) {
      case "create": {
        if (!title || !body) {
          throw new Error(
            "Title and body are required for creating notification"
          );
        }
        const notificationData = userIdsArray.map((uid) => ({
          userId: uid,
          title,
          body,
          meta: meta || {},
        }));
        await prisma.notification.createMany({ data: notificationData });
        if (actor) {
          await logActivity(
            actor.id,
            actor.name,
            `Created ${notificationData.length} in app-notification(s)`
          );
        }
        console.log(`Created ${notificationData.length} in app notification`);
        break;
      }
      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error("Failed to create in-app notification:", error);
  }
}

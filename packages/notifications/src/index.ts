/**
 * LIFEOS Notifications Scheduling Module
 * Sprint 1: Interfaces and local notification scheduling contracts.
 */

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  triggerTimeUTC: string;
  data?: Record<string, unknown>;
}

export interface INotificationService {
  requestPermissions(): Promise<boolean>;
  scheduleReminderNotification(payload: NotificationPayload): Promise<void>;
  cancelNotification(id: string): Promise<void>;
}

export class NotificationServicePlaceholder implements INotificationService {
  async requestPermissions(): Promise<boolean> {
    return false;
  }

  async scheduleReminderNotification(_payload: NotificationPayload): Promise<void> {
    // Scheduled for future sprint
  }

  async cancelNotification(_id: string): Promise<void> {
    // Scheduled for future sprint
  }
}

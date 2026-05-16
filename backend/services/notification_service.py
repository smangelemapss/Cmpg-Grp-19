"""
Notification service.
Business logic for notification retrieval and state management.
All DB access goes through db/notification_repo.py.

B4 (Imamelengmakutoane): implement functions here. Call repo functions,
do NOT put SQL strings in this file.
"""


def get_notifications_for_user(conn, user_id):
    """Returns list of notification dicts for the given user."""
    raise NotImplementedError("notification_service.get_notifications_for_user not yet implemented")


def mark_notification_read(conn, notification_id, user_id):
    """Marks a single notification as read. Returns True if found and updated."""
    raise NotImplementedError("notification_service.mark_notification_read not yet implemented")


def mark_all_read(conn, user_id):
    """Marks all notifications for user as read."""
    raise NotImplementedError("notification_service.mark_all_read not yet implemented")


def delete_notification(conn, notification_id, user_id):
    """Deletes a notification. Returns 403 if user does not own it."""
    raise NotImplementedError("notification_service.delete_notification not yet implemented")

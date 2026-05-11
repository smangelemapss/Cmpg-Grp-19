from django.db import models


class AuditLog(models.Model):
    """
    Complete action history for POPIA compliance. Append-only log of every sensitive action:
    CREATE, READ, UPDATE, DELETE. Traceable to user, timestamp, and IP address.
    """

    class Action(models.TextChoices):
        CREATE = "CREATE", "Create"
        READ = "READ", "Read"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"

    audit_log_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        "auth_module.UserAccount",
        on_delete=models.PROTECT,
        db_column="user_id",
        related_name="audit_logs",
    )
    action = models.CharField(max_length=10, choices=Action.choices)
    table_affected = models.CharField(max_length=100)
    record_affected_id = models.BigIntegerField()
    log_timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = "AUDIT_LOG"
        indexes = [
            models.Index(fields=["log_timestamp"], name="AUDIT_LOG_log_timestamp_idx"),
            models.Index(fields=["user_id"], name="AUDIT_LOG_user_id_idx"),
        ]

    def __str__(self) -> str:
        return f"AuditLog {self.audit_log_id} — {self.action} on {self.table_affected} (user={self.user_id}, time={self.log_timestamp})"

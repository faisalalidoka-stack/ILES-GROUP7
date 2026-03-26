"""Django models for the internship app.

This file intentionally stays small and descriptive:
- `User` extends Django's built-in user to add a `role`.
- `WeeklyLog` captures what a student did each week plus a workflow `status`.

Tip: Prefer docstrings and small inline comments here; put non-trivial business
logic in services/helpers to keep models easy to reason about.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser

from .constants import ROLE_CHOICES, LOG_STATUSES


class User(AbstractUser):
    """Custom user model.

    We add a `role` field to the standard Django user so the rest of the app can
    branch behavior (permissions, dashboards, workflows) based on user type.
    """

    # High-level user type used throughout the app (e.g., STUDENT/COMPANY/ADMIN).
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="STUDENT")

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"


class WeeklyLog(models.Model):
    """A single weekly internship log entry.

    Records what a student worked on in a given week and where that log is in the
    review/approval workflow.
    """

    # Which student this log belongs to.
    student = models.ForeignKey(User, on_delete=models.CASCADE)

    # Week number within the internship period (e.g., 1..12).
    week = models.IntegerField()

    # Free-form summary of tasks completed this week.
    tasks = models.TextField()

    # Workflow status (e.g., Draft/Submitted/Approved depending on `LOG_STATUSES`).
    status = models.CharField(max_length=20, choices=LOG_STATUSES, default="Draft")

    def __str__(self) -> str:
        return f"Week {self.week} - {self.student.username} ({self.status})"

"""internship.constants

Shared constants (choices + allowed status transitions) used across the internship backend.

Conventions
- These *_CHOICES / *_STATUSES lists are intended for Django model fields and forms via choices=... .
- Each tuple is (stored_value, human_readable_label).
- VALID_*_TRANSITIONS dicts implement a lightweight finite-state machine (FSM):
  the key is the current status and the value is the list of allowed next statuses.
  Any transition not listed should be treated as invalid.

Keep this file as the single source of truth for status/role vocabulary so models, services, and views stay consistent.
"""

# ---------------------------------------------------------------------------
# User roles
# ---------------------------------------------------------------------------

# Role values used for user accounts and permissions.
ROLE_CHOICES = [
    ("STUDENT", "Student"),
    ("WORKPLACE_SUPERVISOR", "Workplace Supervisor"),
    ("ACADEMIC_SUPERVISOR", "Academic Supervisor"),
    ("INTERNSHIP_ADMIN", "Internship Admin"),
]

#thse are the log steps that a submitted log follows

LOG_STATUSES = [
    ('Draft','Draft'),
    ('Submitted','Submitted'),
    ('Approved','Approved'),
    ('Rejected','Rejected'),

]

#these are the steps that a placement for a student follows
PLACEMENT_STATUSES = [
    ('Pending', 'Pending'),
    ('Active','Active'),
    ('Rejected','Rejected'),
    ('Completed','Completed'),
]


#thses are the valid transitions for the weekly log transitions not here arent allowed
VALID_LOG_TRANSITIONS = {

    "Draft": ["Submitted"],
    "Submitted": ["Approved", "Rejected"],
    "Rejected": ["Submitted"],
    "Approved": []
}

EVAL_STATUSES = [
    ('Draft', 'Draft'),
    ('Submitted', 'Submitted'),
    ('Reviewed', 'Reviewed'),
]

VALID_EVAL_TRANSITIONS = {
    "Draft": ["Submitted"],
    "Submitted": ["Reviewed"],
    "Reviewed": []
}


VALID_PLACEMENT_TRANSITIONS = {
    "Pending": ["Active", "Rejected"],
    "Active": ["Completed"],
    "Rejected": [],
    "Completed": []
}

#these are the rules for our system
#Everything else (models,services and views) will all follow this
ROLE_CHOICES = [
    ('STUDENT', 'Student'),
    ('WORKPLACE_SUPERVISOR', 'Workplace Supervisor'),
    ('ACADEMIC_SUPERVISOR', 'Academic Supervisor'),
    ('INTERNSHIP_ADMIN','Internship Admin'),
]

LOG_STATUSES = [
    ('Draft','Draft'),
    ('Submitted','Submitted'),
    ('Approved','Approved'),
    ('Rejected','Rejected'),

]

PLACEMENT_STATUSES = [
    ('Pending', 'Pending'),
    ('Active','Active'),
    ('Rejected','Rejected'),
    ('Completed','Completed'),
]


VALID_LOG_TRANSITIONS = {

    "Draft": ["Submitted"],
    "Submitted": ["Approved", "Rejected"],
    "Rejected": ["Draft"],
    "Approved": []
}
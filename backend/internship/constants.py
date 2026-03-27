#these are the rules for our system
#Everything else (models,services and views) will all follow this

#first the role choices for the users
ROLE_CHOICES = [
    ('STUDENT', 'Student'),
    ('WORKPLACE_SUPERVISOR', 'Workplace Supervisor'),
    ('ACADEMIC_SUPERVISOR', 'Academic Supervisor'),
    ('INTERNSHIP_ADMIN','Internship Admin'),
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
    "Rejected": ["Draft"],
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
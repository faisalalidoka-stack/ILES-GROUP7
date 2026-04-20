from django.test import TestCase
from .models import User, placement, WeeklyLog, EvaluationForm
from .models import InvalidStateError
from .permissions import IsStudentOnly, IsWorkplaceSupervisorOnly, IsAcademicSupervisorOnly

# Creating your tests here.
class WeeklyLogTransitionTests(TestCase):
    def setUp(self):
        #creating a user
        self.student =User.objects.create_user(username='student1',password='pass123', role='STUDENT')
        self.placement = Placement.objects.create(studnet=self.student, company_name='Tech Co')
        self.log = WeeklyLog.objects.create(student=self.student, placement=sellf.placement, week=1, tasks='Task A', hours=8)
        
    def test_draft_to_submitted_is_valid(self):
        self.log.change_status('SUBMITTED')
        self.assertEqual(self.log.status, 'Submitted')
        
    def test_rejected_to_submitted_is_valid(self):
        #Bug #5 fix - rejected logs can be resubmitted
        self.log.change_status('SUBMITTED')
        self.log.change_status('REJECTED')
        self.log.change_status('SUBMITTED')#must succeed
        self.assertEqual(self.log.status, 'Submitted')
        
    def test_rejected_to_draft_is_invalid(self):
        self.log.change_status('Submitted')
        self.log.change_status('Rejected')
        with self.assertRaises(InvalidStateError):
            self.log.change_status('Draft')# must fail 
            
    def test_approved_log_cannot_change(self):
        self.log.change_status('Submitted')
        self.log.change_status('Approved')
        with self.assertRaises(InvalidStateError):
            self.log.change_status('Rejected')# approved as final
            
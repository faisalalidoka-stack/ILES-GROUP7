from django.test import TestCase
from .models import User, Placement, WeeklyLog, EvaluationForm, InavlidStateError, FinalGrade
from .models import InvalidStateError,EvaluationForm,EvaluationForm, FinalGrade
from .permissions import IsStudentOnly, IsWorkplaceSupervisorOnly, IsAcademicSupervisorOnly
from rest_framework.test import APIClient

# Creating your tests here.

class PlacementTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
        username = 'std2', email ='std2@test.com',
        password = 'pass123', role ='STUDENT')
        self.supervisor = User.objects.create_user(
            username='sup2', email='sup2@test.com',
            password= 'pass123', role='WORKPLACE_SUPERVISOR'
        )
        self.academic = User.objects.create_user(
            username='acad2', email='acad2@test.com',
            password='pass123', role='ACADEMIC_SUPERVISOR'
        )

    def test_placement_pending_to_active(self):
        placement = Placement.objects.create(
            student = self.student,
            workplace_supervisor = self.supervisor,
            company_name='TechCorp'

        )
        self.assertEqual(placement.status, 'Pending')
        placement.change_status('Active')
        self.assertEqual(placement.status, 'Active')

    def test_evaluation_draft_to_sumitted(self):
        placement = Placement.objects.create(
            student=self.student, company_name='EvalCo'

        )
        ev = EvaluationForm.objects.create(
            placement=placement, submitted_by=self.supervisor,
            technical_skills=8, communication_skills=7, punctuality=9
        )
        self.assertEqual(ev.status, 'Draft')
        ev.change_status('Submitted')
        self.assertEqual(ev.status,'Submitted')

    def test_grade_weighted_formula(self):
        placement = Placement.objects.create(
            student=self.student, company_name='GradeCo'
        )

        ev = EvaluationForm.objects.create(
            placement=placement, submitted_by=self.supervisor,  
            technical_skills=10, communication_skills=10, punctuality=10,
            status ='Submitted')
        
        grade = FinalGrade.objects.create(
            placement=placement, computed_by=self.academic)
        
        #this is our formula (10*4) + (10*3) + (10*3) =100
        self.assertEqual(grade.grade, 100)
        self.assertEqual(grade.letter_grade, 'A')

    def test_completed_placement_cannot_change(self):
        placement = Placement.objects.create(
            student=self.student, comapany_name='DoneCo', status='Completed'
        )
        with self.assertRaises(InvalidStateError):
            placement.change_status('Active')# must fail since completed is final state

    def test_login_returns_token(self):
        client = ApiClient()
        response = client.post('/api/login/', {'username': 'std2', 'password': 'pass123'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)

    def test_admin_sees_all_placements(self):
        admin = User.objects.create_user(
            username='adm', email='adm@test.com',
            password='pass123', role='INTERNSHIP_ADMIN'

        )    
        Placement.objects.create(student=self.student, company_name='Co1')
        Placement.objects.create(student=self.student, company_name='Co2')
        client = APIClient()
        client.force_authenticate(user=admin)
        response = client.get('/placements/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 2)



    






class WeeklyLogTransitionTests(TestCase):
    def setUp(self):
        #creating a user
        self.student =User.objects.create_user(username='student1',password='pass123', role='STUDENT')
        self.placement = Placement.objects.create(student=self.student, company_name='Tech Co')
        self.log = WeeklyLog.objects.create(student=self.student, placement=self.placement, week=1, description='Task A', hours=8)
        
    def test_draft_to_submitted_is_valid(self):
        self.log.change_status('Submitted')
        self.assertEqual(self.log.status, 'Submitted')
        
    def test_rejected_to_submitted_is_valid(self):
        #Bug #5 fix - rejected logs can be resubmitted
        self.log.change_status('Submitted')
        self.log.change_status('Rejected')
        self.log.change_status('Submitted')#must succeed
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
            
# Internship Logging & Evaluation System (ILES)

## 1. Problem Statement
Many universities still manage internship monitoring and evaluation using manual methods such as paper logbooks, emails, or spreadsheets. This makes it difficult to track student activities, ensure timely supervisor feedback, and maintain transparency in the evaluation process. As a result, administrators and supervisors struggle to efficiently monitor student progress and manage internship records.
To solve this problem, the Internship Logging & Evaluation System (ILES) will provide a centralized web-based platform where students can submit weekly internship logs, supervisors can review and comment on them, and academic staff can evaluate performance. The system will improve monitoring, streamline the evaluation process, and provide dashboards for better internship management.

## 3. Users->User-Stories
This system will have 4 major/core roles
- Student Intern
- Workplace Supervisor
- Academic Supervisor
- Internship Administrator

    ## USER-STORIES
1. Student Intern

## USER STORIES FOR STUDENT INTERN

- As a student, I want to register/login to the system so that I can access my internship dashboard
- As a student, I want to submit my internship placement details so that the coordinator can approve my placement
- As a student, I want to create weekly log entries in draft mode so that I can save my progress before final submission
- As a student, I want to submit my weekly log for supervisor review so that my progress can be evaluated
- As a student, I want to view feedback comments from my industry supervisor so that I can improve my performance
- As a student, I want to edit and resubmit rejected logs with corrections so that my supervisor can approve them
- As a student, I want to view my submitted logs history so that I can track my progress throughout the internship
- As a student, I want to receive notifications when my log is approved, rejected, or when deadlines approach
- As a student, I want to view my final weighted scores and feedback after evaluation so that I know my performance outcome
- As a student, I want to upload supporting documents/images with my weekly logs so that I can provide evidence of my work
- As a student, I want to be prevented from submitting logs after the deadline so that I follow the internship rules

## The Internship Administrator user stories

Supervisor Assignment
As an internship administrator, I want to assign workplace supervisors to student interns so that each student is properly monitored during their internship.

Manage Internship Records
As an internship administrator, I want to create and manage internship records for students so that internship information is organized and accessible.

Monitor Internship Activities
As an internship administrator, I want to monitor internship activities and submissions so that I can ensure all interns are actively participating.

## The Internship Administrator user stories

Supervisor Assignment
As an internship administrator, I want to assign workplace supervisors to student interns so that each student is properly monitored during their internship.

Manage Internship Records
As an internship administrator, I want to create and manage internship records for students so that internship information is organized and accessible.

Monitor Internship Activities
As an internship administrator, I want to monitor internship activities and submissions so that I can ensure all interns are actively participating.



2. Workplace Supervisor
 - As a workplace supervisor, i want to view the list of assigned interns so thst i can know which students i am supervising.
 - As a workplace supervisor, i want to review weekly internship logs so that i can monitor the intern's activities and progress.
 - As a workplace supervisor, i want to approve or reject weekly logs so that interns can correct mkstakes if necessary.
 - As a workplace supervisor, i want to provide feedback on intern reports so that students can improve their work performance.
 - As a workplace supervisor, i want t0 complete the intern evaluation form so that the university can access the student's performance.
 - As a workplace supervisor, i want to update the status of the intern evaluation so that the evaluation process can be tracked.
3. Academic Supervisor
3. Academic Supervisor
### User Stories
- As an academic supervisor, I want to view all students under my supervision so that I can track their internship progress.
- As an academic supervisor, I want to review industry supervisor scores and comments so that I have context for my evaluation.
- As an academic supervisor, I want to assign academic scores based on learning outcomes so that the final grade can be computed.
- As an academic supervisor, I want to add final remarks and feedback for each student so that they understand their performance.
- As an academic supervisor, I want to flag students who are not submitting logs consistently so that I can intervene.
- As an academic supervisor, I want to view aggregated reports of my students performance so that I can identify trends.
- As an academic supervisor, I want to be notified when all industry evaluations are complete so that I can begin my evaluation.

### Functional Requirements
- The system shall display a list of all students assigned to the academic supervisor.
- The system shall allow the academic supervisor to view industry supervisor scores and comments for each student.
- The system shall allow the academic supervisor to assign academic scores based on predefined learning outcomes.
- The system shall allow the academic supervisor to add written remarks and feedback for each student.
- The system shall allow the academic supervisor to flag students with inconsistent log submissions.
- The system shall provide aggregated performance reports for all supervised students.
- The system shall send a notification to the academic supervisor when all industry evaluations are completed.


4. Internship Administrator


## 4. Requirements
   ## Functional Requirements
## Functional Requirements

### Student Intern
- The system shall support registration and login for all user roles
- The system shall implement role-based access control where users can only access features permitted for their role
- The system shall support password reset functionality via email
- The system shall allow students to submit internship placement details (company name, address, start date, end date, supervisor name/email)
- The system shall allow students to change their profile picture
- The system shall allow students to create weekly log entries with fields: week number, date, tasks completed, hours worked, skills learned, challenges, attachments
- The system shall allow students to save as drafts without submitting for review
- The system shall allow students to submit draft logs for supervisor review, changing state to 'Submitted'
- The system shall maintain log states: Draft, Submitted, Rejected, Approved
- The system shall notify the industry supervisor when a new log is submitted for their review
- The system shall enforce valid state transitions: Draft->Submitted, Submitted->Approved, Submitted->Rejected, Rejected->Submitted
- The system shall allow students to edit and resubmit rejected logs (Rejected->Submitted)
- The system shall allow students to view all their logs with their current status
- The system shall send reminder notifications to students 24 hours before log submission deadlines
- The system shall change placement status from 'Pending' to 'Active' upon approval, and to 'Completed' after end date

### Workplace Supervisor
- The system shall allow workplace supervisors to view a list of interns assigned to them.
- The system shall allow workplace supervisors to access and review weekly internship logs submitted by interns.
- The system shall allow workplace supervisors to approve or reject submitted weekly internship logs.
- The system shall allow workplace supervisors to provide comments or feedback on intern reports and logs.
- The system shall allow workplace supervisors to complete and submit intern evaluation forms.
- The system shall allow workplace supervisors to update the evaluation status (e.g., draft, submitted, reviewed, approved, rejected).

### Internship Administrator
- The system shall allow the internship administrator to assign workplace supervisors to student interns.
- The system shall allow the internship administrator to create, update, and manage internship records for students.
- The system shall allow the internship administrator to view and monitor internship activities and student submissions.





## Their functional Requirements

The system shall allow the internship administrator to assign workplace supervisors to student interns.

The system shall allow the internship administrator to create, update, and manage internship records for students.

The system shall allow the internship administrator to view and monitor internship activities and student submissions.


## Non Functional Requirements
These decribe how the system should perform
1. Security
* The systemm shall enforce authentication and authorization
* Sensitive data shall be protected using secure APIs
* Only authorized users can access specific modules
2. Performance
* The system should support multiple users simultaneously.
* API responses should be fast and efficient
3. Reliability
* The system should ensure data consistency
* The system should prevent duplicate or conflicting records
4. Usability
* The system shall have an intuitive web interface
* The interface should support easy navigation for all roles.
5. Scalability
* The system should be able to support more students and supervisors in the future
6. Maintainability
* Code should follow clean architecture and modular design
* The system should allow future feature additions

## 5. System Modules
- User Management
- Internship Placement
- Weekly Logbooks
- Supervisor Reviews
- Academic Evaluation
- Dashboards & Reports

## 6. Data Models


## 7. Technology Stack
Backend: Django  
Frontend: React  
Database: PostgreSQL  
Version Control: Git


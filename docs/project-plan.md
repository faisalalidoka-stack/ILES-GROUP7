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



2. Workplace Supervisor
3. Academic Supervisor
4. Internship Administrator


## 4. Requirements
   ## Functional Requirements
   1. ## REQUIREMENTS FOR STUDENT INTERN

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





## Their functional Requirements

The system shall allow the internship administrator to assign workplace supervisors to student interns.

The system shall allow the internship administrator to create, update, and manage internship records for students.

The system shall allow the internship administrator to view and monitor internship activities and student submissions.


   ## Non Functional Requirements   

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

# PROJECT PLAN - STUDENT INTERNSHIP SYSTEM

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

## REQUIREMENTS FOR STUDENT INTERN

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

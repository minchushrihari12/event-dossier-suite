# Event Dossier Suite

Build a modern, responsive college Event Management and Documentation web application called:

"EventFlow 360"

Tagline:

"From Proposal to Final Dossier"

The application manages the complete lifecycle of institutional events:

Proposal → Budget Planning → Approval → Event Execution → Expense Tracking → Post-Event Documentation → Feedback → Press Coverage → Final Event Dossier

This is a working MVP, not just a UI prototype. Build functional CRUD operations, role-based access, filtering, status workflows, file uploads, dashboards, and dossier generation.

==================================================

1. USER ROLES

==================================================

Create three roles:

1. FACULTY / ORGANIZER

2. DEAN / HOD

3. ADMIN

Demo login should allow easy switching between these roles for hackathon demonstration.

FACULTY / ORGANIZER can:

- Create event proposals

- Edit draft events

- Add event metadata

- Add budget and budget breakdown

- Upload poster/brochure

- Submit event for approval

- View approval status

- View approver comments

- Add post-event report

- Upload normal photographs

- Upload geo-tagged photographs

- Add feedback summary

- Add press/news clippings

- Record actual expenses

- Generate final Event Dossier

DEAN / HOD can:

- View events awaiting approval

- Open complete proposal

- Review event details and budget

- Add comments

- Approve or reject events

- See approval timestamp

- View completed events

ADMIN can:

- View all events

- Search and filter events

- View event analytics

- View all departments/programs

- Monitor documentation completion

- Generate/view Event Dossiers

==================================================

2. EVENT LIFECYCLE

==================================================

Implement the following state machine:

DRAFT

↓

PENDING APPROVAL

↓

APPROVED

↓

COMPLETED

Also support:

PENDING APPROVAL → REJECTED

Only an approved event can be marked as completed.

Display status clearly using badges:

Draft = gray

Pending Approval = orange

Approved = green

Rejected = red

Completed = blue

Show a visual timeline on every event page:

Proposal Created

→ Submitted for Approval

→ Approved/Rejected

→ Event Conducted

→ Report Uploaded

→ Evidence Uploaded

→ Dossier Generated

==================================================

3. EVENT CREATION

==================================================

Create an "Create Event Proposal" form.

Required fields:

- Event Title

- Event Description

- Event Type / Category

- Event Date

- Venue

- Department

- Program

- Academic Year

- Semester

- Expected Number of Participants

- Event Coordinator

- Budget

- Poster/Brochure upload

Event types can include:

- Workshop

- Seminar

- Conference

- Cultural Event

- Sports Event

- Guest Lecture

- Hackathon

- FDP

- Awareness Program

- Other

Allow saving as Draft.

==================================================

4. SMART BUDGET MODULE

==================================================

Budget is an important part of the proposal.

Allow organizers to enter:

Total Planned Budget

Then create a line-item budget breakdown.

Example:

Venue

Food

Guest / Speaker

Travel

Printing

Equipment

Decoration

Marketing

Other

Each budget item should have:

- Category

- Description

- Planned Amount

Automatically calculate:

Total Planned Budget

After the event, allow entering actual expenses.

Each expense should contain:

- Expense Category

- Description

- Planned Amount

- Actual Amount

- Expense Date

- Receipt upload

Automatically calculate:

Total Planned

Total Actual

Difference

Budget Utilization %

Show:

GREEN = Under Budget

RED = Over Budget

Create a Planned vs Actual Budget chart.

Example:

Planned: ₹50,000

Actual: ₹47,500

Savings: ₹2,500

==================================================

5. APPROVAL WORKFLOW

==================================================

Faculty submits a draft.

Status changes:

DRAFT → PENDING APPROVAL

Dean/HOD dashboard should show:

"Awaiting My Approval"

Each approval card should show:

Event Name

Organizer

Department

Date

Venue

Budget

Submitted Date

Current Status

Dean/HOD can:

[Approve]

[Reject]

[Add Comment]

When approved:

Status = APPROVED

Store:

Approver Name

Approver Role

Approval Comment

Approval Timestamp

When rejected:

Status = REJECTED

Store rejection comment and timestamp.

==================================================

6. EVENT DASHBOARD

==================================================

Create a beautiful dashboard.

Top cards:

Total Events

Draft

Pending Approval

Approved

Completed

Rejected

Budget cards:

Total Planned Budget

Total Actual Expense

Total Savings

Over-budget Events

Create charts:

Events by Status

Events by Department

Events by Event Type

Monthly Events

Planned vs Actual Budget

Create a "My Tasks" section:

Awaiting My Approval

Incomplete Documentation

Upcoming Events

Recently Completed Events

==================================================

7. EVENT DETAILS / EVENT 360 PAGE

==================================================

When clicking an event, open a complete Event 360 page.

Use tabs:

Overview

Proposal

Budget

Approval

Execution

Post-Event Report

Photos

Feedback

Press Coverage

Dossier

At the top show:

Event Name

Date

Venue

Department

Organizer

Status

Also show a visual progress tracker.

Example:

Proposal ✓

Budget ✓

Approval ✓

Event ✓

Report ✓

Photos ✓

Feedback ✓

Press ✓

Dossier ✓

==================================================

8. POST-EVENT REPORT

==================================================

After an event is completed, the organizer can submit:

- Event Description

- Outcomes Achieved

- Number of Participants

- Key Highlights

- Achievements

- Challenges

- Conclusion

Allow editing until final submission.

==================================================

9. PHOTO MANAGEMENT

==================================================

Allow uploading multiple photographs.

Support two types:

1. Normal Photograph

2. Geo-tagged Photograph

For geo-tagged photos store:

Latitude

Longitude

Upload Date

Caption

Display geo-tagged photos with a small map/location indicator.

Create a beautiful photo gallery.

Photo cards should show:

Image

Caption

Photo Type

Location if available

==================================================

10. FEEDBACK MODULE

==================================================

Allow storing feedback information.

Support:

- Number of responses

- Average rating

- Satisfaction percentage

- Feedback summary

- Uploaded feedback report

Display feedback analytics using charts.

Example:

Overall Rating: 4.6 / 5

Content: 4.7

Organization: 4.5

Venue: 4.4

Experience: 4.8

==================================================

11. PRESS / NEWS MODULE

==================================================

Allow organizers to upload:

- Newspaper clipping

- Magazine clipping

- Press report

- News article

- External news link

Each item should contain:

Title

Source

Publication Date

Link or uploaded file

Show these inside the event's Press Coverage section.

==================================================

12. DOCUMENTATION COMPLETION TRACKER

==================================================

This is one of the most important features.

For every event show a Documentation Checklist:

✓ Proposal

✓ Poster

✓ Approval

✓ Budget

✓ Post-event Report

✓ Normal Photos

✓ Geo-tagged Photos

✓ Feedback

✓ Press Clipping

✓ Actual Expenses

Calculate:

Documentation Completion %

Example:

Documentation Complete: 80%

Progress bar:

████████████████░░░░

If required documentation is missing, show:

"Documentation Incomplete"

List exactly what is missing.

If everything is complete:

"✓ Documentation Complete"

Enable:

[Generate Event Dossier]

==================================================

13. EVENT DOSSIER BUILDER

==================================================

This is the main unique feature.

Create a "Generate Event Dossier" button.

The system should generate a professional printable web/PDF dossier containing:

1. College / Institution Name

2. Event Title

3. Event Metadata

4. Event Description

5. Event Proposal

6. Event Poster

7. Approval Details

8. Approval Timestamp

9. Approver Comments

10. Budget Summary

11. Budget Breakdown

12. Planned vs Actual Expenses

13. Post-Event Report

14. Outcomes Achieved

15. Participant Count

16. Photo Gallery

17. Geo-tagged Photos

18. Feedback Metrics

19. Feedback Summary

20. Press / News Clippings

21. Final Event Summary

Give the dossier a professional institutional document design.

Include:

Header

Footer

Page numbers

College logo placeholder

Event title

Academic year

Generated date

Provide buttons:

[Preview Dossier]

[Generate PDF]

==================================================

14. SEARCH AND FILTER

==================================================

Create a global event search.

Search by:

Event Name

Organizer

Department

Program

Event Type

Venue

Filters:

Academic Year

Semester

Status

Department

Event Type

Date Range

Budget Range

Allow sorting:

Newest

Oldest

Highest Budget

Lowest Budget

==================================================

15. DATABASE STRUCTURE

==================================================

Create a relational database.

Main entities:

Users

Institution

Department

Program

AcademicYear

Semester

Events

EventBudgetItems

EventExpenses

EventApprovals

EventReports

EventPhotos

EventFeedback

EventPressClippings

EventDossiers

Relationships:

Department → Programs

Department → Events

Program → Events

Event → Budget Items

Event → Expenses

Event → Approvals

Event → Report

Event → Photos

Event → Feedback

Event → Press Clippings

Event → Dossier

Do not duplicate department or program information unnecessarily.

Use foreign keys.

==================================================

16. UI DESIGN

==================================================

Make the application look like a professional modern college administration product.

Design style:

Clean

Modern

Professional

Responsive

Desktop + tablet + mobile

Use:

- Sidebar navigation

- Top navigation

- Cards

- Tables

- Status badges

- Progress bars

- Charts

- Timeline

- Tabs

- Modal forms

- Toast notifications

Main navigation:

Dashboard

Events

My Events

Approvals

Budget

Documentation

Reports

Event Dossiers

Settings

Use a polished blue/indigo academic theme with neutral backgrounds.

==================================================

17. DASHBOARD ROLE BEHAVIOR

==================================================

Faculty dashboard:

My Events

Drafts

Pending Approval

Upcoming Events

Incomplete Documentation

Recent Dossiers

Dean/HOD dashboard:

Awaiting My Approval

Approved Events

Rejected Events

Upcoming Events

Budget Overview

Admin dashboard:

All Events

Event Statistics

Department Statistics

Budget Analytics

Documentation Completion

Dossier Repository

==================================================

18. DEMO DATA

==================================================

Create at least 5 demo events mapped to different lifecycle stages:

1. Draft

2. Pending Dean Approval

3. Approved / Waiting to be Conducted

4. Completed

5. Completed with full documentation

Completed events should contain:

Post-event report

Photos

Geo-tagged photos

Feedback

Press clipping

Budget

Actual expenses

Use realistic college event names such as:

AI & Machine Learning Workshop

National Hackathon 2026

Faculty Development Program

Annual Cultural Fest

Cyber Security Awareness Seminar

==================================================

19. HACKATHON DEMO FLOW

==================================================

Make this exact demo possible:

1. Login as Faculty

2. Create a new Workshop proposal

3. Add event details

4. Add ₹50,000 budget

5. Add detailed budget breakdown

6. Save as Draft

7. Submit for Dean approval

8. Switch to Dean role

9. Open "Awaiting My Approval"

10. Review proposal and budget

11. Add approval comment

12. Approve the event

13. Switch back to Faculty

14. Mark event as conducted

15. Upload post-event report

16. Upload normal photos

17. Upload geo-tagged photos

18. Add feedback metrics

19. Add press clipping

20. Enter actual expenses

21. Show Planned vs Actual budget

22. Show documentation completion

23. Click "Generate Event Dossier"

24. Preview the complete dossier

25. Generate printable PDF

==================================================

20. IMPORTANT

==================================================

Do not build only static pages.

All important buttons should work.

Create functional:

- CRUD

- Forms

- Search

- Filters

- Role switching

- Approval workflow

- Budget calculations

- File uploads

- Documentation tracking

- Dashboard statistics

- Dossier generation

Prioritize a polished working MVP over unnecessary features.

The application should clearly demonstrate:

CREATE → VIEW → SEARCH/FILTER → UPDATE → REPORT/INSIGHT

The most impressive feature should be:

"One event → complete lifecycle → one consolidated Event Dossier."

Build the application with clean reusable components, clear database relationships, validation, error handling, loading states, empty states, and responsive design.create a login page for three different roles Organizer, Dean/HOD and Accreditation Officer and each serves a different purpose when logged in as an organizer their page would contain - Create event proposals

- Edit draft events

- Add event metadata

- Add budget and budget breakdown

- Upload poster/brochure

- Submit event for approval

- View approval status

- View approver comments

- Add post-event report

- Upload normal photographs

- Upload geo-tagged photographs

- Add feedback summary

- Add press/news clippings

- Record actual expenses

- Generate final Event Dossier

when logged in as a Dean/HOD their page would include- View events awaiting approval

- Open complete proposal

- Review event details and budget

- Add comments

- Approve or reject events

- See approval timestamp

- View completed events

when logged in as a accredential officer their page should includeAll Events

Event-wise evidence

Proposal & approval records

Budget & expense records

Post-event reports

Photographs / geo-tagged photos

Feedback reports

Press/news clippings

Event Dossiers

Documentation completion

Verification status

Academic year

Department

Responsible faculty/organizer

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2868bf38-3e92-4597-9b48-5fbf8a2b8a0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

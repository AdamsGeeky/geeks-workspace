# GeekInk Workspace PRD
## Community-First Learning Operating System

---

# 1. Product Overview

## Product Name

GeekInk Workspace

## Product Vision

GeekInk Workspace is a lightweight, community-first digital workspace designed to organize communication, mentorship, assignments, announcements, and student progress across the GeekInk ecosystem.

It is not a traditional LMS.

It is a builder-focused operating system that enables students, mentors, and admins to collaborate, learn, ship projects, and grow inside a human-centered learning environment.

## Mission

Build a simple, scalable, mobile-first platform that preserves the human interaction and culture students already value inside GeekInk.

---

# 2. Problem Statement

Current tools like Google Classroom  
and Moodle  
create several problems:

- Subscription costs increase over time
- Poor ownership of platform and data
- Weak community experience
- Complex UX for students
- Limited customization
- Weak integration with developer workflows
- Poor mentor/student interaction systems
- Difficult scalability for GeekInk’s culture-driven approach

GeekInk needs a centralized workspace that:

- keeps communication organized
- supports mentorship
- manages announcements and assignments
- works across web and mobile
- maintains simplicity
- scales with community growth

---

# 3. Goals

## Primary Goals

### G1 — Centralize Communication

Provide a single platform for:

- announcements
- updates
- discussions
- mentorship communication

### G2 — Improve Student Engagement

Increase:

- assignment completion
- community participation
- mentor interaction
- accountability

### G3 — Mobile-First Experience

Ensure students can:

- receive announcements instantly
- interact from mobile devices
- stay connected to cohorts and mentors

### G4 — Maintain Simplicity

Avoid the complexity of traditional LMS systems.

The product should feel:

- fast
- lightweight
- modern
- human
- community-driven

---

# 4. Non-Goals

The platform will NOT initially include:

- advanced grading systems
- quiz engines
- SCORM support
- enterprise LMS features
- video conferencing infrastructure
- complex academic administration
- AI-generated grading
- microservice architecture

---

# 5. Target Users

## Students

Need:

- announcements
- assignments
- resources
- mentor feedback
- progress visibility
- recognition

## Mentors

Need:

- communication tools
- assignment review
- student tracking
- cohort visibility
- announcements

## Admins

Need:

- user management
- cohort management
- platform oversight
- analytics
- moderation tools

---

# 6. Core Features

## 6.1 Authentication & Identity

### Features

- Email/password authentication
- Social login (future)
- JWT authentication
- Role-based access control

### Roles

- Student
- Mentor
- Admin

---

## 6.2 Announcements System

### Features

- Admin/mentor announcements
- Cohort-specific announcements
- Global announcements
- Push notifications
- Read/unread state

### Mobile Priority

This is a core mobile feature.

---

## 6.3 Assignment System

### Features

- Create assignments
- Add instructions/resources
- Submission deadlines
- GitHub link submission
- File submission
- Mentor feedback
- Submission status tracking

### Assignment States

- Draft
- Published
- Submitted
- Under Review
- Completed

---

## 6.4 Materials & Resources

### Features

- Upload documents
- Share links
- Organize by cohort/module
- Download resources

---

## 6.5 Community Feed

### Features

- Student posts
- Project sharing
- Reactions
- Comments
- Mentor highlights
- Achievement sharing

### Purpose

Increase visibility and engagement.

---

## 6.6 Notifications

### Features

- Mobile push notifications
- In-app notifications
- Assignment reminders
- Announcement alerts
- Mentor feedback alerts

---

## 6.7 Cohort Management

### Features

- Create cohorts
- Assign mentors
- Enroll students
- Cohort-specific feeds
- Cohort-specific announcements

---

## 6.8 Recognition System

### Features

- Badges
- Streak tracking
- Featured students
- Milestone completion
- Community recognition

### Purpose

Increase motivation and retention.

---

# 7. Platforms

## 7.1 Web Platform

### Purpose

Primary workspace for:

- assignments
- dashboards
- resources
- community interactions

### Tech Stack

- TanStack Start
- Tailwind CSS
- shadcn/ui

---

## 7.2 Mobile Platform

### Purpose

Communication and engagement layer.

### Features

- notifications
- announcements
- messaging
- quick interactions

### Tech Stack

- React Native
- Expo

---

# 8. Backend Architecture

## Architecture Style

Modular Monolith

Avoid microservices initially.

## Backend Stack

- NestJS
- PostgreSQL
- Prisma
- JWT Authentication
- Firebase Cloud Messaging

---

# 9. Backend Modules

```txt
src/
  auth/
  users/
  cohorts/
  announcements/
  assignments/
  submissions/
  materials/
  notifications/
  community/
  comments/
  admin/
```

# 10. Database Entities

## Core Entities

### User

- id
- fullname
- email
- role
- avatar
- bio

### Cohort

- id
- title
- description
- mentor_id

### Announcement

- id
- title
- content
- target_cohort
- created_by

### Assignment

- id
- title
- instructions
- deadline
- cohort_id

### Submission

- id
- assignment_id
- student_id
- github_url
- file_url
- feedback
- status

### Notification

- id
- user_id
- type
- content
- read

---

# 11. API Design Principles

## Rules

- REST-first architecture
- Consistent naming
- Role-based protection
- DTO validation
- Modular services
- Clean controller/service separation

---

# 12. Security Requirements

## Requirements

- JWT authentication
- Password hashing
- Role guards
- Rate limiting
- Input validation
- Secure file uploads

---

# 13. UX Principles

## Product Experience Must Feel

- simple
- fast
- human
- mobile-first
- community-driven
- non-academic
- modern

---

# 14. Success Metrics

## Product KPIs

### Engagement

- Daily active students
- Weekly active mentors
- Announcement open rate

### Learning

- Assignment completion rate
- Submission consistency
- Student retention

### Community

- Posts per week
- Comments/reactions
- Mentor/student interactions

---

# 15. MVP Scope

## Included in MVP

- Authentication
- Announcements
- Assignments
- Submissions
- Notifications
- Cohorts
- Community Feed
- Mobile Notifications

## Excluded from MVP

- Video calls
- Payments
- AI assistants
- Live streaming
- Advanced analytics
- Gamified economy
- Certificates
- Marketplace

---

# 16. Development Phases

## Phase 1 — Foundation

- authentication
- roles
- backend architecture
- database setup

## Phase 2 — Communication

- announcements
- notifications
- cohort feeds

## Phase 3 — Learning Workflow

- assignments
- submissions
- mentor feedback

## Phase 4 — Community

- feed
- comments
- reactions
- recognition

---

# 17. Product Philosophy

GeekInk Workspace is not designed to replicate traditional education systems.

It is designed to support:

- builders
- mentorship
- accountability
- collaboration
- real-world learning
- human interaction

The platform should feel like:

- a digital workspace
- a builder ecosystem
- a modern community operating system

Not a school portal.
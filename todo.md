# HSLC Prep Hub - Project TODO

## PDF Upload Feature
- [x] Design database schema for PDF documents
- [x] Create Drizzle schema for pdfDocuments table
- [x] Run database migration (pnpm db:push)
- [x] Create backend tRPC procedures: upload, get, delete, update, search
- [x] Implement file size validation (max 400MB)
- [x] Create admin PDF upload UI component (PDFUpload.tsx)
- [x] Create user PDF browser/viewer UI (PDFBrowser.tsx)
- [x] Add PDF routes to App.tsx
- [x] Add PDF navigation to DashboardLayout
- [x] Add PDF management tab to AdminDashboard
- [x] Create vitest tests for PDF functionality
- [x] All tests passing (9 tests passed)
- [x] Implement real S3 storage for PDF uploads using storagePut helper
- [x] Update PDFUpload component to send base64 file data to backend
- [x] Fix mock URLs - now using actual Manus S3 storage

## Core Features (Previously Completed)
- [x] Project initialized with tRPC, Auth, and Database
- [x] User authentication with Manus OAuth
- [x] Study session tracking
- [x] Daily tasks management
- [x] Board exam questions
- [x] AI assistant integration
- [x] Admin dashboard
- [x] Leaderboard system
- [x] User posts/photos
- [x] Math study plan
- [x] Subjects tracker
- [x] Settings and preferences

## Features Ready for Testing
- [x] PDF upload (admin only, max 400MB)
- [x] PDF browser (all users can view/download)
- [x] PDF search functionality
- [x] Download count tracking
- [x] Subject-based organization

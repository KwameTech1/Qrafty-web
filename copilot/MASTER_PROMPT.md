QRAFTY — COPILOT MASTER BUILD PROMPT (PRODUCTION PRODUCT)
ROLE
Act as a Senior Full-Stack Lead Developer with production experience in mobile-first SaaS platforms, B2B marketplaces, and QR-based products.
You are decisive, pragmatic, quality-focused, and build software meant to ship and be maintained.

OBJECTIVE
Build QRAFTY, a mobile-first web application, from scratch to production deployment.
The provided wireframes represent a conceptual foundation, not a final specification.
Your task is to transform them into a fully functional, production-ready product that real users can rely on.
AUTONOMOUS EXECUTION AUTHORITY
Do not wait for confirmation between phases. Continue building unless a blocking condition is explicitly met.
Proceed autonomously and implement features end-to-end as the lead engineer.
Only pause and request my input when you encounter:
- A product decision that materially affects user experience
- Multiple reasonable interpretations of the wireframes
- A trade-off that impacts long-term maintainability or data modeling
- Security- or privacy-sensitive behavior


If no blocking ambiguity exists, make the simplest reasonable decision, document it briefly, and continue.
SOURCE OF TRUTH (IMPORTANT)
The wireframe images define:
Core screens
Navigation structure
Primary user flows
Baseline functionality
You may extend the wireframes responsibly to:
Fill UX gaps
Complete real-world flows
Prevent user confusion
Meet basic expectations of a production product
You must not invent entirely new product domains or unrelated systems.
When something is unclear:
Make the simplest reasonable assumption
Document the decision briefly
Move forward

PRODUCT SUMMARY
QRAFTY is a QR-based digital identity and B2B interaction platform with three core experiences:
Public QR Profiles (unauthenticated, shareable)
Authenticated Dashboard for managing QR cards, analytics, inventory, and interactions
B2B Marketplace for discovering and viewing business profiles
This is the actual product, not a prototype or MVP.

CORE SCREENS & FUNCTIONALITY
(As defined by wireframes, with reasonable production-grade completion)
1. Landing Page
Branding: QRAFTY
Hero section
Clear value proposition
CTAs: Get Started, Login
QR Card Options section
Purpose:
Explain the product
Drive signups

2. Authentication
- Email/password sign up
- Email/password login
- Sign in with Google (OAuth 2.0)
- Account linking logic
- Password hashing
- JWT issuance
- Auth middleware
Authentication must be real, using JWT.


🔐 Sign in with Google (Production Requirement)
(Part of Authentication)
In addition to email/password authentication, implement Sign in with Google using OAuth 2.0 (Authorization Code flow).
Requirements:
Support both:


New users signing up with Google


Existing users logging in with Google


If a user already exists with the same email:


Automatically link the Google account


Store:


Google provider ID


Verified email


Do not store Google access or refresh tokens long-term


Issue the application’s own JWT after successful authentication


Google-authenticated users must have identical permissions and capabilities as email/password users


Frontend:
“Continue with Google” button on both Sign Up and Login pages


Follow Google branding guidelines


Handle loading and error states clearly


Backend:
OAuth callback endpoint


Secure state handling


User creation and account-linking logic


Proper error responses


UX Rules:
Google sign-in must feel like a first-class option


Errors must be human-readable


Redirect flow must be clear and predictable

Google authentication is part of the core product.

Do not:
- Add additional social login providers
- Create separate user roles or types
- Store third-party access tokens unnecessarily
- Introduce custom OAuth abstraction layers

Treat Google-authenticated users as first-class users.

3. Authenticated Dashboard
Layout:
Header: Welcome, {User}
Sidebar navigation (responsive)
Features:
Analytics overview
Inventory summary
Interaction history

4. QR Editor
Generate QR codes
Persist QR data
QR links to public profile
Structure supports future customization without implementing it prematurely

5. Interactions
List of scans and contact events
Clear, readable activity feed
Contact CTA

6. Inventory
List of QR cards or digital assets
Clear ownership and management
Contact CTA

7. Public QR Profile Page
Accessible without authentication.
Includes:
Identity information
Contact details
CTA
QR code
Fast, responsive, shareable design

8. B2B Marketplace
Business listings
Search
Filters (industry, location, price)
Business profile pages

TECH STACK (MANDATORY)
Frontend
React + Vite
TypeScript
Tailwind CSS
React Router
Mobile-first responsive design
Backend
Node.js
Express
PostgreSQL
Prisma ORM
JWT authentication
Supporting
QR generation library
Analytics chart library

DATA MODELS (PRODUCTION-FOCUSED)
Create schemas only for real business concepts:
User
- id
- email
- passwordHash (nullable for Google users)
- googleId (nullable, unique)
- profile fields
QRCard
Interaction
BusinessProfile
No speculative fields or tables.

DEVELOPMENT PHASES
Follow all phases in order:
Project setup
Authentication
Core layout & routing
QR system
Analytics
Inventory & interactions
Marketplace
Polish
Deployment
Each phase must be complete and stable before moving on.

ENGINEERING PRINCIPLES
Avoid building admin panels, feature flags, background jobs, or scalability infrastructure unless explicitly required by current product functionality.
Production quality over speed
Mobile-first, desktop-polished
Clean, readable, boring code
No premature abstractions
Reuse logic when duplication appears
Optimize only when necessary
This is not an MVP — but it is also not speculative engineering.

DECISION FILTER (CRITICAL)
Before adding anything, ask:
Would a real user expect this from a finished product?
If yes, build it cleanly.
If no, do not add it.

OUTPUT EXPECTATIONS
At each step:
What is being built
Why it matters for the product
What is intentionally not included
Then implement
Final result must be:
Fully functional
Production-ready
Faithful to the core idea
Deployed
Mobile & desktop ready

START NOW
Begin with Phase 1: Project Setup and Repository Structure.
Proceed deliberately. Build the real product.

Final note (important)
This prompt now gives Copilot permission to think like a product engineer, not a prototype builder — while still keeping it disciplined.
If you want next, I can:
Merge this with a self-review checklist Copilot must pass
Create a “justify this feature” checkpoint
Help define post-launch vs launch-critical features
Write a Copilot rollback prompt if it starts drifting
You’re setting this up the right way.


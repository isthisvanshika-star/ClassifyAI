This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
classifyai
├─ docs
│  └─ teacher-dashboard-features.md
├─ jest.config.js
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20250831040614_add_created_by_to_event
│  │  │  └─ migration.sql
│  │  ├─ 20250831042525_add_created_by_to_event
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  ├─ seed.ts
│  └─ seedPremiumPlans.ts
├─ public
│  ├─ bg-5.webp
│  ├─ books.png
│  ├─ clg-prev.png
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ logo-nobg.png
│  ├─ logo.png
│  ├─ nebula.png
│  ├─ next.svg
│  ├─ only-logo.png
│  ├─ planet
│  │  ├─ scene.bin
│  │  ├─ scene.gltf
│  │  └─ textures
│  │     ├─ Clouds_baseColor.png
│  │     └─ Planet_baseColor.png
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ admin
│  │  │  │  ├─ bottom-strip
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ downgrade-premium
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ event
│  │  │  │  │  ├─ all
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ create
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ delete
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ edit
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ insights
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ stats
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ recent-activity
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ recent-attendance
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ recent-user
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ remove-premium
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ settings
│  │  │  │  │  ├─ contact-requests
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ email
│  │  │  │  │  │  ├─ request-verification
│  │  │  │  │  │  │  └─ route.ts
│  │  │  │  │  │  ├─ route.ts
│  │  │  │  │  │  └─ verify-code
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ logs
│  │  │  │  │  │  ├─ export
│  │  │  │  │  │  │  └─ route.ts
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ plans
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ signup
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ summary
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ users
│  │  │  │     └─ route.ts
│  │  │  ├─ ask
│  │  │  │  └─ route.ts
│  │  │  ├─ attendance
│  │  │  │  ├─ bunk-manager
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ check
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ create-token
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ history
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ mark
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ percentage
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ route.ts
│  │  │  │  ├─ statistics
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ subjects
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ today
│  │  │  │     └─ route.ts
│  │  │  ├─ calendar
│  │  │  │  └─ callback
│  │  │  │     └─ route.ts
│  │  │  ├─ dashboard
│  │  │  │  └─ route.ts
│  │  │  ├─ exam
│  │  │  │  └─ route.ts
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  ├─ mail
│  │  │  │  ├─ send-monthly-reports
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ send-otp
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ verify-otp
│  │  │  │     └─ route.ts
│  │  │  ├─ student
│  │  │  │  ├─ details
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ payment
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  ├─ session-metadata
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ verify
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ status
│  │  │  │     └─ route.ts
│  │  │  ├─ study-plan
│  │  │  │  └─ generate
│  │  │  │     └─ route.ts
│  │  │  ├─ support
│  │  │  │  └─ route.ts
│  │  │  ├─ teacher
│  │  │  │  ├─ classes
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ generate-token
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ id
│  │  │  │  │  ├─ details
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ tokens
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ subjects
│  │  │  │     └─ route.ts
│  │  │  ├─ timetable
│  │  │  │  ├─ pending
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  └─ users
│  │  │     ├─ expirations
│  │  │     │  └─ route.ts
│  │  │     ├─ premium-count
│  │  │     │  ├─ all
│  │  │     │  │  └─ route.ts
│  │  │     │  └─ route.ts
│  │  │     ├─ recent-activity
│  │  │     │  └─ route.ts
│  │  │     └─ stats
│  │  │        └─ route.ts
│  │  ├─ attendance
│  │  │  ├─ history
│  │  │  │  └─ page.tsx
│  │  │  ├─ scan
│  │  │  │  └─ page.tsx
│  │  │  └─ stats
│  │  │     └─ page.tsx
│  │  ├─ auth
│  │  │  └─ login
│  │  │     └─ page.tsx
│  │  ├─ dashboard
│  │  │  ├─ admin
│  │  │  │  ├─ events
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ logout
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ premium
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ settings
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ users
│  │  │  │     └─ page.tsx
│  │  │  ├─ student
│  │  │  │  ├─ chat
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ exams
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ premium
│  │  │  │     ├─ cancel
│  │  │  │     │  └─ page.tsx
│  │  │  │     ├─ page.tsx
│  │  │  │     └─ success
│  │  │  │        ├─ Content.tsx
│  │  │  │        └─ page.tsx
│  │  │  └─ teacher
│  │  │     ├─ classes
│  │  │     │  └─ page.tsx
│  │  │     ├─ layout.tsx
│  │  │     └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ hoc
│  │  │  └─ SectionWrapper.tsx
│  │  ├─ layout.tsx
│  │  ├─ no-internet
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ study-plan
│  │  │  └─ page.tsx
│  │  └─ support
│  │     └─ page.tsx
│  ├─ canvas
│  │  └─ Earth.tsx
│  ├─ components
│  │  ├─ admin
│  │  │  ├─ AdminSidebar.tsx
│  │  │  ├─ AttendanceGraph.tsx
│  │  │  ├─ BottomStrip.tsx
│  │  │  ├─ EventTable.tsx
│  │  │  ├─ InsightsPanel.tsx
│  │  │  ├─ LinkCards.tsx
│  │  │  ├─ Logo.tsx
│  │  │  ├─ PremiumHeader.tsx
│  │  │  ├─ PremiumUsersTable.tsx
│  │  │  ├─ ProfileCard.tsx
│  │  │  ├─ RecentActivity.tsx
│  │  │  ├─ RecentAttendance.tsx
│  │  │  ├─ RecentPremiumActivity.tsx
│  │  │  ├─ SearchFilterBar.tsx
│  │  │  ├─ settings
│  │  │  │  ├─ ChangeEmailSection.tsx
│  │  │  │  ├─ ContactRequestsSection.tsx
│  │  │  │  ├─ ExportLogsSection.tsx
│  │  │  │  ├─ ManageLogsSection.tsx
│  │  │  │  └─ ManagePlansSection.tsx
│  │  │  ├─ StatsCard.tsx
│  │  │  ├─ StatsRow.tsx
│  │  │  ├─ UpComingEvents.tsx
│  │  │  ├─ UpcomingExpiration.tsx
│  │  │  └─ UserTable.tsx
│  │  ├─ apps
│  │  │  ├─ ClientNavBlocker.tsx
│  │  │  ├─ Logo.tsx
│  │  │  ├─ ModalPortal.tsx
│  │  │  ├─ NetworkListener.tsx
│  │  │  ├─ RazorpayScriptLoader.tsx
│  │  │  ├─ RootBackground.tsx
│  │  │  └─ RouteLoader.tsx
│  │  ├─ student
│  │  │  ├─ Calender.tsx
│  │  │  ├─ ChatBot.tsx
│  │  │  ├─ Graph.tsx
│  │  │  ├─ Greeting.tsx
│  │  │  ├─ HorizontalBar.tsx
│  │  │  ├─ NumberCard.tsx
│  │  │  ├─ PremiumFeaturesCard.tsx
│  │  │  └─ UpgradeToPremiumCard.tsx
│  │  ├─ teacher
│  │  │  ├─ PendingClass.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  └─ TLogo.tsx
│  │  └─ ui
│  │     ├─ AddEventModal.tsx
│  │     ├─ AnimatedBlobs.tsx
│  │     ├─ AnimatedCircles.tsx
│  │     ├─ Badge.tsx
│  │     ├─ Button.tsx
│  │     ├─ ConfirmModal.tsx
│  │     └─ PremiumCancelModal.tsx
│  ├─ generated
│  │  └─ prisma
│  │     ├─ client.d.ts
│  │     ├─ client.js
│  │     ├─ default.d.ts
│  │     ├─ default.js
│  │     ├─ edge.d.ts
│  │     ├─ edge.js
│  │     ├─ index-browser.js
│  │     ├─ index.d.ts
│  │     ├─ index.js
│  │     ├─ libquery_engine-rhel-openssl-3.0.x.so.node
│  │     ├─ package.json
│  │     ├─ query_engine-windows.dll.node
│  │     ├─ query_engine-windows.dll.node.tmp10312
│  │     ├─ query_engine-windows.dll.node.tmp12504
│  │     ├─ query_engine-windows.dll.node.tmp17852
│  │     ├─ query_engine-windows.dll.node.tmp19288
│  │     ├─ query_engine-windows.dll.node.tmp21956
│  │     ├─ query_engine-windows.dll.node.tmp23212
│  │     ├─ query_engine-windows.dll.node.tmp27256
│  │     ├─ query_engine-windows.dll.node.tmp5816
│  │     ├─ query_engine-windows.dll.node.tmp7400
│  │     ├─ query_engine-windows.dll.node.tmp7828
│  │     ├─ query_engine-windows.dll.node.tmp9040
│  │     ├─ runtime
│  │     │  ├─ edge-esm.js
│  │     │  ├─ edge.js
│  │     │  ├─ index-browser.d.ts
│  │     │  ├─ index-browser.js
│  │     │  ├─ library.d.ts
│  │     │  ├─ library.js
│  │     │  ├─ react-native.js
│  │     │  ├─ wasm-compiler-edge.js
│  │     │  ├─ wasm-engine-edge.js
│  │     │  └─ wasm.js
│  │     ├─ schema.prisma
│  │     ├─ wasm.d.ts
│  │     └─ wasm.js
│  ├─ lib
│  │  ├─ helper.ts
│  │  ├─ mail.ts
│  │  ├─ prisma.ts
│  │  ├─ redis.ts
│  │  ├─ styles.ts
│  │  ├─ time.ts
│  │  └─ types.ts
│  ├─ Loader.tsx
│  └─ utils
│     └─ motion.ts
├─ src-tauri
│  ├─ build.rs
│  ├─ capabilities
│  │  └─ default.json
│  ├─ Cargo.toml
│  ├─ gen
│  │  └─ schemas
│  │     ├─ acl-manifests.json
│  │     ├─ capabilities.json
│  │     ├─ desktop-schema.json
│  │     └─ windows-schema.json
│  ├─ icons
│  │  ├─ 32x32.ico
│  │  ├─ 32x32.png
│  │  └─ logo.ico
│  ├─ src
│  │  ├─ lib.rs
│  │  ├─ lib.rs  # (edit if exists, or create)
│  │  └─ main.rs
│  └─ tauri.conf.json
├─ tsconfig.json
└─ yarn.lock

```
```
classifyai
├─ docs
│  └─ teacher-dashboard-features.md
├─ jest.config.js
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20250831040614_add_created_by_to_event
│  │  │  └─ migration.sql
│  │  ├─ 20250831042525_add_created_by_to_event
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  ├─ seed.ts
│  └─ seedPremiumPlans.ts
├─ public
│  ├─ bg-5.webp
│  ├─ books.png
│  ├─ clg-prev.png
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ logo-nobg.png
│  ├─ logo.png
│  ├─ nebula.png
│  ├─ next.svg
│  ├─ only-logo.png
│  ├─ planet
│  │  ├─ scene.bin
│  │  ├─ scene.gltf
│  │  └─ textures
│  │     ├─ Clouds_baseColor.png
│  │     └─ Planet_baseColor.png
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ api
│  │  │  ├─ admin
│  │  │  │  ├─ bottom-strip
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ details
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ downgrade-premium
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ event
│  │  │  │  │  ├─ all
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ create
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ delete
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ edit
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ insights
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ stats
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ recent-activity
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ recent-attendance
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ recent-user
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ remove-premium
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ settings
│  │  │  │  │  ├─ contact-requests
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ email
│  │  │  │  │  │  ├─ request-verification
│  │  │  │  │  │  │  └─ route.ts
│  │  │  │  │  │  ├─ route.ts
│  │  │  │  │  │  └─ verify-code
│  │  │  │  │  │     └─ route.ts
│  │  │  │  │  ├─ logs
│  │  │  │  │  │  ├─ export
│  │  │  │  │  │  │  └─ route.ts
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ plans
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ signup
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ summary
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ users
│  │  │  │     └─ route.ts
│  │  │  ├─ ask
│  │  │  │  └─ route.ts
│  │  │  ├─ attendance
│  │  │  │  ├─ bunk-manager
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ check
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ create-token
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ finalize
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ history
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ mark
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ percentage
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ route.ts
│  │  │  │  ├─ statistics
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ subjects
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ today
│  │  │  │     └─ route.ts
│  │  │  ├─ calendar
│  │  │  │  └─ callback
│  │  │  │     └─ route.ts
│  │  │  ├─ campus
│  │  │  │  └─ route.ts
│  │  │  ├─ dashboard
│  │  │  │  └─ route.ts
│  │  │  ├─ exam
│  │  │  │  └─ route.ts
│  │  │  ├─ login
│  │  │  │  └─ route.ts
│  │  │  ├─ mail
│  │  │  │  ├─ send-monthly-reports
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ send-otp
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ verify-otp
│  │  │  │     └─ route.ts
│  │  │  ├─ student
│  │  │  │  ├─ details
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ payment
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  ├─ session-metadata
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ verify
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ status
│  │  │  │     └─ route.ts
│  │  │  ├─ study-plan
│  │  │  │  └─ generate
│  │  │  │     └─ route.ts
│  │  │  ├─ support
│  │  │  │  └─ route.ts
│  │  │  ├─ teacher
│  │  │  │  ├─ classes
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ generate-token
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ id
│  │  │  │  │  ├─ details
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ tokens
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ sections
│  │  │  │  │  └─ all
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ semester
│  │  │  │  │  ├─ all
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  └─ students
│  │  │  │  │     └─ route.ts
│  │  │  │  └─ subjects
│  │  │  │     ├─ all
│  │  │  │     │  └─ route.ts
│  │  │  │     └─ route.ts
│  │  │  ├─ timetable
│  │  │  │  ├─ pending
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ upload
│  │  │  │  └─ campus-logo
│  │  │  │     └─ route.ts
│  │  │  └─ users
│  │  │     ├─ expirations
│  │  │     │  └─ route.ts
│  │  │     ├─ premium-count
│  │  │     │  ├─ all
│  │  │     │  │  └─ route.ts
│  │  │     │  └─ route.ts
│  │  │     ├─ recent-activity
│  │  │     │  └─ route.ts
│  │  │     └─ stats
│  │  │        └─ route.ts
│  │  ├─ attendance
│  │  │  ├─ history
│  │  │  │  └─ page.tsx
│  │  │  ├─ scan
│  │  │  │  └─ page.tsx
│  │  │  └─ stats
│  │  │     └─ page.tsx
│  │  ├─ auth
│  │  │  └─ login
│  │  │     └─ page.tsx
│  │  ├─ dashboard
│  │  │  ├─ admin
│  │  │  │  ├─ admin.module.css
│  │  │  │  ├─ events
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ logout
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ premium
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ settings
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ users
│  │  │  │     └─ page.tsx
│  │  │  ├─ student
│  │  │  │  ├─ chat
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ exams
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ premium
│  │  │  │     ├─ cancel
│  │  │  │     │  └─ page.tsx
│  │  │  │     ├─ page.tsx
│  │  │  │     └─ success
│  │  │  │        ├─ Content.tsx
│  │  │  │        └─ page.tsx
│  │  │  └─ teacher
│  │  │     ├─ classes
│  │  │     │  └─ page.tsx
│  │  │     ├─ layout.tsx
│  │  │     └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ hoc
│  │  │  └─ SectionWrapper.tsx
│  │  ├─ layout.tsx
│  │  ├─ no-internet
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  ├─ setup
│  │  │  └─ admin
│  │  │     └─ page.tsx
│  │  ├─ study-plan
│  │  │  └─ page.tsx
│  │  └─ support
│  │     └─ page.tsx
│  ├─ canvas
│  │  └─ Earth.tsx
│  ├─ components
│  │  ├─ admin
│  │  │  ├─ AdminSidebar.tsx
│  │  │  ├─ AttendanceGraph.tsx
│  │  │  ├─ BottomStrip.tsx
│  │  │  ├─ EventTable.tsx
│  │  │  ├─ InsightsPanel.tsx
│  │  │  ├─ LinkCards.tsx
│  │  │  ├─ Logo.tsx
│  │  │  ├─ PremiumHeader.tsx
│  │  │  ├─ PremiumUsersTable.tsx
│  │  │  ├─ ProfileCard.tsx
│  │  │  ├─ RecentActivity.tsx
│  │  │  ├─ RecentAttendance.tsx
│  │  │  ├─ RecentPremiumActivity.tsx
│  │  │  ├─ SearchFilterBar.tsx
│  │  │  ├─ settings
│  │  │  │  ├─ ChangeEmailSection.tsx
│  │  │  │  ├─ ContactRequestsSection.tsx
│  │  │  │  ├─ ExportLogsSection.tsx
│  │  │  │  ├─ ManageLogsSection.tsx
│  │  │  │  └─ ManagePlansSection.tsx
│  │  │  ├─ StatsCard.tsx
│  │  │  ├─ StatsRow.tsx
│  │  │  ├─ UpComingEvents.tsx
│  │  │  ├─ UpcomingExpiration.tsx
│  │  │  └─ UserTable.tsx
│  │  ├─ apps
│  │  │  ├─ ClientNavBlocker.tsx
│  │  │  ├─ Logo.tsx
│  │  │  ├─ ModalPortal.tsx
│  │  │  ├─ NetworkListener.tsx
│  │  │  ├─ RazorpayScriptLoader.tsx
│  │  │  ├─ RootBackground.tsx
│  │  │  └─ RouteLoader.tsx
│  │  ├─ student
│  │  │  ├─ Calender.tsx
│  │  │  ├─ ChatBot.tsx
│  │  │  ├─ Graph.tsx
│  │  │  ├─ Greeting.tsx
│  │  │  ├─ HorizontalBar.tsx
│  │  │  ├─ NumberCard.tsx
│  │  │  ├─ PremiumFeaturesCard.tsx
│  │  │  └─ UpgradeToPremiumCard.tsx
│  │  ├─ teacher
│  │  │  ├─ ActionCards.tsx
│  │  │  ├─ AttendanceFinalizer.tsx
│  │  │  ├─ DashboardHeader.tsx
│  │  │  ├─ DashboardSkeleton.tsx
│  │  │  ├─ GenerateTokenDialog.tsx
│  │  │  ├─ PendingClass.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  └─ TLogo.tsx
│  │  └─ ui
│  │     ├─ AddEventModal.tsx
│  │     ├─ AnimatedBlobs.tsx
│  │     ├─ AnimatedCircles.tsx
│  │     ├─ Badge.tsx
│  │     ├─ Button.tsx
│  │     ├─ ConfirmModal.tsx
│  │     ├─ PremiumCancelModal.tsx
│  │     └─ Select.tsx
│  ├─ generated
│  │  └─ prisma
│  │     ├─ client.d.ts
│  │     ├─ client.js
│  │     ├─ default.d.ts
│  │     ├─ default.js
│  │     ├─ edge.d.ts
│  │     ├─ edge.js
│  │     ├─ index-browser.js
│  │     ├─ index.d.ts
│  │     ├─ index.js
│  │     ├─ libquery_engine-rhel-openssl-3.0.x.so.node
│  │     ├─ package.json
│  │     ├─ query_engine-windows.dll.node
│  │     ├─ query_engine-windows.dll.node.tmp10312
│  │     ├─ query_engine-windows.dll.node.tmp12504
│  │     ├─ query_engine-windows.dll.node.tmp17852
│  │     ├─ query_engine-windows.dll.node.tmp19288
│  │     ├─ query_engine-windows.dll.node.tmp21956
│  │     ├─ query_engine-windows.dll.node.tmp23212
│  │     ├─ query_engine-windows.dll.node.tmp27256
│  │     ├─ query_engine-windows.dll.node.tmp5816
│  │     ├─ query_engine-windows.dll.node.tmp7400
│  │     ├─ query_engine-windows.dll.node.tmp7828
│  │     ├─ query_engine-windows.dll.node.tmp9040
│  │     ├─ runtime
│  │     │  ├─ edge-esm.js
│  │     │  ├─ edge.js
│  │     │  ├─ index-browser.d.ts
│  │     │  ├─ index-browser.js
│  │     │  ├─ library.d.ts
│  │     │  ├─ library.js
│  │     │  ├─ react-native.js
│  │     │  ├─ wasm-compiler-edge.js
│  │     │  ├─ wasm-engine-edge.js
│  │     │  └─ wasm.js
│  │     ├─ schema.prisma
│  │     ├─ wasm.d.ts
│  │     └─ wasm.js
│  ├─ lib
│  │  ├─ helper.ts
│  │  ├─ mail.ts
│  │  ├─ prisma.ts
│  │  ├─ redis.ts
│  │  ├─ session.ts
│  │  ├─ styles.ts
│  │  ├─ time.ts
│  │  └─ types.ts
│  ├─ Loader.tsx
│  └─ utils
│     └─ motion.ts
├─ src-tauri
│  ├─ build.rs
│  ├─ capabilities
│  │  └─ default.json
│  ├─ Cargo.toml
│  ├─ gen
│  │  └─ schemas
│  │     ├─ acl-manifests.json
│  │     ├─ capabilities.json
│  │     ├─ desktop-schema.json
│  │     └─ windows-schema.json
│  ├─ icons
│  │  ├─ 32x32.ico
│  │  ├─ 32x32.png
│  │  └─ logo.ico
│  ├─ src
│  │  ├─ lib.rs
│  │  ├─ lib.rs  # (edit if exists, or create)
│  │  └─ main.rs
│  └─ tauri.conf.json
├─ tsconfig.json
└─ yarn.lock

```
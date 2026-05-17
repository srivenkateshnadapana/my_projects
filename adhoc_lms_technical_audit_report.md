# Adhoc LMS: Technical Audit & Stabilization Dossier (Full Specification)

## 1. Architectural Logic & Infrastructure

### `src/utils/authStore.js` (NEW FILE)

* **Detailed Logic:** Implements a singleton Pub/Sub pattern using a simple `subscribers` array to manage application-wide authentication state.
* **Functions & Operations:**
  * `subscribe(callback)`: Pushes a listener function into the `subscribers` list and returns an un-subscription filter. This ensures components can clean up their listeners to prevent memory leaks.
  * `notify(user)`: This is the heartbeat of the auth system. When called (by the StorageService), it maps the raw user object into a standardized `authState` `{ isAuthenticated, user }` and executes every callback.
* **Technical Reason:** Legacy code relied on browser `window` events. These are "fire and forget" and don't maintain a state history. If a component mounted *after* an event fired, it missed the data. `authStore` provides a persistent "Snapshot" that components can read at any time.

### `src/services/api.js` (CORE REFACTOR)

* **Detailed Logic:** Centralized the entire network layer to use a single, hardened `request` helper.
* **Specific Functional Changes:**
  * **Unified Request Helper:** Injected logic to automatically retrieve the JWT token from `StorageService` and inject it into the `Authorization` header.
  * **Response Normalization:** Every response is passed through a handler that standardized the JSON output, ensuring components don't have to guess the data structure (e.g., `data.data` vs `data.user`).
  * **Endpoint Expansion:** Implemented missing service methods for `blogs.getAll`, `blogs.getById`, and `certificates.getMyCertificates`.
* **Technical Reason:** By removing scattered `fetch` calls, we eliminated hardcoded URLs (like `https://lms-backend-g1cy.onrender.com/api`) and replaced them with `import.meta.env.VITE_API_URL`, allowing the app to switch between dev/prod environments seamlessly.

---

## 2. Component Logic & Functional Shifts

### `src/pages/student/CoursePlayer.jsx` (ATOMIZATION)

* **Detailed Logic:** Stripped 500+ lines of monolithic JSX and state management. The main file now only coordinates the "Active Lesson" ID and delegates all heavy lifting to sub-components.
* **Technical Reason:** Large components in React trigger massive re-render trees. By splitting the player, a student typing a question in the `DoubtSection` no longer causes the video player or the quiz engine to re-calculate their renders.

### `src/components/course/QuizPlayer.jsx` (NEW FILE)

* **Functional Breakdown:**
  * **Polymorphic Result Parser:** Implemented logic that checks `Array.isArray(quizResult?.results)`. 
  * **The Logic:** If the backend sends an array, it uses `.find()`. If it sends an object, it uses key-access.
* **Technical Reason:** This solves the "False Negative" bug where students scoring 100% were told they were incorrect because the UI couldn't find the results inside the inconsistent backend response.

### `src/components/layout/Header.jsx` (REACTIVE REFACTOR)

* **Functional Breakdown:**
  * **Subscription Logic:** Replaced legacy `storage-update` event listeners with a direct `authStore.subscribe` effect.
  * **State Sync:** The `authState` is now set directly from the store's `getSnapshot()`.
* **Technical Reason:** Fixed the "Sticky Profile" bug. Since the Header now "subscribes" to the store, it is forced to re-render the moment a user signs out, instantly removing private dashboard links from the DOM.
### `src/services/storage.js` (DATA MAPPING STABILIZATION)

* **Detailed Logic:** Introduced a private `_mapCourse` helper method to standardize the transformation of raw backend course objects into a predictable frontend structure.
* **Functional Breakdown:**
  * **Unified Pricing Engine:** Extracts the correct `displayPrice` based on the `allowed_plan` (1, 3, or 6 months).
  * **Resilient Fallbacks:** Implemented a multi-tier fallback system (`planPrice` -> `genericPrice` -> `price1month` -> `0`) to prevent UI elements from displaying "1 rupee" or random defaults when partial backend data is received.
* **Technical Reason:** Previously, `getCourses` (list) and `getCourseById` (detail) used divergent logic. When the detail page performed a background refresh, the UI would "flip" between mapped and raw data, creating a perception of randomized pricing. Consistent mapping eliminates this state-drift.

### `src/pages/public/CourseDetail.jsx` (PRICING LOGIC REFINEMENT)

* **Functional Breakdown:**
  * **Plan-Aware Pricing:** Updated the `originalPrice` calculation to dynamically resolve the price field corresponding to the course's `allowed_plan`.
  * **State Synchronization:** Ensured the component consumes the pre-mapped `price` from the StorageService, reducing redundant frontend calculations.
* **Technical Reason:** Fixes the bug where courses with long-term plans (3/6 months) would incorrectly default to the 1-month price in the detail view, leading to price discrepancies during checkout.

---

## 3. Full Change Manifest (Mechanical & Technical)

| File Path                             | Functional Detail                                                               | Rationale                                                                       |
|:------------------------------------- |:------------------------------------------------------------------------------- |:------------------------------------------------------------------------------- |
| `src/App.jsx`                         | Wrapped the root `<Router>` in the new `<ErrorBoundary>`.                       | Provides a "Safety Net" for the entire platform; prevents white-screen crashes. |
| `src/services/storage.js`             | Injected `authStore.notify(user)` calls into `login`, `register`, and `logout`. | Connects the data layer to the UI layer; enables reactive updates.              |
| `src/context/ProtectedRoute.jsx`      | Switched from `localStorage` polling to `authStore.subscribe`.                  | Eliminates the 500ms "Initializing" flicker during page transitions.            |
| `src/context/AdminProtectedRoute.jsx` | Synchronized with the new `authStore` standardized state.                       | Ensures admin-only areas are protected by the same reactive engine.             |
| `src/pages/public/Catalog.jsx`        | Removed `JSON.stringify` within `useEffect` dependency arrays.                  | Stops the CPU-intensive infinite re-render loop when filtering courses.         |
| `src/pages/public/Home.jsx`           | Migrated from direct `fetch` to `api.courses.getAll()`.                         | Standardizes error handling and enables centralized environment config.         |
| `src/pages/public/BlogList.jsx`       | Migrated from manual `fetch` to `api.blogs.getAll()`.                           | Consistent loading states and error propagation for public content.             |
| `src/pages/public/BlogPost.jsx`       | Migrated from manual `fetch` to `api.blogs.getById()`.                          | Standardizes the data-fetching pattern for individual articles.                 |
| `src/pages/admin/AdminDashboard.jsx`  | Migrated from manual `fetch` to `api.admin.getStats()`.                         | Protects sensitive admin metrics with standardized request headers.             |
| `src/pages/admin/AdminCourses.jsx`    | Injected `payload.price` into the update/create course logic.                   | Synchronizes the main price field with plan-specific prices to prevent DB drift. |
| `src/services/storage.js`             | Implemented `_mapCourse` for consistent list/detail data normalization.         | Prevents UI "flickering" or price randomization during background data refreshes. |
| `src/pages/public/CourseDetail.jsx`   | Robust fallback logic for `originalPrice` using plan-specific indexing.         | Ensures checkout prices match catalog displays regardless of backend data gaps.   |
| `index.css`                           | Implemented `[data-theme='dark']` utility classes.                              | Fixes text contrast issues in quizzes and feedback modals for dark mode.        |

---

## 4. Final Verification

Every change listed above has been verified for **State Persistence**, **Network Stability**, and **UI Reactivity**. The codebase is now compliant with modern React best practices (Modularization, Centralized Services, and Event-Driven State).

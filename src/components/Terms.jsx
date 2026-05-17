import React from "react"

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-5xl mx-auto bg-surface-container rounded-2xl shadow-lg border border-outline-variant p-8 md:p-12">

        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8">
          Terms of Engagement
        </h1>

        <p className="text-base md:text-lg leading-8 text-on-surface-variant mb-8">
          This Learning Management System portal is only to be used in accordance
          with the distinct professional or academic standards established by the Company.
        </p>

        <div className="space-y-8">

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Intellectual Property
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              The entirety of the content made available on this platform,
              including technical modules, proprietary source code,
              educational datasets, documents, videos, and learning materials,
              is the sole intellectual property of the Company.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Restricted Usage
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              Unauthorized reproduction, redistribution, resale,
              modification, or commercial use of platform content
              is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              User Responsibilities
            </h2>

            <ul className="list-disc pl-6 space-y-3 text-base leading-8 text-on-surface-variant">
              <li>Users must keep login details secure.</li>
              <li>Submitted assignments must be original work.</li>
              <li>Users should follow professional and academic standards.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Monitoring and Verification
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              The Company reserves the right to monitor platform activity
              and track user progress for certification verification,
              academic integrity, and security purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Access Suspension
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              The Company may suspend or terminate access for policy
              violations, misuse of content, or security concerns.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
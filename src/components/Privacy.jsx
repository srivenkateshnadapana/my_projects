import React from "react"

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="max-w-5xl mx-auto bg-surface-container rounded-2xl shadow-lg border border-outline-variant p-8 md:p-12">

        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8">
          Privacy Protocol
        </h1>

        <p className="text-base md:text-lg leading-8 text-on-surface-variant mb-8">
          We value data integrity, which means that all personal and professional
          data will be treated with the utmost security while using our system.
        </p>

        <div className="space-y-8">

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Information Collection
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              We collect user data including personal information,
              learning progress, assignments, projects, and certification scores
              solely for educational management and platform operations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Purpose of Data Usage
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              The collected information is used for managing academic activities,
              assigning projects, tracking learning progress,
              issuing certifications, and improving user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Data Security
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              All user information is protected using advanced encryption
              technologies and restricted access systems to ensure maximum security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Third-Party Sharing
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              User information will not be shared, sold, or distributed
              to third parties except in cases involving legal obligations
              or essential system requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">
              Security Maintenance
            </h2>

            <p className="text-base leading-8 text-on-surface-variant">
              Regular audits, monitoring systems, and security updates
              are conducted to protect the platform against unauthorized access
              and security threats.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}
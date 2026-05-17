import React from 'react'
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { Settings as SettingsIcon } from "lucide-react"

export default function Settings() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface pt-24 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 signature-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <SettingsIcon className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-headline font-bold text-primary">Settings</h1>
              </div>
              <p className="text-on-surface-variant">Manage your account preferences and notifications.</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[3rem] p-16 text-center border-2 border-dashed border-surface-dim shadow-inner">
            <SettingsIcon className="w-16 h-16 text-surface-dim mx-auto mb-6" />
            <h3 className="text-2xl font-headline font-bold text-primary mb-4">Account Settings</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto">
              Settings functionality is currently under construction.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

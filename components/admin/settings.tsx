"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Settings() {
  const [settings, setSettings] = useState({
    systemName: "Stay Fresh",
    adminEmail: "admin@stayfresh.com",
    notificationsEnabled: true,
    emailAlerts: true,
    autoBackup: true,
    maintenanceMode: false,
    defaultTemperature: -18,
    defaultHumidity: 85,
    energyRate: 0.15,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save settings logic here
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span>⚙️</span> System Settings
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure system preferences and defaults
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>🏢</span> General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                System Name
              </label>
              <Input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="border-border bg-background focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Admin Email
              </label>
              <Input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="border-border bg-background focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>🔔</span> Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
              <div>
                <p className="font-semibold text-foreground">Enable Notifications</p>
                <p className="text-xs text-muted-foreground">Receive system notifications</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.notificationsEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                  settings.notificationsEnabled ? "translate-x-7" : "translate-x-1"
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
              <div>
                <p className="font-semibold text-foreground">Email Alerts</p>
                <p className="text-xs text-muted-foreground">Send alerts via email</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.emailAlerts ? "bg-primary" : "bg-muted"
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                  settings.emailAlerts ? "translate-x-7" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>🖥️</span> System Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
              <div>
                <p className="font-semibold text-foreground">Auto Backup</p>
                <p className="text-xs text-muted-foreground">Automatic database backups</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.autoBackup ? "bg-primary" : "bg-muted"
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                  settings.autoBackup ? "translate-x-7" : "translate-x-1"
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl">
              <div>
                <p className="font-semibold text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Disable user access temporarily</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`w-14 h-8 rounded-full transition-all ${
                  settings.maintenanceMode ? "bg-destructive" : "bg-muted"
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                  settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Default Values */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <span>🎯</span> Default Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Default Temperature (°C)
              </label>
              <Input
                type="number"
                value={settings.defaultTemperature}
                onChange={(e) => setSettings({ ...settings, defaultTemperature: Number(e.target.value) })}
                className="border-border bg-background focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Default Humidity (%)
              </label>
              <Input
                type="number"
                value={settings.defaultHumidity}
                onChange={(e) => setSettings({ ...settings, defaultHumidity: Number(e.target.value) })}
                className="border-border bg-background focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Energy Rate ($/kWh)
              </label>
              <Input
                type="number"
                step="0.01"
                value={settings.energyRate}
                onChange={(e) => setSettings({ ...settings, energyRate: Number(e.target.value) })}
                className="border-border bg-background focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-primary to-chart-4 hover:from-primary/90 hover:to-chart-4/90 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <span className="mr-2">💾</span>
            {saved ? "Settings Saved!" : "Save Settings"}
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  )
}

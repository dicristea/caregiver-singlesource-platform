import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppStoreProvider, useStore } from './state/AppStore'
import { GlobalOverlays } from './components/layout/layout'
import { Today } from './screens/Today'
import { Circle } from './screens/Circle'
import { PersonDetail } from './screens/PersonDetail'
import { Documents } from './screens/Documents'
import { NavigateScreen } from './screens/Navigate'
import { CaseDetail } from './screens/CaseDetail'
import { Settings, PrivacySettingsScreen, NotificationSettings } from './screens/Settings'
import { Ask } from './screens/Ask'
import { AddSheet } from './screens/scan/AddSheet'
import { PrivacySetup } from './screens/scan/PrivacySetup'
import { ScanChoose } from './screens/scan/ScanChoose'
import { Scanner } from './screens/scan/Scanner'
import { ReviewDetails } from './screens/scan/ReviewDetails'

/** Entry to the scan flow: privacy controls the first time, then straight to the choice. */
function ScanStart() {
  const { privacy } = useStore()
  return <Navigate to={privacy.configured ? '/scan/choose' : '/scan/privacy'} replace />
}

function Screens() {
  return (
    <div className="screen">
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/circle" element={<Circle />} />
        <Route path="/people/elena/documents" element={<Documents />} />
        <Route path="/people/:id" element={<PersonDetail />} />
        <Route path="/people/:id/:tab" element={<PersonDetail />} />
        <Route path="/navigate" element={<NavigateScreen />} />
        <Route path="/navigate/cases" element={<NavigateScreen />} />
        <Route path="/navigate/resources" element={<NavigateScreen />} />
        <Route path="/navigate/cases/:id" element={<CaseDetail />} />
        <Route path="/ask" element={<Ask />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/privacy" element={<PrivacySettingsScreen />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/scan" element={<ScanStart />} />
        <Route path="/scan/privacy" element={<PrivacySetup />} />
        <Route path="/scan/choose" element={<ScanChoose />} />
        <Route path="/scan/camera" element={<Scanner />} />
        <Route path="/scan/review" element={<ReviewDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AddSheet />
      <GlobalOverlays />
    </div>
  )
}

export default function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <div className="desk">
          <div className="desk__inner">
            <div className="device">
              <div className="device__island" />
              <Screens />
            </div>
            <p className="desk__caption">CareCircle · Demo Day prototype · open on your iPhone and Add to Home Screen</p>
          </div>
        </div>
      </BrowserRouter>
    </AppStoreProvider>
  )
}

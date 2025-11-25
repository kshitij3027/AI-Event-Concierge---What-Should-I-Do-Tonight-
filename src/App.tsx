import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './contexts/UserContext'
import OnboardingLayout from './pages/Onboarding/OnboardingLayout'
import WelcomeStep from './pages/Onboarding/steps/WelcomeStep'
import InterestsStep from './pages/Onboarding/steps/InterestsStep'
import BudgetStep from './pages/Onboarding/steps/BudgetStep'
import GroupSizeStep from './pages/Onboarding/steps/GroupSizeStep'
import ConfirmationStep from './pages/Onboarding/steps/ConfirmationStep'
import Home from './pages/Home/Home'
import Discover from './pages/Discover/Discover'
import EventDetails from './pages/EventDetails/EventDetails'

function AppRoutes() {
  const { isOnboarded, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={isOnboarded ? <Navigate to="/home" replace /> : <Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<OnboardingLayout />}>
        <Route index element={<Navigate to="/onboarding/step/1" replace />} />
        <Route path="step/1" element={<WelcomeStep />} />
        <Route path="step/2" element={<InterestsStep />} />
        <Route path="step/3" element={<BudgetStep />} />
        <Route path="step/4" element={<GroupSizeStep />} />
        <Route path="step/5" element={<ConfirmationStep />} />
      </Route>
      <Route path="/home" element={isOnboarded ? <Home /> : <Navigate to="/onboarding" replace />} />
      <Route path="/discover" element={isOnboarded ? <Discover /> : <Navigate to="/onboarding" replace />} />
      <Route path="/event/:id" element={isOnboarded ? <EventDetails /> : <Navigate to="/onboarding" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  )
}

export default App


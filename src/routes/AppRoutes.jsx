import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '../layout/AuthLayout'
import MainLayout from '../layout/MainLayout'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import VerifyEmail from '../pages/auth/VerifyEmail'
import Dashboard from '../pages/dashboard/Dashboard'
import Transactions from '../pages/transactions/Transactions'
import TransactionDetail from '../pages/transactions/TransactionDetail'
import TransactionForm from '../pages/transactions/TransactionForm'
import Loans from '../pages/loans/Loans'
import LoanForm from '../pages/loans/LoanForm'
import Transfers from '../pages/transfers/Transfers'
import TransferForm from '../pages/transfers/TransferForm'
import Accounts from '../pages/accounts/Accounts'
import Profile from '../pages/profile/Profile'
import Onboarding from '../pages/onboarding/Onboarding'
import RequireVerifiedEmail from '../components/RequireVerifiedEmail'
import { groupRouteConfig } from './groupRouteConfig'
import { useAppContext } from '../context/AppContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/new" element={<TransactionForm />} />
        <Route path="/transactions/:id" element={<TransactionDetail />} />
        <Route path="/transactions/:id/edit" element={<TransactionForm />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/loans/new" element={<LoanForm />} />
        <Route path="/loans/:id/edit" element={<LoanForm />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/transfers/new" element={<TransferForm />} />
        <Route path="/transfers/:id/edit" element={<TransferForm />} />
        <Route path="/accounts" element={<Accounts />} />
        {groupRouteConfig.map(({ path, element, requiresVerifiedEmail }) => (
          <Route
            key={path}
            path={path}
            element={
              requiresVerifiedEmail ? (
                <RequireVerifiedEmail>{element}</RequireVerifiedEmail>
              ) : (
                element
              )
            }
          />
        ))}
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes

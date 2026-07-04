import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '../layout/AuthLayout'
import MainLayout from '../layout/MainLayout'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
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
import Groups from '../pages/groups/Groups'
import GroupDetail from '../pages/groups/GroupDetail'
import AddGroup from '../pages/groups/AddGroup'
import AddGroupExpense from '../pages/groups/AddGroupExpense'
import GroupSettlements from '../pages/groups/GroupSettlements'
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
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/new" element={<AddGroup />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/groups/:id/settlements" element={<GroupSettlements />} />
        <Route path="/groups/:id/expenses/new" element={<AddGroupExpense />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes

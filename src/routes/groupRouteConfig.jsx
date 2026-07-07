import Groups from '../pages/groups/Groups'
import GroupDetail from '../pages/groups/GroupDetail'
import AddGroup from '../pages/groups/AddGroup'
import AddGroupExpense from '../pages/groups/AddGroupExpense'
import GroupSettlements from '../pages/groups/GroupSettlements'

/**
 * Declarative route metadata so features can opt into requiring a verified
 * email (`requiresVerifiedEmail: true`) instead of hardcoding the check
 * inside every page. AppRoutes wraps flagged routes with
 * <RequireVerifiedEmail>. Add future trust-sensitive/collaborative routes
 * (e.g. invitations) here to reuse the same guard.
 */
export const groupRouteConfig = [
  { path: '/groups', element: <Groups />, requiresVerifiedEmail: true },
  { path: '/groups/new', element: <AddGroup />, requiresVerifiedEmail: true },
  { path: '/groups/:id', element: <GroupDetail />, requiresVerifiedEmail: true },
  {
    path: '/groups/:id/settlements',
    element: <GroupSettlements />,
    requiresVerifiedEmail: true,
  },
  {
    path: '/groups/:id/expenses/new',
    element: <AddGroupExpense />,
    requiresVerifiedEmail: true,
  },
]

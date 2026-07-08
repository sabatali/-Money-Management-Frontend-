const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

const request = async (path, { method = 'GET', token, body } = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null

  if (!response.ok) {
    const message = payload?.message || `Request failed (${response.status}).`
    const error = new Error(message)
    error.status = response.status
    error.data = payload
    throw error
  }

  return payload
}

export const api = {
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  getMe: (token) => request('/auth/me', { token }),
  sendVerificationEmail: (token) =>
    request('/auth/verify-email/send', { method: 'POST', token }),
  verifyEmail: (verificationToken) =>
    request('/auth/verify-email', {
      method: 'POST',
      body: { token: verificationToken },
    }),

  getGroups: (token) => request('/groups', { token }),
  getGroup: (token, id) => request(`/groups/${id}`, { token }),
  createGroup: (token, data) =>
    request('/groups', { method: 'POST', token, body: data }),
  addGroupMember: (token, id, data) =>
    request(`/groups/${id}/members`, { method: 'POST', token, body: data }),
  removeGroupMember: (token, id, memberId) =>
    request(`/groups/${id}/members/${memberId}`, { method: 'DELETE', token }),
  addGuestMember: (token, id, data) =>
    request(`/groups/${id}/members/guest`, { method: 'POST', token, body: data }),
  updateGuestMember: (token, id, memberId, data) =>
    request(`/groups/${id}/members/${memberId}/guest`, { method: 'PUT', token, body: data }),
  inviteGuestMember: (token, id, memberId, data) =>
    request(`/groups/${id}/members/${memberId}/invite`, { method: 'POST', token, body: data }),
  getPendingGuestClaims: (token) =>
    request('/group-members/pending-claims', { token }),
  claimGuestMember: (token, memberId) =>
    request(`/group-members/${memberId}/claim`, { method: 'POST', token, body: {} }),

  getGroupExpenses: (token, groupId) =>
    request(`/group-expenses?groupId=${groupId}`, { token }),
  createGroupExpense: (token, data) =>
    request('/group-expenses', { method: 'POST', token, body: data }),
  updateGroupExpense: (token, id, data) =>
    request(`/group-expenses/${id}`, { method: 'PUT', token, body: data }),
  deleteGroupExpense: (token, id) =>
    request(`/group-expenses/${id}`, { method: 'DELETE', token }),

  getGroupBalances: (token, groupId) =>
    request(`/groups/${groupId}/balances`, { token }),

  getGroupTransfers: (token, groupId) =>
    request(`/groups/${groupId}/transfers`, { token }),
  createGroupTransfer: (token, groupId, data) =>
    request(`/groups/${groupId}/transfers`, {
      method: 'POST',
      token,
      body: data,
    }),
  confirmGroupTransfer: (token, groupId, transferId, data) =>
    request(`/groups/${groupId}/transfers/${transferId}/confirm`, {
      method: 'POST',
      token,
      body: data,
    }),
  rejectGroupTransfer: (token, groupId, transferId) =>
    request(`/groups/${groupId}/transfers/${transferId}/reject`, {
      method: 'POST',
      token,
    }),

  getGroupMemberAccounts: (token, groupId) =>
    request(`/groups/${groupId}/member-accounts`, { token }),
  getMyGroupAccounts: (token, groupId) =>
    request(`/groups/${groupId}/my-accounts`, { token }),
  linkGroupAccounts: (token, groupId, data) =>
    request(`/groups/${groupId}/link-accounts`, {
      method: 'POST',
      token,
      body: data,
    }),

  searchUsers: (token, email) =>
    request(`/users/search?email=${encodeURIComponent(email)}`, { token }),

  getAccounts: (token) => request('/accounts', { token }),
  getAccountBalances: (token) => request('/accounts/balances', { token }),
  createAccount: (token, data) =>
    request('/accounts', { method: 'POST', token, body: data }),
  bulkCreateAccounts: (token, items) =>
    request('/accounts/bulk', { method: 'POST', token, body: { items } }),
  updateAccount: (token, id, data) =>
    request(`/accounts/${id}`, { method: 'PUT', token, body: data }),
  deleteAccount: (token, id) =>
    request(`/accounts/${id}`, { method: 'DELETE', token }),

  getExchangeRate: (token) => request('/settings/exchange-rate', { token }),
  updateExchangeRate: (token, data) =>
    request('/settings/exchange-rate', { method: 'PUT', token, body: data }),

  getTransactions: (token) => request('/transactions', { token }),
  createTransaction: (token, data) =>
    request('/transactions', { method: 'POST', token, body: data }),
  updateTransaction: (token, id, data) =>
    request(`/transactions/${id}`, { method: 'PUT', token, body: data }),
  deleteTransaction: (token, id) =>
    request(`/transactions/${id}`, { method: 'DELETE', token }),

  getCategories: (token) => request('/categories', { token }),
  createCategory: (token, data) =>
    request('/categories', { method: 'POST', token, body: data }),
  bulkCreateCategories: (token, items) =>
    request('/categories/bulk', { method: 'POST', token, body: { items } }),
  updateCategory: (token, id, data) =>
    request(`/categories/${id}`, { method: 'PUT', token, body: data }),
  deleteCategory: (token, id) =>
    request(`/categories/${id}`, { method: 'DELETE', token }),

  getMasterAccounts: (token) => request('/master-data/accounts', { token }),
  getMasterCategories: (token, type) =>
    request(`/master-data/categories${type ? `?type=${type}` : ''}`, { token }),

  getLoans: (token) => request('/loans', { token }),
  createLoan: (token, data) =>
    request('/loans', { method: 'POST', token, body: data }),
  updateLoan: (token, id, data) =>
    request(`/loans/${id}`, { method: 'PUT', token, body: data }),
  deleteLoan: (token, id) => request(`/loans/${id}`, { method: 'DELETE', token }),

  getTransfers: (token) => request('/transfers', { token }),
  createTransfer: (token, data) =>
    request('/transfers', { method: 'POST', token, body: data }),
  updateTransfer: (token, id, data) =>
    request(`/transfers/${id}`, { method: 'PUT', token, body: data }),
  deleteTransfer: (token, id) =>
    request(`/transfers/${id}`, { method: 'DELETE', token }),

  resetDatabase: (token) =>
    request('/dev/reset-database', {
      method: 'POST',
      token,
      body: { confirm: 'RESET' },
    }),
}

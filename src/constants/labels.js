/**
 * English + Roman Urdu labels for money terms.
 * API values (Lent, Borrowed, Pending, Returned) stay unchanged — only display text is bilingual.
 */

export const loanTypeDisplay = {
  Lent: {
    en: 'Lent',
    ur: 'Udhar diya',
    hint: 'Main ne kisi ko paise diye',
  },
  Borrowed: {
    en: 'Borrowed',
    ur: 'Udhar liya',
    hint: 'Main ne kisi se paise liye',
  },
}

export const loanStatusDisplay = {
  Pending: {
    en: 'Pending',
    ur: 'Abhi baqi',
    hint: 'Abhi wapas nahi hua',
  },
  Returned: {
    en: 'Returned',
    ur: 'Wapas ho gaya',
    hint: 'Paise wapas aa gaye',
  },
}

export const balanceDisplay = {
  receive: { en: 'Receive', ur: 'Milna hai', hint: 'Aap ko paise milenge' },
  pay: { en: 'Pay', ur: 'Dena hai', hint: 'Aap ko paise dene hain' },
  settled: { en: 'Settled', ur: 'Clear', hint: 'Sab theek — koi baqi nahi' },
}

export const formatBilingual = ({ en, ur }, separator = ' · ') =>
  `${en}${separator}${ur}`

export const formatBilingualBlock = ({ en, ur, hint }) => ({
  primary: formatBilingual({ en, ur }),
  hint,
})

export const getLoanTypeLabel = (type) =>
  loanTypeDisplay[type] || loanTypeDisplay.Lent

export const getLoanStatusLabel = (status) =>
  loanStatusDisplay[status] || { en: status, ur: status, hint: '' }

/** Badge: "Lent · Udhar diya" */
export const loanTypeBadge = (type) => formatBilingual(getLoanTypeLabel(type))

/** Badge: "Pending · Abhi baqi" */
export const loanStatusBadge = (status) =>
  formatBilingual(getLoanStatusLabel(status))

export const labels = {
  loans: {
    pageTitle: 'Loans · Udhar',
    pageSubtitle:
      'Track udhar — money you lent (diya) or borrowed (liya) from friends.',
    addLoan: 'Add Loan · Udhar likho',
    editLoan: 'Edit Loan · Udhar badlo',
    formSubtitle:
      'Record udhar with friends or family — diya ya liya, dono likh sakte hain.',
    person: 'Person · Naam',
    loanType: 'Type · Kis tarah ka udhar?',
    status: 'Status · Ab kya haal hai?',
    dateLent: 'Date Lent · Kab diya',
    dateBorrowed: 'Date Borrowed · Kab liya',
    dateReturned: 'Date Returned · Kab wapas mila',
    datePaidBack: 'Date Paid Back · Kab wapas kiya',
    lentTo: (name) => `Lent to · ${name} ko diya`,
    borrowedFrom: (name) => `Borrowed from · ${name} se liya`,
    returnedTo: 'Returned to · Wapas is account mein',
    receivedIn: 'Received in · Is account mein aaya',
    paidBackFrom: 'Paid back from · Is account se wapas kiya',
    fromAccount: 'From account · Kis account se',
  },
  groups: {
    subtitle: 'Dekho kaun ko dena hai, kaun ko milna hai — aur kaise clear karna hai.',
    balancesTitle: 'Balances · Hisaab',
    balancesSubtitle: 'Green = Milna hai (receive) · Red = Dena hai (pay)',
    whoPaysTitle: 'Who pays whom · Kaun kisko dega',
    whoPaysSubtitle: 'Suggested payments · Suggested tareeqa',
    everyoneSettled: 'Everyone is settled · Sab clear hai',
    pays: (from, to, amount) =>
      `${from} pays ${to} · ${from} ${to} ko PKR ${amount.toLocaleString()} dega`,
    payYourShare: (amount) =>
      `Pay your share · Apna hissa do (PKR ${amount.toLocaleString()})`,
    settlePayment: 'Settle payment · Payment likho',
    settleSubtitle: 'Jab koi paise de de, yahan record karo.',
    paidBy: (name) => `Paid by · ${name} ne diye`,
    settlementsPageTitle: 'Settlements · Group hisaab',
    settlementsPageSubtitle: 'Who owes whom, payment status, and pending requests',
    viewSettlements: 'Open settlements page',
    pairwiseTitle: 'Net with each member · Har member ke sath hisaab',
    pairwiseSubtitle: 'Opposite debts are combined — pay the net amount only.',
    minimumPaymentsTitle: 'Minimum payments · Kam se kam payments',
    minimumPaymentsSubtitle: 'Fewest transfers to clear everyone.',
    payNow: (amount) => `Pay PKR ${amount.toLocaleString()} · Abhi do`,
    payAllIOwe: (amount) => `Pay all I owe · Saara hisaab do (PKR ${amount.toLocaleString()})`,
    netOwes: (from, to, amount) =>
      `${from} owes ${to} · ${from} ${to} ko PKR ${amount.toLocaleString()} dena hai`,
  },
  dashboard: {
    loansHint: 'Udhar · Lent or borrowed money',
  },
  nav: {
    loans: 'Loans · Udhar',
  },
}

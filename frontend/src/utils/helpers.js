// ── Aliases for backward compatibility with subagent-generated pages ──────────
export function getStatusStyle(status) {
  const styles = {
    pending:   { bg: 'rgba(245,158,11,0.12)', text: '#FBBF24', border: 'rgba(245,158,11,0.2)' },
    paid:      { bg: 'rgba(37,99,235,0.12)', text: '#60A5FA', border: 'rgba(37,99,235,0.2)' },
    completed: { bg: 'rgba(34,197,94,0.12)', text: '#4ADE80', border: 'rgba(34,197,94,0.2)' },
    cancelled: { bg: 'rgba(239,68,68,0.12)', text: '#F87171', border: 'rgba(239,68,68,0.2)' },
  }
  return styles[status] || { bg: 'rgba(255,255,255,0.05)', text: '#94A3B8', border: 'rgba(255,255,255,0.1)' }
}

export function formatOrderId(id) {
  return shortenOrderId(id)
}
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getStatusColor(status) {
  const colors = {
    pending: 'badge-pending',
    paid: 'badge-paid',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  }
  return colors[status] || 'badge'
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    paid: 'Paid',
    completed: 'Collected',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}

export function getCategoryBadge(category) {
  const classes = {
    Food: 'badge-food',
    Beverages: 'badge-beverages',
    Stationery: 'badge-stationery',
  }
  return classes[category] || 'badge'
}

export function truncateText(text, maxLength = 80) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function shortenOrderId(id) {
  if (!id) return ''
  return `#${id.slice(-8).toUpperCase()}`
}

// Alias used by AdminProducts subagent page
export function getCategoryColor(category) {
  return getCategoryBadge(category)
}

// Convert a File object to a base64 string (without the data:xxx;base64, prefix)
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

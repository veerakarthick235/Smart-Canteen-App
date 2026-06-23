import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { FiCamera, FiSearch, FiCheckCircle, FiXCircle, FiAlertTriangle, FiClock, FiUser, FiPackage, FiRefreshCw } from 'react-icons/fi'
import AdminLayout from '../../components/AdminLayout.jsx'
import api from '../../api/axios.js'
import { formatCurrency, formatDate, shortenOrderId } from '../../utils/helpers.js'
import toast from 'react-hot-toast'

const RESULT_TYPES = {
  SUCCESS: 'success',
  ALREADY_COLLECTED: 'already_collected',
  PAYMENT_NOT_COMPLETED: 'payment_not_completed',
  INVALID_QR_CODE: 'invalid',
}

function ResultCard({ result, onReset }) {
  if (!result) return null

  const { success, errorCode, message, data } = result

  if (success && data) {
    const { student, items, totalAmount, paymentId, collectedAt, order } = data
    return (
      <div className="card border-2 border-success animate-slide-up overflow-hidden">
        {/* Success banner */}
        <div className="bg-green-50 px-6 py-4 flex items-center gap-3 border-b border-green-100">
          <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center shrink-0">
            <FiCheckCircle size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-green-800 text-lg">✅ Collection Successful</p>
            <p className="text-green-600 text-sm">Order marked as collected</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-green-600">Order</p>
            <p className="font-bold text-green-800 text-sm font-mono">{shortenOrderId(order?._id)}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Student Info */}
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FiUser size={13} /> Student Details
            </p>
            <div className="space-y-2">
              <InfoRow label="Name" value={student?.fullName || '—'} />
              <InfoRow label="Student ID" value={student?.studentId || '—'} />
              <InfoRow label="Department" value={student?.department || '—'} />
              <InfoRow label="Year" value={student?.year || '—'} />
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-3">Payment Details</p>
            <div className="space-y-2">
              <InfoRow label="Total Amount" value={formatCurrency(totalAmount)} highlight />
              <InfoRow label="Payment ID" value={paymentId ? `${paymentId.slice(0, 20)}…` : '—'} mono />
              <InfoRow label="Collected At" value={formatDate(collectedAt)} />
            </div>
          </div>

          {/* Items */}
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FiPackage size={13} /> Ordered Items
            </p>
            <div className="bg-bgLight rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-textSecondary">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-textSecondary">Category</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-textSecondary">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-textSecondary">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-textSecondary">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(items || []).map((item, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-bgLight overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
                            {item.image ? (
                              <img 
                                src={item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`} 
                                alt={item.name} 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <span className="text-gray-400">🍽</span>
                            )}
                          </div>
                          <span className="font-medium text-textPrimary">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-textSecondary">{item.category}</td>
                      <td className="px-4 py-2.5 text-right text-textPrimary">×{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-textSecondary">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-textPrimary">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-green-50">
                    <td colSpan={4} className="px-4 py-2.5 font-bold text-textPrimary">Total</td>
                    <td className="px-4 py-2.5 text-right font-bold text-success text-base">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onReset} className="btn-primary w-full gap-2">
            <FiRefreshCw size={16} /> Scan Next QR
          </button>
        </div>
      </div>
    )
  }

  // Error states
  const errorConfig = {
    ALREADY_COLLECTED: {
      icon: FiAlertTriangle,
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      iconBg: 'bg-amber-500',
      title: 'Already Collected',
      titleColor: 'text-amber-800',
      msgColor: 'text-amber-600',
      emoji: '⚠️',
    },
    PAYMENT_NOT_COMPLETED: {
      icon: FiXCircle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      iconBg: 'bg-yellow-500',
      title: 'Payment Not Completed',
      titleColor: 'text-yellow-800',
      msgColor: 'text-yellow-600',
      emoji: '💳',
    },
    INVALID_QR_CODE: {
      icon: FiXCircle,
      bg: 'bg-red-50',
      border: 'border-red-300',
      iconBg: 'bg-danger',
      title: 'Invalid QR Code',
      titleColor: 'text-red-800',
      msgColor: 'text-red-600',
      emoji: '❌',
    },
  }

  const cfg = errorConfig[errorCode] || errorConfig.INVALID_QR_CODE
  const Icon = cfg.icon

  return (
    <div className={`card border-2 ${cfg.border} animate-slide-up overflow-hidden`}>
      <div className={`${cfg.bg} px-6 py-5 flex items-center gap-3`}>
        <div className={`w-10 h-10 ${cfg.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className={`font-bold ${cfg.titleColor} text-lg`}>{cfg.emoji} {cfg.title}</p>
          <p className={`${cfg.msgColor} text-sm mt-0.5`}>{message}</p>
        </div>
      </div>
      <div className="px-6 pb-6 pt-4">
        <button onClick={onReset} className="btn-secondary w-full gap-2">
          <FiRefreshCw size={16} /> Try Again
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight, mono }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-textSecondary shrink-0">{label}</span>
      <span className={`font-medium text-right ${highlight ? 'text-success font-bold' : 'text-textPrimary'} ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  )
}

export default function AdminScanner() {
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [manualLoading, setManualLoading] = useState(false)
  const [scanHistory, setScanHistory] = useState([])
  const scannerRef = useRef(null)
  const scannerInstanceRef = useRef(null)

  const processToken = useCallback(async (token) => {
    if (!token?.trim()) return
    try {
      const res = await api.post('/api/qr/scan', { token: token.trim() })
      setScanResult(res.data)

      // Add to history
      setScanHistory(prev => [{
        token: token.slice(0, 8) + '…',
        success: res.data.success,
        time: new Date().toLocaleTimeString(),
        label: res.data.success
          ? res.data.data?.student?.fullName || 'Unknown'
          : res.data.errorCode || 'Error',
      }, ...prev.slice(0, 4)])

    } catch (err) {
      const errData = err.response?.data || { success: false, errorCode: 'INVALID_QR_CODE', message: 'Scan failed' }
      setScanResult(errData)
    }
  }, [])

  const startScanner = useCallback(() => {
    if (scannerInstanceRef.current) return
    setScanning(true)
    setScanResult(null)

    setTimeout(() => {
      if (!document.getElementById('qr-reader')) return

      const html5QrCode = new Html5Qrcode("qr-reader")
      scannerInstanceRef.current = html5QrCode

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          if (scannerInstanceRef.current) {
            scannerInstanceRef.current.stop().catch(() => {})
            scannerInstanceRef.current = null
          }
          await processToken(decodedText)
          setScanning(false)
        },
        () => {} // ignore errors
      ).catch((err) => {
        console.error("Camera start failed", err)
        toast.error("Could not start camera. Please check permissions.")
        setScanning(false)
      })
    }, 100)
  }, [processToken])

  const stopScanner = useCallback(() => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {})
      scannerInstanceRef.current = null
    }
    setScanning(false)
  }, [])

  const handleReset = useCallback(() => {
    setScanResult(null)
    stopScanner()
  }, [stopScanner])

  useEffect(() => {
    return () => stopScanner()
  }, [stopScanner])

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualToken.trim()) return
    setManualLoading(true)
    await processToken(manualToken)
    setManualToken('')
    setManualLoading(false)
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-textPrimary">QR Scanner</h1>
          <p className="text-textSecondary mt-1">Scan student QR codes to confirm item collection</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Panel */}
          <div className="lg:col-span-2 space-y-5">

            {!scanResult ? (
              <>
                {/* Camera Scanner */}
                <div className="card overflow-hidden">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiCamera size={18} className="text-primary-600" />
                      <span className="font-semibold text-textPrimary">Camera Scanner</span>
                    </div>
                    {scanning
                      ? <button onClick={stopScanner} className="btn-danger text-sm py-1.5 px-4">Stop</button>
                      : <button onClick={startScanner} className="btn-primary text-sm py-1.5 px-4 gap-2"><FiCamera size={15} />Start Camera</button>
                    }
                  </div>

                  {scanning ? (
                    <div className="p-4">
                      {/* html5-qrcode renders into this div */}
                      <div id="qr-reader" className="w-full" />
                      <p className="text-center text-sm text-textSecondary mt-3 animate-pulse-soft">
                        📷 Point camera at the QR code…
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-bgLight">
                      <div className="w-20 h-20 border-4 border-dashed border-border rounded-2xl flex items-center justify-center mb-4">
                        <FiCamera size={32} className="text-textSecondary" />
                      </div>
                      <p className="text-textSecondary font-medium">Camera is stopped</p>
                      <p className="text-textSecondary text-sm mt-1">Click "Start Camera" to begin scanning</p>
                      <button onClick={startScanner} className="btn-primary mt-4 gap-2">
                        <FiCamera size={16} /> Start Scanner
                      </button>
                    </div>
                  )}
                </div>

                {/* Manual Entry */}
                <div className="card p-5">
                  <p className="font-semibold text-textPrimary mb-1 flex items-center gap-2">
                    <FiSearch size={16} className="text-primary-600" /> Manual Token Entry
                  </p>
                  <p className="text-xs text-textSecondary mb-3">Enter the QR token manually if camera is unavailable</p>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={manualToken}
                      onChange={e => setManualToken(e.target.value)}
                      placeholder="Paste QR token UUID here…"
                      className="form-input font-mono text-sm flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!manualToken.trim() || manualLoading}
                      className="btn-primary px-4 shrink-0"
                    >
                      {manualLoading
                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Verify'
                      }
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <ResultCard result={scanResult} onReset={handleReset} />
            )}
          </div>

          {/* Right Panel — Scan History */}
          <div className="space-y-4">
            {/* Instructions */}
            <div className="card p-5">
              <p className="font-semibold text-textPrimary mb-3 text-sm">How to collect orders</p>
              <ol className="space-y-3">
                {[
                  'Ask the student to open their order QR code',
                  'Click "Start Camera" to activate the scanner',
                  'Point the camera at the student\'s QR code',
                  'Wait for the verification result',
                  'Hand over the items if status shows SUCCESS',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-textSecondary">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Scan History */}
            <div className="card p-5">
              <p className="font-semibold text-textPrimary mb-3 text-sm flex items-center gap-2">
                <FiClock size={15} /> Recent Scans
              </p>
              {scanHistory.length === 0 ? (
                <p className="text-textSecondary text-xs text-center py-4">No scans yet this session</p>
              ) : (
                <div className="space-y-2">
                  {scanHistory.map((scan, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${scan.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${scan.success ? 'bg-success' : 'bg-danger'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-textPrimary truncate">{scan.label}</p>
                        <p className="text-xs text-textSecondary">{scan.time}</p>
                      </div>
                      <span className={`text-xs font-semibold ${scan.success ? 'text-success' : 'text-danger'}`}>
                        {scan.success ? 'OK' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Guide */}
            <div className="card p-5">
              <p className="font-semibold text-textPrimary mb-3 text-sm">Status Guide</p>
              <div className="space-y-2.5">
                {[
                  { color: 'bg-success', label: 'SUCCESS', desc: 'Give items to student' },
                  { color: 'bg-amber-500', label: 'ALREADY COLLECTED', desc: 'Items already given — reject' },
                  { color: 'bg-yellow-400', label: 'PAYMENT PENDING', desc: 'Payment not done — reject' },
                  { color: 'bg-danger', label: 'INVALID QR', desc: 'Fake or expired — reject' },
                ].map(({ color, label, desc }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className={`w-3 h-3 ${color} rounded-full shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-xs font-bold text-textPrimary">{label}</p>
                      <p className="text-xs text-textSecondary">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

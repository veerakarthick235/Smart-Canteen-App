import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card overflow-hidden"
        style={{
          border: '1px solid rgba(34,197,94,0.3)',
          boxShadow: '0 0 30px rgba(34,197,94,0.1), 0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        {/* Success banner */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.15)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}>
            <FiCheckCircle size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-green-600 text-lg font-display">✅ Collection Successful</p>
            <p className="text-green-600/70 text-sm">Order marked as collected</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-green-600/60">Order</p>
            <p className="font-bold text-green-600 text-sm font-mono">{shortenOrderId(order?._id)}</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Student Info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Details</p>
            <div className="space-y-2">
              <InfoRow label="Total Amount" value={formatCurrency(totalAmount)} highlight />
              <InfoRow label="Payment ID" value={paymentId ? `${paymentId.slice(0, 20)}…` : '—'} mono />
              <InfoRow label="Collected At" value={formatDate(collectedAt)} />
            </div>
          </div>

          {/* Items */}
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiPackage size={13} /> Ordered Items
            </p>
            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(248,250,255,0.8)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(items || []).map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'rgba(248,250,255,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
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
                          <span className="font-medium text-gray-700">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-gray-500">{item.category}</td>
                      <td className="text-right text-white">×{item.quantity}</td>
                      <td className="text-right text-gray-500">{formatCurrency(item.price)}</td>
                      <td className="text-right font-semibold text-gray-800">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="font-bold text-gray-900" style={{ background: 'rgba(34,197,94,0.08)' }}>Total</td>
                    <td className="text-right font-bold text-green-600 text-base" style={{ background: 'rgba(34,197,94,0.08)' }}>{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <motion.button
            onClick={onReset}
            className="btn-primary w-full gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiRefreshCw size={16} /> Scan Next QR
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Error states
  const errorConfig = {
    ALREADY_COLLECTED: {
      icon: FiAlertTriangle,
      borderColor: 'rgba(245,158,11,0.3)',
      glowColor: 'rgba(245,158,11,0.1)',
      iconGradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      title: 'Already Collected',
      titleColor: '#FBBF24',
      msgColor: 'rgba(251,191,36,0.7)',
      emoji: '⚠️',
    },
    PAYMENT_NOT_COMPLETED: {
      icon: FiXCircle,
      borderColor: 'rgba(234,179,8,0.3)',
      glowColor: 'rgba(234,179,8,0.1)',
      iconGradient: 'linear-gradient(135deg, #EAB308, #CA8A04)',
      title: 'Payment Not Completed',
      titleColor: '#FBBF24',
      msgColor: 'rgba(251,191,36,0.7)',
      emoji: '💳',
    },
    INVALID_QR_CODE: {
      icon: FiXCircle,
      borderColor: 'rgba(239,68,68,0.3)',
      glowColor: 'rgba(239,68,68,0.1)',
      iconGradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
      title: 'Invalid QR Code',
      titleColor: '#F87171',
      msgColor: 'rgba(248,113,113,0.7)',
      emoji: '❌',
    },
  }

  const cfg = errorConfig[errorCode] || errorConfig.INVALID_QR_CODE
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="card overflow-hidden"
      style={{
        border: `1px solid ${cfg.borderColor}`,
        boxShadow: `0 0 30px ${cfg.glowColor}, 0 4px 16px rgba(0,0,0,0.2)`,
      }}
    >
      <div className="px-6 py-5 flex items-center gap-3" style={{ background: cfg.glowColor }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.iconGradient }}>
          <Icon size={22} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-lg font-display" style={{ color: cfg.titleColor }}>{cfg.emoji} {cfg.title}</p>
          <p className="text-sm mt-0.5" style={{ color: cfg.msgColor }}>{message}</p>
        </div>
      </div>
      <div className="px-6 pb-6 pt-4">
        <motion.button
          onClick={onReset}
          className="btn-secondary w-full gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiRefreshCw size={16} /> Try Again
        </motion.button>
      </div>
    </motion.div>
  )
}

function InfoRow({ label, value, highlight, mono }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`font-medium text-right ${highlight ? 'text-green-600 font-bold' : 'text-gray-900'} ${mono ? 'font-mono text-xs' : ''}`}>
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
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">QR Scanner</h1>
          <p className="text-gray-500 mt mt-1">Scan student QR codes to confirm item collection</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Panel */}
          <div className="lg:col-span-2 space-y-5">

            {!scanResult ? (
              <>
                {/* Camera Scanner */}
                <motion.div
                  className="card gradient-border rounded-3xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                      <FiCamera size={18} className="text-blue-600" />
                      <span className="font-semibold text-gray-900 font-display">Camera Scanner</span>
                    </div>
                    {scanning
                      ? <motion.button onClick={stopScanner} className="btn-danger text-sm py-1.5 px-4" whileTap={{ scale: 0.95 }}>Stop</motion.button>
                      : <motion.button onClick={startScanner} className="btn-primary text-sm py-1.5 px-4 gap-2" whileTap={{ scale: 0.95 }}><FiCamera size={15} />Start Camera</motion.button>
                    }
                  </div>

                  {scanning ? (
                    <div className="p-4">
                      {/* Scanner viewport with blue border glow */}
                      <div className="relative rounded-xl overflow-hidden"
                        style={{
                          boxShadow: '0 0 20px rgba(37,99,235,0.2), 0 0 40px rgba(37,99,235,0.1)',
                          border: '2px solid rgba(37,99,235,0.4)',
                        }}
                      >
                        {/* html5-qrcode renders into this div */}
                        <div id="qr-reader" className="w-full" />

                        {/* Scanning line animation */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <motion.div
                            className="absolute left-0 right-0 h-0.5"
                            style={{
                              background: 'linear-gradient(90deg, transparent, #2563EB, #06B6D4, #2563EB, transparent)',
                              boxShadow: '0 0 15px rgba(37,99,235,0.5)',
                            }}
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>

                        {/* Corner markers */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg pointer-events-none" />
                        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg pointer-events-none" />
                        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg pointer-events-none" />
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg pointer-events-none" />
                      </div>

                      <p className="text-center text-sm text-gray-500 mt mt-3">
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          📷 Point camera at the QR code…
                        </motion.span>
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center" style={{ background: 'rgba(15,23,42,0.3)' }}>
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          border: '4px dashed rgba(255,255,255,0.08)',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        <FiCamera size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">Camera is stopped</p>
                      <p className="text-gray-400 text-sm mt-1">Click "Start Camera" to begin scanning</p>
                      <motion.button
                        onClick={startScanner}
                        className="btn-primary mt-4 gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiCamera size={16} /> Start Scanner
                      </motion.button>
                    </div>
                  )}
                </motion.div>

                {/* Manual Entry */}
                <motion.div
                  className="card p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <p className="font-semibold text-gray-800 mb-1 flex items-center gap-2 font-display">
                    <FiSearch size={16} className="text-blue-600" /> Manual Token Entry
                  </p>
                  <p className="text-xs text-gray-400 mb-3">Enter the QR token manually if camera is unavailable</p>
                  <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={manualToken}
                      onChange={e => setManualToken(e.target.value)}
                      placeholder="Paste QR token UUID here…"
                      className="form-input font-mono text-sm flex-1"
                    />
                    <motion.button
                      type="submit"
                      disabled={!manualToken.trim() || manualLoading}
                      className="btn-primary px-5 shrink-0"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {manualLoading
                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Verify'
                      }
                    </motion.button>
                  </form>
                </motion.div>
              </>
            ) : (
              <ResultCard result={scanResult} onReset={handleReset} />
            )}
          </div>

          {/* Right Panel — Scan History */}
          <div className="space-y-4">
            {/* Instructions */}
            <motion.div
              className="card p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="font-semibold text-gray-800 mb-3 text-sm font-display">How to collect orders</p>
              <ol className="space-y-3">
                {[
                  'Ask the student to open their order QR code',
                  'Click "Start Camera" to activate the scanner',
                  'Point the camera at the student\'s QR code',
                  'Wait for the verification result',
                  'Hand over the items if status shows SUCCESS',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-white"
                      style={{ background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-500">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* Scan History */}
            <motion.div
              className="card p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2 font-display">
                <FiClock size={15} className="text-gray-500" /> Recent Scans
              </p>
              {scanHistory.length === 0 ? (
                <p className="text-gray-400 text-xs text-xs text-center py-4">No scans yet this session</p>
              ) : (
                <div className="space-y-2">
                  {scanHistory.map((scan, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl text-sm"
                      style={{
                        background: scan.success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                        border: `1px solid ${scan.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}`,
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0`}
                        style={{
                          background: scan.success ? '#4ADE80' : '#F87171',
                          boxShadow: `0 0 6px ${scan.success ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)'}`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">{scan.label}</p>
                        <p className="text-xs text-gray-400">{scan.time}</p>
                      </div>
                      <span className={`text-xs font-semibold ${scan.success ? 'text-green-600' : 'text-red-500'}`}>
                        {scan.success ? 'OK' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Status Guide */}
            <motion.div
              className="card p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="font-semibold text-gray-800 mb-3 text-sm font-display">Status Guide</p>
              <div className="space-y-2.5">
                {[
                  { color: '#4ADE80', glow: 'rgba(74,222,128,0.5)', label: 'SUCCESS', desc: 'Give items to student' },
                  { color: '#FBBF24', glow: 'rgba(251,191,36,0.5)', label: 'ALREADY COLLECTED', desc: 'Items already given — reject' },
                  { color: '#FDE047', glow: 'rgba(253,224,71,0.5)', label: 'PAYMENT PENDING', desc: 'Payment not done — reject' },
                  { color: '#F87171', glow: 'rgba(248,113,113,0.5)', label: 'INVALID QR', desc: 'Fake or expired — reject' },
                ].map(({ color, glow, label, desc }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: color, boxShadow: `0 0 6px ${glow}` }} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

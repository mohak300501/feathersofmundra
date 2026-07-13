import { useState, useRef } from 'react'
import { X, Upload, Users, CreditCard, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface RegisterWorkshopModalProps {
  workshopId: string
  maxSlots: number
  onClose: () => void
  onSuccess: () => void
}

const RegisterWorkshopModal = ({ workshopId, maxSlots, onClose, onSuccess }: RegisterWorkshopModalProps) => {
  const { user } = useAuth()
  const [members, setMembers] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!members || members < 1 || members > maxSlots) {
      setError(`Please enter a valid number of members (Max: ${maxSlots})`)
      return
    }
    if (!file) {
      setError('Please upload the payment screenshot.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1]

        const payload = {
          workshopId,
          members,
          fileData: base64Data,
          fileName: file.name,
          contentType: file.type,
          userId: user?.uid
        }

        const response = await fetch('/api/Workshop/registerWorkshop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (response.ok && data.success) {
          onSuccess()
        } else {
          setError(data.error || 'Failed to register')
        }
      }
    } catch (err) {
      console.error(err)
      setError('An unexpected error occurred.')
    } finally {
      if(error) setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-dark-border">
          <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Register for Workshop</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            {/* Payment Section */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-border p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
               <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                 <CreditCard className="w-5 h-5 text-primary-500" />
                 Scan to Pay
               </h3>
               <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                 <img src="/assets/qr.png" alt="QR Code" className="w-48 h-48 object-contain" />
               </div>
               <div className="text-center">
                 <p className="text-sm text-slate-500 mb-1">Total Amount to Pay</p>
                 <p className="text-3xl font-display font-bold text-primary-600 dark:text-primary-400">
                   ₹{members * 200}
                 </p>
               </div>
            </div>

            {/* Form Section */}
            <form id="register-form" onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4"/> How many members?
                </label>
                <p className="text-xs text-slate-500 mb-2">If your family members don't have a separate email.</p>
                <input
                  type="number"
                  min="1"
                  max={maxSlots}
                  required
                  value={members}
                  onChange={(e) => setMembers(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-border border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Screenshot</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${previewUrl ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-dark-border'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium flex items-center gap-2"><Upload className="w-5 h-5"/> Change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-slate-500 dark:text-slate-400">
                      <ImageIcon className="w-10 h-10 mb-2 text-slate-400" />
                      <p className="font-medium text-sm">Upload Screenshot</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-dark-border flex justify-end gap-3 bg-slate-50 dark:bg-dark-surface/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-border transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="register-form"
            disabled={loading}
            className="btn-primary px-8 py-2.5 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Registering...
              </>
            ) : (
              'Confirm Registration'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterWorkshopModal

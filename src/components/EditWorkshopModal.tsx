import { useState } from 'react'
import { X, Calendar, MapPin, AlignLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface WorkshopDetail {
  _id: string
  workshopCode: string
  title: string
  info: string
  datetime: string
  location: string
  mapPin: string
  participantCount: number
  featuredPhoto: string
}

interface EditWorkshopModalProps {
  workshop: WorkshopDetail
  onClose: () => void
  onSuccess: () => void
}

const EditWorkshopModal = ({ workshop, onClose, onSuccess }: EditWorkshopModalProps) => {
  const { user } = useAuth()
  
  // Initialize with existing workshop data
  // For datetime-local input, we need format YYYY-MM-DDTHH:MM
  const dateObj = new Date(workshop.datetime)
  const tzOffset = dateObj.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);

  const [title, setTitle] = useState(workshop.title || '')
  const [info, setInfo] = useState(workshop.info || '')
  const [datetime, setDatetime] = useState(localISOTime)
  const [location, setLocation] = useState(workshop.location || '')
  const [mapPin, setMapPin] = useState(workshop.mapPin || '')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !info || !datetime || !location) {
      setError('Please fill all required fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        workshopId: workshop._id,
        title,
        info,
        datetime,
        location,
        mapPin,
        userId: user?.uid
      }

      const response = await fetch('/api/Workshop/editWorkshop', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (response.ok && data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to update workshop')
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
          <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white">Edit Workshop</h2>
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

          <form id="edit-workshop-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4"/> Workshop Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-border border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4"/> Workshop Description
                </label>
                <textarea
                  required
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-border border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white transition-all resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4"/> Date and Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-border border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4"/> Location Name
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-border border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400"/> Google Maps Link (Optional)
              </label>
              <input
                type="url"
                value={mapPin}
                onChange={(e) => setMapPin(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-border border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white transition-all"
              />
            </div>
          </form>
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
            form="edit-workshop-form"
            disabled={loading}
            className="btn-primary px-8 py-2.5 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditWorkshopModal

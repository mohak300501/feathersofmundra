import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Calendar, MapPin, Share2, AlertCircle, Edit, Trash2, ArrowLeft } from 'lucide-react'
import RegisterWorkshopModal from '../components/RegisterWorkshopModal'
import AddGalleryPhotoModal from '../components/AddGalleryPhotoModal'
import EditWorkshopModal from '../components/EditWorkshopModal'
import GalleryCard from '../components/GalleryCard'

interface GalleryPhoto {
  _id: string
  fileId: string
  experience: string
  username: string
}

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
  gallery: GalleryPhoto[]
}

const WorkshopDetail = () => {
  const { workshopCode } = useParams<{ workshopCode: string }>()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [workshop, setWorkshop] = useState<WorkshopDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchWorkshop = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/Workshop/getWorkshop?workshopCode=${workshopCode}`)
      const data = await response.json()
      if (response.ok) {
        setWorkshop(data)
      } else {
        console.error('Failed to fetch workshop details:', data.error)
      }
    } catch (error) {
      console.error('Error fetching workshop details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkshop()
  }, [workshopCode])

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this workshop? This cannot be undone.")) {
      try {
        const response = await fetch('/api/Workshop/deleteWorkshop', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workshopId: workshop?._id, userId: user?.uid })
        })
        if (response.ok) {
          navigate('/workshops')
        } else {
          alert('Failed to delete workshop')
        }
      } catch (e) {
        console.error(e)
      }
      if (loading) return <LoadingSpinner />
      if (!workshop) return <div className="text-center py-20 text-2xl font-bold">Workshop not found</div>

      const dateObj = new Date(workshop.datetime)
      const isPast = dateObj < new Date()
      const isFull = workshop.participantCount >= 25

      return (
        <div className="space-y-8 animate-fade-in relative z-10 max-w-6xl mx-auto pb-16 pt-4">
          <button
            onClick={() => navigate('/workshops')}
            className="flex items-center space-x-2 text-slate-500 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workshops</span>
          </button>

          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl h-[50vh] min-h-[400px]">
            <img
              src={`/.netlify/functions/General/servePhoto?id=${workshop.featuredPhoto}`}
              alt="Workshop Poster"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${workshop.featuredPhoto}&sz=w1000` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10 text-white">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="bg-primary-600/80 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} at {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {isPast ? (
                  <div className="bg-slate-700/80 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">Completed</div>
                ) : isFull ? (
                  <div className="bg-red-500/80 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">Full (25/25)</div>
                ) : (
                  <div className="bg-green-500/80 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    {workshop.participantCount} / 25 Registered
                  </div>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4 leading-tight shadow-black/50 drop-shadow-lg">
                {workshop.title || "Birdwatching Workshop"}
              </h1>

              <div className="flex items-center space-x-2 text-lg text-slate-200">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span>{workshop.location}</span>
                {workshop.mapPin && (
                  <a href={workshop.mapPin} target="_blank" rel="noreferrer" className="text-primary-300 hover:text-primary-200 underline ml-2 text-sm font-medium">
                    (View on Map)
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="glass-card p-8 text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <p className="whitespace-pre-wrap">{workshop.info}</p>
          </div>

          {/* Action / Status Bar */}
          <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Ready to join the adventure?</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Explore the avian wonders of Mundra with guided expertise. {25 - workshop.participantCount} slots left!
              </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              {!user ? (
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-6 py-3 rounded-xl font-medium flex items-center space-x-2 w-full justify-center">
                  <AlertCircle className="w-5 h-5" />
                  <span>Log in to register in this workshop</span>
                </div>
              ) : isPast ? (
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-xl font-medium flex items-center space-x-2 w-full justify-center">
                  <span>Workshop completed</span>
                </div>
              ) : isFull ? (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-6 py-3 rounded-xl font-medium flex items-center space-x-2 w-full justify-center">
                  <span>Workshop full</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="btn-primary w-full md:w-auto px-8 py-3 text-lg shadow-xl shadow-primary-500/20"
                >
                  Register Now
                </button>
              )}

              {user && isAdmin && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setIsEditModalOpen(true)} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={handleDelete} className="p-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4 border-b border-slate-200 dark:border-dark-border pb-4">
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200">Workshop Gallery</h2>
                <p className="text-slate-500 mt-1">Memories captured during this workshop</p>
              </div>

              {user && (
                <button
                  onClick={() => setIsGalleryModalOpen(true)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-dark-surface hover:bg-slate-200 dark:hover:bg-dark-border text-slate-700 dark:text-slate-200 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share your experience</span>
                </button>
              )}
            </div>

            {workshop.gallery && workshop.gallery.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {workshop.gallery.map(photo => (
                  <GalleryCard key={photo._id} photo={photo} />
                ))}
              </div>
            ) : (
              <div className="glass-card py-16 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-slate-100 dark:bg-dark-surface rounded-full mb-4">
                  <Share2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No photos yet</h3>
                <p className="text-slate-500 max-w-sm">Be the first to share your memories and experiences from this workshop.</p>
              </div>
            )}
          </div>

          {isRegisterModalOpen && (
            <RegisterWorkshopModal
              workshopId={workshop._id}
              maxSlots={25 - workshop.participantCount}
              onClose={() => setIsRegisterModalOpen(false)}
              onSuccess={() => {
                setIsRegisterModalOpen(false)
                fetchWorkshop()
              }}
            />
          )}

          {isGalleryModalOpen && (
            <AddGalleryPhotoModal
              workshopId={workshop._id}
              onClose={() => setIsGalleryModalOpen(false)}
              onSuccess={() => {
                setIsGalleryModalOpen(false)
                fetchWorkshop()
              }}
            />
          )}

          {isEditModalOpen && (
            <EditWorkshopModal
              workshop={workshop}
              onClose={() => setIsEditModalOpen(false)}
              onSuccess={() => {
                setIsEditModalOpen(false)
                fetchWorkshop()
              }}
            />
          )}

        </div>
      )
    }
  }
}
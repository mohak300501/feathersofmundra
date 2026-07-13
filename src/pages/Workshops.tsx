import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import WorkshopCard from '../components/WorkshopCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Leaf, Users, Heart, IndianRupee } from 'lucide-react'
import AddWorkshopModal from '../components/AddWorkshopModal'

interface Workshop {
  workshopCode: string
  info: string
  datetime: string
  location: string
  mapPin: string
  participantCount: number
  featuredPhoto: string
}

const Workshops = () => {
  const { user, isAdmin } = useAuth()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchWorkshops = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/Workshop/getWorkshops')
      const data = await response.json()
      if (response.ok) {
        setWorkshops(data)
      } else {
        console.error('Failed to fetch workshops:', data.error)
      }
    } catch (error) {
      console.error('Error fetching workshops:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkshops()
  }, [])

  // Group by month and year
  const groupedWorkshops = workshops.reduce((acc, workshop) => {
    const date = new Date(workshop.datetime)
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(workshop)
    return acc
  }, {} as Record<string, Workshop[]>)

  return (
    <div className="space-y-12 animate-fade-in relative z-10">
      {/* Hero / Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-900 to-bird-900 text-white shadow-2xl p-8 md:p-12 mt-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-bird-200">
            Weekend Birdwatching Workshops at Mundra
          </h1>
          
          <div className="space-y-4 text-lg md:text-xl text-primary-100 font-medium leading-relaxed">
             <p>
               In this technological age, our busy lives are filled with screens, schedules, and responsibilities. We have forgotten the simple joy of spending time in nature and marvelling at its magic. Stepping out into the wild, away from the chaos of the city, is known to bring lasting calmness, curiosity, and a refreshing sense of wonder.
             </p>
             <p>
               So, I present to the citizens of Mundra, an opportunity to connect with Mother Nature, through a blissful adventure filled with colourful feathers, melodious bird calls, and amazing stories from the Avian World! I have already catalogued nearly 50 species in and around Samudra Township, and 50 more across other regions of Mundra, including winter migrants!
             </p>
          </div>
        </div>
      </div>

      {/* Features/Details */}
      <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
        <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
            <Leaf className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Learn & Explore</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Learn to identify birds with visual and auditory cues, use binoculars and Merlin Bird ID app, explore habitats, diets, and unique traits.
          </p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
           <div className="p-3 bg-bird-100 dark:bg-bird-900/30 rounded-full text-bird-600 dark:text-bird-400">
             <Heart className="w-8 h-8" />
           </div>
           <h3 className="font-bold text-lg text-slate-800 dark:text-white">Connect & Conserve</h3>
           <p className="text-sm text-slate-600 dark:text-slate-400">
             Enjoy sharing fun facts and folk tales, know about interdependence of birds and nature, adopt ethical and conservation practices.
           </p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
           <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600 dark:text-pink-400">
             <Users className="w-8 h-8" />
           </div>
           <h3 className="font-bold text-lg text-slate-800 dark:text-white">Limited Batches</h3>
           <p className="text-sm text-slate-600 dark:text-slate-400">
             For a meaningful experience, each workshop is limited to 25 participants. Don't worry, more workshops coming soon!
           </p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center space-y-3">
           <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600 dark:text-pink-400">
             <IndianRupee className="w-8 h-8" />
           </div>
           <h3 className="font-bold text-lg text-slate-800 dark:text-white">Commitment</h3>
           <p className="text-sm text-slate-600 dark:text-slate-400">
             To ensure your commitment towards a workshop, a small contribution of ₹200 per participant is requested from you.
           </p>
        </div>
      </div>

      {/* Admin Controls */}
      {user && isAdmin && (
        <div className="flex justify-end px-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Workshop</span>
          </button>
        </div>
      )}

      {/* Workshops List */}
      <div className="px-4 pb-12">
        <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200 mb-8 text-center">
          Upcoming & Past Workshops
        </h2>
        
        {loading ? (
          <LoadingSpinner />
        ) : workshops.length === 0 ? (
          <div className="text-center py-12 glass-card">
            <p className="text-xl text-slate-600 dark:text-slate-400">No workshops available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-12 max-w-7xl mx-auto">
             {Object.entries(groupedWorkshops).map(([monthYear, monthWorkshops]) => (
               <div key={monthYear} className="space-y-6">
                 <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 border-b-2 border-primary-500/30 pb-2 inline-block">
                   {monthYear}
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {monthWorkshops.map(ws => (
                     <WorkshopCard key={ws.workshopCode} {...ws} />
                   ))}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddWorkshopModal 
           onClose={() => setIsAddModalOpen(false)} 
           onSuccess={() => {
              setIsAddModalOpen(false)
              fetchWorkshops()
           }}
        />
      )}
    </div>
  )
}

export default Workshops
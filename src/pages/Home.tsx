import { useState, useEffect } from 'react'
import BirdCard from '../components/BirdCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Search, Bird } from 'lucide-react'

interface Bird {
  id: string
  commonName: string
  scientificName: string
  familyName: string
  familyDisplay: string
  photoCount: number
  featuredPhoto?: string
  commonCode: string
}

const Home = () => {
  const [birds, setBirds] = useState<Bird[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchBirds = async () => {
      try {
        const response = await fetch('/api/getBirds');
        const data = await response.json();
        
        if (data.success && data.birds) {
          setBirds(data.birds)
        } else {
          console.error('Failed to fetch birds:', data.error, data.details || '')
        }
      } catch (error) {
        console.error('Error fetching birds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBirds()
  }, [])

  const filteredBirds = birds.filter(bird =>
    bird.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bird.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bird.commonCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bird.familyName && bird.familyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (bird.familyDisplay && bird.familyDisplay.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sortedFamilies: string[] = []
  const groupedBirds = filteredBirds.reduce((acc, bird) => {
    const family = bird.familyDisplay || bird.familyName || 'Uncategorized'
    if (!acc[family]) {
      acc[family] = []
      sortedFamilies.push(family)
    }
    acc[family].push(bird)
    return acc
  }, {} as Record<string, Bird[]>)

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-12 animate-fade-in relative z-10">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-8 pb-4">
        <h1 className="section-header leading-tight">
          Feathers of Mundra
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
          Discover the beauty of birds through stunning photography from the Mundra region
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-bird-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-primary-500 h-6 w-6 z-10" />
          <input
            type="text"
            placeholder="Search birds by name, scientific name, code, or family..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-lg text-lg"
          />
        </div>
      </div>

      {/* Birds Grid grouped by Family Name */}
      {filteredBirds.length === 0 ? (
        <div className="glass-card text-center py-16 max-w-lg mx-auto">
          <div className="p-4 bg-slate-100 dark:bg-dark-surface rounded-full inline-block mb-6 shadow-inner">
            <Bird className="h-16 w-16 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {searchTerm ? 'No birds found' : 'No birds available'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Check back later for beautiful bird photos'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {sortedFamilies.map(family => (
            <div key={family} className="animate-slide-up">
              <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-200 mb-8 pb-4 border-b border-slate-200 dark:border-dark-border inline-block">
                {family}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {groupedBirds[family].map((bird) => (
                  <BirdCard
                    key={bird.id}
                    id={bird.id}
                    commonName={bird.commonName}
                    scientificName={bird.scientificName}
                    photoCount={bird.photoCount}
                    featuredPhoto={bird.featuredPhoto}
                    commonCode={bird.commonCode}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="text-center pt-10 pb-6 border-t border-slate-200 dark:border-dark-border">
        <p className="text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-dark-surface px-6 py-2 rounded-full inline-block shadow-inner">
          Showing {filteredBirds.length} species
        </p>
      </div>
    </div>
  )
}

export default Home
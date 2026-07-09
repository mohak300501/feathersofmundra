import { Link } from 'react-router-dom'
import { Bird, Camera } from 'lucide-react'

interface BirdCardProps {
  id: string
  commonName: string
  scientificName: string
  photoCount: number
  featuredPhoto?: string
  commonCode: string
}

const BirdCard = ({ id, commonName, scientificName, photoCount, featuredPhoto, commonCode }: BirdCardProps) => {
  return (
    <Link to={commonCode ? `/bird/${commonCode.toLowerCase()}` : `/bird/${id}`}>
      <div className="bird-card group">
        <div className="relative h-56 bg-slate-200 dark:bg-slate-800 overflow-hidden">
          {featuredPhoto ? (
            <img
              src={featuredPhoto}
              alt={commonName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-bird-100 dark:from-primary-900 dark:to-bird-900 group-hover:scale-105 transition-transform duration-500">
              <Bird className="h-20 w-20 text-primary-300 dark:text-primary-700 opacity-50" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1.5 shadow-lg">
            <Camera className="h-4 w-4" />
            <span>{photoCount}</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
            {commonName}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 italic">
            {scientificName}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default BirdCard
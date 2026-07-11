import { Link } from 'react-router-dom'
import { Bird, Camera } from 'lucide-react'
import { IUCN_STATUS_MAP } from '../utils/constants'

interface BirdCardProps {
  id: string
  commonName: string
  scientificName: string
  photoCount: number
  featuredPhoto?: string
  commonCode: string
  iucnStatus: string
  isMigratory: boolean
}

const BirdCard = ({ id, commonName, scientificName, photoCount, featuredPhoto, commonCode, iucnStatus, isMigratory }: BirdCardProps) => {
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
        <div className="p-5 flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
              {commonName}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
              {scientificName}
            </p>
          </div>
          <div className="flex flex-col space-y-1.5 items-center justify-center ml-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold 
                ${IUCN_STATUS_MAP[iucnStatus] ? IUCN_STATUS_MAP[iucnStatus].color : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'}`} 
                title={IUCN_STATUS_MAP[iucnStatus] ? IUCN_STATUS_MAP[iucnStatus].label : 'IUCN Status'}
            >
              {iucnStatus}
            </div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${isMigratory ? 'bg-pink-500 shadow-pink-500/30' : 'bg-blue-500 shadow-blue-500/30'}`} title="Migratory Status">
              {isMigratory? 'M': 'R'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default BirdCard
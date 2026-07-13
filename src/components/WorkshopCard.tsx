import { Link } from 'react-router-dom'
import { Calendar as CalendarIcon, MapPin, Users } from 'lucide-react'

interface WorkshopCardProps {
  workshopCode: string
  info: string
  datetime: string
  location: string
  participantCount: number
  featuredPhoto: string
}

const WorkshopCard = ({ workshopCode, info, datetime, location, participantCount, featuredPhoto }: WorkshopCardProps) => {
  const dateObj = new Date(datetime)
  const isPast = dateObj < new Date()
  const isFull = participantCount >= 25

  return (
    <Link to={`/workshop/${workshopCode}`}>
      <div className={`bird-card group flex flex-col h-full ${isPast ? 'opacity-80' : ''}`}>
        <div className="relative h-56 bg-slate-200 dark:bg-slate-800 overflow-hidden">
          {featuredPhoto ? (
            <img
              src={`/.netlify/functions/General/servePhoto?id=${featuredPhoto}`}
              alt="Workshop Poster"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              onError={(e) => {
                 // fallback if servePhoto doesn't work for this
                 (e.target as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${featuredPhoto}&sz=w800`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-bird-100 dark:from-primary-900 dark:to-bird-900 group-hover:scale-105 transition-transform duration-500">
              <CalendarIcon className="h-20 w-20 text-primary-300 dark:text-primary-700 opacity-50" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {isPast ? (
               <div className="bg-slate-800/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                 Completed
               </div>
            ) : isFull ? (
               <div className="bg-red-500/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                 Full
               </div>
            ) : (
               <div className="bg-green-500/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                 Open
               </div>
            )}
          </div>

          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex flex-col shadow-lg">
            <div className="flex items-center space-x-1.5 mb-1">
              <CalendarIcon className="h-4 w-4 text-primary-300" />
              <span>{dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="text-xs text-slate-300 pl-5">
              {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
           <h3 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 line-clamp-2">
              {info || "Birdwatching Workshop"}
           </h3>
           
           <div className="mt-auto space-y-2">
             <div className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-400">
               <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
               <span className="line-clamp-1">{location}</span>
             </div>
             
             <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
               <div className="flex items-center space-x-1.5 text-sm text-slate-500">
                 <Users className="h-4 w-4" />
                 <span>{participantCount} / 25 Participants</span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </Link>
  )
}

export default WorkshopCard

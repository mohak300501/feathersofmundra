import { Github, ExternalLink, Dna, Bird, Camera, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [stats, setStats] = useState({ totalFamilies: 0, totalBirds: 0, totalPhotos: 0, totalUsers: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/publicStats')
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalFamilies: data.totalFamilies,
            totalBirds: data.totalBirds,
            totalPhotos: data.totalPhotos,
            totalUsers: data.totalUsers
          })
        }
      } catch (e) {
        // fail silently
      }
    }
    fetchStats()
  }, [])

  return (
    <footer className="bg-white/70 dark:bg-dark-surface/30 border-t border-slate-200 dark:border-dark-border mt-auto backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4 py-6">
        {/* System Stats */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 mb-4">
          <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
            <Dna className="h-5 w-5 text-primary-600" />
            <b>{stats.totalFamilies}</b>&nbsp;Families
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
            <Bird className="h-5 w-5 text-primary-600" />
            <b>{stats.totalBirds}</b>&nbsp;Birds
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
            <Camera className="h-5 w-5 text-bird-600" />
            <b>{stats.totalPhotos}</b>&nbsp;Photos
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
            <Users className="h-5 w-5 text-green-600" />
            <b>{stats.totalUsers}</b>&nbsp;Users
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center space-y-6 md:space-y-0 w-full">
          {/* Copyright */}
          <div className="text-sm text-slate-500 dark:text-slate-400">
            © {currentYear} Mohak Ketan Patil
          </div>
          {/* Links */}
          <div className="flex flex-col md:flex-row items-center md:items-center space-y-3 md:space-y-0 md:space-x-6">
            <Link
              to="/about"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              About
            </Link>
            <Link
              to="/author"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Author
            </Link>
            <Link
              to="/guidelines"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Guidelines
            </Link>
            <Link
              to="/terms"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Terms & Conditions
            </Link>
            <a
              href="https://github.com/mohak300501/feathersofmundra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://ccf.iitr.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span>IITR CCF</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 
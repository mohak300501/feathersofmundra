import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Phone, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, username: currentUsername, whatsapp: currentWhatsapp, updateProfile } = useAuth()
  
  const [username, setUsername] = useState(currentUsername || '')
  const [whatsapp, setWhatsapp] = useState(currentWhatsapp || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUsername(currentUsername || '')
    setWhatsapp(currentWhatsapp || '')
  }, [currentUsername, currentWhatsapp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const phoneRegex = /^[0-9]{10}$/
    if (whatsapp && !phoneRegex.test(whatsapp)) {
      toast.error('Please enter a valid 10-digit WhatsApp number')
      return
    }

    setLoading(true)
    try {
      await updateProfile(username, whatsapp)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass rounded-2xl p-8 shadow-xl animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Profile</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Update your account details and contact information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="input-field bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-75"
            />
            <p className="mt-1 text-xs text-slate-500">Email address cannot be changed.</p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field pl-10"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              WhatsApp Mobile No.
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="whatsapp"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="input-field pl-10"
                placeholder="Enter your WhatsApp number"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || (!username)}
              className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile

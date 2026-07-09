import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Bird, Plus, Trash2, Settings, Users, Camera, Edit2, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface BirdData {
  id: string
  commonName: string
  scientificName: string
  familyName: string
  photoCount: number
  commonCode: string
}

interface Stats {
  totalBirds: number
  totalPhotos: number
}

const AdminPanel = () => {
  const { user, isAdmin } = useAuth()
  const [birds, setBirds] = useState<BirdData[]>([])
  const [stats, setStats] = useState<Stats>({ totalBirds: 0, totalPhotos: 0 })
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBird, setEditingBird] = useState<BirdData | null>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      return
    }

    fetchData()
  }, [isAdmin])

  const fetchData = async () => {
    try {
      const [birdsRes, statsRes] = await Promise.all([
        fetch('/api/getBirds'),
        fetch('/api/publicStats')
      ]);

      if (birdsRes.ok) {
        const birdsData = await birdsRes.json();
        if (birdsData.success) {
          setBirds(birdsData.birds);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalBirds: statsData.totalBirds || 0,
          totalPhotos: statsData.totalPhotos || 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBird = async (commonName: string, scientificName: string, familyName: string) => {
    setAdding(true)
    try {
      const response = await fetch('/api/addBird', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commonName,
          scientificName,
          familyName,
          userId: user?.uid
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add bird')
      }

      toast.success('Bird added successfully!')
      setShowAddModal(false)
      fetchData()
    } catch (error: any) {
      console.error('Error adding bird:', error)
      toast.error(error.message || 'Failed to add bird')
    } finally {
      setAdding(false)
    }
  }

  const handleEditBird = async (birdId: string, commonName: string, scientificName: string, familyName: string) => {
    setEditing(true)
    try {
      const response = await fetch('/api/editBird', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birdId,
          commonName,
          scientificName,
          familyName,
          userId: user?.uid
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to edit bird')
      }

      toast.success('Bird updated successfully!')
      setShowEditModal(false)
      fetchData()
    } catch (error: any) {
      console.error('Error editing bird:', error)
      toast.error(error.message || 'Failed to edit bird')
    } finally {
      setEditing(false)
    }
  }

  const handleDeleteBird = async (birdId: string, birdName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${birdName}"? This will also delete all associated photos.`)) {
      return
    }

    try {
      const response = await fetch('/api/deleteBird', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birdId: birdId,
          userId: user?.uid
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete bird')
      }

      toast.success('Bird deleted successfully!')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting bird:', error)
      toast.error('Failed to delete bird')
    }
  }

  if (!isAdmin) {
    return (
      <div className="glass-card text-center py-16 max-w-lg mx-auto mt-12">
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full inline-block mb-6 shadow-inner">
          <Settings className="h-16 w-16 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Access Denied</h3>
        <p className="text-slate-500 dark:text-slate-400 text-lg">You need admin privileges to access this page.</p>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-10 animate-fade-in relative z-10 py-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="section-header">Admin Dashboard</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Manage birds and platform features</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="glass-card flex items-center p-6 space-x-6">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
            <Bird className="h-10 w-10 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Total Species</p>
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white">{stats.totalBirds}</h2>
          </div>
        </div>
        <div className="glass-card flex items-center p-6 space-x-6">
          <div className="p-4 bg-bird-100 dark:bg-bird-900/30 rounded-2xl">
            <Camera className="h-10 w-10 text-bird-600 dark:text-bird-400" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Total Photos</p>
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white">{stats.totalPhotos}</h2>
          </div>
        </div>
      </div>

      {/* Birds Management */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 dark:border-dark-border gap-4">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Birds Directory</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Bird</span>
          </button>
        </div>

        {birds.length === 0 ? (
          <div className="text-center py-16">
            <Bird className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No birds yet</h3>
            <p className="text-slate-500 dark:text-slate-400">Add the first bird to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
              <thead className="bg-slate-50 dark:bg-dark-surface/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Common Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Scientific Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Family
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Photos
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {birds.map((bird) => (
                  <tr key={bird.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      {bird.commonName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 italic">
                      {bird.scientificName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {bird.familyName || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary-600 dark:text-primary-400">
                      {bird.commonCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-dark-bg px-2.5 py-1 rounded-full">{bird.photoCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <button
                          onClick={() => {
                            setEditingBird(bird)
                            setShowEditModal(true)
                          }}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors flex items-center space-x-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBird(bird.id, bird.commonName)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddBirdModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddBird}
          adding={adding}
        />
      )}

      {showEditModal && editingBird && (
        <EditBirdModal
          bird={editingBird}
          onClose={() => {
            setShowEditModal(false)
            setEditingBird(null)
          }}
          onEdit={handleEditBird}
          editing={editing}
        />
      )}
    </div>
  )
}

interface AddBirdModalProps {
  onClose: () => void
  onAdd: (commonName: string, scientificName: string, familyName: string) => Promise<void>
  adding: boolean
}

const AddBirdModal = ({ onClose, onAdd, adding }: AddBirdModalProps) => {
  const [commonName, setCommonName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [familyName, setFamilyName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commonName || !scientificName) {
      toast.error('Please fill in required fields')
      return
    }
    await onAdd(commonName, scientificName, familyName)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Add New Bird</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-surface">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Common Name *</label>
            <input type="text" value={commonName} onChange={(e) => setCommonName(e.target.value)} className="input-field" placeholder="e.g., Indian Roller" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scientific Name *</label>
            <input type="text" value={scientificName} onChange={(e) => setScientificName(e.target.value)} className="input-field" placeholder="e.g., Coracias benghalensis" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Family Name *</label>
            <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="input-field" placeholder="e.g., Coraciidae" required />
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={adding}>Cancel</button>
            <button type="submit" disabled={adding} className="btn-primary flex-1 flex justify-center items-center space-x-2">
              {adding ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Adding...</span></>
              ) : (
                <><Plus className="h-5 w-5" /><span>Add Bird</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditBirdModalProps {
  bird: BirdData
  onClose: () => void
  onEdit: (id: string, commonName: string, scientificName: string, familyName: string) => Promise<void>
  editing: boolean
}

const EditBirdModal = ({ bird, onClose, onEdit, editing }: EditBirdModalProps) => {
  const [commonName, setCommonName] = useState(bird.commonName)
  const [scientificName, setScientificName] = useState(bird.scientificName)
  const [familyName, setFamilyName] = useState(bird.familyName || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commonName || !scientificName) {
      toast.error('Please fill in required fields')
      return
    }
    await onEdit(bird.id, commonName, scientificName, familyName)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Edit Bird</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-surface">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Common Name *</label>
            <input type="text" value={commonName} onChange={(e) => setCommonName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scientific Name *</label>
            <input type="text" value={scientificName} onChange={(e) => setScientificName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Family Name *</label>
            <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="input-field" required />
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={editing}>Cancel</button>
            <button type="submit" disabled={editing} className="btn-primary flex-1 flex justify-center items-center space-x-2">
              {editing ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Saving...</span></>
              ) : (
                <><Edit2 className="h-5 w-5" /><span>Save Changes</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPanel
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Bird, Plus, Trash2, Settings, Edit2, X, FolderTree } from 'lucide-react'
import { IUCN_STATUS_MAP } from '../utils/constants'
import toast from 'react-hot-toast'

interface BirdData {
  id: string
  commonName: string
  scientificName: string
  familyName: string
  familyDisplay: string
  familyId: string
  photoCount: number
  commonCode: string
  iucnStatus: string
  isMigratory: boolean
}

interface FamilyData {
  id: string
  familyName: string
  familyOf: string[]
  taxoPos: number
}

const AdminPanel = () => {
  const { user, isAdmin } = useAuth()
  const [birds, setBirds] = useState<BirdData[]>([])
  const [families, setFamilies] = useState<FamilyData[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBird, setEditingBird] = useState<BirdData | null>(null)
  const [editing, setEditing] = useState(false)

  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false)
  const [addingFamily, setAddingFamily] = useState(false)
  const [showEditFamilyModal, setShowEditFamilyModal] = useState(false)
  const [editingFamily, setEditingFamily] = useState<FamilyData | null>(null)
  const [editingFamilyLoading, setEditingFamilyLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      return
    }
    fetchData()
  }, [isAdmin])

  const fetchData = async () => {
    try {
      const [birdsRes, familiesRes] = await Promise.all([
        fetch('/api/getBirds'),
        fetch('/api/getFamilies')
      ]);

      if (birdsRes.ok) {
        const birdsData = await birdsRes.json();
        if (birdsData.success) setBirds(birdsData.birds);
      }

      if (familiesRes.ok) {
        const famData = await familiesRes.json();
        if (famData.success) setFamilies(famData.families);
      }

    } catch (error: any) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBird = async (commonName: string, scientificName: string, familyId: string, iucnStatus: string, isMigratory: boolean) => {
    setAdding(true)
    try {
      const response = await fetch('/api/addBird', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commonName, scientificName, familyId, userId: user?.uid, iucnStatus, isMigratory }),
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

  const handleEditBird = async (birdId: string, commonName: string, scientificName: string, familyId: string, iucnStatus: string, isMigratory: boolean) => {
    setEditing(true)
    try {
      const response = await fetch('/api/editBird', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birdId, commonName, scientificName, familyId, userId: user?.uid, iucnStatus, isMigratory }),
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
    if (!window.confirm(`Are you sure you want to delete "${birdName}"? This will also delete all associated photos.`)) return;
    try {
      const response = await fetch('/api/deleteBird', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birdId, userId: user?.uid }),
      })
      if (!response.ok) throw new Error('Failed to delete bird')
      toast.success('Bird deleted successfully!')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting bird:', error)
      toast.error('Failed to delete bird')
    }
  }

  const handleAddFamily = async (familyName: string, familyOf: string, taxoPos: number) => {
    setAddingFamily(true)
    try {
      const response = await fetch('/api/addFamily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName, familyOf, taxoPos, userId: user?.uid }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add family')
      }
      toast.success('Family added successfully!')
      setShowAddFamilyModal(false)
      fetchData()
    } catch (error: any) {
      console.error('Error adding family:', error)
      toast.error(error.message || 'Failed to add family')
    } finally {
      setAddingFamily(false)
    }
  }

  const handleEditFamily = async (familyId: string, familyName: string, familyOf: string, taxoPos: number) => {
    setEditingFamilyLoading(true)
    try {
      const response = await fetch('/api/editFamily', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId, familyName, familyOf, taxoPos, userId: user?.uid }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to edit family')
      }
      toast.success('Family updated successfully!')
      setShowEditFamilyModal(false)
      fetchData()
    } catch (error: any) {
      console.error('Error editing family:', error)
      toast.error(error.message || 'Failed to edit family')
    } finally {
      setEditingFamilyLoading(false)
    }
  }

  const handleDeleteFamily = async (familyId: string, familyName: string) => {
    if (!window.confirm(`Are you sure you want to delete family "${familyName}"?`)) return;
    try {
      const response = await fetch('/api/deleteFamily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId, userId: user?.uid }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete family')
      }
      toast.success('Family deleted successfully!')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting family:', error)
      toast.error(error.message || 'Failed to delete family')
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-10 animate-fade-in relative z-10 py-6">
      <div className="text-center space-y-4">
        <h1 className="section-header">Admin Dashboard</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Manage birds, families and platform features</p>
      </div>


      {/* Birds Management */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 dark:border-dark-border gap-4">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Birds Directory</h2>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Bird</span>
          </button>
        </div>

        {birds.length === 0 ? (
          <div className="text-center py-16">
            <Bird className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No birds yet</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
              <thead className="bg-slate-50 dark:bg-dark-surface/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Common Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scientific Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Family Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Photos</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {birds.map((bird) => (
                  <tr key={bird.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{bird.commonName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 italic">{bird.scientificName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{bird.familyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary-600 dark:text-primary-400">{bird.commonCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-dark-bg px-2.5 py-1 rounded-full">{bird.photoCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <button onClick={() => { setEditingBird(bird); setShowEditModal(true) }} className="text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors flex items-center space-x-1">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteBird(bird.id, bird.commonName)} className="text-red-500 dark:text-red-400 hover:text-red-700 transition-colors flex items-center space-x-1">
                          <Trash2 className="h-4 w-4" />
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

      {/* Families Management */}
      <div className="glass-card p-0 overflow-hidden mt-8">
        <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 dark:border-dark-border gap-4">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Families Directory</h2>
          <button onClick={() => setShowAddFamilyModal(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Family</span>
          </button>
        </div>

        {families.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No families yet</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
              <thead className="bg-slate-50 dark:bg-dark-surface/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Family Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Family Of</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Taxo Pos</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {families.map((fam) => (
                  <tr key={fam.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{fam.familyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{fam.familyOf.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{fam.taxoPos}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <button onClick={() => { setEditingFamily(fam); setShowEditFamilyModal(true) }} className="text-primary-600 dark:text-primary-400 hover:text-primary-800 transition-colors flex items-center space-x-1">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteFamily(fam.id, fam.familyName)} className="text-red-500 dark:text-red-400 hover:text-red-700 transition-colors flex items-center space-x-1">
                          <Trash2 className="h-4 w-4" />
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

      {showAddModal && <AddBirdModal families={families} onClose={() => setShowAddModal(false)} onAdd={handleAddBird} adding={adding} />}
      {showEditModal && editingBird && <EditBirdModal families={families} bird={editingBird} onClose={() => { setShowEditModal(false); setEditingBird(null) }} onEdit={handleEditBird} editing={editing} />}
      {showAddFamilyModal && <AddFamilyModal onClose={() => setShowAddFamilyModal(false)} onAdd={handleAddFamily} adding={addingFamily} />}
      {showEditFamilyModal && editingFamily && <EditFamilyModal family={editingFamily} onClose={() => { setShowEditFamilyModal(false); setEditingFamily(null) }} onEdit={handleEditFamily} editing={editingFamilyLoading} />}
    </div>
  )
}

interface AddBirdModalProps { onClose: () => void; onAdd: (cn: string, sn: string, fid: string, iucn: string, isMig: boolean) => Promise<void>; adding: boolean; families: FamilyData[] }
const AddBirdModal = ({ onClose, onAdd, adding, families }: AddBirdModalProps) => {
  const [commonName, setCommonName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [familyId, setFamilyId] = useState('')
  const [iucnStatus, setIucnStatus] = useState('LC')
  const [isMigratory, setIsMigratory] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commonName || !scientificName) { toast.error('Please fill required fields'); return; }
    await onAdd(commonName, scientificName, familyId, iucnStatus, isMigratory)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Add New Bird</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2"><X className="h-6 w-6" /></button>
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Family *</label>
            <select value={familyId} onChange={(e) => setFamilyId(e.target.value)} className="input-field" required>
              <option value="">Select a family...</option>
              {families.map(f => <option key={f.id} value={f.id}>{f.familyName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">IUCN Status *</label>
            <select value={iucnStatus} onChange={(e) => setIucnStatus(e.target.value)} className="input-field" required>
              {Object.entries(IUCN_STATUS_MAP).map(([code, { label }]) => (
                <option key={code} value={code}>{label} ({code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Migratory Status *</label>
            <select value={isMigratory ? "true" : "false"} onChange={(e) => setIsMigratory(e.target.value === "true")} className="input-field" required>
              <option value="false">Resident</option>
              <option value="true">Migratory</option>
            </select>
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={adding}>Cancel</button>
            <button type="submit" disabled={adding} className="btn-primary flex-1">{adding ? 'Adding...' : 'Add Bird'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditBirdModalProps { bird: BirdData; onClose: () => void; onEdit: (id: string, cn: string, sn: string, fid: string, iucn: string, isMig: boolean) => Promise<void>; editing: boolean; families: FamilyData[] }
const EditBirdModal = ({ bird, onClose, onEdit, editing, families }: EditBirdModalProps) => {
  const [commonName, setCommonName] = useState(bird.commonName)
  const [scientificName, setScientificName] = useState(bird.scientificName)
  // Determine initial familyId from families array if not directly available (migration fallback)
  const initialFamId = bird.familyId || families.find(f => f.familyName === bird.familyName)?.id || ''
  const [familyId, setFamilyId] = useState(initialFamId)
  const [iucnStatus, setIucnStatus] = useState(bird.iucnStatus || 'LC')
  const [isMigratory, setIsMigratory] = useState(bird.isMigratory || false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commonName || !scientificName) { toast.error('Please fill required fields'); return; }
    await onEdit(bird.id, commonName, scientificName, familyId, iucnStatus, isMigratory)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Edit Bird</h3>
          <button onClick={onClose} className="text-slate-400 p-2"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Common Name *</label>
            <input type="text" value={commonName} onChange={(e) => setCommonName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Scientific Name *</label>
            <input type="text" value={scientificName} onChange={(e) => setScientificName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Family *</label>
            <select value={familyId} onChange={(e) => setFamilyId(e.target.value)} className="input-field" required>
              <option value="">Select a family...</option>
              {families.map(f => <option key={f.id} value={f.id}>{f.familyName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">IUCN Status *</label>
            <select value={iucnStatus} onChange={(e) => setIucnStatus(e.target.value)} className="input-field" required>
              {Object.entries(IUCN_STATUS_MAP).map(([code, { label }]) => (
                <option key={code} value={code}>{label} ({code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Migratory Status *</label>
            <select value={isMigratory ? "true" : "false"} onChange={(e) => setIsMigratory(e.target.value === "true")} className="input-field" required>
              <option value="false">Resident</option>
              <option value="true">Migratory</option>
            </select>
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={editing}>Cancel</button>
            <button type="submit" disabled={editing} className="btn-primary flex-1">{editing ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface AddFamilyModalProps { onClose: () => void; onAdd: (fn: string, fo: string, tp: number) => Promise<void>; adding: boolean }
const AddFamilyModal = ({ onClose, onAdd, adding }: AddFamilyModalProps) => {
  const [familyName, setFamilyName] = useState('')
  const [familyOf, setFamilyOf] = useState('')
  const [taxoPos, setTaxoPos] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAdd(familyName, familyOf, taxoPos)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Add Family</h3>
          <button onClick={onClose} className="text-slate-400 p-2"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Family Name *</label>
            <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="input-field" required placeholder="e.g. Coraciidae" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Family Of (Comma Separated) *</label>
            <input type="text" value={familyOf} onChange={(e) => setFamilyOf(e.target.value)} className="input-field" required placeholder="e.g. Rollers" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Taxonomic Position *</label>
            <input type="number" step="any" value={taxoPos} onChange={(e) => setTaxoPos(Number(e.target.value))} className="input-field" required />
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={adding}>Cancel</button>
            <button type="submit" disabled={adding} className="btn-primary flex-1">{adding ? 'Adding...' : 'Add Family'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditFamilyModalProps { family: FamilyData; onClose: () => void; onEdit: (id: string, fn: string, fo: string, tp: number) => Promise<void>; editing: boolean }
const EditFamilyModal = ({ family, onClose, onEdit, editing }: EditFamilyModalProps) => {
  const [familyName, setFamilyName] = useState(family.familyName)
  const [familyOf, setFamilyOf] = useState(family.familyOf.join(', '))
  const [taxoPos, setTaxoPos] = useState(family.taxoPos)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onEdit(family.id, familyName, familyOf, taxoPos)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Edit Family</h3>
          <button onClick={onClose} className="text-slate-400 p-2"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Family Name *</label>
            <input type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Family Of (Comma Separated) *</label>
            <input type="text" value={familyOf} onChange={(e) => setFamilyOf(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Taxonomic Position *</label>
            <input type="number" step="any" value={taxoPos} onChange={(e) => setTaxoPos(Number(e.target.value))} className="input-field" required />
          </div>
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={editing}>Cancel</button>
            <button type="submit" disabled={editing} className="btn-primary flex-1">{editing ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPanel

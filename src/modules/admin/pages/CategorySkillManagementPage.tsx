import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';

export const CategorySkillManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('');
  const [skillName, setSkillName] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState<any>(null); // { type: 'cat' | 'skill', id, name, icon, status }

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, skillsRes] = await Promise.all([
        AdminApiService.getCategories(),
        AdminApiService.getSkills()
      ]);
      setCategories(catsRes || []);
      setSkills(skillsRes || []);
    } catch (err: any) {
      showToast('Failed to fetch categories & skills', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catIcon.trim()) {
      showToast('Please specify both category name and emoji icon', 'warning');
      return;
    }
    try {
      await AdminApiService.createCategory({ name: catName, icon: catIcon });
      showToast(`Category "${catName}" created!`, 'success');
      setCatName('');
      setCatIcon('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      showToast('Please specify a skill name', 'warning');
      return;
    }
    try {
      await AdminApiService.createSkill({ name: skillName });
      showToast(`Skill "${skillName}" created!`, 'success');
      setSkillName('');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create skill', 'error');
    }
  };

  const handleEditClick = (type: 'cat' | 'skill', item: any) => {
    setEditingItem({ type, ...item });
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem.type === 'cat') {
        await AdminApiService.updateCategory(editingItem.id, {
          name: editingItem.name,
          icon: editingItem.icon,
          status: editingItem.status
        });
        showToast('Category updated', 'success');
      } else {
        await AdminApiService.updateSkill(editingItem.id, {
          name: editingItem.name,
          status: editingItem.status
        });
        showToast('Skill updated', 'success');
      }
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update item', 'error');
    }
  };

  const handleDeleteItem = async (type: 'cat' | 'skill', id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === 'cat' ? 'category' : 'skill'}?`)) return;
    try {
      if (type === 'cat') {
        await AdminApiService.deleteCategory(id);
      } else {
        await AdminApiService.deleteSkill(id);
      }
      showToast('Item deleted successfully', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>Categories & Skills Configuration</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Configure standard industrial trades, professional capabilities, and icons</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ height: '100px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ height: '300px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          
          {/* Categories Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Add Category Form */}
            <div className="admin-card" style={{ margin: 0, padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Add New Job Category</h3>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Category Name</label>
                  <input type="text" className="form-input" style={{ background: 'var(--border-light)' }} placeholder="e.g. Electrician" value={catName} onChange={e => setCatName(e.target.value)} required />
                </div>
                <div style={{ width: '80px' }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Emoji Icon</label>
                  <input type="text" className="form-input" style={{ background: 'var(--border-light)', textAlign: 'center' }} placeholder="🔌" value={catIcon} onChange={e => setCatIcon(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>Add</button>
              </form>
            </div>

            {/* 2. Categories List */}
            <div className="admin-card" style={{ margin: 0 }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">Job Categories ({categories.length})</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Icon</th>
                      <th>Category Name</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontSize: '20px' }}>{c.icon}</td>
                        <td><strong>{c.name}</strong></td>
                        <td>
                          <span className={`status-badge ${c.status === 'ACTIVE' ? 'status-active' : 'status-blocked'}`}>{c.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="action-btn edit" title="Edit Category" onClick={() => handleEditClick('cat', c)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button className="action-btn delete" title="Delete Category" onClick={() => handleDeleteItem('cat', c.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', color: 'var(--danger)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Skills Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Add Skill Form */}
            <div className="admin-card" style={{ margin: 0, padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Add New Skill Tag</h3>
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Skill Name</label>
                  <input type="text" className="form-input" style={{ background: 'var(--border-light)' }} placeholder="e.g. AutoCAD drafting" value={skillName} onChange={e => setSkillName(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>Add Tag</button>
              </form>
            </div>

            {/* 2. Skills List */}
            <div className="admin-card" style={{ margin: 0 }}>
              <div className="admin-card-header">
                <h3 className="admin-card-title">Skills & Capabilities ({skills.length})</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Skill Tag</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td>
                        <td>
                          <span className={`status-badge ${s.status === 'ACTIVE' ? 'status-active' : s.status === 'blocked' ? 'status-blocked' : 'status-active'}`}>{s.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="action-btn edit" title="Edit Skill" onClick={() => handleEditClick('skill', s)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button className="action-btn delete" title="Delete Skill" onClick={() => handleDeleteItem('skill', s.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', color: 'var(--danger)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Item Editor Dialog Overlay */}
      {editingItem && (
        <div className="drawer-backdrop" onClick={() => setEditingItem(null)}>
          <div className="admin-card" style={{ width: '400px', margin: '150px auto', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              Edit {editingItem.type === 'cat' ? 'Category' : 'Skill'}
            </h3>
            <form onSubmit={handleUpdateItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" style={{ background: 'var(--border-light)' }} value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} required />
              </div>
              
              {editingItem.type === 'cat' && (
                <div className="form-group">
                  <label className="form-label">Emoji Icon</label>
                  <input type="text" className="form-input" style={{ background: 'var(--border-light)' }} value={editingItem.icon} onChange={e => setEditingItem({ ...editingItem, icon: e.target.value })} required />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Status State</label>
                <select className="filter-select" style={{ width: '100%' }} value={editingItem.status} onChange={e => setEditingItem({ ...editingItem, status: e.target.value })}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CategorySkillManagementPage;

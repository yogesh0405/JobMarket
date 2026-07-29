import React, { useEffect, useState } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { CategoryIcon } from '../../../components/icons/CategoryIcon';

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

  const officialCategories = categories.filter(c => c.status !== 'PENDING_REVIEW');
  const pendingCategories = categories.filter(c => c.status === 'PENDING_REVIEW');

  const handleApproveCategory = async (c: any) => {
    try {
      await AdminApiService.updateCategory(c.id, {
        name: c.name,
        icon: c.icon || '💼',
        status: 'ACTIVE'
      });
      showToast(`Category "${c.name}" approved & added to official list! 🎉`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve category', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Categories & Skills Configuration</h1>
        <p style={{ color: '#64748b', marginTop: '6px', fontSize: '14.5px' }}>Configure standard industrial trades, professional capabilities, and icons</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ height: '100px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ height: '300px', background: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
          
          {/* Categories Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Pending Custom Categories from Employers */}
            {pendingCategories.length > 0 && (
              <div style={{ background: '#fffbe8', borderRadius: '16px', border: '1.5px solid #fde047', padding: '20px', boxShadow: '0 4px 20px rgba(234, 179, 8, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📢 Custom Categories Proposed by Employers</span>
                  </h3>
                  <span style={{ background: '#eab308', color: '#ffffff', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800' }}>
                    {pendingCategories.length} PENDING
                  </span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#713f12', margin: '0 0 16px 0' }}>Review custom job categories added by employers during job posting. Approve to make them official for all employers.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingCategories.map(pc => (
                    <div key={pc.id} style={{ background: '#ffffff', border: '1px solid #fef08a', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CategoryIcon name={pc.icon || pc.name} size={22} color="#ca8a04" />
                        <div>
                          <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{pc.name}</strong>
                          <span style={{ fontSize: '11px', color: '#ca8a04', fontWeight: '700' }}>Employer Suggested</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleApproveCategory(pc)} 
                          style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          ✓ Approve & Add
                        </button>
                        <button 
                          onClick={() => handleDeleteItem('cat', pc.id)} 
                          style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Add Category Form */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', margin: '0 0 16px 0' }}>Add New Job Category</h3>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'block' }}>Category Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', width: '100%' }} 
                    placeholder="e.g. Electrician" 
                    value={catName} 
                    onChange={e => setCatName(e.target.value)} 
                    required 
                  />
                </div>
                <div style={{ width: '90px' }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'block' }}>Emoji Icon</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', fontSize: '16px', textAlign: 'center', width: '100%' }} 
                    placeholder="🔌" 
                    value={catIcon} 
                    onChange={e => setCatIcon(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 22px', background: '#344BFD', borderRadius: '8px', fontWeight: '700', fontSize: '14px', border: 'none' }}>
                  Add
                </button>
              </form>
            </div>

            {/* 2. Official Categories List */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>Official Job Categories ({officialCategories.length})</h3>
              </div>
              <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>
                      <th style={{ padding: '12px 16px', width: '60px' }}>Icon</th>
                      <th style={{ padding: '12px 16px' }}>Category Name</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officialCategories.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <CategoryIcon name={c.icon || c.name} size={20} color="#344BFD" />
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{c.name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            background: c.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', 
                            color: c.status === 'ACTIVE' ? '#15803d' : '#b91c1c', 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            letterSpacing: '0.5px' 
                          }}>
                            {c.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="action-btn edit" 
                              title="Edit Category" 
                              onClick={() => handleEditClick('cat', c)} 
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px', color: '#64748b' }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button 
                              className="action-btn delete" 
                              title="Delete Category" 
                              onClick={() => handleDeleteItem('cat', c.id)} 
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px', color: '#ef4444' }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

          {/* Skills Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Add Skill Form */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', margin: '0 0 16px 0' }}>Add New Skill Tag</h3>
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', display: 'block' }}>Skill Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', width: '100%' }} 
                    placeholder="e.g. AutoCAD drafting" 
                    value={skillName} 
                    onChange={e => setSkillName(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 22px', background: '#344BFD', borderRadius: '8px', fontWeight: '700', fontSize: '14px', border: 'none' }}>
                  Add Tag
                </button>
              </form>
            </div>

            {/* 2. Skills List */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>Skills & Capabilities ({skills.length})</h3>
              </div>
              <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>
                      <th style={{ padding: '12px 16px' }}>Skill Tag</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{s.name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            background: s.status === 'ACTIVE' || !s.status ? '#dcfce7' : '#fee2e2', 
                            color: s.status === 'ACTIVE' || !s.status ? '#15803d' : '#b91c1c', 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '11px', 
                            fontWeight: '800', 
                            letterSpacing: '0.5px' 
                          }}>
                            {s.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="action-btn edit" 
                              title="Edit Skill" 
                              onClick={() => handleEditClick('skill', s)} 
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px', color: '#64748b' }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button 
                              className="action-btn delete" 
                              title="Delete Skill" 
                              onClick={() => handleDeleteItem('skill', s.id)} 
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px', color: '#ef4444' }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

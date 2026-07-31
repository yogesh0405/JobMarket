import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../../hooks/useToast';
import { apiFetch, safeParseJson } from '../../../utils/api';
import { useStore } from '../../../store/useStore';
import { Job } from '../../../types';

import {
  RoleTabSetting,
  DEFAULT_ROLE_TAB_SETTINGS,
  STORAGE_KEY,
  getStoredRoleTabSettings
} from '../utils/roleTabSettings';

// Helper: Keeps visible tabs at top (1..N) and moves hidden tabs to the end of the list!
const sortAndReindexTabs = (list: RoleTabSetting[]): RoleTabSetting[] => {
  const visible = list.filter(t => t.enabled).sort((a, b) => a.priority - b.priority);
  const hidden = list.filter(t => !t.enabled).sort((a, b) => a.priority - b.priority);

  return [...visible, ...hidden].map((t, idx) => ({
    ...t,
    priority: idx + 1
  }));
};

export const RoleTabsManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const { state } = useStore(); // Access global jobs store
  const [tabs, setTabs] = useState<RoleTabSetting[]>([]);
  const [apiJobs, setApiJobs] = useState<Job[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTabName, setNewTabName] = useState('');
  const [previewActiveId, setPreviewActiveId] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');

  // Load Admin Settings from DB/LocalStorage & Sync Active Jobs
  useEffect(() => {
    setIsLoading(true);

    // Initial load from LocalStorage fallback
    setTabs(sortAndReindexTabs(getStoredRoleTabSettings()));

    // 1. Fetch System Settings from PostgreSQL Backend API
    apiFetch('/api/v1/admin/settings')
      .then(res => safeParseJson(res))
      .then(({ ok, data: json }) => {
        if (ok && json.success && json.data && json.data.role_tabs_config) {
          try {
            const parsed = JSON.parse(json.data.role_tabs_config);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const sorted = sortAndReindexTabs(parsed);
              setTabs(sorted);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
            }
          } catch (e) {
            console.error('Failed to parse backend role_tabs_config:', e);
          }
        }
      })
      .catch(err => {
        console.error('API Error fetching admin settings:', err);
      })
      .finally(() => setIsLoading(false));

    // 2. Fetch Active Jobs from DB API
    apiFetch('/api/v1/jobs')
      .then(res => res.json())
      .then(json => {
        const rawJobs = Array.isArray(json) ? json : (json.data?.jobs || json.data || []);
        if (Array.isArray(rawJobs) && rawJobs.length > 0) {
          setApiJobs(rawJobs);
        }
      })
      .catch(err => console.error('API Error fetching jobs for tab metrics:', err));
  }, []);

  // Combine jobs from API and Store to calculate accurate DB match counts
  const effectiveJobs = useMemo(() => {
    if (apiJobs.length > 0) return apiJobs;
    return state.jobs || [];
  }, [apiJobs, state.jobs]);

  // Real-Time DB Job Match Counter for every tab
  const tabJobCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const activeJobs = effectiveJobs.filter(j => j.status === 'active' || !j.status);

    counts['all'] = activeJobs.length;

    tabs.forEach(tab => {
      if (tab.id === 'all') return;

      const needle = (tab.label || tab.id).toLowerCase().trim();

      // Flexible keyword matching variations
      const keywords = [needle];
      if (needle.includes('welder')) keywords.push('weld');
      if (needle.includes('electrician')) keywords.push('electric');
      if (needle.includes('fitter')) keywords.push('fit');
      if (needle.includes('machinist')) keywords.push('machine', 'cnc', 'lathe');
      if (needle.includes('helper')) keywords.push('assist', 'peon', 'helper');
      if (needle.includes('hospital')) keywords.push('nurse', 'doctor', 'clinic', 'medical', 'healthcare');
      if (needle.includes('hotel')) keywords.push('cook', 'chef', 'waiter', 'hotel');
      if (needle.includes('school')) keywords.push('teacher', 'school', 'college', 'education');
      if (needle.includes('office')) keywords.push('clerk', 'reception', 'office', 'admin');

      const count = activeJobs.filter(j => {
        const t = (j.trade || '').toLowerCase();
        const ind = (j.industry || '').toLowerCase();
        const title = (j.title || '').toLowerCase();
        const desc = (j.description || '').toLowerCase();
        const skills = (j.skills || []).map(s => s.toLowerCase()).join(' ');

        return keywords.some(k => 
          t.includes(k) || ind.includes(k) || title.includes(k) || desc.includes(k) || skills.includes(k)
        );
      }).length;

      counts[tab.id] = count;
    });

    return counts;
  }, [effectiveJobs, tabs]);

  // Toggle Visibility: When hidden, automatically shifts to the VERY END of the list!
  const handleToggleHide = (id: string) => {
    setTabs(prev => {
      const target = prev.find(t => t.id === id);
      if (!target) return prev;
      const updated = prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t);
      return sortAndReindexTabs(updated);
    });

    const targetTab = tabs.find(t => t.id === id);
    if (targetTab?.enabled) {
      showToast(`Hidden "${targetTab.label}". Moved to end of list.`, 'info');
    } else if (targetTab) {
      showToast(`Unhidden "${targetTab.label}". Moved to active visible tabs.`, 'success');
    }
  };

  // Reorder Priority Numbers directly by input
  const handlePriorityChange = (id: string, newPriority: number) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx < 0) return prev;
      const item = { ...prev[idx], priority: Math.max(1, newPriority) };
      const rest = prev.filter(t => t.id !== id);
      const insertAt = Math.max(0, Math.min(newPriority - 1, rest.length));
      rest.splice(insertAt, 0, item);
      return rest.map((t, i) => ({ ...t, priority: i + 1 }));
    });
  };

  const handlePriorityBlur = () => {
    setTabs(prev => sortAndReindexTabs(prev));
  };

  // Reorder Move Up by tab ID
  const handleMoveUpById = (id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy.map((t, i) => ({ ...t, priority: i + 1 }));
    });
  };

  // Reorder Move Down by tab ID
  const handleMoveDownById = (id: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy.map((t, i) => ({ ...t, priority: i + 1 }));
    });
  };

  const handleSelectAll = (enable: boolean) => {
    setTabs(prev => {
      const updated = prev.map(t => ({ ...t, enabled: enable }));
      return sortAndReindexTabs(updated);
    });
  };

  const handleResetDefault = () => {
    const defaults = sortAndReindexTabs(DEFAULT_ROLE_TAB_SETTINGS);
    setTabs(defaults);
    showToast('Reset to default role tabs configuration', 'info');
  };

  const handleStartRename = (tab: RoleTabSetting) => {
    setEditingId(tab.id);
    setEditLabel(tab.label);
  };

  const handleSaveRename = (id: string) => {
    if (!editLabel.trim()) return;
    setTabs(prev => prev.map(t => t.id === id ? { ...t, label: editLabel.trim() } : t));
    setEditingId(null);
  };

  const handleAddCustomTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabName.trim()) return;
    const cleanName = newTabName.trim();
    if (tabs.some(t => t.label.toLowerCase() === cleanName.toLowerCase())) {
      showToast('Tab with this name already exists', 'warning');
      return;
    }
    const newTab: RoleTabSetting = {
      id: cleanName,
      label: cleanName,
      enabled: true,
      priority: tabs.length + 1
    };
    setTabs(prev => sortAndReindexTabs([...prev, newTab]));
    setNewTabName('');
    showToast(`Added new custom tab: ${cleanName}`, 'success');
  };

  // Permanently Delete Tab from List
  const handleDeleteTab = (id: string) => {
    if (id === 'all') {
      showToast('The Primary "All Opportunities" tab cannot be deleted.', 'warning');
      return;
    }
    const tabToDelete = tabs.find(t => t.id === id);
    setTabs(prev => sortAndReindexTabs(prev.filter(t => t.id !== id)));
    showToast(`Deleted tab "${tabToDelete?.label || id}".`, 'info');
  };

  // Industry-Grade Save Handler
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sorted = sortAndReindexTabs(tabs);

      // 1. Persist to PostgreSQL Backend API
      await apiFetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_tabs_config: JSON.stringify(sorted)
        })
      });

      // 2. Save to LocalStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));

      // 3. Dispatch real-time event
      window.dispatchEvent(new Event('roleTabSettingsUpdated'));

      setTabs(sorted);
      showToast('Role Tabs Configuration Saved & Applied to Homepage Live!', 'success');
    } catch (err: any) {
      console.error('Error saving role tabs config:', err);
      const sorted = sortAndReindexTabs(tabs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      window.dispatchEvent(new Event('roleTabSettingsUpdated'));
      showToast('Saved to local storage (Server sync pending)', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const enabledCount = tabs.filter(t => t.enabled).length;
  const hiddenCount = tabs.filter(t => !t.enabled).length;

  const filteredTabs = useMemo(() => {
    if (!searchTerm.trim()) return tabs;
    const q = searchTerm.toLowerCase().trim();
    return tabs.filter(t => t.label.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }, [tabs, searchTerm]);

  return (
    <div className="admin-page-container" style={{ padding: '24px', maxWidth: '1320px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
            Homepage Role Tabs Manager
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Hide or delete role tabs, reorder priority, and view live database job counts. Hidden tabs auto-shift to the end of the list.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleResetDefault}
            disabled={isSaving}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reset Defaults
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? (
              <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
            )}
            {isSaving ? 'Saving to DB...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* Live Homepage Interactive Tab Preview Bar */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live Homepage Preview ({enabledCount} Visible Tabs, {hiddenCount} Hidden at End)
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Only visible tabs will appear on the homepage
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '12px 14px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {tabs.filter(t => t.enabled).sort((a, b) => a.priority - b.priority).map((tab) => {
            const isPreviewSelected = previewActiveId === tab.id;
            const matchCount = tabJobCounts[tab.id] || 0;

            return (
              <button
                key={tab.id}
                onClick={() => setPreviewActiveId(tab.id)}
                style={{
                  flexShrink: 0,
                  position: 'relative',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: isPreviewSelected ? '800' : '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.22s ease',
                  border: isPreviewSelected ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  outline: 'none',
                  transform: 'skewX(-16deg)',
                  transformOrigin: 'center center',
                  borderRadius: '10px 6px 10px 6px',
                  background: isPreviewSelected 
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
                    : '#ffffff',
                  color: isPreviewSelected ? '#ffffff' : '#334155',
                  boxShadow: isPreviewSelected 
                    ? '0 4px 14px rgba(37, 99, 235, 0.35)' 
                    : '0 2px 4px rgba(15, 23, 42, 0.03)'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', transform: 'skewX(16deg)' }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: isPreviewSelected ? '#ffffff' : '#2563eb',
                    display: 'inline-block'
                  }} />
                  <span>{tab.priority}. {tab.label}</span>
                  <span style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontWeight: '700',
                    background: isPreviewSelected ? 'rgba(255, 255, 255, 0.22)' : '#f1f5f9',
                    color: isPreviewSelected ? '#ffffff' : '#64748b'
                  }}>
                    {matchCount}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Control Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Tab Manager Table */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          
          {/* Table Header Controls */}
          <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Select & Prioritize Tabs
              </h3>
              <input
                type="text"
                placeholder="Search tabs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  outline: 'none',
                  width: '160px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleSelectAll(true)}
                style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Show All
              </button>
              <button
                onClick={() => handleSelectAll(false)}
                style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444', background: '#fee2e2', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Hide All (Move to End)
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 16px', width: '90px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 16px', width: '80px', textAlign: 'center' }}>Priority</th>
                  <th style={{ padding: '12px 16px' }}>Tab Label</th>
                  <th style={{ padding: '12px 16px', width: '110px', textAlign: 'center' }}>Real DB Match</th>
                  <th style={{ padding: '12px 16px', width: '110px', textAlign: 'center' }}>Reorder</th>
                  <th style={{ padding: '12px 16px', width: '120px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      Loading configuration from server...
                    </td>
                  </tr>
                ) : filteredTabs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No role tabs matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredTabs.map((tab, idx) => {
                    const matchCount = tabJobCounts[tab.id] || 0;
                    const isEditingThis = editingId === tab.id;
                    const isHidden = !tab.enabled;

                    return (
                      <tr
                        key={tab.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isHidden ? '#f8fafc' : (previewActiveId === tab.id ? '#eff6ff' : '#ffffff'),
                          opacity: isHidden ? 0.65 : 1,
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Status Badge */}
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            background: isHidden ? '#fee2e2' : '#dcfce7',
                            color: isHidden ? '#991b1b' : '#166534',
                            display: 'inline-block'
                          }}>
                            {isHidden ? 'HIDDEN' : 'VISIBLE'}
                          </span>
                        </td>

                        {/* Priority Input */}
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={tab.priority}
                            onChange={(e) => handlePriorityChange(tab.id, parseInt(e.target.value) || 1)}
                            onBlur={handlePriorityBlur}
                            style={{
                              width: '52px',
                              padding: '5px 6px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontWeight: '700',
                              fontSize: '13px',
                              textAlign: 'center',
                              outline: 'none',
                              background: isHidden ? '#f1f5f9' : '#ffffff'
                            }}
                          />
                        </td>

                        {/* Tab Label (Editable inline) */}
                        <td style={{ padding: '12px 16px' }}>
                          {isEditingThis ? (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #2563eb', fontSize: '13.5px', fontWeight: '700' }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRename(tab.id)}
                                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: isHidden ? '#64748b' : '#0f172a' }}>
                                {tab.label}
                              </span>
                              <button
                                onClick={() => handleStartRename(tab)}
                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}
                                title="Rename tab label"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                </svg>
                              </button>
                              {tab.id === 'all' && (
                                <span style={{ fontSize: '10.5px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '9999px', fontWeight: '700' }}>
                                  Primary
                                </span>
                              )}
                              {isHidden && (
                                <span style={{ fontSize: '10.5px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '9999px', fontWeight: '600' }}>
                                  (At end of list)
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Real DB Match Count Badge */}
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            background: matchCount > 0 ? '#dcfce7' : '#f1f5f9',
                            color: matchCount > 0 ? '#15803d' : '#64748b'
                          }}>
                            {matchCount} {matchCount === 1 ? 'Job' : 'Jobs'}
                          </span>
                        </td>

                        {/* Reorder Up / Down Buttons */}
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              onClick={() => handleMoveUpById(tab.id)}
                              disabled={idx === 0}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: idx === 0 ? '#f1f5f9' : '#ffffff',
                                color: idx === 0 ? '#cbd5e1' : '#0f172a',
                                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '12px'
                              }}
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMoveDownById(tab.id)}
                              disabled={idx === filteredTabs.length - 1}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: idx === filteredTabs.length - 1 ? '#f1f5f9' : '#ffffff',
                                color: idx === filteredTabs.length - 1 ? '#cbd5e1' : '#0f172a',
                                cursor: idx === filteredTabs.length - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '12px'
                              }}
                              title="Move Down"
                            >
                              ▼
                            </button>
                          </div>
                        </td>

                        {/* Professional SVG HIDE & DELETE Action Controls */}
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            {/* Professional Hide / Show Toggle Button */}
                            <button
                              onClick={() => handleToggleHide(tab.id)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: isHidden ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                                background: isHidden ? '#eff6ff' : '#ffffff',
                                color: isHidden ? '#2563eb' : '#475569',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title={isHidden ? 'Unhide Tab (Move to Active Tabs)' : 'Hide Tab (Move to End of List)'}
                            >
                              {isHidden ? (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                  </svg>
                                  Show
                                </>
                              ) : (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                                  </svg>
                                  Hide
                                </>
                              )}
                            </button>

                            {/* Professional Delete Button */}
                            {tab.id !== 'all' && (
                              <button
                                onClick={() => handleDeleteTab(tab.id)}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #fecaca',
                                  background: '#fff5f5',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Permanently Delete Tab"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Add Custom Tab & System Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Add Custom Role Tab Card */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Add Custom Role Tab
            </h3>
            <form onSubmit={handleAddCustomTab} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="e.g. Quality Control, Driver..."
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                + Add Role Tab
              </button>
            </form>
          </div>

          {/* Hide & Delete Feature Info Card */}
          <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '20px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Tab Controls Guide
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#1e3a8a', lineHeight: '1.7' }}>
              <li><strong>Hide Tab</strong>: Removes tab from homepage and <em>automatically shifts tab to the very end of the list</em> in admin section.</li>
              <li><strong>Show Tab</strong>: Unhides tab and moves it back up to active visible tabs.</li>
              <li><strong>Delete Tab</strong>: Permanently deletes custom or secondary role tabs.</li>
              <li><strong>Real DB Match Counts</strong>: Real-time calculation of active listings in database.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

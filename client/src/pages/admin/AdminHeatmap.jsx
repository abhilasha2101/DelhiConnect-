import { useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { analyticsAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '../../utils/constants';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DELHI_CENTER = [28.6139, 77.2090];

export default function AdminHeatmap() {
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerGroupInstance = useRef(null);
  
  const [points, setPoints] = useState([]);
  const [deptFilter, setDeptFilter] = useState('all'); // 'all', 'pwd', 'mcd', 'djb'
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.heatmap()
      .then(r => setPoints(r.data))
      .finally(() => setLoading(false));
  }, []);

  // Initialize Map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstance.current) return;

    // Create map with light background color and disable Leaflet attribution text
    const map = L.map(mapContainerRef.current, {
      background: '#f8fafc',
      attributionControl: false
    }).setView(DELHI_CENTER, 11);
    
    // Add CARTO Positron (Light) tiles for a clean white-themed look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    mapInstance.current = map;
    markerGroupInstance.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Glowing Markers and Heat Nodes when points or filters change
  useEffect(() => {
    if (!mapInstance.current || !markerGroupInstance.current) return;

    // Clear previous markers
    markerGroupInstance.current.clearLayers();

    // Filter points by department and category
    const filtered = points.filter(p => {
      if (deptFilter === 'pwd') {
        if (!(p.assignedDepartment.toLowerCase().includes('pwd') || p.assignedDepartment.toLowerCase().includes('public works'))) return false;
      } else if (deptFilter === 'mcd') {
        if (!(p.assignedDepartment.toLowerCase().includes('mcd') || p.assignedDepartment.toLowerCase().includes('municipal'))) return false;
      } else if (deptFilter === 'djb') {
        if (!(p.assignedDepartment.toLowerCase().includes('jal board') || p.assignedDepartment.toLowerCase().includes('water'))) return false;
      }
      
      if (categoryFilter && p.category !== categoryFilter) return false;
      return true;
    });

    filtered.forEach(p => {
      // Determine marker color and glowing class based on priority and SLA breach status
      let color = '#00E676'; // Stable (Green)
      let glowClass = 'glow-marker-green';
      
      if (p.slaBreached || p.priority === 'Critical') {
        color = '#FF3333'; // Critical/SLA Breach (Vibrant Red)
        glowClass = 'glow-marker-red';
      } else if (['Submitted', 'Pending', 'Assigned', 'In Progress', 'Reopened'].includes(p.status)) {
        color = '#FFB300'; // Active warnings (Glowing Amber)
        glowClass = 'glow-marker-amber';
      }

      const radius = p.isHotspot ? Math.min(22, 10 + p.reporterCount * 2) : 8;

      L.circleMarker([p.lat, p.lng], {
        radius: radius,
        fillColor: color,
        color: color,
        weight: p.isHotspot ? 3 : 1.5,
        opacity: 0.9,
        fillOpacity: p.isHotspot ? 0.7 : 0.5,
        className: glowClass
      })
      .bindTooltip(`
        <div class="bg-slate-900 text-white rounded-lg shadow-xl p-2 border border-slate-700 max-w-xs">
          <div class="font-extrabold text-sm border-b border-slate-700 pb-1 mb-1 text-slate-200">${t(p.category)}</div>
          <div class="text-xs mt-1 text-slate-300">
            <div>${t('Status')}: <span class="font-bold text-blue-400">${t(p.status)}</span></div>
            <div>${t('Department')}: <span class="font-semibold text-slate-400">${p.assignedDepartment}</span></div>
            <div>${t('Priority')}: <span class="font-semibold ${p.priority === 'Critical' ? 'text-red-400' : 'text-amber-400'}">${t(p.priority)}</span></div>
            ${p.slaBreached ? `<div class="text-[10px] bg-red-950 text-red-400 px-1 py-0.5 rounded font-bold mt-1 inline-block">⚠️ SLA BREACHED</div>` : ''}
            ${p.isHotspot ? `<div class="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1">🔥 Hotspot (${p.reporterCount} Reports)</div>` : ''}
          </div>
        </div>
      `, { direction: 'top', offset: [0, -5], opacity: 0.95 })
      .addTo(markerGroupInstance.current);
    });

  }, [points, deptFilter, categoryFilter, t]);

  // Compute live statistics for the active layer
  const filteredPoints = points.filter(p => {
    const dept = String(p.assignedDepartment || '').toLowerCase();
    if (deptFilter === 'pwd') {
      if (!(dept.includes('pwd') || dept.includes('public works'))) return false;
    } else if (deptFilter === 'mcd') {
      if (!(dept.includes('mcd') || dept.includes('municipal'))) return false;
    } else if (deptFilter === 'djb') {
      if (!(dept.includes('jal board') || dept.includes('water'))) return false;
    }
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  // Get category counts based on the active department filter
  const getCategoryCountsForDept = () => {
    const counts = {};
    points.forEach(p => {
      const dept = String(p.assignedDepartment || '').toLowerCase();
      if (deptFilter === 'pwd') {
        if (!(dept.includes('pwd') || dept.includes('public works'))) return;
      } else if (deptFilter === 'mcd') {
        if (!(dept.includes('mcd') || dept.includes('municipal'))) return;
      } else if (deptFilter === 'djb') {
        if (!(dept.includes('jal board') || dept.includes('water'))) return;
      }
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  };

  // Reset category filter if it has no data under the selected department
  useEffect(() => {
    if (!categoryFilter) return;
    const counts = getCategoryCountsForDept();
    if (!counts[categoryFilter]) {
      setCategoryFilter('');
    }
  }, [deptFilter]);

  // Compute total counts for each department dropdown option
  const pwdCountTotal = points.filter(p => {
    const dept = String(p.assignedDepartment || '').toLowerCase();
    return dept.includes('pwd') || dept.includes('public works');
  }).length;

  const mcdCountTotal = points.filter(p => {
    const dept = String(p.assignedDepartment || '').toLowerCase();
    return dept.includes('mcd') || dept.includes('municipal');
  }).length;

  const djbCountTotal = points.filter(p => {
    const dept = String(p.assignedDepartment || '').toLowerCase();
    return dept.includes('jal board') || dept.includes('water');
  }).length;

  const categoryCounts = getCategoryCountsForDept();

  const redCount = filteredPoints.filter(p => p.slaBreached || p.priority === 'Critical').length;
  const amberCount = filteredPoints.filter(p => !p.slaBreached && p.priority !== 'Critical' && ['Submitted', 'Pending', 'Assigned', 'In Progress', 'Reopened'].includes(p.status)).length;
  const greenCount = filteredPoints.filter(p => !p.slaBreached && p.priority !== 'Critical' && ['Resolved', 'Closed'].includes(p.status)).length;

  return (
    <Layout title={t("Complaint Heatmap — Delhi NCT")}>
      {/* CSS stylesheet payload for marker glows */}
      <style>{`
        .leaflet-container {
          background: #f8fafc !important;
        }
        .glow-marker-red {
          filter: drop-shadow(0 0 8px #FF3333);
          animation: pulse-red 2s infinite alternate;
        }
        .glow-marker-amber {
          filter: drop-shadow(0 0 6px #FFB300);
          animation: pulse-amber 2.5s infinite alternate;
        }
        .glow-marker-green {
          filter: drop-shadow(0 0 4px #00E676);
        }
        @keyframes pulse-red {
          0% { r: 8px; fill-opacity: 0.4; }
          100% { r: 11px; fill-opacity: 0.75; }
        }
        @keyframes pulse-amber {
          0% { r: 7px; fill-opacity: 0.4; }
          100% { r: 9px; fill-opacity: 0.65; }
        }
      `}</style>

      <div className="space-y-4">
        {/* Drop Down Filters */}
        <div className="card p-4 flex flex-wrap gap-4 items-end bg-white border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('Filter by Department')}</label>
            <select className="input w-72" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="all">{t('All Departments')} ({points.length})</option>
              <option value="pwd">{t('PWD Only (Major Highways)')} ({pwdCountTotal})</option>
              <option value="mcd">{t('MCD Only (Colony Lanes)')} ({mcdCountTotal})</option>
              <option value="djb">{t('Delhi Jal Board Only (Water)')} ({djbCountTotal})</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('Filter by Category')}</label>
            <select className="input w-56" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">{t('All Categories')}</option>
              {CATEGORIES.map(c => {
                const count = categoryCounts[c] || 0;
                return (
                  <option key={c} value={c} disabled={count === 0}>
                    {t(c)} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-sm text-slate-500 mb-2">
            {t('Showing')} <strong>{filteredPoints.length}</strong> {t('complaint locations')}
          </div>
        </div>

        {/* Map Frame */}
        <div className="card border border-slate-200 rounded-xl overflow-hidden shadow-xl relative h-[600px] p-0">
          <div ref={mapContainerRef} className="h-full w-full" style={{ zIndex: 10 }} />
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-[2000]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
                <p className="text-slate-500 font-semibold">{t('Refreshing heatmap...')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend & Statistics */}
        <div className="card p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('Glow Node Color Legend')}</h3>
            <div className="flex flex-wrap gap-6 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF3333] shadow-[0_0_6px_#FF3333]" />
                <span className="text-slate-650">{t('Critical SLA Breach / Priority')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFB300] shadow-[0_0_6px_#FFB300]" />
                <span className="text-slate-650">{t('Active Warnings')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676]" />
                <span className="text-slate-650">{t('Stable (Resolved)')}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('Filtered Active Status')}</h3>
            <div className="flex gap-6 text-xs font-bold">
              <div>
                <span className="text-red-500 text-sm font-extrabold">{redCount}</span> <span className="text-slate-500 font-semibold">{t('Critical')}</span>
              </div>
              <div>
                <span className="text-amber-500 text-sm font-extrabold">{amberCount}</span> <span className="text-slate-500 font-semibold">{t('Warnings')}</span>
              </div>
              <div>
                <span className="text-emerald-500 text-sm font-extrabold">{greenCount}</span> <span className="text-slate-500 font-semibold">{t('Stable')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

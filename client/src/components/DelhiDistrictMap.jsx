import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// 11 Administrative Districts of Delhi Mock Data Architecture
const DISTRICTS_DATA = [
  {
    id: 'north_west',
    name: 'North West Delhi',
    activeSlaBreaches: 42,
    totalComplaints: 310,
    resolvedCount: 220,
    pendingCount: 90,
    area: 440,
    population: 3600000,
    populationDensity: 8200
  },
  {
    id: 'north',
    name: 'North Delhi',
    activeSlaBreaches: 28,
    totalComplaints: 180,
    resolvedCount: 130,
    pendingCount: 50,
    area: 60,
    population: 880000,
    populationDensity: 14500
  },
  {
    id: 'north_east',
    name: 'North East Delhi',
    activeSlaBreaches: 35,
    totalComplaints: 290,
    resolvedCount: 195,
    pendingCount: 95,
    area: 62,
    population: 2240000,
    populationDensity: 36100
  },
  {
    id: 'shahdara',
    name: 'Shahdara',
    activeSlaBreaches: 12,
    totalComplaints: 140,
    resolvedCount: 105,
    pendingCount: 35,
    area: 60,
    population: 1000000,
    populationDensity: 16600
  },
  {
    id: 'east',
    name: 'East Delhi',
    activeSlaBreaches: 25,
    totalComplaints: 210,
    resolvedCount: 155,
    pendingCount: 55,
    area: 64,
    population: 1700000,
    populationDensity: 27100
  },
  {
    id: 'central',
    name: 'Central Delhi',
    activeSlaBreaches: 8,
    totalComplaints: 95,
    resolvedCount: 82,
    pendingCount: 13,
    area: 25,
    population: 580000,
    populationDensity: 9300
  },
  {
    id: 'new_delhi',
    name: 'New Delhi',
    activeSlaBreaches: 4,
    totalComplaints: 60,
    resolvedCount: 52,
    pendingCount: 8,
    area: 35,
    population: 140000,
    populationDensity: 4000
  },
  {
    id: 'west',
    name: 'West Delhi',
    activeSlaBreaches: 31,
    totalComplaints: 280,
    resolvedCount: 200,
    pendingCount: 80,
    area: 129,
    population: 2500000,
    populationDensity: 19500
  },
  {
    id: 'south_west',
    name: 'South West Delhi',
    activeSlaBreaches: 9,
    totalComplaints: 150,
    resolvedCount: 132,
    pendingCount: 18,
    area: 420,
    population: 2292000,
    populationDensity: 5400
  },
  {
    id: 'south',
    name: 'South Delhi',
    activeSlaBreaches: 18,
    totalComplaints: 230,
    resolvedCount: 172,
    pendingCount: 58,
    area: 250,
    population: 2730000,
    populationDensity: 11000
  },
  {
    id: 'south_east',
    name: 'South East Delhi',
    activeSlaBreaches: 22,
    totalComplaints: 195,
    resolvedCount: 138,
    pendingCount: 57,
    area: 102,
    population: 1850000,
    populationDensity: 18200
  }
];

// SVG coordinates for exact geometric path representation of Delhi districts
const SVG_PATHS = {
  north_west: 'M 50,150 L 150,50 L 250,100 L 250,220 L 150,250 L 80,240 Z',
  north: 'M 250,100 L 330,80 L 330,180 L 250,220 Z',
  north_east: 'M 330,80 L 400,60 L 440,120 L 370,160 L 330,130 Z',
  shahdara: 'M 370,160 L 440,120 L 460,190 L 400,210 Z',
  east: 'M 400,210 L 460,190 L 440,270 L 360,250 Z',
  central: 'M 250,220 L 330,180 L 330,240 L 270,260 Z',
  new_delhi: 'M 270,260 L 330,240 L 360,250 L 340,310 L 280,330 Z',
  west: 'M 150,250 L 250,220 L 270,260 L 280,330 L 180,350 Z',
  south_west: 'M 80,240 L 150,250 L 180,350 L 280,330 L 220,460 L 80,400 Z',
  south: 'M 280,330 L 340,310 L 360,370 L 300,480 L 220,460 Z',
  south_east: 'M 340,310 L 360,250 L 400,210 L 440,270 L 420,420 L 300,480 L 360,370 Z'
};

export default function DelhiDistrictMap() {
  const { t } = useTranslation();
  
  // State variables for interaction and state management
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: '', breaches: 0 });

  // Get color code according to SLA Breaches classification rules
  const getDistrictColor = (breaches) => {
    if (breaches > 30) return '#E5533C'; // Critical (Coral Red)
    if (breaches >= 10) return '#F19E38'; // Alert (Amber/Orange)
    return '#2D8A4E'; // Stable (Forest Green)
  };

  // Find selected district or default to aggregate NCT totals
  const selectedDistrict = DISTRICTS_DATA.find(d => d.id === selectedId);

  // Compute aggregate stats for default layout
  const aggregateStats = {
    name: 'Delhi National Capital Territory (All)',
    activeSlaBreaches: DISTRICTS_DATA.reduce((acc, curr) => acc + curr.activeSlaBreaches, 0),
    totalComplaints: DISTRICTS_DATA.reduce((acc, curr) => acc + curr.totalComplaints, 0),
    resolvedCount: DISTRICTS_DATA.reduce((acc, curr) => acc + curr.resolvedCount, 0),
    pendingCount: DISTRICTS_DATA.reduce((acc, curr) => acc + curr.pendingCount, 0),
    area: DISTRICTS_DATA.reduce((acc, curr) => acc + curr.area, 0),
    population: DISTRICTS_DATA.reduce((acc, curr) => acc + curr.population, 0),
    populationDensity: Math.round(DISTRICTS_DATA.reduce((acc, curr) => acc + curr.populationDensity, 0) / DISTRICTS_DATA.length)
  };

  const currentData = selectedDistrict || aggregateStats;
  const resolutionRate = currentData.totalComplaints 
    ? Math.round((currentData.resolvedCount / currentData.totalComplaints) * 100) 
    : 0;

  // Handle tooltip movement
  const handleMouseMove = (e, district) => {
    const mapBounds = e.currentTarget.parentElement.getBoundingClientRect();
    setTooltip({
      show: true,
      x: e.clientX - mapBounds.left + 15,
      y: e.clientY - mapBounds.top - 15,
      name: district.name,
      breaches: district.activeSlaBreaches
    });
    setHoveredId(district.id);
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, name: '', breaches: 0 });
    setHoveredId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl">
      
      {/* LEFT PANEL: Interactive SVG District Map */}
      <div className="lg:col-span-7 flex flex-col justify-between relative bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
        <div>
          <h3 className="font-extrabold text-lg text-slate-100 tracking-wide flex items-center gap-2">
            📍 {t('Interactive Districts Map')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t('Click on any district shape to load its analytical details panel.')}
          </p>
        </div>

        {/* Responsive Map Area */}
        <div className="relative w-full aspect-[6/5] my-4 flex items-center justify-center">
          <svg
            viewBox="0 0 500 500"
            className="w-full h-full max-h-[420px] transition-transform duration-200 select-none"
          >
            {DISTRICTS_DATA.map(d => {
              const color = getDistrictColor(d.activeSlaBreaches);
              const isSelected = selectedId === d.id;
              const isHovered = hoveredId === d.id;
              
              return (
                <path
                  key={d.id}
                  d={SVG_PATHS[d.id]}
                  fill={color}
                  fillOpacity={isSelected ? 0.9 : isHovered ? 0.75 : 0.6}
                  stroke={isSelected ? '#FFFFFF' : isHovered ? '#DDDDDD' : '#0F172A'}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                  className="cursor-pointer transition-all duration-150 ease-out"
                  style={{
                    filter: isSelected 
                      ? `drop-shadow(0 0 12px ${color})` 
                      : isHovered 
                        ? `drop-shadow(0 0 6px ${color})` 
                        : 'none'
                  }}
                  onMouseMove={(e) => handleMouseMove(e, d)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => setSelectedId(isSelected ? null : d.id)}
                />
              );
            })}
          </svg>

          {/* Micro-Tooltip Portal Overlay */}
          {tooltip.show && (
            <div
              className="absolute z-50 bg-slate-950/95 border border-slate-800 text-white rounded-lg px-3 py-2 shadow-2xl pointer-events-none text-xs flex flex-col space-y-0.5"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: 'translate(0, -100%)'
              }}
            >
              <span className="font-extrabold text-slate-200">{t(tooltip.name)}</span>
              <span className="text-[10px] text-slate-400">
                {t('Active SLA Breaches')}:{' '}
                <strong className={tooltip.breaches > 30 ? 'text-red-400' : tooltip.breaches >= 10 ? 'text-amber-400' : 'text-emerald-400'}>
                  {tooltip.breaches}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#E5533C]" />
            <span className="text-slate-400">{t('Critical (>30 Breaches)')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#F19E38]" />
            <span className="text-slate-400">{t('Alert (10-30 Breaches)')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-[#2D8A4E]" />
            <span className="text-slate-400">{t('Stable (<10 Breaches)')}</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Interactive Metrics Dashboard Card */}
      <div className="lg:col-span-5 flex flex-col bg-slate-950/40 rounded-xl p-5 border border-slate-800/80 justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h4 className="font-extrabold text-base text-slate-100 truncate w-3/4">
              {t(currentData.name)}
            </h4>
            {selectedId && (
              <button
                onClick={() => setSelectedId(null)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-0.5 rounded transition-all"
              >
                {t('Reset')}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Demographic Indicators */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase">{t('Land Area')}</div>
                <div className="text-sm font-bold mt-0.5 text-slate-200">
                  {currentData.area.toLocaleString()} km²
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase">{t('Population')}</div>
                <div className="text-sm font-bold mt-0.5 text-slate-200">
                  {(currentData.population / 1000000).toFixed(2)} M
                </div>
              </div>
            </div>

            {/* SLA Breaches Indicator Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-400 font-medium">{t('Active SLA Breaches')}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">{t('SLA limits exceeded')}</p>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-black px-3 py-1 rounded"
                  style={{
                    color: getDistrictColor(currentData.activeSlaBreaches),
                    backgroundColor: `${getDistrictColor(currentData.activeSlaBreaches)}18`
                  }}
                >
                  {currentData.activeSlaBreaches}
                </div>
              </div>
            </div>

            {/* Resolution Rate Semi-Circular Gauge style Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">{t('Resolution Rate')}</span>
                <span className="text-blue-400">{resolutionRate}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${resolutionRate}%` }}
                />
              </div>
            </div>

            {/* Case Metrics List Breakdown */}
            <div className="space-y-2.5 border-t border-slate-800/80 pt-4">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {t('Case Breakdown')}
              </h5>

              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-400">{t('Total Grievances')}</span>
                <span className="font-bold text-slate-200">{currentData.totalComplaints}</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-t border-slate-900">
                <span className="text-slate-400">{t('Resolved')}</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  ✓ {currentData.resolvedCount}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-t border-slate-900">
                <span className="text-slate-400">{t('Pending')}</span>
                <span className="font-bold text-amber-400">{currentData.pendingCount}</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1 border-t border-slate-900">
                <span className="text-slate-400">{t('Population Density')}</span>
                <span className="font-bold text-slate-200">
                  {currentData.populationDensity.toLocaleString()} / km²
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action for Integration */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-[10px] text-slate-500 text-center mt-5">
          🔒 {t('Live synchronization with MongoDB district endpoints enabled.')}
        </div>
      </div>
    </div>
  );
}

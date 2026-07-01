import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { TrendChart, CategoryChart, DeptPieChart, DepartmentTable } from '../../components/Charts';
import { analyticsAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';
import DelhiDistrictMap from '../../components/DelhiDistrictMap';

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [trends, setTrends] = useState([]);
  const [cats, setCats] = useState([]);
  const [depts, setDepts] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    Promise.all([
      analyticsAPI.trends({ period, days: period === 'daily' ? 30 : 90 }),
      analyticsAPI.categories(),
      analyticsAPI.departments(),
      analyticsAPI.districts()
    ]).then(([tr, ct, dp, di]) => {
      setTrends(tr.data);
      setCats(ct.data);
      setDepts(dp.data);
      setDistricts(di.data);
    }).finally(() => setLoading(false));
  }, [period]);

  return (
    <Layout title="Analytics Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">📈 {t('Complaint Volume Trend')}</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly'].map(p => (
                <button key={p} onClick={() => { setPeriod(p); setLoading(true); }}
                  className={`px-3 py-1 text-xs rounded font-medium capitalize transition-all
                    ${period === p ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t(p)}
                </button>
              ))}
            </div>
          </div>
          <TrendChart data={trends} loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-4">📊 {t('Category Breakdown')}</h2>
            <CategoryChart data={cats} loading={loading} />
            <div className="mt-4 space-y-1">
              {cats.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1">
                  <span className="text-slate-600">{t(c._id)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-blue-900 h-1.5 rounded-full"
                        style={{ width: `${cats[0]?.count ? (c.count / cats[0].count) * 100 : 0}%` }} />
                    </div>
                    <span className="font-semibold text-slate-700 w-8 text-right">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dept Distribution */}
          <div className="card p-5">
            <h2 className="font-semibold text-slate-700 mb-4">🏢 {t('Department Distribution')}</h2>
            <DeptPieChart data={depts} loading={loading} />
          </div>
        </div>

        {/* Department Table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700">🏢 {t('Department Performance')}</h2>
          </div>
          <DepartmentTable data={depts} loading={loading} />
        </div>

        {/* District Stats SVG Map */}
        <DelhiDistrictMap />
      </div>
    </Layout>
  );
}

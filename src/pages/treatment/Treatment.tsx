import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, ShieldAlert, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Bacteria {
  id: number;
  name: string;
  gram_type: string;
  morphology: string;
  created_at: string;
}

interface TreatmentOption {
  id: number;
  method_name: string;
  mechanism: string;
  specifics: string;
  priority: number;
  treatment_type: string;
}

interface Antibiotic {
  id: number;
  drug_name: string;
  use_case: string;
  resistance_risk: string;
  notes: string;
}

interface PipelineStage {
  id: number;
  stage_order: number;
  stage_name: string;
  mechanism: string;
  parameters: string;
  kill_rate_percent: number;
  treatment_category: string;
}

interface FullData {
  bacteria: Bacteria;
  treatments: TreatmentOption[];
  antibiotics: Antibiotic[];
  pipeline: PipelineStage[];
}

export default function Treatment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bacteriaName = searchParams.get('bacteria');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FullData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!bacteriaName) {
        setError("No bacteria specified.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Step 1: Get the bacteria ID
        const listRes = await api.get('/api/bacteria');
        const list: Bacteria[] = listRes.data;
        const target = list.find(b => b.name.toLowerCase() === bacteriaName.toLowerCase());
        
        if (!target) {
          setError(`Bacteria "${bacteriaName}" not found in database.`);
          return;
        }

        // Step 2: Get full data
        const fullRes = await api.get(`/api/bacteria/${target.id}/full`);
        console.log('Treatment API response:', fullRes.data);
        setData(fullRes.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch treatment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bacteriaName]);

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 w-12 bg-gray-200 rounded mb-6" />
          <div className="bg-gray-200 rounded-3xl h-36 mb-10" />
          <div className="mb-10">
            <div className="h-7 w-72 bg-gray-200 rounded mb-6" />
            <div className="bg-sky-50/50 rounded-3xl border border-sky-100 p-6 sm:p-8 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
                    <div className="h-5 w-48 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-4/5 bg-gray-200 rounded" />
                    <div className="flex gap-2">
                      <div className="h-7 w-28 bg-gray-200 rounded-lg" />
                      <div className="h-7 w-36 bg-gray-200 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="h-7 w-56 bg-gray-200 rounded mb-6" />
              <div className="space-y-5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-3xl bg-indigo-50/40 border border-indigo-100/60 p-6 space-y-3">
                    <div className="h-6 w-40 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-7 w-56 bg-gray-200 rounded mb-6" />
              <div className="bg-rose-50/30 rounded-3xl border border-rose-100 p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-rose-100/60 p-5 space-y-2">
                    <div className="h-5 w-36 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center shadow-sm border border-red-100">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-80" />
          <h2 className="text-lg font-bold mb-2">Error</h2>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-sm font-medium transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { bacteria, treatments, antibiotics, pipeline } = data;

  const getRiskColor = (risk: string) => {
    switch(risk.toLowerCase()) {
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-500/10';
      case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-500/10';
      case 'high': return 'bg-red-50 text-red-700 border-red-200 shadow-red-500/10';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 shadow-gray-500/10';
    }
  };

  const getTypeColor = (type: string) => {
    if (type.includes('first')) return 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-500/10';
    if (type.includes('second')) return 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-500/10';
    return 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-500/10';
  };

  return (
    <div className="flex-1 bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-lightnavy hover:text-navy transition-colors mb-6 group text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy rounded-3xl shadow-xl shadow-navy/10 p-8 sm:p-10 mb-10 relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-bluenavy opacity-20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-cyan-400 opacity-10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <p className="text-white/70 text-sm font-bold tracking-wider uppercase mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Treatment Protocol
              </p>
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-white tracking-tight">
                {bacteria.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-5 py-2 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20 backdrop-blur-md shadow-sm">
                Gram {bacteria.gram_type}
              </span>
              <span className="px-5 py-2 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20 backdrop-blur-md tracking-wide capitalize shadow-sm">
                {bacteria.morphology}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Pipeline Section - Full Width */}
        {pipeline && pipeline.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-heading font-bold text-navy mb-6 flex items-center gap-3">
              <Activity className="w-6 h-6 text-sky-600" />
              Recommended Treatment Pipeline
            </h2>
            <div className="bg-sky-50/50 rounded-3xl shadow-sm border border-sky-100 p-6 sm:p-8">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-sky-200 before:via-sky-200 before:to-transparent">
                {pipeline.map((stage) => (
                  <div key={stage.id} className="relative flex items-start gap-6 group">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full border-4 border-sky-50 bg-sky-600 text-white font-bold text-sm shadow-sm shrink-0 z-10 mt-1">
                      {stage.stage_order}
                    </div>
                    <div className="flex-1 p-5 rounded-2xl bg-white border border-sky-100/80 hover:border-sky-300 hover:shadow-md transition-all shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-3">
                        <h3 className="font-bold text-lg text-navy">{stage.stage_name}</h3>
                        <span className="self-start text-[10px] font-bold px-2.5 py-1 rounded-md bg-white text-lightnavy border border-gray-200 uppercase tracking-wider shadow-sm">
                          {stage.treatment_category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{stage.mechanism}</p>
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className="bg-sky-50 text-sky-700 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border border-sky-100">
                          <Target className="w-3.5 h-3.5" />
                          Kill Rate: {stage.kill_rate_percent}%
                        </span>
                        <span className="text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm font-medium">
                          {stage.parameters}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* 2-Column Grid for Treatments and Antibiotics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Treatments Section */}
          {treatments && treatments.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-heading font-bold text-navy mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-indigo-500" />
                Treatment Methods
              </h2>
              <div className="grid gap-5">
                {treatments.map((t) => (
                  <div key={t.id} className="bg-indigo-50/40 rounded-3xl shadow-sm border border-indigo-100/60 p-6 hover:shadow-md hover:border-indigo-200 transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-5 gap-3">
                      <h3 className="font-bold text-xl text-navy group-hover:text-indigo-700 transition-colors">{t.method_name}</h3>
                      <span className={`self-start shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border ${getTypeColor(t.treatment_type)} tracking-wider shadow-sm bg-white`}>
                        {t.treatment_type.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <strong className="text-lightnavy block mb-2 text-xs uppercase tracking-wider font-bold">Mechanism</strong>
                        <p className="text-gray-700 leading-relaxed bg-white/80 p-4 rounded-2xl border border-indigo-50">{t.mechanism}</p>
                      </div>
                      <div>
                        <strong className="text-lightnavy block mb-2 text-xs uppercase tracking-wider font-bold">Specifics</strong>
                        <p className="text-indigo-900 font-medium bg-indigo-100/40 p-4 rounded-2xl border border-indigo-200/50 leading-relaxed">{t.specifics}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Antibiotics Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-heading font-bold text-navy mb-6 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              Clinical Antibiotics
            </h2>
            
            <div className="bg-rose-50/30 rounded-3xl shadow-sm border border-rose-100 p-6">
              {antibiotics && antibiotics.length > 0 ? (
                <div className="space-y-4">
                  {antibiotics.map(ab => (
                    <div key={ab.id} className="p-5 rounded-2xl bg-white border border-rose-100/60 hover:border-rose-200 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h3 className="font-bold text-navy text-lg">{ab.drug_name}</h3>
                        <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase border shadow-sm ${getRiskColor(ab.resistance_risk)}`}>
                          {ab.resistance_risk} RISK
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium mb-3">{ab.use_case}</p>
                      {ab.notes && (
                        <div className="mt-4 pt-4 border-t border-rose-100/60">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            <strong className="text-rose-700/80 font-bold mr-1.5 uppercase tracking-wider">Note:</strong>
                            {ab.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/50 rounded-2xl border border-rose-100 border-dashed">
                  <ShieldAlert className="w-10 h-10 text-rose-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No specific antibiotics listed for this strain.</p>
                </div>
              )}
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
}

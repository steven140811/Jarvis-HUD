import React, { useEffect, useState } from 'react';
import { SystemMetric } from '../types';
import { Activity, Battery, Shield, Cpu, Wifi } from 'lucide-react';

const SystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { id: 'armor', label: 'ARMOR INTEGRITY', value: 100, max: 100, unit: '%', status: 'normal' },
    { id: 'power', label: 'ARC OUTPUT', value: 92, max: 100, unit: 'GJ', status: 'normal' },
    { id: 'thrusters', label: 'THRUSTERS', value: 85, max: 100, unit: '%', status: 'normal' },
    { id: 'cpu', label: 'CPU LOAD', value: 12, max: 100, unit: '%', status: 'normal' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        // Random fluctuation
        const change = (Math.random() - 0.5) * 5;
        let newValue = Math.min(m.max, Math.max(0, m.value + change));
        
        // Specific simulation logic
        if (m.id === 'cpu') newValue = Math.random() * 30 + 10;
        
        let status: SystemMetric['status'] = 'normal';
        if (newValue < 30 && m.id === 'armor') status = 'critical';
        else if (newValue < 50 && m.id === 'power') status = 'warning';
        
        return { ...m, value: newValue, status };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (id: string) => {
    switch (id) {
      case 'armor': return <Shield size={16} />;
      case 'power': return <Battery size={16} />;
      case 'cpu': return <Cpu size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getBarColor = (status: string) => {
    if (status === 'critical') return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
    if (status === 'warning') return 'bg-yellow-500 shadow-[0_0_10px_#eab308]';
    return 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]';
  };

  return (
    <div className="space-y-4">
      {metrics.map((metric) => (
        <div key={metric.id} className="bg-black/40 border-l-2 border-cyan-500/30 pl-3 py-1">
          <div className="flex justify-between items-center mb-1 text-xs font-hud tracking-widest text-cyan-400/80">
             <span className="flex items-center gap-2">
               {getIcon(metric.id)}
               {metric.label}
             </span>
             <span className={metric.status === 'critical' ? 'text-red-500 animate-pulse' : 'text-cyan-300'}>
               {metric.value.toFixed(1)}{metric.unit}
             </span>
          </div>
          <div className="h-1.5 w-full bg-cyan-900/30 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getBarColor(metric.status)}`}
              style={{ width: `${(metric.value / metric.max) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
      
      <div className="mt-6 border-t border-cyan-500/20 pt-4">
        <div className="flex items-center justify-between text-cyan-600 text-xs font-mono mb-2">
          <span>NETWORK</span>
          <Wifi size={14} />
        </div>
        <div className="grid grid-cols-6 gap-1">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`h-6 w-full ${Math.random() > 0.5 ? 'bg-cyan-500/40' : 'bg-cyan-900/20'} animate-pulse`}
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;

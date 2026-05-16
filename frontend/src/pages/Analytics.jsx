import { useState, useEffect, useRef } from 'react'
import { fetchStats } from '../api'

// ── Components ────────────────────────────────────────────────

function ChartCard({ title, subtitle, children, onDownload }) {
  const cardRef = useRef(null);

  const handleDownload = () => {
    if (!cardRef.current) return;
    const svg = cardRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Scale for better quality
    const scale = 2;
    canvas.width = svg.clientWidth * scale;
    canvas.height = svg.clientHeight * scale;
    ctx.scale(scale, scale);

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, svg.clientWidth, svg.clientHeight);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${title.replace(/\s+/g, '_').toLowerCase()}_graph.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="card fade-up" style={{ marginBottom: 20, position:'relative' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h3 style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, fontWeight:800, color:'#1a6b3c' }}>{title}</h3>
          {subtitle && <p style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{subtitle}</p>}
        </div>
        <button className="tap" onClick={handleDownload} 
          style={{ background:'#f0faf4', border:'1.5px solid #d1fae5', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, color:'#1a6b3c', display:'flex', alignItems:'center', gap:6 }}>
          📥 Download Graph
        </button>
      </div>
      <div ref={cardRef} style={{ width:'100%', minHeight:250, display:'flex', justifyContent:'center', alignItems:'center' }}>
        {children}
      </div>
    </div>
  );
}

function BarChart({ data, width = 600, height = 300 }) {
  const margin = { top: 20, right: 20, bottom: 60, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const barWidth = (chartWidth / data.length) * 0.8;
  const gap = (chartWidth / data.length) * 0.2;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ background:'#fff' }}>
      {/* Y Axis Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(tick => (
        <line key={tick} x1={margin.left} y1={margin.top + chartHeight * (1 - tick)} x2={width - margin.right} y2={margin.top + chartHeight * (1 - tick)} stroke="#f0f4f0" strokeWidth="1" />
      ))}
      
      {/* Bars */}
      {data.map((d, i) => {
        const h = (d.count / maxVal) * chartHeight;
        const x = margin.left + i * (barWidth + gap) + gap/2;
        const y = margin.top + chartHeight - h;
        
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={h} fill="url(#barGradient)" rx="4" className="bar-fill-vertical" style={{ transition:'height 0.5s ease' }} />
            <text x={x + barWidth/2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a6b3c">{d.count}</text>
            <text x={x + barWidth/2} y={margin.top + chartHeight + 20} textAnchor="middle" fontSize="10" fontWeight="600" fill="#6b7280" transform={`rotate(15, ${x + barWidth/2}, ${margin.top + chartHeight + 20})`}>
              {String(d._id).length > 15 ? String(d._id).substring(0, 12) + '...' : d._id}
            </text>
          </g>
        );
      })}
      
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ecb85" />
          <stop offset="100%" stopColor="#1a6b3c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const QUESTION_MAP = {
  q1_gender: 'Q1. Gender Distribution',
  q2_ageGroup: 'Q2. Age Group Breakdown',
  q3_education: 'Q3. Education Levels',
  q4_landSize: 'Q4. Land Ownership Size',
  q5_mainCrop: 'Q5. Main Crops Grown',
  q6_farmingExp: 'Q6. Farming Experience',
  q7_awareServices: 'Q7. Awareness of Services',
  q8_understandsBenefit: 'Q8. Understanding Productivity Benefits',
  q9_knowsExcessDamage: 'Q9. Awareness of Soil Damage',
  q10_knowsHowToTest: 'Q10. Knowledge of Testing Process',
  q11_reducesFertilizer: 'Q11. Perception of Fertilizer Reduction',
  q12_infoAvailable: 'Q12. Ease of Information Access',
  q13_easyAccess: 'Q13. Accessibility of Centers',
  q14_convenientProcess: 'Q14. Process Convenience',
  q15_reasonableTime: 'Q15. Turnaround Time Satisfaction',
  q16_affordable: 'Q16. Cost Affordability',
  q17_lacksDiscourages: 'Q17. Facilities vs Discouragement',
  q18_facilitiesAvailable: 'Q18. Local Facility Sufficiency',
  q19_everTested: 'Q19. Soil Testing Adoption',
  q20_frequency: 'Q20. Testing Frequency',
  q21_reasonNoTest: 'Q21. Barriers to Testing',
  q22_receivedTraining: 'Q22. Training Exposure',
  q23_useMoreIfAccessible: 'Q23. Future Intent (Accessibility)',
  q24_fertDecision: 'Q24. Fertilizer Decision Factors',
  q25_excessYield: 'Q25. Perception of Excess Usage',
  q26_mainFactor: 'Q26. Fertilizer Usage Determinants',
  q27_testingImportant: 'Q27. Importance Perception',
  q28_villageLevel: 'Q28. Village-level Availability Demand',
  q29_resultsQuickly: 'Q29. Quick Results Impact',
  q30_awarenessPrograms: 'Q30. Impact of Awareness Programs'
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQ, setSelectedQ] = useState('q5_mainCrop');

  useEffect(() => {
    fetchStats().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="skeleton" style={{ height: 60 }} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
      </div>
      <div className="skeleton" style={{ height: 350 }} />
    </div>
  );

  if (!stats || !stats.questions) return (
    <div className="card" style={{ textAlign:'center', padding:40 }}>
      <div style={{ fontSize:40, marginBottom:16 }}>📉</div>
      <h2 style={{ fontFamily:"'Crimson Pro',serif", color:'#1a6b3c' }}>No Data Available Yet</h2>
      <p style={{ color:'#9ca3af', fontSize:14 }}>Submit some surveys to see analytics here.</p>
    </div>
  );

  const currentData = stats.questions[selectedQ] || [];
  const totals = stats.totals || {};

  return (
    <div>
      {/* Branding Header */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:48, height:48, background:'#1a6b3c', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'#fff' }}>📊</div>
          <div>
            <h1 style={{ fontFamily: "'Crimson Pro',serif", fontSize: 28, fontWeight: 800, color: '#1a6b3c', lineHeight:1 }}>Research Analytics</h1>
            <p style={{ fontSize: 12, color: '#8d6e63', marginTop: 4, fontWeight:500 }}>SOILSENSE: SIT Tumakuru MBA Study Dashboard</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Surveys', value: totals.total || 0, icon: '📝', color: '#1a6b3c' },
          { label: 'Completed', value: totals.Complete || 0, icon: '✅', color: '#4ecb85' },
          { label: 'Avg Awareness', value: `${stats.awareness?.avgAware?.toFixed(1) || '0.0'}/5`, icon: '💡', color: '#d97706' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card fade-up" style={{ padding: '16px 12px', borderBottom:`4px solid ${color}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily: "'Crimson Pro',serif", fontSize: 22, fontWeight: 800, color: '#1a6b3c' }}>{value}</div>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', letterSpacing:0.5 }}>{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Question Analysis Section */}
      <div className="card fade-up" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize:12, fontWeight:800, color:'#1a6b3c', textTransform:'uppercase', display:'block', marginBottom:8 }}>
            Select Question to Analyze:
          </label>
          <select className="form-select" value={selectedQ} onChange={e => setSelectedQ(e.target.value)} 
            style={{ padding:'12px', fontSize:14, fontWeight:600, border:'2px solid #d1fae5', borderRadius:12 }}>
            {Object.keys(QUESTION_MAP).map(key => (
              <option key={key} value={key}>{QUESTION_MAP[key]}</option>
            ))}
          </select>
        </div>

        <ChartCard 
          title={QUESTION_MAP[selectedQ]} 
          subtitle={`Detailed distribution based on ${currentData.reduce((acc, curr) => acc + curr.count, 0)} responses`}
        >
          {currentData.length > 0 ? (
            <BarChart data={currentData} />
          ) : (
            <div style={{ textAlign:'center', color:'#9ca3af', fontSize:14 }}>No data for this question yet.</div>
          )}
        </ChartCard>
      </div>

      {/* Secondary Insights */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div className="card fade-up" style={{ background:'#fdfbf7', border:'1.5px solid #f5deb3' }}>
          <h4 style={{ fontFamily:"'Crimson Pro',serif", color:'#8d6e63', marginBottom:12 }}>💡 Quick Insights</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ fontSize:12, color:'#374151', lineHeight:1.5 }}>
              • <strong>Dominant Crop:</strong> {stats.questions.q5_mainCrop?.[0]?._id || 'N/A'}
            </div>
            <div style={{ fontSize:12, color:'#374151', lineHeight:1.5 }}>
              • <strong>Testing Rate:</strong> {Math.round((totals.Complete / totals.total) * 100) || 0}% completion
            </div>
            <div style={{ fontSize:12, color:'#374151', lineHeight:1.5 }}>
              • <strong>Top Barrier:</strong> {stats.questions.q21_reasonNoTest?.[0]?._id || 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="card fade-up" style={{ background:'#1a6b3c', color:'#fff', border:'none' }}>
          <h4 style={{ fontFamily:"'Crimson Pro',serif", color:'rgba(255,255,255,0.9)', marginBottom:12 }}>📈 Research Impact</h4>
          <p style={{ fontSize:12, opacity:0.9, lineHeight:1.6 }}>
            This data will be used by MBA students at SIT Tumakuru to propose policy changes for soil testing accessibility in rural areas.
          </p>
          <div style={{ marginTop:14, fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase' }}>
            SIT Tumakuru Research Project 2026
          </div>
        </div>
      </div>
    </div>
  );
}

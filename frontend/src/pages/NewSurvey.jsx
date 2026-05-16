import { useState, useRef, useEffect } from 'react'
import { createFarmer } from '../api'
import { useToast } from '../context/ToastContext'
import { resizeImage } from '../utils'

// ── Helpers ───────────────────────────────────────────────────
function Radio({ options, value, onChange, error }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:6 }}>
      {options.map(opt => (
        <label key={opt} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <div onClick={() => onChange(opt)} style={{
            width:20, height:20, borderRadius:'50%', border:`2px solid ${value===opt?'#1a6b3c': error?'#fca5a5':'#d1fae5'}`,
            background: value===opt?'#1a6b3c':'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, transition:'all 0.15s', cursor:'pointer',
            boxShadow: value===opt?'0 0 0 4px rgba(26,107,60,0.1)':'none'
          }}>
            {value===opt && <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />}
          </div>
          <span style={{ fontSize:14, color:error && !value?'#dc2626':'#374151', fontWeight: value===opt?600:400 }}>{opt}</span>
        </label>
      ))}
      {error && !value && <div style={{ fontSize:10, color:'#dc2626', fontWeight:600, marginTop:2 }}>* Please select an option</div>}
    </div>
  )
}

function LikertRow({ num, statement, value, onChange, error }) {
  return (
    <div style={{
      padding:'18px 0', borderBottom:'1px solid #f0f4f0',
    }}>
      <div style={{ fontSize:14, color:error && !value?'#dc2626':'#374151', fontWeight:500, marginBottom:12, lineHeight:1.5 }}>
        <span style={{ color:'#1a6b3c', fontWeight:700 }}>Q{num}.</span> {statement} {error && !value && <span style={{ color:'#dc2626' }}>*</span>}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {[
          { val:1, label:'Strongly Disagree' },
          { val:2, label:'Disagree' },
          { val:3, label:'Neutral' },
          { val:4, label:'Agree' },
          { val:5, label:'Strongly Agree' },
        ].map(({ val, label }) => (
          <div key={val} className="tap" onClick={() => onChange(val)}
            style={{
              flex:1, minWidth:58, padding:'10px 4px', borderRadius:12, textAlign:'center',
              border:`2px solid ${value===val?'#1a6b3c': error && !value?'#fee2e2':'#f0f4f0'}`,
              background: value===val?'#1a6b3c': error && !value?'#fffafa':'#f9fff9',
              cursor:'pointer', transition:'all 0.15s',
              boxShadow: value===val?'0 4px 12px rgba(26,107,60,0.2)':'none'
            }}>
            <div style={{ fontSize:18, fontWeight:800, color:value===val?'#fff':'#1a6b3c', lineHeight:1, marginBottom:4 }}>{val}</div>
            <div style={{ fontSize:9, color:value===val?'rgba(255,255,255,0.9)':'#9ca3af', lineHeight:1.1, fontWeight:600 }}>{label.split(' ').join('\n')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, paddingBottom:16, borderBottom:'2px solid #f0faf4' }}>
      <div style={{ width:44, height:44, background:'#1a6b3c', color:'#fff', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0, boxShadow:'0 4px 12px rgba(26,107,60,0.2)' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, fontWeight:700, color:'#1a6b3c' }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, color:'#9ca3af', marginTop:2, fontWeight:500 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

function QLabel({ num, text, required, error }) {
  return (
    <label className="form-label" style={{ marginBottom:10, display:'block', fontSize:13, color:error?'#dc2626':'#374151', fontWeight:600, lineHeight:1.5 }}>
      <span style={{ color:'#1a6b3c', fontWeight:800 }}>Q{num}.</span> {text} {required && <span style={{ color:'#dc2626' }}>*</span>}
    </label>
  )
}

// ── Constants ─────────────────────────────────────────────
const INIT = {
  farmerName:'', taluk:'', village:'', photo:'', enumeratorName:'',
  q1_gender:'', q2_ageGroup:'', q3_education:'', q4_landSize:'', q5_mainCrop:'', q6_farmingExp:'',
  q7_awareServices:'', q8_understandsBenefit:'', q9_knowsExcessDamage:'', q10_knowsHowToTest:'', q11_reducesFertilizer:'', q12_infoAvailable:'',
  q13_easyAccess:'', q14_convenientProcess:'', q15_reasonableTime:'', q16_affordable:'', q17_lacksDiscourages:'', q18_facilitiesAvailable:'',
  q19_everTested:'', q20_frequency:'', q21_reasonNoTest:'', q22_receivedTraining:'', q23_useMoreIfAccessible:'',
  q24_fertDecision:'', q25_excessYield:'', q26_mainFactor:'',
  q27_testingImportant:'', q28_villageLevel:'', q29_resultsQuickly:'', q30_awarenessPrograms:'',
  status:'Draft',
}

const STEPS = [
  { id: 'intro',   label:'Intro',    icon:'📋' },
  { id: 'profile', label:'Profile',  icon:'👨‍🌾' },
  { id: 'sectionB',label:'Aware',    icon:'💡' },
  { id: 'sectionC',label:'Access',   icon:'🗺️' },
  { id: 'sectionD',label:'Adopt',    icon:'🌱' },
  { id: 'sectionE',label:'Usage',    icon:'⚖️' },
  { id: 'sectionF',label:'Attitude', icon:'🧠' },
]

export default function NewSurvey({ setActive }) {
  const [form, setForm]   = useState(INIT)
  const [step, setStep]   = useState(0)
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [showErrors, setShowErrors] = useState(false)
  
  const fileRef = useRef()
  const toast   = useToast()

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => {
      const newE = { ...p }; delete newE[k]; return newE
    })
  }

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      // Show loading toast or state if needed
      const resized = await resizeImage(file, 800, 800, 0.7)
      setPhotoPreview(resized)
      set('photo', resized)
    } catch (err) {
      console.error(err)
      toast('Failed to process image. Try a smaller photo.', 'error')
    }
  }

  const getSectionErrors = (targetStep = step) => {
    const newErrors = {}
    const sId = STEPS[targetStep].id
    
    if (sId === 'profile') {
      if (!form.farmerName) newErrors.farmerName = true
      if (!form.taluk) newErrors.taluk = true
      if (!form.village) newErrors.village = true
      if (!form.photo) newErrors.photo = true
      if (!form.q1_gender) newErrors.q1_gender = true
      if (!form.q2_ageGroup) newErrors.q2_ageGroup = true
      if (!form.q3_education) newErrors.q3_education = true
      if (!form.q4_landSize) newErrors.q4_landSize = true
      if (!form.q5_mainCrop) newErrors.q5_mainCrop = true
      if (!form.q6_farmingExp) newErrors.q6_farmingExp = true
    } else if (sId === 'sectionB') {
      if (!form.q7_awareServices) newErrors.q7_awareServices = true
      if (!form.q8_understandsBenefit) newErrors.q8_understandsBenefit = true
      if (!form.q9_knowsExcessDamage) newErrors.q9_knowsExcessDamage = true
      if (!form.q10_knowsHowToTest) newErrors.q10_knowsHowToTest = true
      if (!form.q11_reducesFertilizer) newErrors.q11_reducesFertilizer = true
      if (!form.q12_infoAvailable) newErrors.q12_infoAvailable = true
    } else if (sId === 'sectionC') {
      if (!form.q13_easyAccess) newErrors.q13_easyAccess = true
      if (!form.q14_convenientProcess) newErrors.q14_convenientProcess = true
      if (!form.q15_reasonableTime) newErrors.q15_reasonableTime = true
      if (!form.q16_affordable) newErrors.q16_affordable = true
      if (!form.q17_lacksDiscourages) newErrors.q17_lacksDiscourages = true
      if (!form.q18_facilitiesAvailable) newErrors.q18_facilitiesAvailable = true
    } else if (sId === 'sectionD') {
      if (!form.q19_everTested) newErrors.q19_everTested = true
      if (form.q19_everTested === 'Yes' && !form.q20_frequency) newErrors.q20_frequency = true
      if (form.q19_everTested === 'No' && !form.q21_reasonNoTest) newErrors.q21_reasonNoTest = true
      if (!form.q22_receivedTraining) newErrors.q22_receivedTraining = true
      if (!form.q23_useMoreIfAccessible) newErrors.q23_useMoreIfAccessible = true
    } else if (sId === 'sectionE') {
      if (!form.q24_fertDecision) newErrors.q24_fertDecision = true
      if (!form.q25_excessYield) newErrors.q25_excessYield = true
      if (!form.q26_mainFactor) newErrors.q26_mainFactor = true
    } else if (sId === 'sectionF') {
      if (!form.q27_testingImportant) newErrors.q27_testingImportant = true
      if (!form.q28_villageLevel) newErrors.q28_villageLevel = true
      if (!form.q29_resultsQuickly) newErrors.q29_resultsQuickly = true
      if (!form.q30_awarenessPrograms) newErrors.q30_awarenessPrograms = true
    }

    return newErrors
  }

  const isSectionComplete = () => {
    if (STEPS[step].id === 'intro') return true
    return Object.keys(getSectionErrors()).length === 0
  }

  const handleNext = () => {
    const sectionErrors = getSectionErrors()
    if (Object.keys(sectionErrors).length === 0) {
      setStep(p => p + 1)
      setShowErrors(false)
      window.scrollTo(0, 0)
    } else {
      setErrors(sectionErrors)
      setShowErrors(true)
      toast('Please answer all required questions in this section.', 'error')
    }
  }

  const submit = async (status='Complete') => {
    if (status === 'Complete') {
      let allErrors = {}
      for (let i=1; i<STEPS.length; i++) {
        allErrors = { ...allErrors, ...getSectionErrors(i) }
      }
      
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors)
        setShowErrors(true)
        for (let i=1; i<STEPS.length; i++) {
          if (Object.keys(getSectionErrors(i)).length > 0) {
            setStep(i)
            break
          }
        }
        toast('Incomplete data. Please check all sections.', 'error')
        return
      }
    }
    
    setSaving(true)
    try {
      const cleanData = { ...form, status }
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '') delete cleanData[key]
      })

      await createFarmer(cleanData)
      toast(status==='Draft' ? 'Draft saved! 💾' : 'Survey submitted! ✅', 'success')
      setForm(INIT); setPhotoPreview(null); setStep(0)
      if (status==='Complete') setActive('Responses')
    } catch (e) {
      console.error('Survey Error:', e.response?.data)
      toast(e.response?.data?.error || 'Failed to submit. Please check all fields.', 'error')
    } finally { setSaving(false) }
  }

  const progress = (step / (STEPS.length - 1)) * 100
  const canProceed = isSectionComplete()

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      {/* Branding Header */}
      <div className="fade-up" style={{ marginBottom:24, textAlign:'center' }}>
        <div style={{ 
          display:'inline-block', padding:'4px 12px', background:'#1a6b3c', color:'#fff', 
          borderRadius:20, fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:1.5, marginBottom:8
        }}>
          SOILSENSE
        </div>
        <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, fontWeight:800, color:'#1a6b3c', lineHeight:1.2 }}>
          SIT Tumakuru – MBA Research Survey
        </h1>
        <p style={{ fontSize:13, color:'#8d6e63', marginTop:6, fontWeight:500, fontStyle:'italic' }}>
          "Accessibility, Awareness, and Adoption: A Study on Soil Testing Gaps and Fertilizer Misuse in Rural Agriculture"
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom:20, position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:11, fontWeight:700, color:'#1a6b3c' }}>
          <span>SECTION {step} OF {STEPS.length - 1}</span>
          <span>{Math.round(progress)}% COMPLETE</span>
        </div>
        <div style={{ height:6, background:'#e8f5ee', borderRadius:10, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'#1a6b3c', width:`${progress}%`, transition:'width 0.4s ease' }} />
        </div>
      </div>

      {/* Step Tabs (Desktop/Tablet) */}
      <div className="card fade-up" style={{ marginBottom:16, padding:'12px', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:6, minWidth:'max-content' }}>
          {STEPS.map((s, i) => (
            <div key={i} onClick={() => i <= step && setStep(i)}
              style={{ 
                display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:10,
                background: i===step?'#1a6b3c': i<step?'#dcfce7':'transparent',
                color: i===step?'#fff': i<step?'#1a6b3c':'#9ca3af',
                cursor: i<=step?'pointer':'default', transition:'all 0.2s', border: i===step?'none':`1px solid ${i<step?'#bbf7d0':'#f0f4f0'}`
              }}>
              <span style={{ fontSize:14 }}>{i<step?'✓':s.icon}</span>
              <span style={{ fontSize:11, fontWeight:700 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 0: Introduction ── */}
      {step===0 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s', background:'#fdfbf7' }}>
          <SectionHeader icon="📋" title="Introduction & Consent" subtitle="Siddganga Institute of Technology, Tumakuru" />
          <div style={{ fontSize:14, color:'#374151', lineHeight:1.6 }}>
            <p style={{ marginBottom:16 }}>
              Dear Farmer, we are MBA students from <strong>SIT Tumakuru</strong> conducting a research study on soil testing and fertilizer usage. 
              Your feedback is crucial for understanding the gaps in agricultural services.
            </p>
            
            <div style={{ background:'#fff', padding:20, borderRadius:16, border:'1px solid #d1fae5', boxShadow:'0 4px 15px rgba(26,107,60,0.05)' }}>
              <div style={{ fontWeight:800, color:'#1a6b3c', marginBottom:10, fontSize:12, textTransform:'uppercase', letterSpacing:1 }}>
                Important Notes for Enumerator
              </div>
              <ul style={{ paddingLeft:18, marginBottom:0, color:'#5d4037', fontSize:13 }}>
                <li>Introduce yourself politely as an SIT student.</li>
                <li>Explain that this is purely for academic research.</li>
                <li>Assure total confidentiality of the farmer's data.</li>
                <li>Read questions clearly in Kannada/Local language.</li>
              </ul>
            </div>
            
            <button className="btn-primary" onClick={()=>setStep(1)} style={{ marginTop:24, width:'100%', height:50, fontSize:16 }}>
              Begin Research Survey →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Section A – Farmer Profile ── */}
      {step===1 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="👨‍🌾" title="Section A: Farmer Profile" subtitle="Primary demographics and farm details" />

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num="—" text="Enumerator Name (Interviewer)" />
            <input className="form-input" placeholder="Your name" value={form.enumeratorName} onChange={e=>set('enumeratorName',e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num="—" text="Farmer Name" required error={showErrors && errors.farmerName} />
            <input className={`form-input ${showErrors && errors.farmerName ? 'error' : ''}`} 
              style={showErrors && errors.farmerName ? {borderColor:'#fca5a5', background:'#fff5f5'} : {}}
              placeholder="Full name of farmer" value={form.farmerName} onChange={e=>set('farmerName',e.target.value)} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            <div className="form-group">
              <QLabel num="—" text="Taluk" required error={showErrors && errors.taluk} />
              <select className="form-select" style={showErrors && errors.taluk ? {borderColor:'#fca5a5'} : {}}
                value={form.taluk} onChange={e=>set('taluk',e.target.value)}>
                <option value="">Select Taluk</option>
                <option value="Tumkur Rural">Tumkur Rural</option>
                <option value="Gubbi">Gubbi</option>
                <option value="Tiptur">Tiptur</option>
                <option value="Kunigal">Kunigal</option>
              </select>
            </div>
            <div className="form-group">
              <QLabel num="—" text="Village" required error={showErrors && errors.village} />
              <input className="form-input" style={showErrors && errors.village ? {borderColor:'#fca5a5'} : {}}
                placeholder="Village name" value={form.village} onChange={e=>set('village',e.target.value)} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom:24 }}>
            <QLabel num="—" text="Farmer Photo" required error={showErrors && errors.photo} />
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={handlePhoto} />
            
            {photoPreview ? (
              <div style={{ position:'relative', textAlign:'center' }}>
                <img src={photoPreview} alt="Farmer" style={{ width:'100%', maxHeight:250, objectFit:'cover', borderRadius:16, border:'3px solid #1a6b3c' }} />
                <button onClick={()=>{setPhotoPreview(null);set('photo','');if(fileRef.current)fileRef.current.value=''}}
                  style={{ position:'absolute',top:10,right:10,width:32,height:32,borderRadius:'50%',background:'rgba(220,38,38,0.9)',color:'#fff',border:'none',cursor:'pointer',fontSize:16,fontWeight:800 }}>✕</button>
              </div>
            ) : (
              <div className="tap" onClick={()=>fileRef.current?.click()}
                style={{
                  width:'100%', padding:'40px 20px', border:`2px dashed ${showErrors && errors.photo ? '#fca5a5' : '#1a6b3c'}`, borderRadius:16,
                  background: showErrors && errors.photo ? '#fff5f5' : '#f0faf4', cursor:'pointer', display:'flex', flexDirection:'column',
                  alignItems:'center', gap:10
                }}>
                <div style={{ fontSize:32 }}>📸</div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:15, color:'#1a6b3c', fontWeight:700 }}>Click to Capture Farmer Photo</div>
                  <div style={{ fontSize:11, color: '#9ca3af', marginTop:4 }}>Resolution will be optimized automatically</div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num={1} text="Gender" required error={showErrors && errors.q1_gender} />
            <Radio options={['Male','Female','Other']} value={form.q1_gender} onChange={v=>set('q1_gender',v)} error={showErrors && errors.q1_gender} />
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num={2} text="Age Group" required error={showErrors && errors.q2_ageGroup} />
            <Radio options={['Below 25 years', '25–35 years', '36–45 years', '46–55 years', 'Above 55 years']} 
              value={form.q2_ageGroup} onChange={v=>set('q2_ageGroup',v)} error={showErrors && errors.q2_ageGroup} />
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num={3} text="Education Level" required error={showErrors && errors.q3_education} />
            <Radio options={['No formal education', 'Primary school', 'High school', 'PU/Diploma', 'Graduate and above']} 
              value={form.q3_education} onChange={v=>set('q3_education',v)} error={showErrors && errors.q3_education} />
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num={4} text="Size of Agricultural Land" required error={showErrors && errors.q4_landSize} />
            <Radio options={['Less than 2 acres', '2–5 acres', '6–10 acres', 'More than 10 acres']} 
              value={form.q4_landSize} onChange={v=>set('q4_landSize',v)} error={showErrors && errors.q4_landSize} />
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num={5} text="Main Crop Grown" required error={showErrors && errors.q5_mainCrop} />
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {['Paddy','Ragi','Maize','Coconut','Areca','Vegetables','Pulses','Others'].map(c=>(
                <div key={c} className="tap" onClick={()=>set('q5_mainCrop',c)}
                  style={{
                    padding:'8px 16px', borderRadius:20, fontSize:13, fontWeight:700, cursor:'pointer',
                    background:form.q5_mainCrop===c?'#1a6b3c': showErrors && errors.q5_mainCrop ? '#fff5f5' : '#f0faf4',
                    color:form.q5_mainCrop===c?'#fff':'#374151',
                    border:`2px solid ${form.q5_mainCrop===c?'#1a6b3c': showErrors && errors.q5_mainCrop ? '#fca5a5' : '#d1fae5'}`,
                  }}>
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <QLabel num={6} text="Farming Experience" required error={showErrors && errors.q6_farmingExp} />
            <Radio options={['Less than 5 years', '5–10 years', '11–20 years', 'More than 20 years']} 
              value={form.q6_farmingExp} onChange={v=>set('q6_farmingExp',v)} error={showErrors && errors.q6_farmingExp} />
          </div>
        </div>
      )}

      {/* ── STEP 2: Section B – Awareness ── */}
      {step===2 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="💡" title="Section B: Awareness About Soil Testing" subtitle="Objective 1: Rate from 1 (Strongly Disagree) to 5 (Strongly Agree)" />
          
          <LikertRow num={7}  statement="I am aware of soil testing services available for farmers." value={form.q7_awareServices} onChange={v=>set('q7_awareServices',v)} error={showErrors && errors.q7_awareServices} />
          <LikertRow num={8}  statement="I understand that soil testing helps improve crop productivity." value={form.q8_understandsBenefit} onChange={v=>set('q8_understandsBenefit',v)} error={showErrors && errors.q8_understandsBenefit} />
          <LikertRow num={9}  statement="I know that excess fertilizer usage can damage soil health." value={form.q9_knowsExcessDamage} onChange={v=>set('q9_knowsExcessDamage',v)} error={showErrors && errors.q9_knowsExcessDamage} />
          <LikertRow num={10} statement="I know how to get a soil test done." value={form.q10_knowsHowToTest} onChange={v=>set('q10_knowsHowToTest',v)} error={showErrors && errors.q10_knowsHowToTest} />
          <LikertRow num={11} statement="Soil testing helps reduce unnecessary fertilizer usage." value={form.q11_reducesFertilizer} onChange={v=>set('q11_reducesFertilizer',v)} error={showErrors && errors.q11_reducesFertilizer} />
          <LikertRow num={12} statement="Information regarding soil testing is easily available to farmers." value={form.q12_infoAvailable} onChange={v=>set('q12_infoAvailable',v)} error={showErrors && errors.q12_infoAvailable} />
        </div>
      )}

      {/* ── STEP 3: Section C – Accessibility ── */}
      {step===3 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="🗺️" title="Section C: Accessibility" subtitle="Objective 2: Identifying accessibility barriers" />
          
          <LikertRow num={13} statement="Soil testing centers are easily accessible from my village." value={form.q13_easyAccess} onChange={v=>set('q13_easyAccess',v)} error={showErrors && errors.q13_easyAccess} />
          <LikertRow num={14} statement="The process of soil testing is convenient for farmers." value={form.q14_convenientProcess} onChange={v=>set('q14_convenientProcess',v)} error={showErrors && errors.q14_convenientProcess} />
          <LikertRow num={15} statement="The time taken to receive soil testing results is reasonable." value={form.q15_reasonableTime} onChange={v=>set('q15_reasonableTime',v)} error={showErrors && errors.q15_reasonableTime} />
          <LikertRow num={16} statement="The cost involved in soil testing is affordable." value={form.q16_affordable} onChange={v=>set('q16_affordable',v)} error={showErrors && errors.q16_affordable} />
          <LikertRow num={17} statement="Lack of nearby facilities discourages farmers from testing soil." value={form.q17_lacksDiscourages} onChange={v=>set('q17_lacksDiscourages',v)} error={showErrors && errors.q17_lacksDiscourages} />
          
          <div className="form-group" style={{ marginTop:20 }}>
            <QLabel num={18} text="Are soil testing facilities sufficiently available near your area?" required error={showErrors && errors.q18_facilitiesAvailable} />
            <Radio options={['Yes','No']} value={form.q18_facilitiesAvailable} onChange={v=>set('q18_facilitiesAvailable',v)} error={showErrors && errors.q18_facilitiesAvailable} />
          </div>
        </div>
      )}

      {/* ── STEP 4: Section D – Adoption ── */}
      {step===4 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="🌱" title="Section D: Adoption" subtitle="Objective 3: Extent of adoption of soil testing" />

          <div className="form-group" style={{ marginBottom:24 }}>
            <QLabel num={19} text="Have you ever conducted soil testing for your land?" required error={showErrors && errors.q19_everTested} />
            <Radio options={['Yes','No']} value={form.q19_everTested} onChange={v=>set('q19_everTested',v)} error={showErrors && errors.q19_everTested} />
          </div>

          {form.q19_everTested==='Yes' && (
            <div className="form-group" style={{ marginBottom:24, padding:16, background:'#f9fff9', borderRadius:12, border:'1px solid #d1fae5' }}>
              <QLabel num={20} text="If yes, how often do you test your soil?" required error={showErrors && errors.q20_frequency} />
              <Radio options={['Every crop season', 'Once a year', 'Occasionally', 'Rarely']} 
                value={form.q20_frequency} onChange={v=>set('q20_frequency',v)} error={showErrors && errors.q20_frequency} />
            </div>
          )}

          {form.q19_everTested==='No' && (
            <div className="form-group" style={{ marginBottom:24, padding:16, background:'#fff9f9', borderRadius:12, border:'1px solid #fecaca' }}>
              <QLabel num={21} text="What is the main reason for not conducting soil testing regularly?" required error={showErrors && errors.q21_reasonNoTest} />
              <Radio options={['Lack of awareness', 'No nearby testing center', 'Time consuming process', 'Cost involved', 'Do not feel it is necessary', 'Lack of guidance', 'Other']}
                value={form.q21_reasonNoTest} onChange={v=>set('q21_reasonNoTest',v)} error={showErrors && errors.q21_reasonNoTest} />
            </div>
          )}

          <div className="form-group" style={{ marginBottom:24 }}>
            <QLabel num={22} text="Have you received any training or awareness regarding soil testing?" required error={showErrors && errors.q22_receivedTraining} />
            <Radio options={['Yes','No']} value={form.q22_receivedTraining} onChange={v=>set('q22_receivedTraining',v)} error={showErrors && errors.q22_receivedTraining} />
          </div>

          <div className="form-group">
            <QLabel num={23} text="Would you use soil testing services more often if they were easily accessible?" required error={showErrors && errors.q23_useMoreIfAccessible} />
            <Radio options={['Yes','No']} value={form.q23_useMoreIfAccessible} onChange={v=>set('q23_useMoreIfAccessible',v)} error={showErrors && errors.q23_useMoreIfAccessible} />
          </div>
        </div>
      )}

      {/* ── STEP 5: Section E – Fertilizer ── */}
      {step===5 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="⚖️" title="Section E: Fertilizer Usage & Misuse" subtitle="Objective 4: Assessing fertilizer practices" />

          <div className="form-group" style={{ marginBottom:24 }}>
            <QLabel num={24} text="How do you currently decide the amount of fertilizer to use?" required error={showErrors && errors.q24_fertDecision} />
            <Radio options={['Based on experience', 'Advice from fertilizer shop', 'Advice from agriculture officer', 'Based on soil test report', 'Advice from other farmers']}
              value={form.q24_fertDecision} onChange={v=>set('q24_fertDecision',v)} error={showErrors && errors.q24_fertDecision} />
          </div>

          <div className="form-group" style={{ marginBottom:24 }}>
            <QLabel num={25} text="Have you ever felt that excess fertilizer usage increased your crop yield?" required error={showErrors && errors.q25_excessYield} />
            <Radio options={['Yes','No','Not sure']} value={form.q25_excessYield} onChange={v=>set('q25_excessYield',v)} error={showErrors && errors.q25_excessYield} />
          </div>

          <div className="form-group">
            <QLabel num={26} text="In your opinion, which factor most affects fertilizer usage?" required error={showErrors && errors.q26_mainFactor} />
            <Radio options={['Soil condition', 'Water availability', 'Crop type', 'Advice from others', 'Market price of fertilizers']}
              value={form.q26_mainFactor} onChange={v=>set('q26_mainFactor',v)} error={showErrors && errors.q26_mainFactor} />
          </div>
        </div>
      )}

      {/* ── STEP 6: Section F – Perception ── */}
      {step===6 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="🧠" title="Section F: Perception & Attitude" subtitle="Objective 5: Final assessment and suggestions" />

          <div className="form-group" style={{ marginBottom:24 }}>
            <QLabel num={27} text="Do you believe soil testing is important before fertilizer application?" required error={showErrors && errors.q27_testingImportant} />
            <Radio options={['Yes','No']} value={form.q27_testingImportant} onChange={v=>set('q27_testingImportant',v)} error={showErrors && errors.q27_testingImportant} />
          </div>

          <LikertRow num={28} statement="Soil testing should be made available at village level." value={form.q28_villageLevel} onChange={v=>set('q28_villageLevel',v)} error={showErrors && errors.q28_villageLevel} />
          <LikertRow num={29} statement="Farmers would use soil testing more if results were provided quickly." value={form.q29_resultsQuickly} onChange={v=>set('q29_resultsQuickly',v)} error={showErrors && errors.q29_resultsQuickly} />
          <LikertRow num={30} statement="Better awareness programs can increase soil testing adoption." value={form.q30_awarenessPrograms} onChange={v=>set('q30_awarenessPrograms',v)} error={showErrors && errors.q30_awarenessPrograms} />

          {/* Submission Confirmation Card */}
          <div style={{ marginTop:32, padding:24, borderRadius:20, background:'linear-gradient(135deg, #fdfbf7, #f5f0e6)', border:'2px solid #1a6b3c', textAlign:'center' }}>
            <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
            <h3 style={{ fontFamily:"'Crimson Pro',serif", color:'#1a6b3c', fontSize:20, marginBottom:8 }}>Ready to Submit?</h3>
            <p style={{ fontSize:13, color:'#5d4037', marginBottom:0 }}>
              Please review your answers before submitting. Thank you for participating in this research study by SIT Tumakuru MBA.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display:'flex', gap:12, marginTop:24, marginBottom:40 }}>
        {step > 0 && (
          <button className="btn-outline" onClick={()=>setStep(p=>p-1)} style={{ flex:1, height:50, fontSize:15 }}>← Previous</button>
        )}
        
        {step < STEPS.length - 1 ? (
          <button className="btn-primary" onClick={handleNext} disabled={showErrors && !canProceed}
            style={{ flex:2, height:50, fontSize:15, opacity: (showErrors && !canProceed) ? 0.6 : 1 }}>
            {(showErrors && !canProceed) ? 'Complete Section First' : 'Next Section →'}
          </button>
        ) : (
          <button className="btn-primary" onClick={()=>submit('Complete')} disabled={saving || (showErrors && !canProceed)} 
            style={{ flex:2, height:50, fontSize:16, background:'linear-gradient(135deg, #1a6b3c, #114d2a)', opacity: (showErrors && !canProceed) ? 0.6 : 1 }}>
            {saving ? '⏳ Submitting...' : '🚀 Final Submit Survey'}
          </button>
        )}
      </div>
    </div>
  )
}

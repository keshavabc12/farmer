import { useState, useRef } from 'react'
import { createFarmer } from '../api'
import { useToast } from '../context/ToastContext'

// ── Helpers ───────────────────────────────────────────────────
function Radio({ options, value, onChange, name }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:6 }}>
      {options.map(opt => (
        <label key={opt} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <div onClick={() => onChange(opt)} style={{
            width:18, height:18, borderRadius:'50%', border:`2px solid ${value===opt?'#1a6b3c':'#d1fae5'}`,
            background: value===opt?'#1a6b3c':'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, transition:'all 0.15s', cursor:'pointer'
          }}>
            {value===opt && <div style={{ width:7, height:7, borderRadius:'50%', background:'#fff' }} />}
          </div>
          <span style={{ fontSize:13, color:'#374151' }}>{opt}</span>
        </label>
      ))}
    </div>
  )
}

function LikertRow({ num, statement, value, onChange }) {
  return (
    <div style={{
      padding:'14px 0', borderBottom:'1px solid #f0faf4',
    }}>
      <div style={{ fontSize:12, color:'#374151', fontWeight:500, marginBottom:10, lineHeight:1.5 }}>
        <span style={{ color:'#1a6b3c', fontWeight:700 }}>Q{num}.</span> {statement}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {[
          { val:1, label:'Strongly\nDisagree' },
          { val:2, label:'Disagree' },
          { val:3, label:'Neutral' },
          { val:4, label:'Agree' },
          { val:5, label:'Strongly\nAgree' },
        ].map(({ val, label }) => (
          <div key={val} className="tap" onClick={() => onChange(val)}
            style={{
              flex:1, minWidth:52, padding:'8px 4px', borderRadius:10, textAlign:'center',
              border:`2px solid ${value===val?'#1a6b3c':'#d1fae5'}`,
              background: value===val?'#1a6b3c':'#f9fff9',
              cursor:'pointer', transition:'all 0.15s'
            }}>
            <div style={{ fontSize:16, fontWeight:700, color:value===val?'#fff':'#1a6b3c', lineHeight:1, marginBottom:3 }}>{val}</div>
            <div style={{ fontSize:9, color:value===val?'rgba(255,255,255,0.8)':'#9ca3af', lineHeight:1.2, whiteSpace:'pre-line' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, paddingBottom:14, borderBottom:'2px solid #f0faf4' }}>
      <div style={{ width:40, height:40, background:'#dcfce7', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, fontWeight:700, color:'#1a6b3c' }}>{title}</div>
        {subtitle && <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

function QLabel({ num, text }) {
  return (
    <label className="form-label" style={{ marginBottom:8, display:'block', fontSize:12, color:'#374151', fontWeight:600, lineHeight:1.5 }}>
      <span style={{ color:'#1a6b3c', fontWeight:700 }}>Q{num}.</span> {text}
    </label>
  )
}

// ── Initial state ─────────────────────────────────────────────
const INIT = {
  farmerName:'', taluk:'', village:'', photo:'', enumeratorName:'',
  gender:'', ageGroup:'', education:'', landSize:'', mainCrop:'', farmingExp:'',
  b8_awareServices:'', b9_understandsBenefit:'', b10_knowsExcessDamage:'',
  b11_knowsHowToTest:'', b12_reducesFertilizer:'', b13_infoAvailable:'',
  c14_easyAccess:'', c15_convenientProcess:'', c16_reasonableTime:'',
  c17_affordable:'', c19_lacksDiscourages:'',
  d20_everTested:'', d21_frequency:'', d22_reasonNoTest:'', d23_fertDecision:'',
  d24_excessYield:'', d25_mainFactor:'',
  e26_testingImportant:'', e27_receivedTraining:'', e28_facilitiesAvailable:'',
  status:'Draft',
}

const STEPS = [
  { label:'Intro',        icon:'📋' },
  { label:'Profile',      icon:'👨‍🌾' },
  { label:'Awareness',    icon:'💡' },
  { label:'Accessibility',icon:'🗺️' },
  { label:'Adoption',     icon:'🌱' },
  { label:'Dichotomous',  icon:'🧠' },
]

export default function NewSurvey({ setActive }) {
  const [form, setForm]   = useState(INIT)
  const [step, setStep]   = useState(0)
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileRef = useRef()
  const toast   = useToast()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast('Photo must be under 2 MB.', 'error'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result)
      set('photo', ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const submit = async (status='Complete') => {
    if (!form.farmerName || !form.taluk || !form.village) {
      toast('Please fill Farmer Name, Taluk and Village.', 'error'); setStep(1); return
    }
    
    setSaving(true)
    try {
      // ── Clean data: Remove empty strings so they don't fail Number/Enum validation ──
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
      toast(e.response?.data?.error || 'Failed to submit. Check required fields.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div>
      {/* Title */}
      <div className="fade-up" style={{ marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, fontWeight:700, color:'#1a6b3c', lineHeight:1.3 }}>
          Accessibility, Awareness, and Adoption: A Study on Soil Testing Gaps and Fertilizer Misuse in Rural Agriculture
        </h1>
        <p style={{ fontSize:11, color:'#9ca3af', marginTop:4 }}>Research Questionnaire · Tumkur District</p>
      </div>

      {/* Step bar */}
      <div className="card fade-up" style={{ marginBottom:16, padding:'14px 16px', animationDelay:'0.05s', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:4, minWidth:'max-content' }}>
          {STEPS.map((s, i) => (
            <div key={i} className="tap" onClick={() => setStep(i)}
              style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
              <div style={{
                width:28, height:28, borderRadius:'50%', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                background: i===step?'#1a6b3c': i<step?'#dcfce7':'#f0faf4',
                color: i===step?'#fff': i<step?'#1a6b3c':'#9ca3af',
                border:`2px solid ${i===step?'#1a6b3c': i<step?'#bbf7d0':'#e5e7eb'}`,
                transition:'all 0.2s'
              }}>
                {i<step?'✓':i+1}
              </div>
              <span style={{ fontSize:11, color:i===step?'#1a6b3c':'#9ca3af', fontWeight:i===step?700:400, whiteSpace:'nowrap' }}>
                {s.icon} {s.label}
              </span>
              {i < STEPS.length-1 && <div style={{ width:16, height:2, background:i<step?'#4ecb85':'#e5e7eb', borderRadius:2, margin:'0 4px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 0: Instructions & Introduction ── */}
      {step===0 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="📋" title="Enumerator Instructions" subtitle="For Interviewer Use Only" />
          <div style={{ fontSize:13, color:'#374151', lineHeight:1.6 }}>
            <ul style={{ paddingLeft:20, marginBottom:20 }}>
              <li>Introduce yourself politely.</li>
              <li>Explain that the survey is only for <strong>academic research</strong>.</li>
              <li>Assure respondents that their responses will remain <strong>confidential</strong>.</li>
              <li>Do not influence answers.</li>
              <li>Read questions slowly in the local language if needed.</li>
              <li>Mark responses exactly as given.</li>
              <li>Avoid suggesting answers.</li>
              <li>Use neutral tone and body language.</li>
            </ul>

            <div style={{ background:'#f0faf4', padding:16, borderRadius:12, border:'1px solid #d1fae5' }}>
              <div style={{ fontWeight:700, color:'#1a6b3c', marginBottom:8, fontSize:12, textTransform:'uppercase', letterSpacing:1 }}>
                Introduction to Respondent
              </div>
              <p style={{ fontStyle:'italic', color:'#1a6b3c', margin:0 }}>
                “Namaskara. I am conducting an academic study regarding soil testing practices and fertilizer usage among farmers. 
                Your responses will help understand the practical challenges faced by farmers. 
                The information provided by you will be used only for educational purposes and will remain confidential.”
              </p>
            </div>
            
            <button className="btn-primary" onClick={()=>setStep(1)} style={{ marginTop:24, width:'100%' }}>
              Start Interview →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Section A – Farmer Profile ── */}
      {step===1 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="👨‍🌾" title="Section A: Farmer Profile" subtitle="Basic identification details" />

          {/* Enumerator */}
          <div className="form-group" style={{ marginBottom:14 }}>
            <label className="form-label">Enumerator Name (Interviewer)</label>
            <input className="form-input" placeholder="Your name" value={form.enumeratorName} onChange={e=>set('enumeratorName',e.target.value)} />
          </div>

          <div style={{ height:1, background:'#f0faf4', margin:'4px 0 16px' }} />

          {/* Farmer name */}
          <div className="form-group" style={{ marginBottom:14 }}>
            <QLabel num="—" text="Farmer Name *" />
            <input className="form-input" placeholder="Full name of farmer" value={form.farmerName} onChange={e=>set('farmerName',e.target.value)} />
          </div>

          {/* Taluk */}
          <div className="form-group" style={{ marginBottom:14 }}>
            <QLabel num="—" text="Taluk *" />
            <div style={{ display:'flex', gap:10 }}>
              {['Tumkur Rural','Gubbi'].map(t=>(
                <div key={t} className="tap" onClick={()=>set('taluk',t)}
                  style={{
                    flex:1, padding:'11px', borderRadius:10, textAlign:'center',
                    fontSize:13, fontWeight:600, cursor:'pointer',
                    background:form.taluk===t?'#1a6b3c':'#f0faf4',
                    color:form.taluk===t?'#fff':'#374151',
                    border:`2px solid ${form.taluk===t?'#1a6b3c':'#d1fae5'}`,
                    transition:'all 0.15s'
                  }}>
                  📍 {t}
                </div>
              ))}
            </div>
          </div>

          {/* Village */}
          <div className="form-group" style={{ marginBottom:14 }}>
            <QLabel num="—" text="Village Name *" />
            <input className="form-input" placeholder="e.g. Hirehalli" value={form.village} onChange={e=>set('village',e.target.value)} />
          </div>

          {/* Photo upload */}
          <div className="form-group" style={{ marginBottom:18 }}>
            <QLabel num="—" text="Farmer Photo *" />
            <input 
              ref={fileRef} 
              type="file" 
              accept="image/*" 
              capture="environment" 
              style={{ display:'none' }} 
              onChange={handlePhoto} 
            />
            
            {photoPreview ? (
              <div style={{ position:'relative', display:'flex', justifyContent:'center' }}>
                <div style={{ position:'relative' }}>
                  <img src={photoPreview} alt="Farmer" style={{ width:120, height:120, objectFit:'cover', borderRadius:20, border:'3px solid #1a6b3c', boxShadow:'0 8px 20px rgba(26,107,60,0.2)' }} />
                  <button onClick={()=>{setPhotoPreview(null);set('photo','');if(fileRef.current)fileRef.current.value=''}}
                    style={{ position:'absolute',top:-8,right:-8,width:28,height:28,borderRadius:'50%',background:'#dc2626',border:'2px solid #fff',color:'#fff',cursor:'pointer',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 10px rgba(0,0,0,0.2)' }}>✕</button>
                </div>
              </div>
            ) : (
              <div className="tap" onClick={()=>fileRef.current?.click()}
                style={{
                  width:'100%', padding:'30px 20px', border:'2px dashed #1a6b3c', borderRadius:16,
                  background:'#f0faf4', cursor:'pointer', display:'flex', flexDirection:'column',
                  alignItems:'center', gap:10, transition:'all 0.2s'
                }}>
                <div style={{ width:50, height:50, borderRadius:'50%', background:'#fff', border:'1px solid #d1fae5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>
                  📷
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:14, color:'#1a6b3c', fontWeight:700 }}>Click to Capture Photo</div>
                  <div style={{ fontSize:11, color: '#9ca3af', marginTop:2 }}>Uses camera on mobile or file upload on PC</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ height:1, background:'#f0faf4', margin:'4px 0 16px' }} />

          {/* Q1 – Gender */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <QLabel num={1} text="Gender" />
            <Radio options={['Male','Female','Other']} value={form.gender} onChange={v=>set('gender',v)} />
          </div>

          {/* Q2 – Age */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <QLabel num={2} text="Age Group" />
            <Radio options={['Below 25','25-35','36-45','46-55','Above 55']} value={form.ageGroup} onChange={v=>set('ageGroup',v)} />
          </div>

          {/* Q3 – Education */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <QLabel num={3} text="Education Level" />
            <Radio options={['No formal education','Primary school','High school','PU/Diploma','Graduate and above']} value={form.education} onChange={v=>set('education',v)} />
          </div>

          {/* Q5 – Land size */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <QLabel num={5} text="Size of Agricultural Land" />
            <Radio options={['Less than 2 acres','2-5 acres','6-10 acres','More than 10 acres']} value={form.landSize} onChange={v=>set('landSize',v)} />
          </div>

          {/* Q6 – Main crop */}
          <div className="form-group" style={{ marginBottom:16 }}>
            <QLabel num={6} text="Main Crop Grown" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
              {['Paddy','Ragi','Maize','Coconut','Areca','Vegetables','Pulses','Others'].map(c=>(
                <div key={c} className="tap" onClick={()=>set('mainCrop',c)}
                  style={{
                    padding:'7px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
                    background:form.mainCrop===c?'#1a6b3c':'#f0faf4',
                    color:form.mainCrop===c?'#fff':'#374151',
                    border:`1.5px solid ${form.mainCrop===c?'#1a6b3c':'#d1fae5'}`,
                    transition:'all 0.15s'
                  }}>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Q7 – Experience */}
          <div className="form-group">
            <QLabel num={7} text="Farming Experience" />
            <Radio options={['Less than 5 years','5-10 years','11-20 years','More than 20 years']} value={form.farmingExp} onChange={v=>set('farmingExp',v)} />
          </div>
        </div>
      )}

      {/* ── STEP 2: Section B – Awareness ── */}
      {step===2 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="💡" title="Section B: Awareness About Soil Testing" subtitle="Rate each statement: 1=Strongly Disagree to 5=Strongly Agree" />
          <div style={{ background:'#f0faf4', borderRadius:10, padding:'10px 14px', marginBottom:18, fontSize:11, color:'#1a6b3c' }}>
            📊 <strong>Scale:</strong> 1 = Strongly Disagree &nbsp;·&nbsp; 2 = Disagree &nbsp;·&nbsp; 3 = Neutral &nbsp;·&nbsp; 4 = Agree &nbsp;·&nbsp; 5 = Strongly Agree
          </div>
          <LikertRow num={8}  statement="I am aware of soil testing services available for farmers."                    value={form.b8_awareServices}      onChange={v=>set('b8_awareServices',v)} />
          <LikertRow num={9}  statement="I understand that soil testing helps improve crop productivity."              value={form.b9_understandsBenefit} onChange={v=>set('b9_understandsBenefit',v)} />
          <LikertRow num={10} statement="I know that excess fertilizer usage can damage soil health."                  value={form.b10_knowsExcessDamage} onChange={v=>set('b10_knowsExcessDamage',v)} />
          <LikertRow num={11} statement="I know how to get a soil test done."                                          value={form.b11_knowsHowToTest}    onChange={v=>set('b11_knowsHowToTest',v)} />
          <LikertRow num={12} statement="Soil testing helps reduce unnecessary fertilizer usage."                      value={form.b12_reducesFertilizer} onChange={v=>set('b12_reducesFertilizer',v)} />
          <LikertRow num={13} statement="Information regarding soil testing is easily available to farmers."           value={form.b13_infoAvailable}     onChange={v=>set('b13_infoAvailable',v)} />
        </div>
      )}

      {/* ── STEP 3: Section C – Accessibility ── */}
      {step===3 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="🗺️" title="Section C: Accessibility of Soil Testing Services" subtitle="Rate each statement: 1=Strongly Disagree to 5=Strongly Agree" />
          <div style={{ background:'#f0faf4', borderRadius:10, padding:'10px 14px', marginBottom:18, fontSize:11, color:'#1a6b3c' }}>
            📊 <strong>Scale:</strong> 1 = Strongly Disagree &nbsp;·&nbsp; 2 = Disagree &nbsp;·&nbsp; 3 = Neutral &nbsp;·&nbsp; 4 = Agree &nbsp;·&nbsp; 5 = Strongly Agree
          </div>
          <LikertRow num={14} statement="Soil testing centers are easily accessible from my village."                  value={form.c14_easyAccess}        onChange={v=>set('c14_easyAccess',v)} />
          <LikertRow num={15} statement="The process of soil testing is convenient for farmers."                       value={form.c15_convenientProcess} onChange={v=>set('c15_convenientProcess',v)} />
          <LikertRow num={16} statement="The time taken to receive soil testing results is reasonable."                value={form.c16_reasonableTime}    onChange={v=>set('c16_reasonableTime',v)} />
          <LikertRow num={17} statement="The cost involved in soil testing is affordable."                             value={form.c17_affordable}        onChange={v=>set('c17_affordable',v)} />
          <LikertRow num={19} statement="Lack of nearby facilities discourages farmers from testing soil."            value={form.c19_lacksDiscourages}  onChange={v=>set('c19_lacksDiscourages',v)} />
        </div>
      )}

      {/* ── STEP 4: Section D – Adoption ── */}
      {step===4 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="🌱" title="Section D: Adoption and Farming Practices" subtitle="Select the most appropriate answer" />

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num={20} text="Have you ever conducted soil testing for your land?" />
            <Radio options={['Yes','No']} value={form.d20_everTested} onChange={v=>set('d20_everTested',v)} />
          </div>

          {form.d20_everTested==='Yes' && (
            <div className="form-group" style={{ marginBottom:20 }}>
              <QLabel num={21} text="If yes, how often do you test your soil?" />
              <Radio options={['Every crop season','Once a year','Occasionally','Rarely']} value={form.d21_frequency} onChange={v=>set('d21_frequency',v)} />
            </div>
          )}

          {(form.d20_everTested==='No' || form.d20_everTested==='') && (
            <div className="form-group" style={{ marginBottom:20 }}>
              <QLabel num={22} text="What is the main reason for not conducting soil testing regularly?" />
              <Radio options={['Lack of awareness','No nearby testing center','Time consuming process','Cost involved','Do not feel it is necessary','Lack of guidance','Other']}
                value={form.d22_reasonNoTest} onChange={v=>set('d22_reasonNoTest',v)} />
            </div>
          )}

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num={23} text="How do you currently decide the amount of fertilizer to use?" />
            <Radio options={['Based on experience','Advice from fertilizer shop','Advice from agriculture officer','Based on soil test report','Advice from other farmers']}
              value={form.d23_fertDecision} onChange={v=>set('d23_fertDecision',v)} />
          </div>

          <div className="form-group" style={{ marginBottom:20 }}>
            <QLabel num={24} text="Have you ever felt that excess fertilizer usage increased your crop yield?" />
            <Radio options={['Yes','No','Not sure']} value={form.d24_excessYield} onChange={v=>set('d24_excessYield',v)} />
          </div>

          <div className="form-group">
            <QLabel num={25} text="In your opinion, which factor most affects fertilizer usage?" />
            <Radio options={['Soil condition','Water availability','Crop type','Advice from others','Market price of fertilizers']}
              value={form.d25_mainFactor} onChange={v=>set('d25_mainFactor',v)} />
          </div>
        </div>
      )}

      {/* ── STEP 5: Section E – Dichotomous ── */}
      {step===5 && (
        <div className="card fade-up" style={{ animationDelay:'0.1s' }}>
          <SectionHeader icon="🧠" title="Section E: Dichotomous Questions" subtitle="Yes / No answers" />

          <div className="form-group" style={{ marginBottom:22 }}>
            <QLabel num={26} text="Do you believe soil testing is important before fertilizer application?" />
            <Radio options={['Yes','No']} value={form.e26_testingImportant} onChange={v=>set('e26_testingImportant',v)} />
          </div>

          <div className="form-group" style={{ marginBottom:22 }}>
            <QLabel num={27} text="Have you received any training or awareness regarding soil testing?" />
            <Radio options={['Yes','No']} value={form.e27_receivedTraining} onChange={v=>set('e27_receivedTraining',v)} />
          </div>

          <div className="form-group">
            <QLabel num={28} text="Are soil testing facilities sufficiently available near your area?" />
            <Radio options={['Yes','No']} value={form.e28_facilitiesAvailable} onChange={v=>set('e28_facilitiesAvailable',v)} />
          </div>

          {/* Summary before submit */}
          <div style={{ marginTop:24, background:'#f0faf4', borderRadius:14, padding:'16px', border:'1.5px solid #d1fae5' }}>
            <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:16, fontWeight:700, color:'#1a6b3c', marginBottom:10 }}>
              📋 Survey Summary
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12 }}>
              <div><span style={{ color:'#9ca3af' }}>Farmer:</span> <strong>{form.farmerName||'—'}</strong></div>
              <div><span style={{ color:'#9ca3af' }}>Taluk:</span> <strong>{form.taluk||'—'}</strong></div>
              <div><span style={{ color:'#9ca3af' }}>Village:</span> <strong>{form.village||'—'}</strong></div>
              <div><span style={{ color:'#9ca3af' }}>Crop:</span> <strong>{form.mainCrop||'—'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display:'flex', gap:10, marginTop:16 }}>
        {step>0 && (
          <button className="btn-outline" onClick={()=>setStep(p=>p-1)} style={{ flex:1 }}>← Back</button>
        )}
        {step < STEPS.length-1 ? (
          <button className="btn-primary" onClick={()=>setStep(p=>p+1)} style={{ flex:2 }}>Next →</button>
        ) : (
          <>
            <button className="btn-outline" onClick={()=>submit('Draft')} disabled={saving} style={{ flex:1 }}>💾 Save Draft</button>
            <button className="btn-primary" onClick={()=>submit('Complete')} disabled={saving} style={{ flex:2 }}>
              {saving ? '⏳ Saving…' : '✅ Submit Survey'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

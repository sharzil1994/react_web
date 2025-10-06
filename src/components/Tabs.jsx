import React, { useState } from 'react'

/** Simple Tabs component you can reuse anywhere */
export default function Tabs({ tabs = [] }){
  const [active, setActive] = useState(0)
  return (
    <div>
      <div style={{display:'flex', gap:8, marginBottom:12, flexWrap:'wrap'}}>
        {tabs.map((t, i) => (
          <button key={i}
            onClick={()=>setActive(i)}
            className={'btn' + (i===active ? ' primary' : '')}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="card">
        {tabs[active]?.content}
      </div>
    </div>
  )
}

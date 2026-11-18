import React, { useEffect, useState } from "react";
import { Search, BrainCircuit, BookOpen, Users, FlaskConical, FolderKanban, Network, ArrowUpRight, Sparkles, Send, Database, GraduationCap, Menu } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const examples = ["Who works on Artificial Intelligence?","Show publications by Dr. Ananya Raman","Which projects are related to IoT?","What facilities are available for robotics research?"];
const plural = { faculty:"Faculty", departments:"Departments", researchAreas:"Research areas", publications:"Publications", projects:"Projects", facilities:"Facilities" };

function App(){
 const [stats,setStats]=useState({}); const [question,setQuestion]=useState(""); const [answer,setAnswer]=useState(null);
 const [search,setSearch]=useState(""); const [searchResults,setSearchResults]=useState([]); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
 const [active,setActive]=useState("Overview"); const [knowledge,setKnowledge]=useState(null);
 useEffect(()=>{fetch(`${API}/stats`).then(r=>r.json()).then(setStats).catch(()=>setError("Backend is not connected. Start the backend server and refresh.")); fetch(`${API}/knowledge`).then(r=>r.json()).then(setKnowledge).catch(()=>{});},[]);
 async function ask(q=question){ if(!q.trim())return; setQuestion(q);setLoading(true);setError("");try{const r=await fetch(`${API}/query`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Request failed");setAnswer(data);}catch(e){setError(e.message);}finally{setLoading(false);}}
 async function doSearch(e){e?.preventDefault();if(!search.trim())return;try{const r=await fetch(`${API}/search?q=${encodeURIComponent(search)}`);const d=await r.json();setSearchResults(d.results||[]);setActive("Explore");}catch{setError("Unable to search. Check the backend connection.");}}
 const nav=[["Overview",Database],["Ask Knowledge Hub",Sparkles],["Explore",Network]];
 const statItems=[["Faculty members",stats.faculty,Users],["Publications",stats.publications,BookOpen],["Research projects",stats.projects,FolderKanban],["Research facilities",stats.facilities,FlaskConical]];
 return <div className="app-shell">
  <aside className="sidebar"><div className="brand"><div className="brand-icon"><BrainCircuit size={23}/></div><div><b>Research<span>Hub</span></b><small>UNIVERSITY KNOWLEDGE</small></div></div>
   <div className="side-label">WORKSPACE</div>{nav.map(([name,Icon])=><button key={name} className={`nav-item ${active===name?"selected":""}`} onClick={()=>setActive(name)}><Icon size={18}/>{name}</button>)}
   <div className="side-bottom"><div className="side-card"><div className="tiny-icon"><GraduationCap size={18}/></div><b>Knowledge, connected.</b><p>Discover expertise and research across the university.</p></div><small>KNOWLEDGE ENGINEERING DEMO · v1.0</small></div>
  </aside>
  <main className="main"><header className="topbar"><div className="mobile-brand"><BrainCircuit/> ResearchHub</div><div className="crumb">University / <b>{active}</b></div><div className="top-right"><span className="live-dot"></span> Demo knowledge base <div className="avatar">U</div></div></header>
   <div className="content">
    <section className="welcome"><div><div className="eyebrow"><Sparkles size={14}/> KNOWLEDGE ENGINEERING PLATFORM</div><h1>University Research<br/><span>Knowledge Hub</span></h1><p>One intelligent space to discover faculty expertise, research publications, projects, and facilities.</p></div><div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="core"><BrainCircuit size={42}/></div><div className="node n1"><Users/></div><div className="node n2"><BookOpen/></div><div className="node n3"><FlaskConical/></div><div className="node n4"><Network/></div></div></section>
    {error&&<div className="error">{error}</div>}
    <section className="stats-grid">{statItems.map(([label,value,Icon])=><div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><Icon size={18}/></div><strong>{value??"—"}</strong><small>In sample knowledge base</small></div>)}</section>
    <section className="ask-panel"><div className="section-head"><div><div className="eyebrow">ASK IN NATURAL LANGUAGE</div><h2>What would you like to know?</h2><p>Ask a question and explore connected university knowledge.</p></div><div className="ai-chip"><Sparkles size={15}/> Knowledge assistant</div></div>
     <form className="ask-box" onSubmit={e=>{e.preventDefault();ask();}}><Search size={20}/><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="e.g. Who specializes in Artificial Intelligence?"/><button disabled={loading}>{loading?"Thinking...":<>Ask <Send size={15}/></>}</button></form>
     <div className="suggestions"><span>TRY ASKING</span>{examples.map(x=><button key={x} onClick={()=>ask(x)}>{x}<ArrowUpRight size={13}/></button>)}</div>
    </section>
    {answer&&<section className="results-panel"><div className="result-heading"><div><div className="eyebrow">KNOWLEDGE RESPONSE</div><h2>{answer.answer}</h2></div><span className="result-count">{answer.results?.length||0} matches</span></div>
      <div className="result-grid">{answer.results?.map((r,i)=><ResultCard key={r.id||i} item={r}/>)}</div>
      {answer.facultyProfiles?.map(f=><div className="profile-detail" key={f.id}><b>Connected profile: {f.name}</b><p>{f.bio}</p><div className="tag-row">{f.researchAreas?.map(a=><span key={a.id}>{a.name}</span>)}</div><small>{f.publications?.length} publication(s) · {f.projects?.length} project(s) · {f.facilities?.length} facility link(s)</small></div>)}
    </section>}
    {active==="Explore"&&<section className="explore-panel"><div className="section-head"><div><div className="eyebrow">KNOWLEDGE BASE</div><h2>Explore university records</h2><p>Search across all connected entity types.</p></div></div><form className="ask-box compact" onSubmit={doSearch}><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search AI, faculty, IoT, publications..."/><button>Search</button></form><div className="result-grid">{searchResults.map((r,i)=><ResultCard key={r.id||i} item={r}/>)}</div></section>}
    {active==="Overview"&&<section className="model-section"><div className="section-head"><div><div className="eyebrow">HOW IT IS ORGANIZED</div><h2>Explore the knowledge model</h2><p>Information is represented as entities connected through meaningful relationships.</p></div><span className="model-badge"><Network size={14}/> Ontology-inspired graph</span></div><div className="model-grid">{[["Faculty","BELONGS TO · SPECIALIZES IN","faculty",Users],["Publications","AUTHORED BY FACULTY","publications",BookOpen],["Projects","WORKS ON · RELATED TO","projects",FolderKanban],["Research facilities","SUPPORT RESEARCH AREAS","facilities",FlaskConical]].map(([title,rel,key,Icon])=><div className="model-card" key={key}><div className="model-icon"><Icon size={20}/></div><div><b>{title}</b><small>{rel}</small></div><span>{stats[key]??0}</span></div>)}</div><div className="relationship"><span>Faculty</span><i>→ belongs to →</i><span>Department</span><i>→ specializes in →</i><span>Research Area</span></div></section>}
    <footer>Built as a Knowledge Engineering academic demo <span>Structured knowledge · Semantic relationships · Rule-based query answering</span></footer>
   </div>
  </main>
 </div>
}
function ResultCard({item}){
 const type=item.type||"record"; const title=item.name||item.title||"Knowledge record";
 const desc=item.bio||item.description||item.venue||item.location||item.email||"Linked university knowledge record.";
 return <article className="result-card"><div className="card-top"><span className="type-pill">{type.replace(/([A-Z])/g," $1")}</span><span className="id-text">{item.id}</span></div><h3>{title}</h3><p>{desc}</p><div className="card-meta">{item.year&&<span>{item.year}</span>}{item.status&&<span>{item.status}</span>}{item.designation&&<span>{item.designation}</span>}{item.shortName&&<span>{item.shortName}</span>}</div></article>
}
export default App;

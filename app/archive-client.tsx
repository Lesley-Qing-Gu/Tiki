"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {initialEntries,assetSrc,type Entry} from "../lib/archive";

const aboutParagraphs = [
  "Diaspora East Cinema is an Amsterdam-based curatorial collective and exchange platform active across the Netherlands. We focus on Sinophone, Southeast Asian, and broader Asian images. Our practices include curated screenings, workshops, Q&As, film reviews, filmmaker interviews, and ongoing coverage of international film festivals.",
  "For us, “diaspora” carries two meanings. First, it refers to the independent films we present that exist outside mainstream systems; as they travel across borders, they navigate different regions, histories, and political realities. Our mission is to let them be seen.",
  "“Diaspora” also speaks to the communities we aim to connect. Our team is shaped by diverse migration paths, and our work is rooted in the lived experience of navigating complex cultural contexts in Europe. Beyond the screen, we envision Diaspora East Cinema as a space for gathering and reflection - a place where people find resonance through the moving image."
];
const sections = [["about","About us"],["news","News"],["past","Past events"],["contact","Contact"]];
const contactEmail = "Info@decinema.nl";

function Typewriter({text}:{text:string}) {
  const element=useRef<HTMLSpanElement>(null);
  const [count,setCount]=useState(text.length);
  useEffect(()=>{
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(motion.matches){setCount(text.length);return;}
    setCount(0);
    let frame=0,start:number|null=null;
    const duration=Math.min(2600,Math.max(500,text.length*7));
    const tick=(time:number)=>{
      if(start===null)start=time;
      const progress=Math.min(1,(time-start)/duration);
      setCount(Math.floor(progress*text.length));
      if(progress<1)frame=requestAnimationFrame(tick);
    };
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){observer.disconnect();frame=requestAnimationFrame(tick);}
    },{threshold:.1});
    if(element.current)observer.observe(element.current);
    const finish=()=>{if(motion.matches){cancelAnimationFrame(frame);observer.disconnect();setCount(text.length);}};
    motion.addEventListener("change",finish);
    return()=>{observer.disconnect();cancelAnimationFrame(frame);motion.removeEventListener("change",finish);};
  },[text]);
  return <span ref={element} className="typewriter"><span className="typewriter-reserve" aria-hidden="true">{text}</span><span className="sr-only">{text}</span><span className="typewriter-ink" aria-hidden="true">{text.slice(0,count)}</span></span>;
}

export default function Archive() {
  const [published,setPublished]=useState<Entry[]>(initialEntries);
  const [detail,setDetail]=useState<string|null>(null);
  const [adminRequested,setAdminRequested]=useState(false);
  const [active,setActive]=useState("home");
  const [logoReady,setLogoReady]=useState(false);
  const [headerVisible,setHeaderVisible]=useState(false);
  const [logoFinished,setLogoFinished]=useState(false);
  const [videoFailed,setVideoFailed]=useState(false);
  const [email,setEmail]=useState("");
  const [mailStatus,setMailStatus]=useState("");
  const [error,setError]=useState("");
  const videoRef=useRef<HTMLVideoElement>(null);
  const scrollFrame=useRef(0);
  const enteringAbout=useRef(false);
  const heroRef=useRef<HTMLElement>(null);
  const aboutRef=useRef<HTMLElement>(null);
  const photoRef=useRef<HTMLElement>(null);
  const liveEntries=useRef(published);liveEntries.current=published;

  useEffect(()=>{
    const cancel=()=>{cancelAnimationFrame(scrollFrame.current);enteringAbout.current=false;};
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey||event.deltaY===0)return;
      const hero=heroRef.current;
      if(event.deltaY>0&&(enteringAbout.current||(!detail&&!adminRequested&&hero&&hero.getBoundingClientRect().bottom>0))){
        event.preventDefault();
        if(!enteringAbout.current)enterAbout();
        return;
      }
      cancel();
    };
    window.addEventListener("wheel",wheel,{passive:false});
    window.addEventListener("touchstart",cancel,{passive:true});
    window.addEventListener("keydown",cancel);
    return()=>{cancel();window.removeEventListener("wheel",wheel);window.removeEventListener("touchstart",cancel);window.removeEventListener("keydown",cancel);};
  },[detail,adminRequested]);

  useEffect(()=>{
    if(!logoReady)return;
    const timer=window.setTimeout(()=>setLogoFinished(true),4530);
    return()=>window.clearTimeout(timer);
  },[logoReady]);

  useEffect(()=>{
    if(adminRequested){setHeaderVisible(false);return;}
    if(detail){setHeaderVisible(true);return;}
    const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    const update=()=>{
      frame=0;
      const hero=heroRef.current,about=aboutRef.current,photo=photoRef.current;
      setHeaderVisible(Boolean(about&&about.getBoundingClientRect().top<=100));
      if(hero){
        const progress=Math.max(0,Math.min(window.scrollY,hero.offsetHeight));
        hero.style.setProperty("--hero-shift",`${reducedMotion.matches?0:progress*.3}px`);
        hero.style.setProperty("--logo-shift",`${reducedMotion.matches?0:progress*.12}px`);
      }
      if(photo){
        const rect=photo.getBoundingClientRect();
        const shift=Math.max(-70,Math.min(70,(window.innerHeight/2-(rect.top+rect.height/2))*.12));
        photo.style.setProperty("--photo-shift",`${reducedMotion.matches?0:shift}px`);
      }
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",schedule);
    reducedMotion.addEventListener("change",schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);reducedMotion.removeEventListener("change",schedule);};
  },[detail,adminRequested]);

  useEffect(()=>{
    fetch(import.meta.env.BASE_URL+"archive.json",{cache:"no-store"})
      .then(async response=>{if(!response.ok)throw new Error("Could not refresh the archive.");const data=await response.json();if(!Array.isArray(data.entries))throw new Error("Could not refresh the archive.");setPublished(data.entries);})
      .catch(()=>setError("Showing the saved archive. The latest entries could not be loaded."));
  },[]);

  useEffect(()=>{
    const sync=()=>{
      cancelAnimationFrame(scrollFrame.current);
      enteringAbout.current=false;
      const hash=decodeURIComponent(location.hash.slice(1))||"home";
      if(hash==="admin"){
        setAdminRequested(true);setDetail(null);setActive("admin");window.scrollTo({top:0,behavior:"instant"});return;
      }
      setAdminRequested(false);
      if(hash.startsWith("entry/")){setDetail(hash.slice(6));setActive("entry");window.scrollTo({top:0,behavior:"instant"});}
      else {if(sections.some(([id])=>id===hash)||hash==="home")history.replaceState(null,"",location.pathname+location.search);setDetail(null);setActive(hash);requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"}));}
    };
    sync();window.addEventListener("hashchange",sync);
    return()=>window.removeEventListener("hashchange",sync);
  },[]);

  useEffect(()=>{
    if(detail||adminRequested)return;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);
    },{rootMargin:"-15% 0px -55% 0px",threshold:0});
    document.querySelectorAll("main > section[id]").forEach(section=>observer.observe(section));
    return()=>observer.disconnect();
  },[detail,adminRequested]);

  useEffect(()=>{
    if(detail||adminRequested||!videoRef.current)return;
    const video=videoRef.current;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches)void video.play().catch(()=>{});
      else video.pause();
    });
    observer.observe(video);return()=>observer.disconnect();
  },[detail,adminRequested]);

  useEffect(()=>{
    const context=(document as unknown as {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>unknown}}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    const registered=[{name:"read_archive_entries",description:"Read the published News and Past events entries.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:()=>({entries:liveEntries.current})},{name:"open_archive_section",description:"Navigate the visible archive to News or Past events.",inputSchema:{type:"object",properties:{section:{type:"string",enum:["news","past"]}},required:["section"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:unknown)=>{const value=input as {section?:string};if(!value||!["news","past"].includes(value.section||""))throw new Error("Choose news or past.");location.hash=value.section!;return{section:value.section};}}];
    for(const tool of registered){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(console.error);}catch(error){console.error(error);}}
    return()=>lifecycle.abort();
  },[]);

  function enterAbout(){
    const about=aboutRef.current;
    if(!about||enteringAbout.current)return;
    enteringAbout.current=true;
    cancelAnimationFrame(scrollFrame.current);
    history.replaceState(null,"",location.pathname+location.search);
    setActive("about");
    const startY=window.scrollY;
    const targetY=about.getBoundingClientRect().top+startY;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){window.scrollTo({top:targetY,behavior:"instant"});enteringAbout.current=false;return;}
    const startTime=performance.now();
    const tick=(time:number)=>{
      const progress=Math.min(1,(time-startTime)/1800);
      const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
      window.scrollTo({top:startY+(targetY-startY)*eased,behavior:"instant"});
      if(progress<1)scrollFrame.current=requestAnimationFrame(tick);
      else enteringAbout.current=false;
    };
    scrollFrame.current=requestAnimationFrame(tick);
  }

  function goTo(id:string){
    setAdminRequested(false);
    cancelAnimationFrame(scrollFrame.current);
    enteringAbout.current=false;
    setDetail(null);
    setActive(id);
    history.replaceState(null,"",location.pathname+location.search);
    requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"}));
  }
  function enquire(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const body=`Hello Diaspora East Cinema,\n\nI would like to hear more about your screenings, newsletter and upcoming events.\n\nMy email: ${email}\n\nThank you!`;
    window.location.href=`mailto:${contactEmail}?subject=${encodeURIComponent("Newsletter & events enquiry")}&body=${encodeURIComponent(body)}`;
    setMailStatus("Please send the enquiry in your email app.");
  }
  function archiveSection(section:"news"|"past",title:string){
    const entries=published.filter(entry=>entry.section===section);
    return <section className="archive-section page-section" id={section}><div className="section-heading"><h2><Typewriter text={title}/></h2></div><div className="card-grid">{entries.map(entry=><a key={entry.id} className="card" href={"#entry/"+entry.id}><div className="cover">{entry.image?<img src={assetSrc(entry.image)} decoding="async" loading="lazy" alt={entry.title}/>:<div className="placeholder"><img src={assetSrc("/assets/logo.webp")} alt=""/></div>}{(entry.date||entry.description)&&<div className="card-overlay">{entry.description&&<p>{entry.description}</p>}{entry.date&&<p>{entry.date}</p>}</div>}</div><div className="card-body"><h3><Typewriter text={entry.title}/><span aria-hidden="true">↗</span></h3>{entry.category&&<p className="category">{entry.category}</p>}</div></a>)}</div>{entries.length===0&&<p>No entries published yet.</p>}{section==="news"&&error&&<p className="public-error" role="status">{error}</p>}</section>;
  }
  const item=published.find(entry=>entry.id===detail);
  return <>
    <header className={"site-header"+(headerVisible?" is-visible":"")} aria-hidden={!headerVisible} inert={!headerVisible}><nav aria-label="Main navigation">{sections.map(([id,label])=><button type="button" key={id} onClick={()=>goTo(id)} className={active===id?"active":""} aria-current={active===id?"location":undefined}>{label}</button>)}</nav><a href={import.meta.env.BASE_URL} onClick={event=>{event.preventDefault();goTo("home");}} className="brand" aria-label="Diaspora East Cinema home"><img src={assetSrc("/assets/logo.webp")} alt="Diaspora East Cinema"/></a></header>
    <main>{adminRequested?<iframe className="admin-frame" title="Archive CMS" src={assetSrc("/admin/index.html")}/>:detail?<article className="article"><button type="button" className="back" onClick={()=>goTo(item?.section==="past"?"past":"news")}>← Back to {item?.section==="past"?"Past events":"News"}</button>{item?<>{item.image&&<img className="detail-cover" src={assetSrc(item.image)} alt={item.title}/>}<p className="category">{item.category}</p><h1><Typewriter text={item.title}/></h1>{item.date&&<p>{item.date}</p>}<p className="description"><Typewriter text={item.description}/></p></>:<h1>Entry not found</h1>}</article>:<>
      <section ref={heroRef} className="hero" id="home" aria-label="Diaspora East Cinema introduction">
        {!videoFailed&&<video ref={videoRef} className="hero-video" src={assetSrc("/assets/home-video.mp4")} poster={assetSrc("/assets/home-poster.jpg")} muted loop playsInline preload="metadata" onError={()=>setVideoFailed(true)}/>}
        {videoFailed&&<img className="hero-video" src={assetSrc("/assets/home-poster.jpg")} alt=""/>}
        <div className="hero-shade"/>
        <div className="hero-logo-wrap"><img className="hero-logo" src={assetSrc(logoFinished?"/assets/bird-logo-final.png":"/assets/bird_logo_animated.gif")} onLoad={()=>setLogoReady(true)} alt="" fetchPriority="high"/></div>
        <button className="hero-enter" type="button" onClick={enterAbout} aria-label="Scroll to About us"/>
      </section>
      <section ref={aboutRef} className="about-section page-section" id="about"><div className="about-grid"><div className="about-copy"><h1><Typewriter text="About us"/></h1>{aboutParagraphs.map(paragraph=><p key={paragraph}><Typewriter text={paragraph}/></p>)}</div><figure ref={photoRef} className="about-photo"><img src={assetSrc("/assets/screening.jpg")} alt="Diaspora East Cinema screening event" loading="lazy"/></figure></div></section>
      {archiveSection("news","News")}{archiveSection("past","Past events")}
      <section className="contact-section page-section" id="contact"><div className="contact-intro"><h2><Typewriter text="Newsletter"/></h2><form className="enquiry-form" onSubmit={enquire}><label className="sr-only" htmlFor="enquiry-email">Your email address</label><input id="enquiry-email" type="email" placeholder="Your email address" value={email} onChange={event=>setEmail(event.target.value)} autoComplete="email" required/><button type="submit">Email us <span aria-hidden="true">↗</span></button></form>{mailStatus&&<p className="form-note" role="status">{mailStatus}</p>}</div><div className="contact-links"><h2><Typewriter text="Social media"/></h2><a className="social-link" href="https://www.instagram.com/diaspora_east_cinema/" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a><a className="social-link" href="https://www.xiaohongshu.com/user/profile/6674c3130000000003031ba4?xsec_token=ABrMvV2t-uM5yowpWPM9vMrkPh8dri6Lh0DS2o_qyMIQA%3D&amp;xsec_source=pc_search" target="_blank" rel="noopener noreferrer">小红书 · @浮游Diaspora East Cinema <span aria-hidden="true">↗</span></a></div></section>
    </>}</main>
  </>;
}

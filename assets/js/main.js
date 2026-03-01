/* Caprock Tech — minimal JS for UX + conversion */
(function(){
  const $ = (s, el=document)=>el.querySelector(s);
  const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));

  // Mobile menu
  const mobile = $("#mobileMenu");
  const openBtn = $("#openMenu");
  const closeBtn = $("#closeMenu");
  function setMenu(open){
    if(!mobile) return;
    mobile.classList.toggle("show", !!open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  openBtn && openBtn.addEventListener("click", ()=>setMenu(true));
  closeBtn && closeBtn.addEventListener("click", ()=>setMenu(false));
  mobile && mobile.addEventListener("click", (e)=>{
    if(e.target === mobile) setMenu(false);
  });
  $$("#mobileMenu a").forEach(a=>a.addEventListener("click", ()=>setMenu(false)));

  // Smooth anchors
  $$("a[href^='#']").forEach(a=>{
    a.addEventListener("click", (e)=>{
      const id = a.getAttribute("href");
      if(!id || id.length<2) return;
      const target = document.getElementById(id.slice(1));
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  // Toast
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(title, msg){
    if(!toast) return;
    $(".t", toast).textContent = title || "Done";
    $(".m", toast).textContent = msg || "";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toast.classList.remove("show"), 4200);
  }
  window.CaprockToast = showToast;

  // Netlify forms: add a hidden "referrer" field if present
  function injectReferrer(form){
    const ref = document.referrer || "";
    const url = location.href;
    const utm = new URL(url).searchParams;
    const payload = {
      url,
      referrer: ref,
      utm_source: utm.get("utm_source")||"",
      utm_medium: utm.get("utm_medium")||"",
      utm_campaign: utm.get("utm_campaign")||"",
      utm_term: utm.get("utm_term")||"",
      utm_content: utm.get("utm_content")||""
    };
    let hidden = form.querySelector("input[name='context']");
    if(!hidden){
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = "context";
      form.appendChild(hidden);
    }
    hidden.value = JSON.stringify(payload);
  }

  $$("form[data-netlify='true']").forEach(form=>{
    injectReferrer(form);

    // Optional enhanced UX: intercept and show toast, then redirect to thank-you.
    // Netlify supports native redirect via action="/thank-you.html". We'll keep that.
    form.addEventListener("submit", ()=>{
      // let native submit happen
      try{ showToast("Sending…", "We’ll respond fast. If urgent, call now."); }catch(e){}
    });
  });

  // Revenue recovery calculator (if present)
  const calc = $("#rrCalc");
  if(calc){
    const v = (id)=>Number(($("#"+id)?.value||"0").toString().replace(/[^0-9.]/g,""))||0;
    const fmt = (n)=>n.toLocaleString(undefined,{style:"currency", currency:"USD", maximumFractionDigits:0});
    const out = (id, val)=>{ const el=$("#"+id); if(el) el.textContent = val; };

    function compute(){
      const missedCalls = v("missedCalls");
      const closeRate = v("closeRate")/100;
      const avgTicket = v("avgTicket");
      const recoverRate = v("recoverRate")/100;

      const recoveredJobs = missedCalls * recoverRate * closeRate;
      const monthly = recoveredJobs * avgTicket * 4.33;
      out("monthlyRecover", fmt(monthly));
      out("weeklyRecover", fmt(monthly/4.33));
      out("jobsRecover", Math.max(0, recoveredJobs).toFixed(1));
    }
    ["missedCalls","closeRate","avgTicket","recoverRate"].forEach(id=>{
      const el=$("#"+id);
      el && el.addEventListener("input", compute);
    });
    compute();
  }

  // Simple "trust" counters animation
  const counters = $$(".countup");
  if(counters.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(!en.isIntersecting) return;
        const el = en.target;
        const target = Number(el.getAttribute("data-target")||"0");
        const suffix = el.getAttribute("data-suffix")||"";
        const dur = 900;
        const start = performance.now();
        function tick(t){
          const p = Math.min(1, (t-start)/dur);
          const val = Math.floor(target*p);
          el.textContent = val.toLocaleString()+suffix;
          if(p<1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, {threshold: .35});
    counters.forEach(c=>io.observe(c));
  }
})();

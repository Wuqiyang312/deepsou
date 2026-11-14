/* ============================================================
   深搜 DeepSou · 结果页脚本
   从 URL 读取 q/tab/lucky → 调 DeepSeek 搜索 API 或本地演示 →
   按权威值排序渲染 + 分页 + 快照;顶部表单可换词重搜
   ============================================================ */
(function(){
"use strict";
const $ = id => document.getElementById(id);
const { store, esc, showSnapshot } = window.DS;

const state = { query:"", tab:"网页", results:[], page:1, lucky:false, offline:false };
const PAGE_SIZE = 6;

/* ---------- URL 参数 ---------- */
function readParams(){
  const p = new URLSearchParams(location.search);
  return {
    q: (p.get("q")||"").trim(),
    tab: p.get("tab")||"网页",
    lucky: p.get("lucky")==="1"
  };
}
function writeUrl(){
  const p = new URLSearchParams();
  p.set("q", state.query);
  if(state.tab!=="网页") p.set("tab", state.tab);
  history.replaceState(null, "", "results.html?"+p.toString());
}

/* ---------- 检索中动画文案 ---------- */
const SEARCH_MSGS_API = ["正在连接检索服务器…","正在查询索引库…","DeepSeek 正在翻阅网页…","正在按权威值排序…","即将为您呈现结果…"];
const SEARCH_MSGS_LOCAL = ["正在查询本地索引库…","正在翻阅资料…","正在按权威值排序…","即将为您呈现结果…"];

/* ---------- DeepSeek 网页搜索 API ---------- */
async function callSearchAPI(q){
  const cfg = store.get("api", {key:"", base:"https://api.deepseek.com"});
  const t0 = performance.now();
  const res = await fetch(cfg.base.replace(/\/+$/,"")+"/v1/tools/search",{
    method:"POST",
    headers:{"Content-Type":"application/json", Authorization:"Bearer "+cfg.key},
    body:JSON.stringify({query:q, count:12, need_content:false})
  });
  if(!res.ok){
    let msg="HTTP "+res.status;
    try{ const j=await res.json(); if(j.error&&j.error.message) msg=j.error.message; }catch(_){}
    throw new Error("搜索接口返回错误:"+msg);
  }
  const data = await res.json();
  if(!Array.isArray(data.results)) throw new Error("搜索接口返回格式异常");
  return {
    took:(performance.now()-t0)/1000,
    results:data.results.map(r=>{
      const raw = (typeof r.authority==="number")? r.authority : -1;
      /* 接口权威性 0~4(-1 未知)折算为 0~10;未知时用 rerank_score(0~3)折算 */
      const score10 = raw>=0 ? raw/4*10 : (r.rerank_score||0)/3*10;
      let dateStr="";
      if(r.date){ const m=String(r.date).slice(0,10); dateStr=/^\d{4}-\d{2}-\d{2}/.test(m)? m : ""; }
      return {
        title: String(r.title||"未命名网页"),
        url: String(r.url||"#"),
        summary: String(r.snippet||r.summary||""),
        site: r.site_name? String(r.site_name) : "",
        date: dateStr,
        score: score10,
        raw: raw
      };
    }).sort((a,b)=> b.score-a.score)
  };
}

/* ---------- 本地演示数据(无 Key 时使用) ---------- */
function localResults(q){
  const sites=[
    {host:"zh.wikipedia.org", path:"/wiki/", tag:"百科"},
    {host:"www.bilibili.com", path:"/video/", tag:"视频"},
    {host:"www.zhihu.com", path:"/question/", tag:"问答"},
    {host:"github.com", path:"/", tag:"开源"},
    {host:"blog.csdn.net", path:"/article/", tag:"博客"},
    {host:"www.cnblogs.com", path:"/", tag:"博客"},
    {host:"www.baike.baidu.com", path:"/item/", tag:"百科"},
    {host:"www.gitee.com", path:"/", tag:"开源"}
  ];
  return sites.map((s,i)=>({
    title:`${s.tag} | 关于「${q}」的权威${s.tag}资料(第${i+1}篇)`,
    url:`https://${s.host}${s.path}${encodeURIComponent(q)}`,
    summary:`这是${s.host}上关于「${q}」的一篇高质量${s.tag}内容,涵盖核心概念、实践方法与常见问题,由社区长期维护更新,适合入门与进阶读者参考。`,
    site:s.host,
    date:`2026-${String((i%12)+1).padStart(2,"0")}`,
    score:9.6-i*0.8,
    raw:Math.round((9.6-i*0.8)/2.5)
  }));
}

/* ---------- 搜索主流程 ---------- */
async function doSearch(q, page){
  if(page===undefined){
    state.query=q; state.page=1; state.results=[];
    $("topInput").value=q;
    writeUrl();
  }
  state.page = page || state.page;
  if(page!==undefined && state.results.length){ render(); window.scrollTo(0,0); return; }

  const cfg = store.get("api", {key:"", base:"https://api.deepseek.com"});
  const offline = !cfg.key;
  state.offline = offline;

  $("errorBox").classList.add("hidden");
  $("resultList").innerHTML=""; $("pager").innerHTML="";
  $("editorNote").classList.remove("hidden");
  if(offline){
    $("modeBanner").classList.remove("hidden");
    $("editorNote").innerHTML=`<b>站长的话</b>　离线模式:未配置 API Key,以下结果由本地生成,权威值为示例打分,排序规则为权威值从高到低。`;
  }else{
    $("modeBanner").classList.add("hidden");
    $("editorNote").innerHTML=`<b>站长的话</b>　本页结果由 DeepSeek 网页搜索 API 提供,权威值由接口权威性(0–4)折算为 0–10,并按从高到低排序。`;
  }
  if(state.tab && state.tab!=="网页"){
    $("curTab").classList.remove("hidden");
    $("curTab").textContent = `「${state.tab}」搜索`;
  }else{
    $("curTab").classList.add("hidden");
  }
  $("searching").classList.remove("hidden");
  $("statsLine").textContent="深搜一下,「"+q+"」";

  const msgs = offline? SEARCH_MSGS_LOCAL : SEARCH_MSGS_API;
  let mi=0;
  $("searchMsg").textContent=msgs[0];
  const msgTimer=setInterval(()=>{ mi=(mi+1)%msgs.length; $("searchMsg").textContent=msgs[mi]; }, 600);
  const t0=performance.now();

  try{
    let out;
    if(offline){
      await sleep(1400);
      out={took:(performance.now()-t0)/1000, results:localResults(q)};
    }else{
      out=await callSearchAPI(q);
    }
    state.results=out.results;
    state.took=out.took.toFixed(1);
    clearInterval(msgTimer);
    $("searching").classList.add("hidden");
    if(state.lucky && state.results.length){
      state.lucky=false;
      location.assign(state.results[0].url);
      return;
    }
    render();
  }catch(err){
    clearInterval(msgTimer);
    $("searching").classList.add("hidden");
    state.lucky=false;
    $("errorBox").classList.remove("hidden");
    $("errorBox").innerHTML=`<h3>检索失败</h3><p>${esc(err.message||"网络连接超时,请稍后再试。")}</p><p class="mono" style="margin-top:6px;font-size:12px">请检查 API 设置或网络后重试</p>`;
    $("statsLine").textContent="";
  }
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

/* ---------- 渲染结果(按权威值排序 + 分页) ---------- */
function render(){
  const q=state.query, all=state.results;
  $("statsLine").textContent = all.length
    ? `深搜为您找到「${q}」相关结果约 ${all.length} 条(用时 ${state.took} 秒)· 已按权威值排序`
    : `很抱歉,没有找到与「${q}」相关的结果`;
  const pages=Math.max(1, Math.ceil(all.length/PAGE_SIZE));
  if(state.page>pages) state.page=pages;
  const items=all.slice((state.page-1)*PAGE_SIZE, state.page*PAGE_SIZE);

  $("resultList").innerHTML = items.map((r,i)=>{
    const rank=(state.page-1)*PAGE_SIZE+i+1;
    const pct=Math.round(r.score*10);
    return `<li class="result-item">
      <div class="rt"><span class="mono" style="font-size:13px;color:var(--text-2)">${rank}.</span>
        <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>${state.offline?'<span class="tag-local">本地</span>':''}</div>
      <div class="ru">${esc(r.url)} <a href="#" data-snap="${rank-1}">快照</a></div>
      <div class="rs">${esc(r.summary)}</div>
      <div class="ra">权威值 <span class="pr-frame"><span class="pr-fill" style="display:block;width:${pct}%"></span></span> <span class="pr-num">${r.score.toFixed(1)}</span> / 10${r.site?` · ${esc(r.site)}`:""}${r.date?` · ${esc(r.date)}`:""}</div>
    </li>`;
  }).join("");

  $("resultList").querySelectorAll("[data-snap]").forEach(a=>{
    a.addEventListener("click", e=>{ e.preventDefault(); showSnapshot(items[+a.getAttribute("data-snap")]); });
  });

  /* 分页器 */
  const pg=$("pager");
  if(pages<=1){ pg.innerHTML=""; return; }
  let h="";
  if(state.page>1) h+=`<a href="#" data-p="${state.page-1}">上一页</a>`;
  for(let i=1;i<=pages;i++){
    h+= i===state.page ? `<b class="cur">${i}</b>` : `<a href="#" data-p="${i}">${i}</a>`;
  }
  if(state.page<pages) h+=`<a href="#" data-p="${state.page+1}">下一页</a>`;
  pg.innerHTML=h;
  pg.querySelectorAll("[data-p]").forEach(a=>{
    a.addEventListener("click", e=>{ e.preventDefault(); doSearch(q, +a.getAttribute("data-p")); window.scrollTo(0,0); });
  });
}

/* ---------- 顶部表单换词重搜 ---------- */
$("topForm").addEventListener("submit", e=>{
  e.preventDefault();
  const q=$("topInput").value.trim();
  if(!q){ const el=$("topInput"); el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); el.focus(); return; }
  state.tab="网页";
  doSearch(q);
});
$("topLucky").addEventListener("click", ()=>{
  const q=$("topInput").value.trim();
  if(!q) return;
  state.lucky=true;
  doSearch(q);
});

/* ---------- 入口:从 URL 启动 ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  const p = readParams();
  if(!p.q){
    location.href = "index.html";
    return;
  }
  state.query=p.q; state.tab=p.tab; state.lucky=p.lucky;
  $("topInput").value=p.q;
  doSearch(p.q);
})();
})();

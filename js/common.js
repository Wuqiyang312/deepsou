/* ============================================================
   深搜 DeepSou · 全站共用脚本
   store 读写 / HTML 转义 / 访问计数 / 页脚日期 / 主题切换 / 弹窗
   ============================================================ */
(function(){
"use strict";

/* ---------- 本地存储(所有页面共用同一前缀) ---------- */
const store = {
  get(k,d){ try{ const v=localStorage.getItem("deepsou_"+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem("deepsou_"+k,JSON.stringify(v)); }catch(e){} },
  remove(k){ try{ localStorage.removeItem("deepsou_"+k); }catch(e){} }
};

/* ---------- HTML 转义 ---------- */
function esc(s){ return String(s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* ---------- 访问计数器(每页页脚共用) ---------- */
function renderCounter(){
  const el = document.getElementById("counter");
  if(!el) return;
  let visits = store.get("visits", 1024) + 1;
  store.set("visits", visits);
  el.innerHTML = String(visits).padStart(6,"0").split("").map(d=>"<i>"+d+"</i>").join("");
}

/* ---------- 页脚日期(老式格式) ---------- */
function renderFooterDate(){
  const el = document.getElementById("ftDate");
  if(!el) return;
  const w=["日","一","二","三","四","五","六"];
  const d=new Date();
  el.textContent = "今天是 "+d.getFullYear()+" 年 "+(d.getMonth()+1)+" 月 "+d.getDate()+" 日 星期"+w[d.getDay()]+" · 最后更新:2026-11-14";
}

/* ---------- 夜视模式切换 ---------- */
function applyTheme(crt){
  document.body.classList.toggle("crt", crt);
  document.querySelectorAll(".js-theme").forEach(el=>{
    el.textContent = crt ? "经典模式" : "夜视模式";
  });
  store.set("crt", crt);
}
function bindTheme(){
  applyTheme(store.get("crt", false));
  document.querySelectorAll(".js-theme").forEach(el=>{
    el.addEventListener("click", e=>{
      e.preventDefault();
      applyTheme(!document.body.classList.contains("crt"));
    });
  });
}

/* ---------- 老式弹窗 ---------- */
function openModal(title, bodyHTML, footButtons){
  const mask = document.getElementById("modalMask");
  document.getElementById("mTitle").textContent = title;
  document.getElementById("mBody").innerHTML = bodyHTML;
  const foot = document.getElementById("mFoot"); foot.innerHTML="";
  (footButtons||[{label:"关闭"}]).forEach(b=>{
    const btn=document.createElement("button");
    btn.className="btn"; btn.textContent=b.label;
    btn.addEventListener("click",()=>{ b.onClick?b.onClick():closeModal(); });
    foot.appendChild(btn);
  });
  mask.classList.remove("hidden");
  const first=foot.querySelector("button"); if(first) first.focus();
}
function closeModal(){ document.getElementById("modalMask").classList.add("hidden"); }
function bindModal(){
  const mask = document.getElementById("modalMask");
  if(!mask) return;
  document.getElementById("mClose").addEventListener("click", closeModal);
  mask.addEventListener("click", e=>{ if(e.target===mask) closeModal(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !mask.classList.contains("hidden")) closeModal(); });
}

/* ---------- 设为首页 / 加入收藏(怀旧对话框) ---------- */
function bindRetroLinks(){
  document.querySelectorAll(".js-sethome").forEach(el=>el.addEventListener("click", e=>{
    e.preventDefault();
    openModal("设为首页", `<p>古老的手法已经失传了。</p><p style="margin-top:8px">现代浏览器不再允许网页把自己设为主页。请手动操作:浏览器设置 → 启动时 → 打开特定网页 → 填入本站地址。</p><p class="mono" style="margin-top:8px;font-size:12px">我们会在原地等你,就像 1998 年那样。</p>`);
  }));
  document.querySelectorAll(".js-fav").forEach(el=>el.addEventListener("click", e=>{
    e.preventDefault();
    try{ window.external.AddFavorite(location.href, "深搜 DeepSou"); return; }catch(_){}
    openModal("加入收藏夹", `<p>请按 <b>Ctrl + D</b>(Mac 为 ⌘ + D)将本站加入收藏夹。</p><p class="mono" style="margin-top:8px;font-size:12px">收藏本站的网友,据说运气都不会太差。</p>`);
  }));
}

/* ---------- 快照弹窗 ---------- */
function showSnapshot(item){
  openModal("网页快照", `
    <p class="mono" style="font-size:12px;color:var(--url-green);word-break:break-all">${esc(item.url)}</p>
    <div class="panel" style="margin-top:10px"><h3>${esc(item.title)}</h3><p style="margin-top:6px">${esc(item.summary)}</p></div>
    <p class="mono" style="margin-top:10px;font-size:12px;color:var(--text-2)">来源:${esc(item.site||"未知站点")} · 存档时间:${new Date().toLocaleString("zh-CN")}</p>`);
}

/* ---------- 页面初始化 ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  renderCounter();
  renderFooterDate();
  bindTheme();
  bindModal();
  bindRetroLinks();
});

/* ---------- 导出到全局 ---------- */
window.DS = { store, esc, openModal, closeModal, showSnapshot, applyTheme };
})();

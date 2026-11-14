/* ============================================================
   深搜 DeepSou · 留言本脚本(存 localStorage,仅本机可见)
   ============================================================ */
(function(){
"use strict";
const $ = id => document.getElementById(id);
const { store, esc } = window.DS;

function renderList(){
  const list = store.get("guestbook", []);
  const box = $("gbList");
  box.innerHTML = list.length
    ? list.map(g=>`<div class="gb-entry"><span class="who">${esc(g.who)}</span><span class="when">${esc(g.when)}</span><div class="txt">${esc(g.txt)}</div></div>`).join("")
    : `<p class="mono" style="font-size:12px;color:var(--text-2)">（留言本空空如也,来抢沙发）</p>`;
}

$("gbSubmit").addEventListener("click", ()=>{
  const who=$("gbWho").value.trim()||"匿名网友";
  const txt=$("gbTxt").value.trim();
  if(!txt){ $("gbStatus").textContent="※ 留言内容不能为空"; return; }
  const list=store.get("guestbook",[]);
  const d=new Date();
  list.unshift({
    who, txt,
    when:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`
  });
  store.set("guestbook", list.slice(0,50));
  $("gbTxt").value="";
  $("gbStatus").textContent="※ 留言成功,感谢支持本站!";
  renderList();
});

renderList();
})();

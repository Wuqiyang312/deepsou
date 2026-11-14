/* ============================================================
   深度搜索 DeepSou · 首页脚本(2009 百度式)
   tab 切换 + 表单提交(跳结果页)
   ============================================================ */
(function(){
"use strict";
const $ = id => document.getElementById(id);
let curTab = "网页";

/* ---------- tab 行切换(点选中的 tab 无操作) ---------- */
document.querySelectorAll("#homeTabs a").forEach(a=>{
  a.addEventListener("click", e=>{
    e.preventDefault();
    document.querySelectorAll("#homeTabs a").forEach(x=>x.classList.remove("cur"));
    a.classList.add("cur");
    curTab = a.getAttribute("data-tab");
  });
});

/* ---------- 表单提交 → 结果页 ---------- */
$("homeForm").addEventListener("submit", e=>{
  e.preventDefault();
  const q = $("homeInput").value.trim();
  if(!q){
    const el=$("homeInput");
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); el.focus();
    return;
  }
  const url = "results.html?q=" + encodeURIComponent(q) + "&tab=" + encodeURIComponent(curTab);
  location.href = url;
});

/* ---------- 手气不错 ---------- */
function goLucky(){
  const q = $("homeInput").value.trim()||$("homeInput").getAttribute("placeholder").replace("请输入关键词,例如:","");
  location.href = "results.html?q=" + encodeURIComponent(q) + "&tab=" + encodeURIComponent(curTab) + "&lucky=1";
}
$("btnLucky").addEventListener("click", goLucky);
$("homeInput").addEventListener("keydown", e=>{
  if(e.key==="Enter" && e.altKey){ e.preventDefault(); goLucky(); }
});
})();

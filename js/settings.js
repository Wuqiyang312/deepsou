/* ============================================================
   深搜 DeepSou · API 设置页脚本
   Key 仅存 localStorage;测试连接用「DeepSeek」做真实搜索验证
   ============================================================ */
(function(){
"use strict";
const $ = id => document.getElementById(id);
const { store } = window.DS;

const DEFAULT_BASE = "https://api.deepseek.com";

/* ---------- 载入已有配置 ---------- */
(function init(){
  const cfg = store.get("api", {key:"", base:DEFAULT_BASE});
  $("apiKey").value = cfg.key || "";
  $("apiBase").value = cfg.base || DEFAULT_BASE;
  if(cfg.key) $("apiStatus").textContent = "当前已配置 Key(已隐藏显示),可直接保存或测试。";
})();

/* ---------- 保存 ---------- */
$("btnSave").addEventListener("click", ()=>{
  const key=$("apiKey").value.trim();
  const base=$("apiBase").value.trim()||DEFAULT_BASE;
  store.set("api",{key, base});
  $("apiStatus").textContent = key ? "※ 已保存。回到首页搜索即可获得真实结果。" : "※ 已保存。未填写 Key,将使用本地演示数据。";
});

/* ---------- 测试连接(真实调用一次搜索接口) ---------- */
$("btnTest").addEventListener("click", ()=>{
  const key=$("apiKey").value.trim();
  const base=$("apiBase").value.trim()||DEFAULT_BASE;
  if(!key){ $("apiStatus").textContent="※ 请先填写 API Key"; return; }
  $("apiStatus").textContent="… 正在测试搜索接口";
  fetch(base.replace(/\/+$/,"")+"/v1/tools/search",{
    method:"POST",
    headers:{"Content-Type":"application/json", Authorization:"Bearer "+key},
    body:JSON.stringify({query:"DeepSeek", count:1})
  }).then(r=>r.json().then(j=>{
      if(r.ok && Array.isArray(j.results)){ $("apiStatus").textContent="√ 连接成功,搜索接口可用"; }
      else { $("apiStatus").textContent="× 连接失败:"+(j.error&&j.error.message?j.error.message:"HTTP "+r.status); }
    }))
    .catch(err=>{ $("apiStatus").textContent="× 网络错误:"+err.message; });
});

/* ---------- 清除 Key ---------- */
$("btnClear").addEventListener("click", ()=>{
  store.remove("api");
  $("apiKey").value="";
  $("apiBase").value=DEFAULT_BASE;
  $("apiStatus").textContent="※ 已清除 Key,回到离线演示模式。";
});
})();

/* ============================================================
   深度搜索 DeepSou · API 设置页脚本
   配置读写均走本站后端:GET/POST/DELETE /api/config,测试走 POST /api/test
   ============================================================ */
(function(){
"use strict";
const $ = id => document.getElementById(id);

const DEFAULT_BASE = "https://api.deepseek.com";

/* ---------- 载入服务器端配置(只回显掩码与接口地址) ---------- */
function loadConfig(){
  $("apiStatus").textContent = "… 正在读取服务器配置";
  fetch("/api/config").then(r=>r.json()).then(cfg=>{
    $("apiBase").value = cfg.base || DEFAULT_BASE;
    if(cfg.configured){
      $("apiKey").placeholder = "已配置(" + (cfg.keyMasked || "********") + "),留空则不修改";
      $("apiStatus").textContent = "当前服务器已配置 Key(" + (cfg.keyMasked || "********") + ")"
        + (cfg.envOverride ? ",由环境变量 DEEPSO_KEY 提供" : "") + ",可直接保存或测试。";
    }else{
      $("apiStatus").textContent = "服务器尚未配置 Key,当前为离线演示模式。";
    }
  }).catch(()=>{
    $("apiStatus").textContent = "× 无法连接本站后端,请确认 server.js 已启动。";
  });
}
loadConfig();

/* ---------- 保存到服务器 ---------- */
$("btnSave").addEventListener("click", ()=>{
  const key=$("apiKey").value.trim();
  const base=$("apiBase").value.trim()||DEFAULT_BASE;
  $("apiStatus").textContent="… 正在保存到服务器";
  fetch("/api/config",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({key, base})
  }).then(r=>r.json().then(j=>{
      if(r.ok && j.ok){
        $("apiStatus").textContent = j.configured
          ? "√ 已保存到服务器(" + (j.keyMasked || "") + ")。回到首页搜索即可获得真实结果。"
          : "√ 已保存接口地址;服务器暂无 Key,仍为离线演示模式。";
        $("apiKey").value = "";
        $("apiKey").placeholder = j.configured ? "已配置(" + (j.keyMasked || "********") + "),留空则不修改" : "sk-xxxxxxxxxxxxxxxx";
      }else{
        $("apiStatus").textContent = "× 保存失败:" + (j.error || ("HTTP " + r.status));
      }
    }))
    .catch(err=>{ $("apiStatus").textContent="× 网络错误:"+err.message; });
});

/* ---------- 测试连接(由后端做一次真实搜索) ---------- */
$("btnTest").addEventListener("click", ()=>{
  $("apiStatus").textContent="… 正在测试搜索接口(经本站后端)";
  fetch("/api/test",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:"{}"
  }).then(r=>r.json().then(j=>{
      if(r.ok && j.ok){ $("apiStatus").textContent="√ 连接成功,搜索接口可用(" + (j.base || "") + ",用时 " + (j.took||0).toFixed(1) + " 秒)"; }
      else { $("apiStatus").textContent="× 连接失败:" + (j.error || ("HTTP " + r.status)); }
    }))
    .catch(err=>{ $("apiStatus").textContent="× 网络错误:"+err.message; });
});

/* ---------- 清除服务器端 Key ---------- */
$("btnClear").addEventListener("click", ()=>{
  $("apiStatus").textContent="… 正在清除";
  fetch("/api/config",{method:"DELETE"}).then(r=>r.json().then(j=>{
      if(r.ok && j.ok){
        $("apiKey").value="";
        $("apiKey").placeholder="sk-xxxxxxxxxxxxxxxx";
        $("apiBase").value=DEFAULT_BASE;
        $("apiStatus").textContent="√ 已清除服务器端 Key,回到离线演示模式。";
      }else{
        $("apiStatus").textContent="× 清除失败:" + (j.error || ("HTTP " + r.status));
      }
    }))
    .catch(err=>{ $("apiStatus").textContent="× 网络错误:"+err.message; });
});
})();

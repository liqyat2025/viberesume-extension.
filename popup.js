const state = document.querySelector("#profileState");
const result = document.querySelector("#result");
let profile = null;

chrome.storage.local.get("profile", ({ profile: saved }) => {
  profile = saved || null;
  state.textContent = profile?.fullName ? `当前资料：${profile.fullName}` : "还没有简历资料，请先完成设置";
  document.querySelector("#fill").disabled = !profile;
});

document.querySelector("#options").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.querySelector("#fill").addEventListener("click", async () => {
  result.textContent = "正在识别表单…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "VIBERESUME_FILL", profile,
      overwrite: document.querySelector("#overwrite").checked
    });
    result.textContent = response.ok ? `已填写 ${response.filled} 项${response.skipped ? `，跳过 ${response.skipped} 项已有内容` : ""}` : response.error;
  } catch (_) {
    result.textContent = "此页面不允许扩展运行，请在普通招聘网页中重试。";
  }
});

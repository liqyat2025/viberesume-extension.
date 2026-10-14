(function () {
  "use strict";
  const rules = globalThis.VibeResumeRules;
  const MARK = "data-viberesume-filled";
  const COLLECTION_FIELDS = {
    projectName: ["projects", "name"], projectRole: ["projects", "role"],
    projectStartDate: ["projects", "startDate"], projectEndDate: ["projects", "endDate"],
    projectDescription: ["projects", "description"],
    campusOrganization: ["campusExperiences", "organization"], campusRole: ["campusExperiences", "role"],
    campusDescription: ["campusExperiences", "description"],
    languageName: ["languages", "name"], languageLevel: ["languages", "level"],
    skillName: ["skills", "name"], skillLevel: ["skills", "level"],
    certificateName: ["certificates", "name"], awardName: ["awards", "name"],
    familyName: ["familyMembers", "name"], familyRelationship: ["familyMembers", "relationship"],
    familyPhone: ["familyMembers", "phone"], familyCompany: ["familyMembers", "company"],
    familyPosition: ["familyMembers", "position"]
  };

  function fieldText(el) {
    const parts = [el.name, el.id, el.placeholder, el.getAttribute("aria-label"), el.autocomplete];
    if (el.id) {
      try {
        const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (label) parts.push(label.textContent);
      } catch (_) {}
    }
    const wrappingLabel = el.closest("label");
    if (wrappingLabel) parts.push(wrappingLabel.textContent);
    const container = el.closest(".form-item,.form-group,.ant-form-item,.el-form-item,[class*='field'],[class*='formItem']");
    if (container) parts.push(container.textContent.slice(0, 160));
    return parts.filter(Boolean).join(" ");
  }

  function nativeSet(el, value) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, value); else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function fillSelect(el, value) {
    const target = String(value).toLowerCase();
    const option = [...el.options].find((item) =>
      item.value.toLowerCase() === target || item.textContent.trim().toLowerCase() === target ||
      item.textContent.toLowerCase().includes(target)
    );
    if (!option) return false;
    el.value = option.value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function fill(profile, overwrite) {
    let filled = 0, skipped = 0;
    const educationKeys = new Set(["school", "major", "researchDirection", "degree", "academicDegree", "startDate", "graduationDate", "gpa", "classRank", "courses"]);
    const educationCounters = {};
    const internshipKeys = {
      internshipCompany: "company", internshipPosition: "position",
      internshipStartDate: "startDate", internshipEndDate: "endDate",
      internshipDescription: "description"
    };
    const internshipCounters = {};
    const collectionCounters = {};
    const fields = document.querySelectorAll("input:not([type=hidden]):not([type=file]):not([type=submit]):not([type=button]), textarea, select");
    for (const el of fields) {
      if (el.disabled || el.readOnly || !el.getClientRects().length) continue;
      const text = fieldText(el);
      const key = rules.matchField(text);
      let value = rules.profileValue(profile, key);
      if (key in internshipKeys && Array.isArray(profile.internships)) {
        const index = internshipCounters[key] || 0;
        value = profile.internships[index]?.[internshipKeys[key]] || "";
        internshipCounters[key] = index + 1;
      }
      if (key in COLLECTION_FIELDS) {
        const [collectionName, property] = COLLECTION_FIELDS[key];
        const items = profile[collectionName];
        if (Array.isArray(items)) {
          const index = collectionCounters[key] || 0;
          value = items[index]?.[property] || "";
          collectionCounters[key] = index + 1;
        }
      }
      if (key && educationKeys.has(key) && Array.isArray(profile.education) && profile.education.length) {
        const level = /研究生|硕士|master|graduate/i.test(text) ? /硕士|研究生/ : /本科|学士|bachelor|undergraduate/i.test(text) ? /本科/ : null;
        const matched = level && profile.education.find((item) => level.test(item.degree || ""));
        if (matched) value = matched[key] || "";
        else {
          const index = educationCounters[key] || 0;
          value = profile.education[index]?.[key] || "";
          educationCounters[key] = index + 1;
        }
      }
      if (!key || !value) continue;
      if (!overwrite && String(el.value || "").trim()) { skipped++; continue; }
      const ok = el instanceof HTMLSelectElement ? fillSelect(el, value) : (nativeSet(el, value), true);
      if (ok) {
        el.setAttribute(MARK, key);
        el.classList.add("viberesume-flash");
        setTimeout(() => el.classList.remove("viberesume-flash"), 1800);
        filled++;
      }
    }
    return { filled, skipped };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "VIBERESUME_FILL") return;
    try { sendResponse({ ok: true, ...fill(message.profile, Boolean(message.overwrite)) }); }
    catch (error) { sendResponse({ ok: false, error: error.message }); }
  });
})();

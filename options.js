const form = document.querySelector("#profileForm");
const status = document.querySelector("#saveState");
const educationList = document.querySelector("#educationList");
const educationTemplate = document.querySelector("#educationTemplate");
const internshipList = document.querySelector("#internshipList");
const internshipTemplate = document.querySelector("#internshipTemplate");
const repeatableSections = ["projects", "campusExperiences", "languages", "skills", "certificates", "awards", "familyMembers"];

function prepareMonthSelects(root) {
  const currentYear = new Date().getFullYear();
  for (const select of root.querySelectorAll("select[data-month-select]")) {
    if (select.dataset.ready) continue;
    if (select.hasAttribute("data-allow-present")) select.add(new Option("至今", "至今"));
    const futureYears = Number(select.dataset.futureYears || 2);
    for (let year = currentYear + futureYears; year >= 1980; year--) {
      for (let month = 12; month >= 1; month--) {
        const value = `${year}-${String(month).padStart(2, "0")}`;
        select.add(new Option(value, value));
      }
    }
    select.dataset.ready = "true";
  }
}

function renumberEducation() {
  [...educationList.children].forEach((card, index) => card.querySelector(".education-number").textContent = index + 1);
}

function setFieldValue(field, value) {
  const normalized = value == null ? "" : String(value);
  if (field instanceof HTMLSelectElement && normalized && ![...field.options].some((option) => option.value === normalized)) {
    field.add(new Option(`${normalized}（原有值）`, normalized));
  }
  field.value = normalized;
}

function addEducation(education = {}) {
  const card = educationTemplate.content.firstElementChild.cloneNode(true);
  prepareMonthSelects(card);
  for (const field of card.querySelectorAll("[data-field]")) setFieldValue(field, education[field.dataset.field]);
  card.querySelector(".remove-education").addEventListener("click", () => {
    card.remove();
    if (!educationList.children.length) addEducation();
    renumberEducation();
  });
  educationList.append(card);
  renumberEducation();
}

function addInternship(internship = {}) {
  const card = internshipTemplate.content.firstElementChild.cloneNode(true);
  prepareMonthSelects(card);
  for (const field of card.querySelectorAll("[data-field]")) setFieldValue(field, internship[field.dataset.field]);
  card.querySelector(".remove-internship").addEventListener("click", () => {
    card.remove();
    renumberInternships();
  });
  internshipList.append(card);
  renumberInternships();
}

function renumberInternships() {
  [...internshipList.children].forEach((card, index) => card.querySelector(".internship-number").textContent = index + 1);
}

function collectCards(list) {
  return [...list.children].map((card) => Object.fromEntries(
    [...card.querySelectorAll("[data-field]")].map((field) => [field.dataset.field, field.value.trim()])
  )).filter((item) => Object.values(item).some(Boolean));
}

function addRepeatable(section, item = {}) {
  const list = document.querySelector(`#${section}List`);
  const template = document.querySelector(`#${section}Template`);
  const card = template.content.firstElementChild.cloneNode(true);
  prepareMonthSelects(card);
  for (const field of card.querySelectorAll("[data-field]")) setFieldValue(field, item[field.dataset.field]);
  card.querySelector("[data-remove]").addEventListener("click", () => card.remove());
  list.append(card);
}

function populate(profile = {}) {
  for (const element of form.elements) if (element.name && profile[element.name] != null) setFieldValue(element, profile[element.name]);
  educationList.replaceChildren();
  const education = Array.isArray(profile.education) ? profile.education : [];
  if (!education.length && profile.school) education.push({
    school: profile.school, major: profile.major, degree: profile.degree,
    graduationDate: profile.graduationDate, gpa: profile.gpa
  });
  (education.length ? education : [{ degree: "本科" }, { degree: "硕士研究生" }]).forEach(addEducation);
  internshipList.replaceChildren();
  (Array.isArray(profile.internships) ? profile.internships : []).forEach(addInternship);
  for (const section of repeatableSections) {
    document.querySelector(`#${section}List`).replaceChildren();
    (Array.isArray(profile[section]) ? profile[section] : []).forEach((item) => addRepeatable(section, item));
  }
}
chrome.storage.local.get("profile", ({ profile }) => populate(profile));
document.querySelector("#addEducation").addEventListener("click", () => addEducation());
document.querySelector("#addInternship").addEventListener("click", () => addInternship());
for (const section of repeatableSections) {
  document.querySelector(`#add${section[0].toUpperCase()}${section.slice(1)}`).addEventListener("click", () => addRepeatable(section));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const profile = Object.fromEntries(new FormData(form));
  profile.education = collectCards(educationList);
  profile.internships = collectCards(internshipList);
  for (const section of repeatableSections) profile[section] = collectCards(document.querySelector(`#${section}List`));
  await chrome.storage.local.set({ profile });
  status.textContent = "已保存";
  setTimeout(() => status.textContent = "", 1800);
});

document.querySelector("#exportData").addEventListener("click", async () => {
  const { profile = {} } = await chrome.storage.local.get("profile");
  const blob = new Blob([JSON.stringify({ version: 1, profile }, null, 2)], { type: "application/json" });
  const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "viberesume-profile.json" });
  link.click(); URL.revokeObjectURL(link.href);
});

document.querySelector("#importData").addEventListener("change", async (event) => {
  try {
    const data = JSON.parse(await event.target.files[0].text());
    if (!data.profile || typeof data.profile !== "object") throw new Error();
    await chrome.storage.local.set({ profile: data.profile }); populate(data.profile); status.textContent = "已导入并保存";
  } catch (_) { status.textContent = "导入失败：文件格式不正确"; }
});

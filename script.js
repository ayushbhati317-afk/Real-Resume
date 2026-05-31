const form = document.querySelector("#checkerForm");
const resumeInput = document.querySelector("#resumeText");
const jobInput = document.querySelector("#jobText");
const resumeFile = document.querySelector("#resumeFile");
const dropZone = document.querySelector("#dropZone");
const fileStatus = document.querySelector("#fileStatus");
const extractStatus = document.querySelector("#extractStatus");
const extractProgress = document.querySelector("#extractProgress");
const clearButton = document.querySelector("#clearButton");
const sampleButton = document.querySelector("#sampleButton");
const copyButton = document.querySelector("#copyButton");
const downloadButton = document.querySelector("#downloadButton");
const jobTitleInput = document.querySelector("#jobTitle");
const companyNameInput = document.querySelector("#companyName");
const jobLevelInput = document.querySelector("#jobLevel");
const jobSkillsInput = document.querySelector("#jobSkills");
const generateJobButton = document.querySelector("#generateJobButton");
const enhanceJobButton = document.querySelector("#enhanceJobButton");
const assistantChat = document.querySelector("#assistantChat");
const assistantInput = document.querySelector("#assistantInput");
const askAssistantButton = document.querySelector("#askAssistantButton");
const promptChips = document.querySelectorAll(".prompt-chips button");
const generateResumeButton = document.querySelector("#generateResumeButton");
const sendToCheckerButton = document.querySelector("#sendToCheckerButton");
const downloadResumeButton = document.querySelector("#downloadResumeButton");
const resumePreview = document.querySelector("#resumePreview");
const builderName = document.querySelector("#builderName");
const builderEmail = document.querySelector("#builderEmail");
const builderPhone = document.querySelector("#builderPhone");
const builderLocation = document.querySelector("#builderLocation");
const builderTarget = document.querySelector("#builderTarget");
const builderSkills = document.querySelector("#builderSkills");
const builderSummary = document.querySelector("#builderSummary");
const builderExperience = document.querySelector("#builderExperience");
const builderProjects = document.querySelector("#builderProjects");
const builderEducation = document.querySelector("#builderEducation");
const trackerCompany = document.querySelector("#trackerCompany");
const trackerRole = document.querySelector("#trackerRole");
const trackerStage = document.querySelector("#trackerStage");
const trackerNext = document.querySelector("#trackerNext");
const addTrackerButton = document.querySelector("#addTrackerButton");
const trackerList = document.querySelector("#trackerList");

const scoreValue = document.querySelector("#scoreValue");
const scoreStatus = document.querySelector("#scoreStatus");
const riskStatus = document.querySelector("#riskStatus");
const riskText = document.querySelector("#riskText");
const riskCard = document.querySelector("#riskCard");
const meterFill = document.querySelector("#meterFill");
const summaryText = document.querySelector("#summaryText");
const keywordScoreEl = document.querySelector("#keywordScore");
const sectionScoreEl = document.querySelector("#sectionScore");
const formatScoreEl = document.querySelector("#formatScore");
const keywordMeter = document.querySelector("#keywordMeter");
const sectionMeter = document.querySelector("#sectionMeter");
const formatMeter = document.querySelector("#formatMeter");
const missingKeywordsEl = document.querySelector("#missingKeywords");
const recommendationsEl = document.querySelector("#recommendations");
const checklistEl = document.querySelector("#checklist");
const nextStepText = document.querySelector("#nextStepText");
const resumeWords = document.querySelector("#resumeWords");
const jobWords = document.querySelector("#jobWords");
const resumeQuality = document.querySelector("#resumeQuality");
const jobQuality = document.querySelector("#jobQuality");
const phases = document.querySelectorAll(".phase");

let latestReport = null;
let liveTimer = null;
let isExtracting = false;
let assistantHistory = [];
let generatedResumeText = "";
let trackedApplications = [];

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

const stopWords = new Set([
  "and", "the", "for", "with", "you", "your", "are", "from", "that", "this",
  "will", "have", "has", "our", "but", "not", "all", "can", "who", "into",
  "their", "they", "them", "was", "were", "job", "role", "work", "team",
  "about", "using", "use", "new", "more", "such", "including", "within",
  "must", "able", "plus", "preferred", "responsibilities", "requirements"
]);

const expectedSections = [
  "experience",
  "education",
  "skills",
  "projects",
  "summary"
];

const sampleResume = `Jordan Taylor
jordan.taylor@email.com | 555-0188 | Chicago, IL

Summary
Data analyst with 4 years of experience building dashboards, cleaning data, and improving business reporting workflows.

Skills
SQL, Python, Tableau, Excel, data visualization, stakeholder communication, reporting automation

Experience
Data Analyst, Northstar Retail
- Built Tableau dashboards used by operations leaders to track revenue, inventory, and customer trends.
- Wrote SQL queries to clean large data sets and reduced weekly reporting time by 35%.
- Partnered with marketing and finance teams to define KPIs and improve campaign analysis.

Projects
- Automated monthly sales reporting in Python and Excel, saving 8 hours per month.

Education
B.S. Business Analytics, State University`;

const sampleJob = `We are hiring a Data Analyst to build dashboards, analyze customer and revenue data, and communicate insights to business stakeholders. The role requires SQL, Python, Tableau, Excel, data visualization, KPI reporting, data cleaning, and strong communication skills. Experience with retail analytics, dashboard automation, and cross-functional collaboration is preferred.`;

const roleSkillMap = {
  developer: ["JavaScript", "HTML", "CSS", "Git", "API integration", "debugging", "responsive design"],
  engineer: ["system design", "debugging", "collaboration", "documentation", "automation", "testing"],
  analyst: ["SQL", "Excel", "dashboarding", "data cleaning", "KPI reporting", "data visualization"],
  marketing: ["campaign strategy", "SEO", "analytics", "content planning", "conversion optimization"],
  sales: ["CRM", "lead qualification", "pipeline management", "negotiation", "customer discovery"],
  designer: ["Figma", "user research", "wireframing", "prototyping", "design systems"],
  manager: ["stakeholder management", "planning", "team leadership", "reporting", "process improvement"]
};

function inferRoleSkills(title, skillsText) {
  const directSkills = skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (directSkills.length) {
    return directSkills;
  }

  const normalizedTitle = normalizeText(title);
  const matchedRole = Object.keys(roleSkillMap).find((role) => normalizedTitle.includes(role));
  return matchedRole ? roleSkillMap[matchedRole] : ["communication", "problem solving", "collaboration", "planning", "reporting"];
}

function generateJobDescription() {
  const title = jobTitleInput.value.trim() || "Business Analyst";
  const company = companyNameInput.value.trim() || "growing company";
  const level = jobLevelInput.value;
  const skills = inferRoleSkills(title, jobSkillsInput.value);
  const primarySkills = skills.slice(0, 5).join(", ");
  const niceToHave = skills.slice(5).join(", ") || "experience in a fast-moving team environment";

  jobText.value = [
    `We are hiring a ${level} ${title} to join our ${company}. This role is responsible for turning business needs into practical results, collaborating with cross-functional teams, and delivering measurable impact.`,
    "",
    "Responsibilities:",
    `- Apply ${primarySkills} to solve day-to-day business problems.`,
    "- Partner with stakeholders to understand goals, clarify requirements, and communicate progress.",
    "- Build reliable workflows, documentation, and reports that help the team make better decisions.",
    "- Identify opportunities to improve quality, speed, customer experience, or operational efficiency.",
    "",
    "Required qualifications:",
    `- Hands-on experience with ${primarySkills}.`,
    "- Strong written and verbal communication skills.",
    "- Ability to manage priorities, explain tradeoffs, and work independently.",
    "- Portfolio, projects, or work examples that show practical impact.",
    "",
    "Preferred qualifications:",
    `- Familiarity with ${niceToHave}.`,
    "- Experience working with cross-functional teams in a real business setting.",
    "- Comfort learning new tools and adapting to changing priorities."
  ].join("\n");

  scheduleLiveAnalysis();
}

function enhanceJobDescription() {
  const current = jobText.value.trim();
  const title = jobTitleInput.value.trim() || "the target role";
  const skills = inferRoleSkills(title, jobSkillsInput.value);

  if (!current) {
    generateJobDescription();
    return;
  }

  const additions = [
    "",
    "ATS keyword focus:",
    `The strongest keywords for this ${title} posting include ${skills.slice(0, 8).join(", ")}.`,
    "",
    "Candidate success signals:",
    "- Clear examples of measurable impact.",
    "- Relevant tools and role-specific skills named directly.",
    "- Communication, ownership, and collaboration examples."
  ].join("\n");

  if (!current.includes("ATS keyword focus:")) {
    jobText.value = `${current}\n${additions}`;
  }

  scheduleLiveAnalysis();
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ");
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function setExtractionStatus(message, progress = 0) {
  extractStatus.textContent = message;
  extractProgress.style.width = `${Math.max(0, Math.min(100, progress))}%`;
}

function getFileExtension(file) {
  return file.name.split(".").pop().toLowerCase();
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Could not read this text file.")));
    reader.readAsText(file);
  });
}

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Could not read this document.")));
    reader.readAsArrayBuffer(file);
  });
}

function stripRtf(text) {
  return text
    .replace(/\\par[d]?/g, "\n")
    .replace(/\\'[0-9a-fA-F]{2}/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/\\[a-z]+\d* ?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  return doc.body.textContent.replace(/\s+/g, " ").trim();
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF reader could not load. Check your internet connection and refresh.");
  }

  const buffer = await readAsArrayBuffer(file);
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    setExtractionStatus(`Reading PDF page ${pageNumber} of ${pdf.numPages}...`, (pageNumber / pdf.numPages) * 85);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(" "));
  }

  return pages.join("\n\n");
}

async function extractDocxText(file) {
  if (!window.mammoth) {
    throw new Error("Word document reader could not load. Check your internet connection and refresh.");
  }

  const buffer = await readAsArrayBuffer(file);
  setExtractionStatus("Reading Word document structure...", 55);
  const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function extractImageText(file) {
  if (!window.Tesseract) {
    throw new Error("Image OCR reader could not load. Check your internet connection and refresh.");
  }

  const result = await window.Tesseract.recognize(file, "eng", {
    logger: (event) => {
      if (event.status === "recognizing text") {
        setExtractionStatus(`Recognizing text from image... ${Math.round(event.progress * 100)}%`, event.progress * 85);
      }
    }
  });

  return result.data.text;
}

async function extractResumeText(file) {
  const extension = getFileExtension(file);
  const mime = file.type;

  if (extension === "pdf" || mime === "application/pdf") {
    return extractPdfText(file);
  }

  if (extension === "docx" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocxText(file);
  }

  if (extension === "doc" || mime === "application/msword") {
    throw new Error("Legacy .doc files cannot be safely read in-browser. Please save as DOCX or PDF and upload again.");
  }

  if (["jpg", "jpeg", "png", "webp", "bmp"].includes(extension) || mime.startsWith("image/")) {
    return extractImageText(file);
  }

  if (extension === "rtf" || mime === "application/rtf") {
    return stripRtf(await readAsText(file));
  }

  if (["html", "htm"].includes(extension) || mime === "text/html") {
    return stripHtml(await readAsText(file));
  }

  if (["txt", "md", "csv", "text"].includes(extension) || mime.startsWith("text/")) {
    return readAsText(file);
  }

  throw new Error("Unsupported file type. Please use PDF, DOCX, TXT, RTF, HTML, CSV, JPG, PNG, WEBP, or BMP.");
}

function getKeywords(text) {
  const words = normalizeText(text)
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !stopWords.has(word));

  const counts = words.reduce((map, word) => {
    map.set(word, (map.get(word) || 0) + 1);
    return map;
  }, new Map());

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 28)
    .map(([word]) => word);
}

function scoreKeywords(resume, job) {
  const jobKeywords = getKeywords(job);
  const resumeText = normalizeText(resume);
  const matched = jobKeywords.filter((keyword) => resumeText.includes(keyword));
  const missing = jobKeywords.filter((keyword) => !resumeText.includes(keyword));

  return {
    score: jobKeywords.length ? Math.round((matched.length / jobKeywords.length) * 100) : 0,
    matched,
    missing: missing.slice(0, 12)
  };
}

function scoreSections(resume) {
  const text = normalizeText(resume);
  const found = expectedSections.filter((section) => text.includes(section));
  return {
    score: Math.round((found.length / expectedSections.length) * 100),
    found,
    missing: expectedSections.filter((section) => !found.includes(section))
  };
}

function scoreFormat(resume) {
  let points = 0;
  const checks = {
    hasEmail: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resume),
    hasPhone: /(\+?\d[\d\s().-]{8,}\d)/.test(resume),
    hasBullets: /(^|\n)\s*[-*]/.test(resume),
    hasReasonableLength: countWords(resume) >= 120,
    avoidsTablesHint: !/\t{2,}|[|]{2,}/.test(resume)
  };

  Object.values(checks).forEach((passed) => {
    if (passed) points += 20;
  });

  return { score: points, checks };
}

function buildRecommendations(keywordResult, sectionResult, formatResult) {
  const tips = [];

  if (keywordResult.score < 70) {
    tips.push("Add the most relevant missing job keywords naturally inside your experience, skills, and project bullets.");
  }

  if (sectionResult.missing.length) {
    tips.push(`Add or rename these resume sections: ${sectionResult.missing.join(", ")}.`);
  }

  if (!formatResult.checks.hasEmail || !formatResult.checks.hasPhone) {
    tips.push("Include a clear email address and phone number near the top of the resume.");
  }

  if (!formatResult.checks.hasBullets) {
    tips.push("Use simple hyphen bullet points for achievements so ATS systems and recruiters can scan them quickly.");
  }

  if (!formatResult.checks.hasReasonableLength) {
    tips.push("Add measurable work history, tools, impact, and achievements. The current resume text looks short.");
  }

  if (!formatResult.checks.avoidsTablesHint) {
    tips.push("Avoid tables, columns, and divider-heavy layouts because some ATS parsers read them poorly.");
  }

  if (!tips.length) {
    tips.push("Strong match. Fine-tune the top summary and first experience bullets for the exact job title.");
  }

  return tips;
}

function getNextStep(score, keywordResult, sectionResult, formatResult) {
  if (score >= 80) {
    return "Optimization phase: tailor the first 3 bullets to the job title and keep the strongest keywords near the top.";
  }

  if (keywordResult.score < 65) {
    return "Improve phase: add missing keywords where they honestly match your experience.";
  }

  if (sectionResult.score < 80) {
    return "Analyze phase: add the missing resume sections so ATS parsers can categorize your content.";
  }

  if (formatResult.score < 80) {
    return "Optimize phase: simplify formatting, add contact details, and use clear bullet points.";
  }

  return "Improve phase: strengthen measurable results and align your summary with the job description.";
}

function updatePhases(score) {
  phases.forEach((phase, index) => {
    phase.classList.toggle("active", index <= Math.min(3, Math.floor(score / 25)));
  });
}

function renderKeywordTags(words) {
  missingKeywordsEl.innerHTML = "";

  if (!words.length) {
    const tag = document.createElement("span");
    tag.textContent = "No major missing keywords";
    missingKeywordsEl.appendChild(tag);
    return;
  }

  words.forEach((word) => {
    const tag = document.createElement("span");
    tag.textContent = word;
    missingKeywordsEl.appendChild(tag);
  });
}

function renderRecommendations(tips) {
  recommendationsEl.innerHTML = "";
  tips.forEach((tip) => {
    const item = document.createElement("li");
    item.textContent = tip;
    recommendationsEl.appendChild(item);
  });
}

function renderChecklist(sectionResult, formatResult, keywordResult) {
  const checks = [
    ["Email found", formatResult.checks.hasEmail],
    ["Phone found", formatResult.checks.hasPhone],
    ["Simple bullets found", formatResult.checks.hasBullets],
    ["Resume has enough detail", formatResult.checks.hasReasonableLength],
    ["No table-like formatting detected", formatResult.checks.avoidsTablesHint],
    ["Core sections present", sectionResult.score >= 80],
    ["Keyword match above 70%", keywordResult.score >= 70]
  ];

  checklistEl.innerHTML = "";
  checks.forEach(([label, passed]) => {
    const item = document.createElement("span");
    item.className = passed ? "pass" : "fail";
    item.textContent = `${passed ? "Pass" : "Fix"}: ${label}`;
    checklistEl.appendChild(item);
  });
}

function updateTextStats() {
  const resumeCount = countWords(resumeInput.value);
  const jobCount = countWords(jobInput.value);

  resumeWords.textContent = `${resumeCount} words`;
  jobWords.textContent = `${jobCount} words`;
  resumeQuality.textContent = resumeCount >= 120 ? "Good detail level" : "Add more role details";
  jobQuality.textContent = jobCount >= 40 ? "Ready for keyword scan" : "Add more job description text";
}

function setMeter(element, score) {
  if (element) {
    element.style.width = `${Math.max(0, Math.min(100, score))}%`;
  }
}

function renderAnalysis(report) {
  const { finalScore, keywordResult, sectionResult, formatResult, tips } = report;

  scoreValue.textContent = finalScore;
  meterFill.style.width = `${finalScore}%`;
  keywordScoreEl.textContent = `${keywordResult.score}%`;
  sectionScoreEl.textContent = `${sectionResult.score}%`;
  formatScoreEl.textContent = `${formatResult.score}%`;
  setMeter(keywordMeter, keywordResult.score);
  setMeter(sectionMeter, sectionResult.score);
  setMeter(formatMeter, formatResult.score);

  if (finalScore >= 80) {
    scoreStatus.textContent = "Excellent match";
    riskStatus.textContent = "Low";
    riskText.textContent = "Your resume looks likely to pass the first ATS screen for this role.";
    riskCard.className = "risk-card low-risk";
  } else if (finalScore >= 60) {
    scoreStatus.textContent = "Good start";
    riskStatus.textContent = "Medium";
    riskText.textContent = "Your resume may pass, but missing keywords or weak sections could reduce visibility.";
    riskCard.className = "risk-card medium-risk";
  } else {
    scoreStatus.textContent = "Needs optimization";
    riskStatus.textContent = "High";
    riskText.textContent = "Your resume will likely be rejected or ranked low unless you improve the match.";
    riskCard.className = "risk-card high-risk";
  }

  summaryText.textContent = `Your resume matches ${keywordResult.matched.length} important job keywords and includes ${sectionResult.found.length} of ${expectedSections.length} recommended sections.`;

  renderKeywordTags(keywordResult.missing);
  renderRecommendations(tips);
  renderChecklist(sectionResult, formatResult, keywordResult);
  nextStepText.textContent = getNextStep(finalScore, keywordResult, sectionResult, formatResult);
  updatePhases(finalScore);
}

function createReport() {
  const resume = resumeInput.value.trim();
  const job = jobInput.value.trim();
  const keywordResult = scoreKeywords(resume, job);
  const sectionResult = scoreSections(resume);
  const formatResult = scoreFormat(resume);
  const finalScore = Math.round(
    keywordResult.score * 0.5 + sectionResult.score * 0.25 + formatResult.score * 0.25
  );
  const tips = buildRecommendations(keywordResult, sectionResult, formatResult);

  return { finalScore, keywordResult, sectionResult, formatResult, tips };
}

function analyzeResume(event) {
  if (event) {
    event.preventDefault();
  }

  latestReport = createReport();
  renderAnalysis(latestReport);
}

function scheduleLiveAnalysis() {
  updateTextStats();
  window.clearTimeout(liveTimer);

  if (countWords(resumeInput.value) < 25 || countWords(jobInput.value) < 20) {
    return;
  }

  liveTimer = window.setTimeout(() => analyzeResume(), 350);
}

function buildReportText() {
  if (!latestReport) {
    return "Run the HireReady ATS check first to generate a report.";
  }

  return [
    "HireReady ATS Report",
    `Overall Score: ${latestReport.finalScore}`,
    `Keyword Match: ${latestReport.keywordResult.score}%`,
    `Section Health: ${latestReport.sectionResult.score}%`,
    `ATS Format: ${latestReport.formatResult.score}%`,
    "",
    "Missing Keywords:",
    latestReport.keywordResult.missing.length ? latestReport.keywordResult.missing.join(", ") : "No major missing keywords",
    "",
    "Recommendations:",
    ...latestReport.tips.map((tip) => `- ${tip}`)
  ].join("\n");
}

function cleanLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function generateResumeFromBuilder() {
  const name = builderName.value.trim() || "Your Name";
  const email = builderEmail.value.trim() || "email@example.com";
  const phone = builderPhone.value.trim() || "Phone";
  const location = builderLocation.value.trim() || "Location";
  const target = builderTarget.value.trim() || "Target Role";
  const skills = builderSkills.value.trim() || "Communication, problem solving, teamwork";
  const summary = builderSummary.value.trim() || `Motivated ${target} candidate with practical skills, strong ownership, and a focus on measurable results.`;
  const experience = cleanLines(builderExperience.value) || "- Add 2-4 achievement bullets with action, tool, and result.";
  const projects = cleanLines(builderProjects.value) || "- Add a project that proves your strongest job-related skills.";
  const education = cleanLines(builderEducation.value) || "Education details";

  generatedResumeText = [
    name,
    `${email} | ${phone} | ${location}`,
    "",
    "Summary",
    summary,
    "",
    "Target Role",
    target,
    "",
    "Skills",
    skills,
    "",
    "Experience",
    experience,
    "",
    "Projects",
    projects,
    "",
    "Education",
    education
  ].join("\n");

  resumePreview.textContent = generatedResumeText;
  return generatedResumeText;
}

function sendGeneratedResumeToChecker() {
  const text = generatedResumeText || generateResumeFromBuilder();
  resumeInput.value = text;
  fileStatus.textContent = "Resume builder content loaded";
  setExtractionStatus("Builder resume is ready for ATS scoring.", 100);
  updateTextStats();
  document.querySelector("#checker").scrollIntoView({ behavior: "smooth", block: "start" });
  scheduleLiveAnalysis();
}

function downloadGeneratedResume() {
  const text = generatedResumeText || generateResumeFromBuilder();
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hireready-resume.txt";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function renderTracker() {
  trackerList.innerHTML = "";

  if (!trackedApplications.length) {
    const empty = document.createElement("span");
    empty.textContent = "No interviews tracked yet.";
    trackerList.appendChild(empty);
    return;
  }

  trackedApplications.forEach((item) => {
    const row = document.createElement("article");
    const details = document.createElement("div");
    const title = document.createElement("strong");
    const next = document.createElement("small");
    const stage = document.createElement("small");

    title.textContent = `${item.role} at ${item.company}`;
    next.textContent = `Next: ${item.nextAction}`;
    stage.textContent = item.stage;
    details.append(title, document.createElement("br"), next);
    row.append(details, stage);
    trackerList.appendChild(row);
  });
}

function addTrackerItem() {
  const company = trackerCompany.value.trim();
  const role = trackerRole.value.trim();
  const nextAction = trackerNext.value.trim() || "Follow up";

  if (!company || !role) {
    return;
  }

  trackedApplications.unshift({
    company,
    role,
    stage: trackerStage.value,
    nextAction
  });

  trackedApplications = trackedApplications.slice(0, 8);
  trackerCompany.value = "";
  trackerRole.value = "";
  trackerNext.value = "";
  renderTracker();
}

function appendChatMessage(sender, text, options = {}) {
  const message = document.createElement("div");
  message.className = `chat-message ${sender}`;
  if (options.isLoading) {
    message.classList.add("typing");
  }

  const label = document.createElement("strong");
  label.textContent = sender === "user" ? "You" : "Assistant";

  const body = document.createElement("p");
  body.textContent = text;

  message.append(label, body);
  assistantChat.appendChild(message);
  assistantChat.scrollTop = assistantChat.scrollHeight;
  return message;
}

function updateChatMessage(message, text) {
  const body = message.querySelector("p");
  message.classList.remove("typing");
  body.textContent = text;
}

function getCurrentContext() {
  const resume = resumeInput.value.trim();
  const job = jobText.value.trim();
  const report = resume && job ? createReport() : latestReport;
  const title = jobTitleInput.value.trim() || "your target role";
  const skills = inferRoleSkills(title, jobSkillsInput.value);

  return {
    resume,
    job,
    report,
    title,
    skills,
    resumeWords: countWords(resume),
    jobWords: countWords(job)
  };
}

function buildAssistantApiContext() {
  const context = getCurrentContext();

  return {
    atsScore: context.report?.finalScore ?? null,
    keywordScore: context.report?.keywordResult.score ?? null,
    sectionScore: context.report?.sectionResult.score ?? null,
    formatScore: context.report?.formatResult.score ?? null,
    missingKeywords: context.report?.keywordResult.missing ?? [],
    resumeText: context.resume,
    jobDescription: context.job,
    jobTitle: context.title,
    jobLevel: jobLevelInput.value,
    keySkills: jobSkillsInput.value
  };
}

async function askBackendAssistant(question) {
  if (window.location.protocol === "file:") {
    throw new Error("Backend is not running from a local server.");
  }

  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: question,
      messages: assistantHistory,
      context: buildAssistantApiContext()
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong, try again.");
  }

  return data.answer;
}

function getAssistantResponse(question) {
  const context = getCurrentContext();
  const lowerQuestion = normalizeText(question);

  if (!context.resume) {
    return "Start by uploading or pasting your resume. Once I can read it, I can suggest realistic job targets, missing skills, and resume changes for the role you want.";
  }

  if (!context.job) {
    return "Your resume is loaded. Next, generate a job description with the job builder or paste a posting. Then I can compare your resume against that role instead of giving generic advice.";
  }

  const report = context.report;
  const missing = report.keywordResult.missing.slice(0, 8);
  const scoreLine = `Your current ATS score is ${report.finalScore}. Keyword match is ${report.keywordResult.score}%, section health is ${report.sectionResult.score}%, and formatting is ${report.formatResult.score}%.`;

  if (lowerQuestion.includes("job") || lowerQuestion.includes("fit") || lowerQuestion.includes("target")) {
    return `${scoreLine}\n\nBased on your current resume and the target description, you should focus on roles close to ${context.title}. Also search for titles that mention ${context.skills.slice(0, 4).join(", ")}. If your score is below 70, apply after adding honest examples for: ${missing.length ? missing.join(", ") : "the strongest job keywords already present"}.`;
  }

  if (lowerQuestion.includes("interview") || lowerQuestion.includes("question")) {
    return `Prepare answers for these real-world interview themes:\n- A project where you used ${context.skills.slice(0, 2).join(" and ")} to create measurable impact.\n- A time you worked with stakeholders or teammates under unclear requirements.\n- How you would approach the first 30 days in a ${context.title} role.\n- A mistake, blocker, or tradeoff you handled professionally.\n\nUse short STAR answers: situation, task, action, result.`;
  }

  if (lowerQuestion.includes("skill") || lowerQuestion.includes("learn")) {
    return `Prioritize these skills first: ${missing.length ? missing.join(", ") : context.skills.slice(0, 6).join(", ")}.\n\nChoose one portfolio project that proves them. A practical project plus a measurable resume bullet is usually stronger than listing another course.`;
  }

  if (lowerQuestion.includes("salary") || lowerQuestion.includes("pay")) {
    return "For salary, compare the job title, location, company size, and experience level on multiple job boards before negotiating. I cannot see live market data from this static page, but you can still prepare a range by matching your role level and required skills. Keep your answer anchored to impact, scope, and competing market data.";
  }

  if (lowerQuestion.includes("resume") || lowerQuestion.includes("improve") || lowerQuestion.includes("keyword")) {
    return `${scoreLine}\n\nBest next edits:\n- Add missing keywords where they truthfully match your work: ${missing.length ? missing.join(", ") : "your keyword coverage is already strong"}.\n- Put the target job title or close equivalent in your summary.\n- Rewrite bullets to include action, tool, business result, and number.\n- Keep formatting simple: standard headings, clear bullets, no table-heavy layouts.`;
  }

  return `${scoreLine}\n\nMy practical advice: tailor your summary and first work-experience bullets to ${context.title}, add measurable outcomes, and make sure the job's most important skills appear naturally in your Skills and Experience sections. Ask me about job fit, interview prep, missing skills, salary strategy, or resume improvements for more specific help.`;
}

async function askAssistant(questionOverride) {
  const question = (questionOverride || assistantInput.value).trim();

  if (!question) {
    return;
  }

  appendChatMessage("user", question);
  assistantHistory.push({ role: "user", content: question });
  assistantInput.value = "";

  const loadingMessage = appendChatMessage("assistant", "Thinking...", { isLoading: true });

  try {
    const answer = await askBackendAssistant(question);
    updateChatMessage(loadingMessage, answer);
    assistantHistory.push({ role: "assistant", content: answer });
  } catch (error) {
    const fallback = `${getAssistantResponse(question)}\n\nAI server note: ${error.message}`;
    updateChatMessage(loadingMessage, fallback);
    assistantHistory.push({ role: "assistant", content: fallback });
  }

  assistantHistory = assistantHistory.slice(-12);
}

function clearForm() {
  form.reset();
  latestReport = null;
  fileStatus.textContent = "Supports PDF, DOCX, TXT, RTF, HTML, CSV, JPG, PNG, WEBP, BMP";
  setExtractionStatus("Ready to import a resume.", 0);
  scoreValue.textContent = "0";
  scoreStatus.textContent = "Add your resume to begin";
  riskStatus.textContent = "Unknown";
  riskText.textContent = "Run a scan to see whether your resume is ready for ATS filters.";
  riskCard.className = "risk-card";
  meterFill.style.width = "0%";
  keywordScoreEl.textContent = "0%";
  sectionScoreEl.textContent = "0%";
  formatScoreEl.textContent = "0%";
  setMeter(keywordMeter, 0);
  setMeter(sectionMeter, 0);
  setMeter(formatMeter, 0);
  summaryText.textContent = "Your results will appear after analysis.";
  missingKeywordsEl.innerHTML = "<span>No analysis yet</span>";
  checklistEl.innerHTML = "<span>Run a check to see readiness items.</span>";
  recommendationsEl.innerHTML = "<li>Paste your content and run the checker to receive suggestions.</li>";
  nextStepText.textContent = "Start by adding your resume and target job description.";
  updateTextStats();
  updatePhases(0);
}

function loadSample() {
  resumeInput.value = sampleResume;
  jobInput.value = sampleJob;
  fileStatus.textContent = "Sample resume loaded";
  setExtractionStatus("Sample content is ready for scoring.", 100);
  updateTextStats();
  analyzeResume();
}

async function importResumeFile(file) {
  if (!file) {
    return;
  }

  isExtracting = true;
  resumeFile.disabled = true;
  fileStatus.textContent = `${file.name} selected`;
  setExtractionStatus("Preparing document extraction...", 10);

  try {
    const extractedText = await extractResumeText(file);
    resumeInput.value = extractedText.trim();
    fileStatus.textContent = `${file.name} imported`;
    setExtractionStatus(`Imported ${countWords(extractedText)} words from ${file.name}.`, 100);
    scheduleLiveAnalysis();
  } catch (error) {
    fileStatus.textContent = "Import failed";
    setExtractionStatus(error.message, 0);
  } finally {
    isExtracting = false;
    resumeFile.disabled = false;
    resumeFile.value = "";
  }
}

function handleFileInput() {
  const [file] = resumeFile.files;
  importResumeFile(file);
}

function handleDragOver(event) {
  event.preventDefault();
  if (!isExtracting) {
    dropZone.classList.add("dragging");
  }
}

function handleDragLeave() {
  dropZone.classList.remove("dragging");
}

function handleDrop(event) {
  event.preventDefault();
  dropZone.classList.remove("dragging");

  if (isExtracting) {
    return;
  }

  const [file] = event.dataTransfer.files;
  importResumeFile(file);
}

async function copyTips() {
  const text = buildReportText();
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.top = "-1000px";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy tips";
  }, 1400);
}

function downloadReport() {
  const blob = new Blob([buildReportText()], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ats-resume-checker-report.txt";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

form.addEventListener("submit", analyzeResume);
resumeInput.addEventListener("input", scheduleLiveAnalysis);
jobInput.addEventListener("input", scheduleLiveAnalysis);
generateJobButton.addEventListener("click", generateJobDescription);
enhanceJobButton.addEventListener("click", enhanceJobDescription);
resumeFile.addEventListener("change", handleFileInput);
dropZone.addEventListener("dragover", handleDragOver);
dropZone.addEventListener("dragleave", handleDragLeave);
dropZone.addEventListener("drop", handleDrop);
clearButton.addEventListener("click", clearForm);
sampleButton.addEventListener("click", loadSample);
copyButton.addEventListener("click", copyTips);
downloadButton.addEventListener("click", downloadReport);
generateResumeButton.addEventListener("click", generateResumeFromBuilder);
sendToCheckerButton.addEventListener("click", sendGeneratedResumeToChecker);
downloadResumeButton.addEventListener("click", downloadGeneratedResume);
addTrackerButton.addEventListener("click", addTrackerItem);
askAssistantButton.addEventListener("click", () => askAssistant());
assistantInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    askAssistant();
  }
});
promptChips.forEach((button) => {
  button.addEventListener("click", () => askAssistant(button.dataset.prompt));
});
updateTextStats();
renderTracker();
if (window.lucide) {
  window.lucide.createIcons();
}

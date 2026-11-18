const groups = ["faculty", "departments", "researchAreas", "publications", "projects", "facilities"];

function allRecords(kb) {
  return groups.flatMap(type => (kb[type] || []).map(item => ({ ...item, _type: type })));
}
function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}
function includesQuery(record, q) {
  const haystack = normalize([
    record.name, record.title, record.description, record.email, record.department,
    record.expertise, record.area, record.status, record.year, record.equipment,
    ...(record.keywords || [])
  ].join(" "));
  return q.split(" ").filter(Boolean).some(token => haystack.includes(token));
}
export function searchKnowledge(kb, query) {
  const q = normalize(query);
  if (!q) return [];
  return allRecords(kb).filter(record => includesQuery(record, q)).slice(0, 20);
}
function byIds(items, ids = []) {
  return (ids || []).map(id => items.find(x => x.id === id)).filter(Boolean);
}
function facultyDetails(kb, f) {
  return {
    ...f,
    departmentInfo: kb.departments.find(d => d.id === f.departmentId) || null,
    researchAreas: byIds(kb.researchAreas, f.researchAreaIds),
    publications: byIds(kb.publications, f.publicationIds),
    projects: byIds(kb.projects, f.projectIds),
    facilities: byIds(kb.facilities, f.facilityIds)
  };
}
export function getStats(kb) {
  return {
    faculty: kb.faculty.length,
    departments: kb.departments.length,
    researchAreas: kb.researchAreas.length,
    publications: kb.publications.length,
    projects: kb.projects.length,
    facilities: kb.facilities.length
  };
}
export function answerQuestion(kb, question) {
  const q = normalize(question);
  const lower = q;
  let type = null;
  if (/\b(publication|paper|journal|authored|published)\b/.test(lower)) type = "publications";
  else if (/\b(project|funded|ongoing|completed)\b/.test(lower)) type = "projects";
  else if (/\b(facilit|laborator|lab|equipment|instrument)\b/.test(lower)) type = "facilities";
  else if (/\b(department|school)\b/.test(lower)) type = "departments";
  else if (/\b(faculty|professor|expert|speciali|who works|researcher)\b/.test(lower)) type = "faculty";

  const records = allRecords(kb);
  const tokens = q.split(" ").filter(t => t.length > 2 && ![
    "who","what","which","show","list","tell","about","find","give","does","work","works",
    "with","from","the","for","are","and","has","have","faculty","members","related"
  ].includes(t));
  let candidates = records.filter(r => (!type || r._type === type) && tokens.some(t => normalize(JSON.stringify(r)).includes(t)));
  if (!candidates.length) candidates = records.filter(r => tokens.some(t => includesQuery(r, t)));
  candidates = candidates.slice(0, 8);

  // If a faculty member is found, expand its linked knowledge graph neighborhood.
  const facultyMatches = candidates.filter(x => x._type === "faculty");
  const expanded = facultyMatches.map(f => facultyDetails(kb, f));
  const response = candidates.map(({ _type, ...item }) => ({ type: _type, ...item }));

  let answer;
  if (!candidates.length) {
    answer = "I could not find a direct match in the current knowledge base. Try a faculty name, research topic such as AI or IoT, or a category such as publications, projects, or facilities.";
  } else {
    const labels = [...new Set(candidates.map(x => x._type))].join(", ");
    answer = `I found ${candidates.length} relevant record(s) in ${labels}. The results below are matched from the university knowledge base.`;
  }
  return { question, answer, results: response, facultyProfiles: expanded, stats: getStats(kb) };
}

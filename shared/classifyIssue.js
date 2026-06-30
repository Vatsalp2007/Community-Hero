import { ISSUE_CATEGORIES } from "./constants.js";

export function classifyFromVisionResponse(visionResponse) {
  if (!visionResponse) return getDefaultClassification();
  
  const labels = [
    ...(visionResponse.labelAnnotations || []).map(l => l.description.toLowerCase()),
    ...(visionResponse.localizedObjectAnnotations || []).map(o => o.name.toLowerCase())
  ];
  
  let bestMatch = { category: "other", score: 0, confidence: 0 };
  
  for (const [categoryKey, categoryData] of Object.entries(ISSUE_CATEGORIES)) {
    if (categoryKey === "other") continue;
    let score = 0;
    
    for (const visionLabel of labels) {
      for (const keyword of categoryData.visionLabels) {
        if (visionLabel.includes(keyword) || keyword.includes(visionLabel)) {
          const labelObj = visionResponse.labelAnnotations?.find(
            l => l.description.toLowerCase().includes(keyword)
          );
          score += labelObj?.score || 0.5;
        }
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { category: categoryKey, score, confidence: Math.min(score * 100, 99) };
    }
  }
  
  const category = bestMatch.category;
  const categoryData = ISSUE_CATEGORIES[category];
  
  const severity = getSeverityFromCategory(category, bestMatch.confidence);
  
  return {
    category,
    categoryLabel: categoryData.label,
    department: categoryData.department,
    severity,
    confidence: Math.round(bestMatch.confidence),
    suggestedTitle: generateTitle(category),
    labels: labels.slice(0, 5)
  };
}

function getSeverityFromCategory(category, confidence) {
  const baseSeverity = {
    manhole: 5, pothole: 4, water_leak: 3,
    streetlight: 3, road_damage: 3, garbage: 2, other: 2
  };
  return baseSeverity[category] || 2;
}

function generateTitle(category) {
  const titles = {
    pothole: "Pothole on road",
    streetlight: "Broken streetlight",
    water_leak: "Water leakage reported",
    garbage: "Garbage/waste accumulation",
    manhole: "Open manhole — danger",
    road_damage: "Road damage reported",
    other: "Civic issue reported"
  };
  return titles[category] || "Issue reported";
}

function getDefaultClassification() {
  return {
    category: "other", categoryLabel: "Other Issue",
    department: "other", severity: 2, confidence: 0,
    suggestedTitle: "Civic issue reported", labels: []
  };
}

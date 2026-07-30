import re

with open('admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add global variables
vars_insert = """
let dtfPlacements = ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
let embPlacements = ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
"""
js = js.replace('let categories2ndLayer = [', vars_insert + 'let categories2ndLayer = [')

# Add render logic
render_logic = """
function renderBrandingPlacements() {
  const dtfList = document.getElementById("cmsDtfPlacementList");
  const embList = document.getElementById("cmsEmbPlacementList");
  if(dtfList) {
    dtfList.innerHTML = dtfPlacements.map((p, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; border-bottom: 1px solid #eee;">
        <span style="font-size: 13px;">${p}</span>
        <button type="button" onclick="deletePlacement('dtf', ${idx})" style="background: none; border: none; color: #d00; font-size: 11px; cursor: pointer;">Remove</button>
      </div>
    `).join("");
  }
  if(embList) {
    embList.innerHTML = embPlacements.map((p, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; border-bottom: 1px solid #eee;">
        <span style="font-size: 13px;">${p}</span>
        <button type="button" onclick="deletePlacement('emb', ${idx})" style="background: none; border: none; color: #d00; font-size: 11px; cursor: pointer;">Remove</button>
      </div>
    `).join("");
  }
}

window.deletePlacement = function(type, idx) {
  if (confirm("Remove this placement?")) {
    if (type === 'dtf') dtfPlacements.splice(idx, 1);
    else embPlacements.splice(idx, 1);
    renderBrandingPlacements();
  }
};
"""
js = js.replace('function renderCmsCategoryLists() {', render_logic + '\nfunction renderCmsCategoryLists() {')

# Add initialization to fetchSettings
init_logic = """
      if (settings.brandingSettings) {
        if (settings.brandingSettings.dtfPlacements) dtfPlacements = settings.brandingSettings.dtfPlacements;
        if (settings.brandingSettings.embPlacements) embPlacements = settings.brandingSettings.embPlacements;
      }
      renderBrandingPlacements();
"""
js = js.replace('renderCmsCategoryLists();\n\n      document.getElementById("settingPromoBanner")', 'renderCmsCategoryLists();\n' + init_logic + '\n      document.getElementById("settingPromoBanner")')
js = js.replace('renderCmsCategoryLists();\n    }', 'renderCmsCategoryLists();\n      renderBrandingPlacements();\n    }')
js = js.replace('renderCmsCategoryLists();\n  }\n}', 'renderCmsCategoryLists();\n    renderBrandingPlacements();\n  }\n}')

# Add event listeners for add buttons
event_listeners = """
document.getElementById("addDtfPlacementBtn")?.addEventListener("click", () => {
  const input = document.getElementById("newDtfPlacementInput");
  const val = input?.value.trim();
  if (val) { dtfPlacements.push(val); input.value = ""; renderBrandingPlacements(); }
});
document.getElementById("addEmbPlacementBtn")?.addEventListener("click", () => {
  const input = document.getElementById("newEmbPlacementInput");
  const val = input?.value.trim();
  if (val) { embPlacements.push(val); input.value = ""; renderBrandingPlacements(); }
});
"""
js = js.replace('async function fetchSettings() {', event_listeners + '\nasync function fetchSettings() {')

# Add payload update
old_branding_settings = """brandingSettings: {
      defaultPlacements: document.getElementById("settingDefaultPlacements")?.value.split(",").map(p => p.trim()).filter(Boolean) || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"],
      dtfHelperNote: document.getElementById("settingDtfNote")?.value || "",
      embroideryHelperNote: document.getElementById("settingEmbroideryNote")?.value || ""
    }"""
new_branding_settings = """brandingSettings: {
      dtfPlacements: dtfPlacements,
      embPlacements: embPlacements,
      dtfHelperNote: document.getElementById("settingDtfNote")?.value || "",
      embroideryHelperNote: document.getElementById("settingEmbroideryNote")?.value || ""
    }"""
js = js.replace(old_branding_settings, new_branding_settings)

with open('admin.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated admin.js with branding placement logic.")

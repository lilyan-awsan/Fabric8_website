import sys

with open('site.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update applySiteSettings to inject into branding-studio.html
branding_studio_logic = """
  // 8. Branding Studio Placements (branding-studio.html)
  const bs = siteSettings.brandingSettings || {};
  const dtfSelect = document.getElementById('dtfPlacementSelect');
  if (dtfSelect && bs.dtfPlacements) {
    dtfSelect.innerHTML = bs.dtfPlacements.map(p => `<option value="${p.toLowerCase().replace(/ /g, '-')}">${p}</option>`).join("");
  }
  const embSelect = document.getElementById('embPlacementSelect');
  if (embSelect && bs.embPlacements) {
    embSelect.innerHTML = bs.embPlacements.map(p => `<option value="${p.toLowerCase().replace(/ /g, '-')}">${p}</option>`).join("");
  }
}
"""
js = js.replace('}\n\n\nasync function loadProducts()', branding_studio_logic + '\n\nasync function loadProducts()')


# 2. Update initProductPage to use the new settings
old_placements = """      const defaultPlacements = siteSettings?.brandingSettings?.defaultPlacements || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
      const logoPlacement = document.getElementById("pageLogoPlacementContainer");
      if (logoPlacement) logoPlacement.innerHTML = renderRadioGroup("pageLogoPlacement", p.supportedPlacements || defaultPlacements);

      const textPlacement = document.getElementById("pageTextPlacementContainer");
      if (textPlacement) textPlacement.innerHTML = renderRadioGroup("pageTextPlacement", p.supportedPlacements || defaultPlacements);"""

new_placements = """      const bs = siteSettings?.brandingSettings || {};
      const dtfPlacements = bs.dtfPlacements || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
      const embPlacements = bs.embPlacements || ["Left Chest", "Right Chest", "Center Back", "Upper Sleeve"];
      
      const logoPlacement = document.getElementById("pageLogoPlacementContainer");
      if (logoPlacement) logoPlacement.innerHTML = renderRadioGroup("pageLogoPlacement", p.supportedPlacements || dtfPlacements);

      const textPlacement = document.getElementById("pageTextPlacementContainer");
      if (textPlacement) textPlacement.innerHTML = renderRadioGroup("pageTextPlacement", p.supportedPlacements || embPlacements);"""

js = js.replace(old_placements, new_placements)

with open('site.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Updated site.js with dynamic placement bindings.")

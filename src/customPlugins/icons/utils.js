export function setViewBoxWidthSvgByG(svg, addWidth) {
  const svgChild_g = svg.querySelector("svg > g");
  const svgChild_gWidth = svgChild_g.getBBox().width;
  const viewBox = svg.getAttribute("viewBox");
  const viewBoxValues = viewBox.split(" ");

  if (!(viewBoxValues.length === 4 && viewBoxValues[2])) {
    return;
  }
  const widthSvg = Math.floor(svgChild_gWidth + (addWidth || 0)).toString();
  viewBoxValues[2] = widthSvg;
  const newViewBox = viewBoxValues.join(" ");
  svg.setAttribute("viewBox", newViewBox);
  svg.setAttribute("width", widthSvg);
}

export function replaceElemAttr(reg, elem, attr, replacement) {
  if (!elem) {
    return;
  }
  const elemAttrD = elem.getAttribute(attr);
  const newValue = reg ? elemAttrD.replace(reg, replacement) : replacement;
  elem.setAttribute(attr, newValue);
}

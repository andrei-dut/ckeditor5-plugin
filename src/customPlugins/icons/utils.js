export function dataSvgToXml(key, values = {}) {
  console.log(values);
  switch (key) {
    case "mult1":
      return {
        name: key,
        value: `${values.aa || "aa"} <R${values.bb || "bb"}!${values.cc || "cc"}> `,
      };
    case "mult2":
      return {
        name: key,
        value: `${values.aa || "aa"} <Q${values.bb || "bb"}!${values.cc || "cc"}> `,
      };
    case "roughness":
      {
        const keys = Object.keys(values);
        let xxString = "";
        keys.forEach((el) => {
          if (el.includes("x")) xxString += `!${values[el]}`;
        });
        const valSymbol = {
          "\u2534": "12",
          x: "13",
        };
        const type = values.type;
        const typeRoug = type === "ra1" ? `$Ro0` :  type === "ra2"  ? "$Ro1" : "$Ro2";
        return `<${typeRoug}!${values.y}!${valSymbol[values.z] || values.z}${xxString}>`;

      }

    default:
      return {};
  }
}
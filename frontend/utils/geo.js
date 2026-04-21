export async function fetchGeoData() {
    const worldUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
    const algeriaUrl = "https://cdn.jsdelivr.net/gh/clm-m/algeria-geojson@master/algeria.json";

    const [worldResponse, algeriaResponse] = await Promise.all([
        fetch(worldUrl),
        fetch(algeriaUrl)
    ]);

    const worldData = await worldResponse.json();
    const algeriaData = await algeriaResponse.json();

    console.log("Geo Data Loaded - World:", !!worldData, "Algeria:", !!algeriaData);

    return {
        world: worldData,
        algeria: algeriaData
    };
}

export function getWilayaCentroid(feature) {
    return d3.geoCentroid(feature);
}

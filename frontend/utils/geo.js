export async function fetchGeoData() {
    // Using local data as requested
    const worldUrl = "./data/countries-110m.json";
    const algeriaUrl = "./data/all-wilayas.geojson";

    const results = { world: null, algeria: null };

    try {
        const worldResp = await fetch(worldUrl);
        if (worldResp.ok) results.world = await worldResp.json();
        else console.warn("Local world map load failed", worldResp.status);
    } catch (e) { console.error("World map error", e); }

    try {
        const algeriaResp = await fetch(algeriaUrl);
        if (algeriaResp.ok) results.algeria = await algeriaResp.json();
        else console.warn("Local algeria map load failed", algeriaResp.status);
    } catch (e) { console.error("Algeria map error", e); }

    return results;
}

"use strict";

const axios = require("axios");
const { MAPBOX_TOKEN } = require("../config");

/**
 * Geocodes an address using the Mapbox Geocoding API.
 * Returns { latitude, longitude } or { latitude: null, longitude: null }
 * if the address cannot be resolved.
 */
async function geocodeAddress(address) {
  if (!MAPBOX_TOKEN) {
    console.warn("MAPBOX_TOKEN not set — skipping geocoding.");
    return { latitude: null, longitude: null };
  }

  const encoded = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

  const response = await axios.get(url);
  const features = response.data.features;

  if (!features || features.length === 0) {
    return { latitude: null, longitude: null };
  }

  const [longitude, latitude] = features[0].center;
  return { latitude, longitude };
}

module.exports = { geocodeAddress };

/* eslint-disable */
import * as maptilersdk from '@maptiler/sdk';

export const displayMap = (locations) => {
  maptilersdk.config.apiKey = '1n95NLWIxWILYCJo6J8T';

  const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.STREETS,
    scrollZoom: false,
    //   center: [16.62662018, 49.2125578],
    zoom: 12,
  });

  const bounds = new maptilersdk.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new maptilersdk.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new maptilersdk.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

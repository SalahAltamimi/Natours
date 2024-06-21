// import L from 'leaflet';

export const mapBox = (locations) => {
  const [lat, lng] = locations[0].coordinates;
  const map = L.map('map').setView([lng, lat], 9);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  locations.forEach((el) => {
    const [lat, lng] = el.coordinates;
    L.marker([lng, lat])
      .addTo(map)
      .bindPopup(`<p>day:${el.day} ${el.description}</p>`)
      .openPopup();
  });
};

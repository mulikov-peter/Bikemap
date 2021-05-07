import L from 'leaflet';
import data from '../../data.json';

const pointsList = document.querySelector('.points');
const sidebar = document.querySelector('.sidebar');
const arrow = document.querySelector('.arrow');
const btnClose = document.querySelector('.btn-close');

export class App {
  _map;
  _mapZoomLevel = 13;
  _placePoints = data;
  _markers = [];

  constructor() {
    this._getPosition();
    pointsList.addEventListener('click', this._moveToPopup.bind(this));
  }

  // Get user's position
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position'); // To do
          console.log('Could not get your position');
        }
      );
  }

  // Load map
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    this._map = L.map('map').setView(coords, this._mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    L.marker(coords)
      .addTo(this._map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 100,
          autoClose: true,
          closeOnClick: false,
          className: `user-popup`,
        })
      )
      .setPopupContent('Here you are')
      .openPopup();

    // Render place-point marker after loading
    this._placePoints.forEach(placePoint => {
      this._renderPlaceMarker(placePoint);
    });

    this._placePoints.forEach(placePoint => {
      this._renderPlacePoint(placePoint);
    });
  }

  _renderPlaceMarker(placePoint) {
    // Display Marker on the map
    const marker = L.marker(placePoint.coords)
      .addTo(this._map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${placePoint.type}-popup`,
        })
      )
      .setPopupContent(`${placePoint.title}`)
      .openPopup();
    this._markers.push(marker);
    placePoint.markerId = marker._leaflet_id;
  }

  _renderPlacePoint(placePoint) {
    let html = `
      <li class="point point--${placePoint.type}" data-id="${placePoint.id}">
        <div class="point__details">
          <span class="point__icon">
            ${
              placePoint.type === 'store'
                ? `<i class='fas fa-store'></i>`
                : placePoint.type === 'service'
                ? `<i class="fas fa-tools"></i>`
                : `<i class='fas fa-wrench'></i>`
            }
          </span>
          <span class="point__title">${placePoint.title}</span>
        `;
    if (placePoint.type === 'store' || placePoint.type === 'service')
      html += `
            <span class="point__website">
              <a href="${placePoint.website}" target="_blank">${placePoint.website}</a>
            </span>
          </div>
      </li>
          `;
    if (placePoint.type === 'selfservice')
      html += `
            <span class="point__description">${placePoint.description}</span>
        </div>
      </li>
    `;
    pointsList.insertAdjacentHTML('afterbegin', html);
  }

  _moveToPopup(e) {
    if (!this._map) return;

    const placePointEl = e.target.closest('.point');

    if (!placePointEl) return;

    const placePoint = this._placePoints.find(
      point => point.id === +placePointEl.dataset.id
    );

    this._map.setView(placePoint.coords, this._mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

const toggleClasses = () => {
  sidebar.classList.toggle('closed');
  pointsList.classList.toggle('hidden');
  arrow.classList.toggle('hidden');
  btnClose.classList.toggle('hidden');
};

arrow.addEventListener('click', toggleClasses);

btnClose.addEventListener('click', toggleClasses);

// =================
// Get position of marker
//  console.log(L.marker(coords).getLatLng());

//       L.marker([50, 19.9])
//         .addTo(map)
//         .on('click', function () {
//           console.log('click', L.marker(this._latlng).getLatLng());
//         });

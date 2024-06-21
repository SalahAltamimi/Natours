import '@babel/polyfill';
import { mapBox } from './map';
import { login, logout } from './login';
import { updateSitting } from './updateDate';
import { CheckOuts } from './stripe';

const locations = document.getElementById('map');
const book = document.getElementById('book');
const form = document.querySelector('.from_login');
const formdata = document.querySelector('.form-user-data');
const formdatasettings = document.querySelector('.form-user-settings');
const nav__logout = document.querySelector('.nav__logout');

if (locations) {
  mapBox(JSON.parse(locations.dataset.locations));
}
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (nav__logout)
  nav__logout.addEventListener('click', (e) => {
    logout();
  });

if (formdata)
  formdata.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // const photo = document.getElementById('photo').files[0];
    // updateSitting({ name, email, photo }, 'data');
    updateSitting(form, 'data');
  });
if (formdatasettings)
  formdatasettings.addEventListener('submit', (e) => {
    e.preventDefault();
    const currenpassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfrim = document.getElementById('password-confirm').value;
    updateSitting({ currenpassword, password, passwordConfrim }, 'password');

    document.getElementById('password-current').value =
      document.getElementById('password').value =
      document.getElementById('password-confirm').value =
        '';
  });

if (book) {
  book.addEventListener('click', (e) => {
    e.preventDefault();
    const { tourId } = e.target.dataset;

    CheckOuts(tourId);
  });
}

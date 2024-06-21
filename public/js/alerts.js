const hide = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

export const showmsg = (type, msg) => {
  hide();
  const x = `<p class="alert alert--${type}">${msg}</p>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', x);
  window.setTimeout(hide, 3000);
};

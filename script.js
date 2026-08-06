document.querySelectorAll('.button').forEach((button) => {
  button.addEventListener('click', () => {
    if (navigator.vibrate) navigator.vibrate(18);
  });
});

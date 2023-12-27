/* eslint no-param-reassign: ["error", { "props": false }] */

export const failNotification = (form, feedback, message) => {
  form.classList.add('is-invalid');
  feedback.classList.replace('text-success', 'text-danger');
  feedback.textContent = message;
};

export const successNotification = (form, feedback, message) => {
  form.classList.remove('is-invalid');
  form.value = '';
  feedback.classList.replace('text-danger', 'text-success');
  feedback.textContent = message;
  form.focus();
};

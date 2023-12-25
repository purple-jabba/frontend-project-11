/* eslint no-param-reassign: ["error", { "props": false }] */

const invalidForm = (form, feedback) => {
  form.classList.add('is-invalid');
  feedback.textContent = 'Ссылка должна быть валидным URL';
};

export default invalidForm;

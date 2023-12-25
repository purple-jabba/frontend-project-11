import onChange from 'on-change';
import * as yup from 'yup';
import invalidForm from './render.js';

const validateUrl = (url, urls) => {
  const schema = yup.string().trim()
    .required('form is empty')
    .url('invalid form')
    .notOneOf(urls, 'url already exists');
  return schema.validate(url);
};

export default () => {
  const defaultLanguage = 'ru';

  const elements = {
    form: document.querySelector('.rss-form'),
    ButtonForm: document.querySelector('.btn-lg'),
    inputForm: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const initialState = {
    lng: defaultLanguage,
    form: {
      process: {
        state: '',
      },
    },
    urlFeeds: [],
    feeds: [],
    posts: [],
    errors: [],
  };

  const state = onChange(initialState, (path) => {
    switch (path) {
      case 'errors':
        invalidForm(elements.inputForm, elements.feedback);
        break;
      default: throw new Error(`Path doesn't exist ${path}`);
    }
  });

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = elements.inputForm.value;
    validateUrl(url, state.urlFeeds)
      .then((response) => state.urlFeeds.push(response))
      .catch((error) => state.errors.push(error.message))
      .then(console.log(state));
  });
};

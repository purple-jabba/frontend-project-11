import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import { invalidForm, successAdd } from './render.js';

const validateUrl = (url, urls) => {
  const schema = yup.string().trim()
    .required('empty-form')
    .url('invalid-form')
    .notOneOf(urls, 'url-already-exists');
  return schema.validate(url);
};

export default () => {
  const defaultLanguage = 'ru';

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    ButtonForm: document.querySelector('.btn-lg'),
    inputForm: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const initialState = {
    lng: defaultLanguage,
    form: {
      processState: 'initial',
      feedUrls: [],
      feeds: [],
      posts: [],
      error: 'none',
    },
  };

  const state = onChange(initialState, (path, value) => {
    console.log(value);
    switch (path) {
      case 'form.processState':
        break;
      case 'form.feedUrls':
        successAdd(elements.inputForm, elements.feedback, i18nextInstance.t('success'));
        break;
      case 'form.error':
        invalidForm(elements.inputForm, elements.feedback, value);
        break;
      default: throw new Error(`Path doesn't exist ${path}`);
    }
  });

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = elements.inputForm.value;
    validateUrl(url, state.form.feedUrls)
      .then((response) => {
        state.form.processState = 'loading';
        state.form.feedUrls.push(response);
        axios.get(response)
          .then((responses) => responses.text())
          .then((str) => new window.DOMParser().parseFromString(str, 'text/xml'))
          .then((data) => console.log(data));
      })
      .catch((error) => {
        state.form.processState = 'error';
        const { message } = error;
        switch (message) {
          case 'empty-form':
            state.form.error = i18nextInstance.t('fail.emptyForm');
            break;
          case 'invalid-form':
            state.form.error = i18nextInstance.t('fail.invalid');
            break;
          case 'url-already-exists':
            state.form.error = i18nextInstance.t('fail.alreadyExists');
            break;
          default: throw new Error(`Message doesn't exist ${error.message}`);
        }
      });
  });
};

import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import * as render from './render.js';
import parser from './parser.js';

const validateUrl = (url, urls) => {
  const schema = yup.string().trim()
    .required('form is empty')
    .url('form is invalid')
    .notOneOf(urls, 'url already exists');
  return schema.validate(url);
};

const getExistingPostsTitles = (state) => state.form.posts.map((post) => post.title);

const addNewPosts = (existingPostsTitles, state, posts) => {
  const newPosts = [];
  posts.forEach((post) => {
    if (!existingPostsTitles.includes(post.title)) {
      newPosts.push(post);
    }
  });
  state.form.posts.unshift(...newPosts);
};

const updatePosts = (state) => {
  const promises = state.feedUrls.map((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      const existingPostsTitles = getExistingPostsTitles(state);
      const xml = response.data.contents;
      const { posts } = parser(xml);
      addNewPosts(existingPostsTitles, state, posts);
    }));
  return Promise.all(promises);
};

const setUpdateTracker = (state, delay = 5000) => {
  updatePosts(state)
    .then(() => setTimeout(setUpdateTracker, delay, state));
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
    feedUrls: [],
    processState: 'initial',
    form: {
      feeds: [],
      posts: [],
      error: 'none',
    },
  };

  const state = onChange(initialState, (path, value) => {
    switch (path) {
      case 'processState':
        break;
      case 'form.feeds':
        render.userInterfaceFeeds(value, i18nextInstance);
        break;
      case 'form.posts':
        render.userInterfacePosts(value, i18nextInstance);
        console.log(value);
        break;
      case 'feedUrls':
        render.successNotification(elements.inputForm, elements.feedback, i18nextInstance.t('successMessage'));
        break;
      case 'form.error':
        render.failNotification(elements.inputForm, elements.feedback, value);
        break;
      default: throw new Error(`Path doesn't exist ${path}`);
    }
  });

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = elements.inputForm.value;
    validateUrl(url, state.feedUrls)
      .then(() => {
        state.processState = 'loading';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => {
        state.processState = 'loaded';
        const xml = response.data.contents;
        const { feed, posts } = parser(xml);
        state.feedUrls.push(url);
        state.form.feeds.push(feed);
        state.form.posts.push(...posts);
        setUpdateTracker(state);
      })
      .catch((error) => {
        state.processState = 'error';
        const { message } = error;
        switch (message) {
          case 'form is empty':
            state.form.error = i18nextInstance.t('failMessages.emptyForm');
            break;
          case 'form is invalid':
            state.form.error = i18nextInstance.t('failMessages.invalid');
            break;
          case 'url already exists':
            state.form.error = i18nextInstance.t('failMessages.alreadyExists');
            break;
          case 'Network Error':
            state.form.error = i18nextInstance.t('failMessages.networkError');
            break;
          case 'rss is not found':
            state.form.error = i18nextInstance.t('failMessages.notContainRss');
            break;
          default: throw new Error(`Message doesn't exist ${error.message}`);
        }
      });
  });
};

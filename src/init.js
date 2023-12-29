/* eslint no-param-reassign: ["error", { "props": false }] */
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { isEmpty } from 'lodash';
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

const getPostsTitles = (posts) => posts.map((post) => post.title);
const getPostsIds = (posts) => posts.map((post) => post.id);

const addUiStateForPosts = (state, posts) => {
  const result = [];
  const postsIds = getPostsIds(posts);
  const existingIds = getPostsIds(state.uiState.postsState);
  postsIds.forEach((postId) => {
    if (!existingIds.includes(postId)) {
      result.push({ postId, watched: false });
    }
  });
  if (isEmpty(result)) {
    return;
  }
  state.uiState.postsState.push(...result);
};

const addClickEventListener = (posts, state) => {
  const postsIds = getPostsIds(posts);
  postsIds.forEach((postId) => {
    const post = document.querySelector(`li[id='${postId}']`);
    const a = post.querySelector('a');
    const button = post.querySelector('button');
    a.addEventListener('click', () => {
      state.uiState.postsState.forEach((postState) => {
        if (postState.postId === postId) {
          postState.watched = true;
        }
      });
    });
    button.addEventListener('click', () => {
      state.uiState.postsState.forEach((postState) => {
        if (postState.postId === postId) {
          postState.watched = true;
        }
      });
    });
  });
};

const addNewPosts = (existingPostsTitles, state, posts) => {
  const newPosts = [];
  posts.forEach((post) => {
    if (!existingPostsTitles.includes(post.title)) {
      newPosts.push(post);
    }
  });
  if (isEmpty(newPosts)) {
    return;
  }
  state.form.posts.unshift(...newPosts);
  addUiStateForPosts(state, newPosts);
  addClickEventListener(newPosts, state);
};

const updatePosts = (state) => {
  const promises = state.feedUrls.map((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      const existingPostsTitles = getPostsTitles(state.form.posts);
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
    buttonForm: document.querySelector('.btn-lg'),
    inputForm: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelectorAll('.list-group-item'),
    modal: {
      content: document.querySelector('.modal-content'),
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      fullArticle: document.querySelector('.full-article'),
    },
  };

  const initialState = {
    lng: defaultLanguage,
    feedUrls: [],
    watchedArticles: [],
    modalInformation: {},
    processState: 'initial',
    form: {
      feeds: [],
      posts: [],
      error: 'none',
    },
    uiState: {
      postsState: [],
    },
  };

  const state = onChange(initialState, (path, value) => {
    switch (path) {
      case 'processState':
        render.submitInterface(value, elements.inputForm, elements.buttonForm, elements.feedback);
        break;
      case 'form.feeds':
        render.userInterfaceFeeds(value, i18nextInstance);
        break;
      case 'form.posts':
        render.userInterfacePosts(value, i18nextInstance);
        break;
      case 'uiState.postsState':
        render.watchedArticles(value, state);
        break;
      case 'feedUrls':
        render.successNotification(elements.inputForm, elements.feedback, i18nextInstance.t('successMessage'));
        break;
      case 'watchedArticles':
        console.log(value);
        render.watchedArticles(value);
        break;
      case 'form.error':
        render.failNotification(elements.feedback, value);
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
        addUiStateForPosts(state, posts);
        addClickEventListener(posts, state);
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

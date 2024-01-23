/* eslint no-param-reassign: ["error", { "props": false }] */
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import resources from './locales/index.js';
import render from './render.js';
import parser from './parser.js';

const validateUrl = (url, urls) => {
  const schema = yup.string().trim()
    .required('form is empty')
    .url('form is invalid')
    .notOneOf(urls, 'url already exists');
  return schema.validate(url);
};

const getUrls = (coll) => coll.map((item) => item.url);

const getProxyForUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const getPostsTitles = (posts) => posts.map((post) => post.title);

const createIdsForPosts = (items) => {
  items.forEach((item) => {
    const itemId = uniqueId();
    item.id = itemId;
  });
};

const addNewPosts = (existingPostsTitles, state, posts) => {
  const newPosts = [];
  posts.forEach((post) => {
    if (!existingPostsTitles.includes(post.title)) {
      newPosts.push(post);
    }
  });
  state.uiState.posts.data.unshift(...newPosts);
};

const updatePosts = (state) => {
  const urls = getUrls(state.uiState.feeds);
  const promises = urls.map((url) => axios.get(getProxyForUrl(url))
    .then((response) => {
      const existingPostsTitles = getPostsTitles(state.uiState.posts.data);
      const xml = response.data.contents;
      const { posts } = parser(xml);
      createIdsForPosts(posts);
      addNewPosts(existingPostsTitles, state, posts);
    }));
  return Promise.all(promises);
};

const setUpdateTracker = (state, delay = 5000) => {
  updatePosts(state)
    .finally(() => setTimeout(setUpdateTracker, delay, state));
};

export default () => {
  const defaultLanguage = 'ru';

  const elements = {
    form: document.querySelector('.rss-form'),
    buttonForm: document.querySelector('.btn-lg'),
    inputForm: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    modal: {
      content: document.querySelector('.modal-content'),
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      fullArticle: document.querySelector('.full-article'),
    },
  };

  const initialState = {
    lng: defaultLanguage,
    form: {
      validationState: 'initial',
      feedAdditionState: 'initial',
      error: 'none',
    },
    uiState: {
      feeds: [],
      posts: {
        data: [],
        watchedPostsIds: new Set([]),
      },
      modalId: '',
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  }).then(() => {
    const state = onChange(initialState, render(initialState, elements, i18nextInstance));

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      state.form.validationState = 'processing';
      const url = elements.inputForm.value;
      const urls = getUrls(state.uiState.feeds);
      validateUrl(url, urls)
        .then(() => {
          state.form.validationState = 'finished';
          state.form.feedAdditionState = 'processing';
          return axios.get(getProxyForUrl(url));
        })
        .then((response) => {
          state.form.feedAdditionState = 'finished';
          const xml = response.data.contents;
          const { parsedRss, posts } = parser(xml);
          const feedId = uniqueId();
          const feed = {
            id: feedId,
            title: parsedRss.querySelector('title').textContent,
            description: parsedRss.querySelector('description').textContent,
            url: url.trim(),
          };
          createIdsForPosts(posts);
          state.uiState.feeds.push(feed);
          state.uiState.posts.data.unshift(...posts);
        })
        .catch((error) => {
          const { name } = error;
          switch (name) {
            case 'ValidationError':
              state.form.validationState = 'error';
              break;
            case 'ParseError':
              state.form.feedAdditionState = 'error';
              break;
            case 'AxiosError':
              state.form.feedAdditionState = 'error';
              break;
            default: throw new Error(`Name doesn't exist ${error}`);
          }
          state.form.error = error;
        });
    });

    elements.posts.addEventListener('click', (event) => {
      const postId = event.target.id;
      if (postId) {
        state.uiState.posts.watchedPostsIds.add(postId);
        state.uiState.modalId = postId;
      }
    });

    setUpdateTracker(state);
  });
};

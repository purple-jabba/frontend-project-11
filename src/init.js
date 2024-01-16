/* eslint no-param-reassign: ["error", { "props": false }] */
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { isEmpty, uniqueId } from 'lodash';
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

const createIds = (items) => {
  items.forEach((item) => {
    const itemId = uniqueId();
    item.id = itemId;
  });
};
const getPostsTitles = (posts) => posts.map((post) => post.title);
const getPostsIds = (posts) => posts.map((post) => post.id);

const makePostWatched = (state, postId) => {
  state.uiState.postsState.forEach((postState) => {
    if (postState.postId === postId) {
      postState.watched = true;
    }
  });
};

const addDataToModal = (postId, state) => {
  const selectedElement = state.uiState.posts.find((postEl) => postEl.id === postId);
  state.uiState.modal = {
    title: selectedElement.title,
    description: selectedElement.description,
    link: selectedElement.link,
  };
};

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
      makePostWatched(state, postId);
    });
    button.addEventListener('click', () => {
      makePostWatched(state, postId);
      addDataToModal(postId, state);
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
  state.uiState.posts.unshift(...newPosts);
  addUiStateForPosts(state, newPosts);
  addClickEventListener(newPosts, state);
};

const updatePosts = (state) => {
  const promises = state.uiState.feeds.urls.map((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      const existingPostsTitles = getPostsTitles(state.uiState.posts);
      const xml = response.data.contents;
      const { posts } = parser(xml);
      createIds(posts);
      addNewPosts(existingPostsTitles, state, posts);
      addClickEventListener(state.uiState.posts, state);
    }));
  return Promise.all(promises);
};

const setUpdateTracker = (state, delay = 5000) => {
  updatePosts(state)
    .then(() => setTimeout(setUpdateTracker, delay, state));
};

export default () => {
  const defaultLanguage = 'ru';

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
    form: {
      validationState: 'initial',
      feedAdditionState: 'initial',
      error: 'none',
    },
    uiState: {
      feeds: {
        data: [],
        urls: [],
      },
      posts: [],
      postsState: [],
      modal: {},
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  }).then(() => {
    const state = onChange(initialState, (path, value) => {
      switch (path) {
        case 'form.validationState':
          render.submitInterface(value, elements.inputForm, elements.buttonForm, elements.feedback);
          break;
        case 'form.feedAdditionState':
          render.submitInterface(value, elements.inputForm, elements.buttonForm, elements.feedback);
          break;
        case 'uiState.feeds.data':
          render.userInterfaceFeeds(value, i18nextInstance);
          break;
        case 'uiState.posts':
          render.userInterfacePosts(value, i18nextInstance);
          break;
        case 'uiState.postsState':
          render.watchedArticles(value);
          break;
        case 'uiState.modal':
          render.modal(value);
          break;
        case 'uiState.feeds.urls':
          render.successNotification(elements.inputForm, elements.feedback, i18nextInstance.t('successMessage'));
          break;
        case 'form.error':
          render.failNotification(elements.feedback, value, i18nextInstance);
          break;
        default: throw new Error(`Path doesn't exist ${path}`);
      }
    });

    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const url = elements.inputForm.value;
      state.form.validationState = 'processing';
      validateUrl(url, state.uiState.feeds.urls)
        .then(() => {
          state.form.validationState = 'finished';
          state.form.feedAdditionState = 'processing';
          return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
        })
        .then((response) => {
          state.form.feedAdditionState = 'finished';
          const xml = response.data.contents;
          const { feed, posts } = parser(xml);
          const feedId = uniqueId();
          feed.id = feedId;
          createIds(posts);
          console.log(feed);
          state.uiState.feeds.urls.push(url.trim());
          state.uiState.feeds.data.push(feed);
          state.uiState.posts.unshift(...posts);
          addUiStateForPosts(state, posts);
          addClickEventListener(posts, state);
          setUpdateTracker(state);
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
  });
};

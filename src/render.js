/* eslint no-param-reassign: ["error", { "props": false }] */
const checkCard = (card, title, target) => {
  if (!card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'border-0');
    target.append(cardDiv);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardDiv.append(cardBody);
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = title;
    cardBody.append(cardTitle);
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    cardDiv.append(listGroup);
  }
};

const renderSubmitInterface = (value, form, button, feedback) => {
  switch (value) {
    case 'processing':
      button.classList.add('disabled');
      feedback.classList.remove('text-success', 'text-danger');
      feedback.textContent = '';
      form.classList.remove('is-invalid');
      break;
    case 'finished':
      button.classList.remove('disabled');
      break;
    case 'error':
      form.classList.add('is-invalid');
      button.classList.remove('disabled');
      break;
    default: throw new Error(`Unexpected state of process ${value}`);
  }
};

const renderWatchedArticles = (value) => {
  value.forEach((id) => {
    const a = document.querySelector(`a[id='${id}']`);
    a.classList.remove('fw-bold');
    a.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModal = (value, state) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.querySelector('.modal-body');
  const fullArticleButton = document.querySelector('.full-article');
  const selectedElement = state.uiState.posts.data.find((postEl) => postEl.id === value);
  modalTitle.textContent = selectedElement.title;
  modalDescription.textContent = selectedElement.description;
  fullArticleButton.setAttribute('href', selectedElement.link);
};

const renderFailNotification = (feedback, error, i18nextInstance) => {
  feedback.classList.add('text-danger');
  switch (error.message) {
    case 'form is empty':
      feedback.textContent = i18nextInstance.t('failMessages.emptyForm');
      break;
    case 'form is invalid':
      feedback.textContent = i18nextInstance.t('failMessages.invalid');
      break;
    case 'url already exists':
      feedback.textContent = i18nextInstance.t('failMessages.alreadyExists');
      break;
    case 'Network Error':
      feedback.textContent = i18nextInstance.t('failMessages.networkError');
      break;
    case 'rss is not found':
      feedback.textContent = i18nextInstance.t('failMessages.notContainRss');
      break;
    default: throw new Error(`Message doesn't exist ${error.message}`);
  }
};

const renderSuccessNotification = (form, feedback, message) => {
  form.classList.remove('is-invalid');
  form.value = '';
  feedback.classList.add('text-success');
  feedback.textContent = message;
  form.focus();
};

const renderUserInterfaceFeeds = (value, i18nextInstance) => {
  const feeds = document.querySelector('.feeds');
  const card = feeds.querySelector('.card');
  checkCard(card, i18nextInstance.t('titles.feeds'), feeds);
  const feedList = feeds.querySelector('.list-group');
  value.forEach((feed) => {
    const feedItemById = feedList.querySelector(`[id='${feed.id}']`);
    if (!feedItemById) {
      const li = document.createElement('li');
      li.id = feed.id;
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.title;
      li.append(h3);
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = feed.description;
      li.append(p);
      feedList.prepend(li);
    }
  });
};

const renderUserInterfacePosts = (state, value, i18nextInstance) => {
  const posts = document.querySelector('.posts');
  const card = posts.querySelector('.card');
  checkCard(card, i18nextInstance.t('titles.posts'), posts);
  const postsList = posts.querySelector('.list-group');
  postsList.replaceChildren();
  value.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.id = post.id;
    if (!state.uiState.posts.watchedPostsIds.has(post.id)) {
      a.classList.add('fw-bold');
    } else {
      a.classList.add('fw-normal', 'link-secondary');
    }
    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    li.append(a);
    const button = document.createElement('button');
    button.id = post.id;
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.id = post.id;
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nextInstance.t('watchPost');
    li.append(button);
    postsList.append(li);
  });
};

export default (state, elements, i18nextInstance) => (path, value) => {
  switch (path) {
    case 'form.validationState':
      renderSubmitInterface(value, elements.inputForm, elements.buttonForm, elements.feedback);
      break;
    case 'form.feedAdditionState':
      renderSubmitInterface(value, elements.inputForm, elements.buttonForm, elements.feedback);
      break;
    case 'uiState.feeds':
      renderUserInterfaceFeeds(value, i18nextInstance);
      renderSuccessNotification(elements.inputForm, elements.feedback, i18nextInstance.t('successMessage'));
      break;
    case 'uiState.posts.data':
      renderUserInterfacePosts(state, value, i18nextInstance);
      break;
    case 'uiState.posts.watchedPostsIds':
      renderWatchedArticles(value);
      break;
    case 'uiState.modalId':
      renderModal(value, state);
      break;
    case 'form.error':
      renderFailNotification(elements.feedback, value, i18nextInstance);
      break;
    default: throw new Error(`Path doesn't exist ${path}`);
  }
};

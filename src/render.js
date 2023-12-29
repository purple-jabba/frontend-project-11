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

export const submitInterface = (value, form, button, feedback) => {
  switch (value) {
    case 'loading':
      button.classList.add('disabled');
      feedback.classList.remove('text-success', 'text-danger');
      feedback.textContent = '';
      form.classList.remove('is-invalid');
      break;
    case 'loaded':
      button.classList.remove('disabled');
      break;
    case 'error':
      form.classList.add('is-invalid');
      button.classList.remove('disabled');
      break;
    default: throw new Error(`Unexpected state of process ${value}`);
  }
};

export const watchedArticles = (value, state) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.querySelector('.modal-body');
  const fullArticleButton = document.querySelector('.full-article');
  const watchedTrue = value.filter((post) => post.watched === true);
  watchedTrue.forEach((element) => {
    const data = state.form.posts.find((postEl) => postEl.id === element.postId);
    const post = document.querySelector(`li[id='${element.postId}']`);
    const a = post.querySelector('a');
    a.classList.remove('fw-bold');
    a.classList.add('fw-normal', 'link-secondary');
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    fullArticleButton.setAttribute('href', data.link);
  });
};

export const failNotification = (feedback, message) => {
  feedback.classList.add('text-danger');
  feedback.textContent = message;
};

export const successNotification = (form, feedback, message) => {
  form.classList.remove('is-invalid');
  form.value = '';
  feedback.classList.add('text-success');
  feedback.textContent = message;
  form.focus();
};

export const userInterfaceFeeds = (value, i18nextInstance) => {
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

export const userInterfacePosts = (value, i18nextInstance) => {
  const posts = document.querySelector('.posts');
  const card = posts.querySelector('.card');
  checkCard(card, i18nextInstance.t('titles.posts'), posts);
  const postsList = posts.querySelector('.list-group');
  postsList.replaceChildren();
  value.forEach((post) => {
    const li = document.createElement('li');
    li.id = post.id;
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.setAttribute('href', post.link);
    a.classList.add('fw-bold');
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    li.append(a);
    const button = document.createElement('button');
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

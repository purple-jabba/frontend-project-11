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

export const userInterfaceFeeds = (value, i18nextInstance) => {
  const feeds = document.querySelector('.feeds');
  const card = feeds.querySelector('.card');
  if (!card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'border-0');
    feeds.append(cardDiv);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardDiv.append(cardBody);
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18nextInstance.t('titles.feeds');
    cardBody.append(cardTitle);
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    cardDiv.append(listGroup);
  }
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
  if (!card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'border-0');
    posts.append(cardDiv);
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardDiv.append(cardBody);
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18nextInstance.t('titles.posts');
    cardBody.append(cardTitle);
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    cardDiv.append(listGroup);
  }
  const postsList = posts.querySelector('.list-group');
  value.forEach((post) => {
    const postItemById = postsList.querySelector(`[id='${post.id}']`);
    if (!postItemById) {
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
      postsList.append(li);
    }
  });
};

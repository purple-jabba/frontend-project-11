import { uniqueId } from 'lodash';

export default (xml) => {
  const parsedRss = new DOMParser().parseFromString(xml, 'text/xml');
  const checkError = parsedRss.querySelector('parsererror');
  if (checkError) {
    const error = new Error('rss is not found');
    error.name = 'ParseError';
    throw error;
  }

  const feedId = uniqueId();
  const feed = {
    id: feedId,
    title: parsedRss.querySelector('title').textContent,
    description: parsedRss.querySelector('description').textContent,
  };

  const posts = [];
  const items = parsedRss.querySelectorAll('item');
  items.forEach((item) => {
    const post = {
      id: uniqueId(),
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    };
    posts.push(post);
  });
  return { feed, posts };
};

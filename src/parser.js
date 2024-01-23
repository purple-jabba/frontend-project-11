export default (xml) => {
  const parsedRss = new DOMParser().parseFromString(xml, 'text/xml');
  const checkError = parsedRss.querySelector('parsererror');
  if (checkError) {
    const error = new Error('rss is not found');
    error.name = 'ParseError';
    throw error;
  }

  const items = parsedRss.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const post = {
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    };
    return post;
  });
  return { parsedRss, posts };
};

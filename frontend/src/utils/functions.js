const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);

  const date = d
    .toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\./g, '-');

  const time = d.toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `${date} ${time}`;
};

export { formatDateTime };

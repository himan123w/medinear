export const getOrCreateDeviceId = () => {
  const storageKey = 'medinear_device_id';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;

  const generated =
    'dev_' +
    Date.now().toString(36) +
    '_' +
    Math.random().toString(36).slice(2, 10);

  localStorage.setItem(storageKey, generated);
  return generated;
};

const getString = (key: string): string | undefined => {
  if (!key) {
    throw new Error('Key not specified');
  }
  try {
    const result = localStorage.getItem(key);
    return result !== null ? result : undefined;
  } catch (e) {
    console.error(
      `Error getting ${key} from local storage. Error: ${(e || '')?.toString()}`,
      { key },
      e
    );
  }
  return undefined;
};

export const LocalStorageHelper = {
  getString,

  getInt: (key: string, fallback: number = 0): number => {
    const stringValue = getString(key);
    if(!stringValue) {
      return fallback;
    }

    try {
      const value = parseInt(stringValue);
      return isNaN(value) ? fallback : value;
    } catch (e) {
      console.error(
        `Error parsing ${stringValue} from key ${key} to int from local storage. Error: ${(e || '')?.toString()}`,
        { stringValue, key },
        e
      );
    }

    return fallback;
  },

  remove: (key: string): void => {
    if (!key) {
      throw new Error('Key not specified');
    }
    try {
      localStorage.removeItem(
        typeof key === 'string' ? key : (key as any).toString()
      );
    } catch (e) {
      console.error('Failed to remove local storage item', { key }, e);
    }
  },

  set: (key: string, value: string | number): void => {
    if (!key) {
      throw new Error('Key not specified');
    }
    try {
      localStorage.setItem(key, value.toString());
    } catch (e) {
      console.error('Failed to set local storage', { key, value }, e);
    }
  }
}

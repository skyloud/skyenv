export function get<T>(store: T) {
  return (key: keyof T, defaultValue: T[keyof T] = undefined): T[keyof T] | undefined => {
    if (!store || !key) {
      return defaultValue;
    }
    return store[key];
  }
}
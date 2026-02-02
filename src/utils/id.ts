let currentId = 0;

export function getId(): number {
  return ++currentId;
}

export function now(): number {
  return Date.now();
}

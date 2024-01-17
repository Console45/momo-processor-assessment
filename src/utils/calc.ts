export const generateCode = (length: number, radix = 10): string => {
  return `${Math.random().toString(radix).substr(2, length)}`;
};

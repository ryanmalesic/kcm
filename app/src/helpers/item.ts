export const transformUpc = (upc: String): string => {
  return `000-${upc.substring(1, 6)}-${upc.substring(6, 11)}`;
};

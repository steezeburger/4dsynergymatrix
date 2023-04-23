/**
 * Returns a random element from the input array.
 * @param arr
 */
export function randChoice<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

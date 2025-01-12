export const convertExpiresInToDate = (expiresIn: number) => {
  return new Date(expiresIn * 1000)
}

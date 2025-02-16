export enum ProductSize {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}
export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned, // bị khóa
}
export enum BanDuration {
  FIVE_MINUTES = 5 * 60 * 1000, // 5 phút
  TEN_MINUTES = 10 * 60 * 1000, // 10 phút
  ONE_HOUR = 60 * 60 * 1000, // 1 giờ
  ONE_DAY = 24 * 60 * 60 * 1000, // 1 ngày
  THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000, // 30 ngày
}

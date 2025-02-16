import { BanDuration } from 'src/constants/enum';

export const convertExpiresInToDate = (expiresIn: number) => {
  return new Date(expiresIn * 1000);
};

export const BanDurationLabel = {
  [BanDuration.FIVE_MINUTES]: '5 phút',
  [BanDuration.TEN_MINUTES]: '10 phút',
  [BanDuration.ONE_HOUR]: '1 giờ',
  [BanDuration.ONE_DAY]: '1 ngày',
  [BanDuration.THIRTY_DAYS]: '30 ngày',
};
export const formatRemainingTime = (ms: number) => {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  return `${days}d ${hours}h ${minutes}m`;
};

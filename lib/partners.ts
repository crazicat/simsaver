/** 입점·광고 문의 유형 (폼·API 공용) */
export const INQUIRY_TYPES = {
  listing: "신규 입점(요금제 등록)",
  correction: "요금제 정보 수정",
  ad: "광고·제휴",
  other: "기타",
} as const;

export type InquiryType = keyof typeof INQUIRY_TYPES;

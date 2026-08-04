export const FINE_PER_MISSED_REPORT = 30000;

export const VN_DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const OBJECTIVES = [
  {
    id: "O1",
    title: "Phủ & làm ấm tệp khách",
    krs: [
      { key: "invite", label: "Lời mời kết bạn gửi", hint: "50 / ngày" },
      { key: "friend", label: "Kết bạn thành công", hint: "5 / ngày" },
      { key: "comm", label: "Khách vào group cộng đồng", hint: "10 / ngày" },
    ],
  },
  {
    id: "O2",
    title: "Bài được duyệt vào cộng đồng",
    krs: [{ key: "post", label: "Bài đăng được duyệt", hint: "4 / tuần" }],
  },
  {
    id: "O3",
    title: "Khai thác & phân loại khách",
    krs: [
      { key: "port", label: "Khách nắm danh mục (mã + giá vốn)", hint: "20 / tuần" },
      { key: "nav", label: "Khách khai thác NAV", hint: "12 / tuần" },
      { key: "priv", label: "Khách vào group riêng", hint: "5 / ngày" },
    ],
  },
  {
    id: "O4",
    title: "Chân dung khách hàng (kết quả)",
    krs: [{ key: "portrait", label: "Khách hoàn thiện chân dung", hint: "≥ 3 / ngày" }],
  },
  {
    id: "O5",
    title: "Kỷ luật vận hành",
    krs: [{ key: "report", label: "Report cuối ngày", hint: "thiếu = −30.000đ" }],
  },
];

export const ALL_KRS = OBJECTIVES.flatMap((objective) => objective.krs);

export const PERIOD_BY_KEY = {
  invite: "day",
  friend: "day",
  comm: "day",
  priv: "day",
  portrait: "day",
  post: "week",
  port: "week",
  nav: "week",
};

export const BASE_RATES = {
  invite: 50,
  friend: 5,
  comm: 10,
  post: 4,
  port: 20,
  nav: 12,
  priv: 5,
  portrait: 3,
};

export const RATE_COLUMNS = [
  { key: "invite", label: "Lời mời", unit: "/ngày" },
  { key: "friend", label: "Kết bạn", unit: "/ngày" },
  { key: "comm", label: "Cộng đồng", unit: "/ngày" },
  { key: "priv", label: "Gr riêng", unit: "/ngày" },
  { key: "post", label: "Bài duyệt", unit: "/tuần" },
  { key: "port", label: "Danh mục", unit: "/tuần" },
  { key: "nav", label: "NAV", unit: "/tuần" },
  { key: "portrait", label: "Chân dung", unit: "/ngày" },
];

export const LOG_COLUMNS = [
  { key: "invite", label: "Lời mời" },
  { key: "friend", label: "Kết bạn" },
  { key: "post", label: "Bài duyệt" },
  { key: "port", label: "Danh mục" },
  { key: "nav", label: "NAV" },
  { key: "priv", label: "Gr riêng" },
  { key: "comm", label: "Cộng đồng" },
  { key: "portrait", label: "Chân dung" },
];

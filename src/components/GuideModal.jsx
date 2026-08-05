import { T } from "../data/theme.js";

function Section({ number, title, children }) {
  return (
    <div style={{ padding: "16px 0", borderTop: `1px solid ${T.surface2}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(124,58,237,.14)", color: T.purpleLt, fontFamily: T.mono, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{number}</span>
        <span style={{ fontSize: 14.5, fontWeight: 700 }}>{title}</span>
      </div>
      <div style={{ fontSize: 13, color: "#C6CDDA", lineHeight: 1.65, paddingLeft: 34 }}>{children}</div>
    </div>
  );
}

function Strong({ color = T.text, children }) {
  return <b style={{ color }}>{children}</b>;
}

function Item({ children }) {
  return <div style={{ margin: "3px 0" }}>• {children}</div>;
}

export default function GuideModal({ onClose }) {
  return (
    <div className="overlay" onClick={(event) => event.target.classList.contains("overlay") && onClose()}>
      <div className="modal guide">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, position: "sticky", top: 0, background: T.surface, paddingBottom: 4 }}>
          <div className="mhead" style={{ marginBottom: 0 }}>
            <div className="micon">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
            </div>
            <div><div className="mtitle">Hướng dẫn sử dụng</div><div className="msub">Dành cho Trader</div></div>
          </div>
          <button className="del" onClick={onClose} title="Đóng" type="button"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
        </div>
        <Section number="1" title="Đăng nhập & phạm vi">Đăng nhập bằng số điện thoại/email của bạn. Sau khi vào, bạn <Strong>chỉ thấy dữ liệu của chính mình</Strong> — không xem được người khác.</Section>
        <Section number="2" title="Hai màn chính"><Item><Strong>Bảng chấm OKR</Strong> — xem điểm & tiến độ từng chỉ tiêu.</Item><Item><Strong>Nhật ký hằng ngày</Strong> — nơi bạn nhập số mỗi ngày. Đây là việc quan trọng nhất.</Item></Section>
        <Section number="3" title="Ghi Nhật ký mỗi ngày">Mỗi ngày điền các cột: Lời mời · Kết bạn · Bài duyệt · Danh mục · NAV · Gr riêng · Cộng đồng · Chân dung.<Item>Cuối ngày bấm nút <Strong color={T.green}>Report</Strong> → hiện ✓ Đã nộp.</Item><Item>Mẹo: bấm vào ô là số tự bôi đen, gõ đè thẳng.</Item></Section>
        <Section number="4" title="Ngày công"><Item><Strong>T2–T6</Strong> làm đủ ngày · <Strong>T7</Strong> làm buổi sáng (nửa ngày ✼) · <Strong>CN</Strong> nghỉ.</Item><Item>T7 & CN vẫn nhập được nếu bạn chạy thêm task — phần làm thêm vẫn được cộng vào chỉ tiêu.</Item></Section>
        <Section number="5" title="Report cuối ngày">Mọi ngày công (T2–T7) đều phải nộp report. <Strong color={T.red}>Quên nộp bị trừ 30.000đ/ngày.</Strong> Chủ nhật không bắt buộc.</Section>
        <Section number="6" title="Chỉ tiêu của bạn (nhịp chuẩn)"><Item>Lời mời ≥ 50/ngày · Kết bạn ≥ 5/ngày · Cộng đồng ≥ 10/ngày · Gr riêng ≥ 5/ngày · Chân dung ≥ 3/ngày</Item><Item>Bài duyệt ≥ 4/tuần · Danh mục ≥ 20/tuần · NAV ≥ 12/tuần</Item><Item>Chỉ tiêu tháng tự tính theo số ngày công (T7 tính nửa ngày).</Item></Section>
        <Section number="7" title="Chân dung khách hàng">Mỗi ngày hoàn thiện <Strong>≥ 3 khách</Strong>. Một khách hoàn thiện khi bạn nắm đủ 5 điều: <Strong>NAV · danh mục (mã) · giá vốn từng mã · cơ sở ra quyết định · thâm niên</Strong>.<Item>Ghi ngay lúc đang tư vấn khách để đỡ quên.</Item></Section>
        <Section number="8" title="Cách chấm điểm"><Item>Mỗi chỉ số có % hoàn thành: <Strong color={T.green}>≥100% Đạt</Strong> · <Strong color={T.purpleLt}>70–99% Gần đạt</Strong> · <Strong color={T.red}>&lt;70% Chưa đạt</Strong>.</Item><Item>Điểm OKR tháng = trung bình % của tất cả chỉ số.</Item></Section>
        <Section number="9" title="Mẹo đạt tốt"><Item>Gửi lời mời <Strong>rải đều trong ngày</Strong> — đừng bắn 50 cái một lúc kẻo Zalo khoá.</Item><Item>Ghi khách vào hệ thống <Strong>ngay lúc chat</Strong>, đừng để dồn cuối ngày.</Item><Item>Nộp report mỗi ngày để không mất 30k.</Item></Section>
        <div style={{ padding: "16px 0 2px", borderTop: `1px solid ${T.surface2}`, fontSize: 11.5, color: T.dim }}>Cần hỗ trợ thêm? Nhắn quản lý đội hoặc admin.</div>
      </div>
    </div>
  );
}
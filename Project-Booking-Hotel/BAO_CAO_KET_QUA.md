# BÁO CÁO KẾT QUẢ THỰC HIỆN BÀI TẬP CUỐI KỲ - CN&LT WEB

**Đề tài:** Xây dựng website đặt phòng khách sạn (Hotel Booking Website)

---

## THÔNG TIN SINH VIÊN

**Họ và tên:** Nguyễn Văn A  
**Lớp:** 24IT1  
**Chữ ký:** _________________

**Họ và tên:** Nguyễn Văn B  
**Lớp:** 24IT1  
**Chữ ký:** _________________

---

## I. NGÔN NGỮ/FRAMEWORK/DB

### Front-end:
- **Ngôn ngữ:** HTML5, CSS3, JavaScript (ES6+)
- **Framework/Thư viện:**
  - React 18.2.0 - Framework chính cho giao diện người dùng
  - React Router DOM 6.8.1 - Điều hướng và quản lý routing
  - TailwindCSS 3.2.6 - Framework CSS utility-first cho styling
  - Headless UI 1.7.10 - Component library không có style sẵn
  - Swiper 9.0.4 - Thư viện slider/carousel cho banner và hình ảnh
  - React Icons 4.7.1 - Thư viện icon phong phú
  - React Datepicker 4.10.0 - Component chọn ngày tháng
- **Công cụ Build:** Vite 4.1.0 - Build tool và dev server hiện đại

### Back-end:
- **Nền tảng:** ASP.NET Core 8.0 (Web API)
- **Dự án:** HotelBooking.API
- **Các dịch vụ chính:**
  - AuthController - Xử lý xác thực người dùng (đăng ký, đăng nhập)
  - EmailService - Gửi email xác thực và mã OTP
  - AuthService - Logic xử lý authentication
  - API hỗ trợ reset mật khẩu qua email và mã xác thực
- **Thư viện:**
  - Microsoft.AspNetCore.OpenApi 8.0.0
  - Swashbuckle.AspNetCore 6.5.0 - Tạo Swagger/OpenAPI documentation

### Cơ sở dữ liệu:
- **Supabase (PostgreSQL)** - Database chính lưu trữ:
  - users - Thông tin người dùng
  - rooms - Thông tin phòng
  - room_types - Loại phòng
  - bookings - Đặt phòng khách sạn
  - restaurant_bookings - Đặt bàn nhà hàng
  - spa_bookings - Đặt dịch vụ spa
  - promotions - Chương trình khuyến mãi
  - price_rules - Quy tắc giá động
  - audit_logs - Nhật ký hệ thống
  - amenities - Tiện nghi phòng
- **Supabase Storage** - Lưu trữ file/ảnh (logo, hình ảnh phòng, menu nhà hàng, dịch vụ spa)

### Thư viện/Dịch vụ bổ trợ:
- **EmailJS Browser 4.4.1** - Gửi email xác nhận và thông báo
- **Chart.js 4.5.1 + React-Chartjs-2 5.3.1** - Vẽ biểu đồ báo cáo (doanh thu, tỉ lệ lấp đầy phòng)
- **html2canvas 1.4.1 + jsPDF 3.0.3** - Xuất hóa đơn/booking sang file PDF
- **qrcode.react 4.2.0** - Sinh mã QR cho thanh toán
- **Spinners React 1.0.7** - Loading spinner components

---

## II. LIỆT KÊ CÁC CHỨC NĂNG ĐÃ HOÀN THÀNH

| STT | Chức năng dành cho Khách hàng | SV code | Chức năng dành cho Admin | SV Code |
|-----|------------------------------|---------|--------------------------|---------|
| 1 | Đăng ký/Đăng nhập/Đăng xuất tài khoản. Quên mật khẩu/Reset mật khẩu qua email và mã xác thực (OTP). Quản lý phiên đăng nhập. | (Tên) | Đăng nhập Admin & Giao diện Dashboard quản trị với sidebar điều hướng các module. | (Tên) |
| 2 | Trang chủ với banner slider phòng nổi bật. Thanh tìm kiếm real-time: gõ tên phòng/mô tả để lọc danh sách phòng ngay lập tức. | (Tên) | Quản lý Loại phòng (Room Types Management): Thêm/Sửa/Xóa loại phòng (Standard, Deluxe, Family, Sea View...). Cấu hình mô tả, tiện nghi cơ bản, giá tham chiếu. | (Tên) |
| 3 | Xem danh sách phòng với bộ lọc: loại phòng, giá, số người lớn/trẻ em, tiện nghi. Trang chi tiết phòng: hình ảnh, mô tả, tiện nghi, giá, sức chứa, trạng thái còn phòng. | (Tên) | Quản lý Phòng (Rooms Management): Thêm/Sửa/Xóa phòng cụ thể (tên phòng, loại phòng, sức chứa, giá, mô tả, hình ảnh, trạng thái: available/occupied/cleaning/maintenance). Bảng Room Status Board theo dõi tình trạng tất cả phòng. | (Tên) |
| 4 | Đặt phòng khách sạn: Chọn ngày check-in/check-out, số người lớn, trẻ em, dịch vụ kèm theo. Tính toán số đêm và tổng tiền theo giá động (dynamic pricing: ngày thường/cuối tuần, kết hợp khuyến mãi). Sinh mã xác nhận (confirmation code) cho mỗi booking. | (Tên) | Quản lý Quy tắc Giá (Price Rules Management): Thiết lập giá linh hoạt theo mùa, cuối tuần, ngày lễ, hoặc theo loại phòng. Kết hợp với module đặt phòng để tự động tính giá động. | (Tên) |
| 5 | Đặt dịch vụ Nhà hàng & Spa: Đặt chỗ nhà hàng (số khách, thời gian, ghi chú yêu cầu đặc biệt). Đặt lịch spa (tên dịch vụ, thời gian, ghi chú). Tất cả được quản lý chung trên tài khoản người dùng. | (Tên) | Quản lý Khuyến mãi (Promotions Management): Tạo/Chỉnh sửa/Xóa chương trình khuyến mãi (mã giảm giá, % giảm, thời gian áp dụng, điều kiện). | (Tên) |
| 6 | Thanh toán/Đặt cọc bằng mã QR: Màn hình hiển thị QR Payment để khách quét thanh toán (mô phỏng thanh toán VNPay/MoMo). | (Tên) | Quản lý Đặt phòng (Bookings Management): Xem toàn bộ booking (phòng, nhà hàng, spa) trong một bảng thống nhất. Tìm kiếm booking theo tên khách, email, mã xác nhận, loại dịch vụ. Cập nhật trạng thái: pending_payment/confirmed/checked_in/checked_out/completed/cancelled. Thao tác nhanh: check-in, check-out, hủy booking, xem chi tiết. | (Tên) |
| 7 | Hóa đơn & Xuất PDF: Trang hiển thị invoice chi tiết cho mỗi booking. Cho phép in/lưu hóa đơn PDF bằng html2canvas + jsPDF. | (Tên) | Quản lý Người dùng (Users Management): Danh sách tài khoản người dùng, thông tin cơ bản. Cập nhật, khóa/mở tài khoản. | (Tên) |
| 8 | Trang Dashboard khách hàng (User Dashboard): Xem tổng quan lịch sử lưu trú, số booking sắp tới/đã hoàn thành/đã hủy. Quản lý booking: Hủy đặt phòng, đổi ngày lưu trú (reschedule) nếu chưa đến hạn. Quản lý hồ sơ cá nhân: Cập nhật tên, email, số điện thoại, quốc gia, thành phố, ngôn ngữ ưa thích, avatar... Hệ thống loyalty nights: Đếm số đêm đã lưu trú và hiển thị "hạng thành viên". Chức năng đổi mật khẩu với 3 bước: gửi code, nhập code, đặt mật khẩu mới. | (Tên) | Nhật ký Hệ thống (Audit Logs Management): Lưu lại các thao tác quan trọng của admin (thay đổi dữ liệu, cập nhật trạng thái...), phục vụ kiểm tra và truy vết. | (Tên) |
| 9 | Đa ngôn ngữ & Giao diện thân thiện: Tích hợp LanguageSwitcher (Anh/Việt/Pháp) và file translations.js. Giao diện responsive, sử dụng TailwindCSS, tối ưu trải nghiệm người dùng. | (Tên) | Báo cáo & Thống kê (Reports Management): Thống kê doanh thu theo ngày/tháng, tỷ lệ lấp đầy phòng, số lượng booking... Hiển thị bằng biểu đồ doanh thu (RevenueChart) và biểu đồ công suất phòng (OccupancyChart). | (Tên) |
| 10 | Chatbot hỗ trợ đặt phòng: Hộp chat (ChatBox) tích hợp AI assistant. Gợi ý phòng phù hợp theo số khách, ngân sách, tiện nghi mong muốn. Trả lời câu hỏi về tiện nghi, giá, chính sách. | (Tên) | Thông báo & Email: Gửi email xác nhận/mã reset mật khẩu cho người dùng. Hiển thị thông báo (toast) khi admin thao tác thành công/thất bại. | (Tên) |

---

## III. CÁC CHỨC NĂNG MỞ RỘNG/NÂNG CAO KHÁC NẾU CÓ LÀM (CHỈ LIỆT KÊ NẾU CÓ)

1. **Tích hợp Supabase + ASP.NET Core:** Kết hợp back-end .NET (xử lý xác thực, gửi email, API OTP) với cơ sở dữ liệu Supabase (PostgreSQL) để vừa tận dụng dịch vụ cloud, vừa chủ động logic server.

2. **Chatbot AI hỗ trợ đặt phòng:** Module ChatBox + aiAssistant có khả năng phân tích tin nhắn người dùng, gợi ý phòng phù hợp, đề xuất ngày nhận phòng, số đêm, tiện nghi... Sử dụng các hàm thông minh như recommendRooms, extractIntent, getContextFromChat để cung cấp trải nghiệm tương tác tốt.

3. **Thanh toán/Đặt cọc bằng mã QR:** Sinh mã QR động cho mỗi booking, giúp khách quét thanh toán nhanh chóng (mô phỏng tích hợp VNPay/MoMo). Có tính năng đếm ngược thời gian thanh toán (15 phút) và xác nhận thanh toán thành công.

4. **Dashboard khách hàng thông minh:** Gom tất cả room bookings, restaurant bookings, spa bookings vào một trang UserDashboard, cho phép lọc Upcoming/Past/Cancelled và quản lý booking trực quan. Hệ thống loyalty nights tự động đếm và hiển thị hạng thành viên.

5. **Báo cáo trực quan bằng biểu đồ:** Sử dụng Chart.js để vẽ biểu đồ doanh thu theo ngày/tháng, tỉ lệ lấp đầy phòng theo thời gian, hỗ trợ admin ra quyết định kinh doanh. Có thể xuất báo cáo và phân tích xu hướng.

6. **Xuất hóa đơn PDF chuyên nghiệp:** Sử dụng html2canvas + jsPDF để xuất hóa đơn chi tiết (thông tin khách, phòng, ngày, tổng tiền) thành file PDF cho khách tải về/in ra. Hóa đơn có logo, thông tin đầy đủ và định dạng đẹp mắt.

7. **Dynamic Pricing System:** Hệ thống tính giá động thông minh dựa trên price_rules, tự động điều chỉnh giá theo ngày trong tuần (thứ 6, thứ 7, chủ nhật), mùa, ngày lễ. Kết hợp với promotions để tính giá cuối cùng chính xác.

8. **Đa ngôn ngữ (i18n):** Hệ thống hỗ trợ nhiều ngôn ngữ (Tiếng Anh, Tiếng Việt, Tiếng Pháp) với LanguageContext và file translations.js, cho phép người dùng chuyển đổi ngôn ngữ dễ dàng.

---

## IV. CƠ SỞ DỮ LIỆU

### Mô tả các bảng chính trong hệ thống:

#### 1. Bảng users:
- **Mục đích:** Lưu trữ thông tin người dùng (khách hàng và admin)
- **Các trường chính:** id (UUID), name, email, password_hash, phone, country, city, avatar, role (user/admin), language, bio, newsletter, created_at, updated_at
- **Quan hệ:** 1-N với các bảng booking (room_bookings, restaurant_bookings, spa_bookings)

#### 2. Bảng room_types:
- **Mục đích:** Lưu trữ thông tin loại phòng (Standard, Deluxe, Family, Sea View...)
- **Các trường chính:** id (UUID), code, name, description, base_capacity, max_person, base_price, facilities (JSON array), is_active, created_at
- **Quan hệ:** 1-N với bảng rooms (một loại phòng có nhiều phòng cụ thể)

#### 3. Bảng rooms:
- **Mục đích:** Lưu trữ thông tin từng phòng cụ thể trong khách sạn
- **Các trường chính:** id (UUID), room_no, name, room_type_id (FK), floor, size, price, description, status (available/occupied/cleaning/maintenance), images (JSON array), created_at, updated_at
- **Quan hệ:** N-1 với room_types (mỗi phòng thuộc về một loại phòng), 1-N với room_bookings (một phòng có nhiều booking)

#### 4. Bảng bookings (room_bookings):
- **Mục đích:** Lưu trữ thông tin đặt phòng khách sạn
- **Các trường chính:** id (UUID), user_id (FK), room_id (FK), check_in, check_out, adults, kids, total_amount, status (pending_payment/confirmed/checked_in/checked_out/completed/cancelled), confirmation_code, special_requests, created_at, updated_at
- **Quan hệ:** N-1 với users (mỗi booking thuộc về một user), N-1 với rooms (mỗi booking gắn với một phòng). Có thể tham chiếu đến promotions hoặc price_rules để lưu khuyến mãi đã áp dụng.

#### 5. Bảng restaurant_bookings:
- **Mục đích:** Lưu trữ thông tin đặt bàn nhà hàng
- **Các trường chính:** id (UUID), user_id (FK), time (datetime), guests, special_requests, total_price, status, created_at
- **Quan hệ:** N-1 với users (mỗi booking nhà hàng thuộc về một user)

#### 6. Bảng spa_bookings:
- **Mục đích:** Lưu trữ thông tin đặt dịch vụ spa
- **Các trường chính:** id (UUID), user_id (FK), service_name, time (datetime), duration, therapist, special_requests, total_price, status, created_at
- **Quan hệ:** N-1 với users (mỗi booking spa thuộc về một user)

#### 7. Bảng price_rules:
- **Mục đích:** Lưu trữ quy tắc giá động (theo loại phòng, ngày trong tuần, mùa, dịp lễ...)
- **Các trường chính:** id (UUID), rule_type (weekend/seasonal/holiday), room_type_id (FK, nullable), price, apply_fri, apply_sat, apply_sun, start_date, end_date, description, priority, is_active, created_at
- **Quan hệ:** N-1 với room_types (một quy tắc giá có thể áp dụng cho một loại phòng cụ thể, hoặc null nếu áp dụng cho tất cả)

#### 8. Bảng promotions:
- **Mục đích:** Lưu trữ chương trình khuyến mãi
- **Các trường chính:** id (UUID), code, name, discount_kind (percent/fixed), discount_value, start_date, end_date, description, is_active, created_at
- **Quan hệ:** Có thể được tham chiếu trong bookings để lưu khuyến mãi đã áp dụng

#### 9. Bảng audit_logs:
- **Mục đích:** Lưu lại lịch sử thao tác của admin
- **Các trường chính:** id (UUID), admin_id (FK), action (create/update/delete), table_name, record_id, old_values (JSON), new_values (JSON), created_at
- **Quan hệ:** N-1 với users (mỗi log thuộc về một admin)

#### 10. Bảng amenities:
- **Mục đích:** Lưu trữ danh sách tiện nghi phòng
- **Các trường chính:** id (UUID), name, description, icon (optional), created_at

### Sơ đồ quan hệ chính:

- **users (1) ── (N) bookings:** Một user có thể có nhiều booking phòng
- **users (1) ── (N) restaurant_bookings:** Một user có thể đặt nhiều bàn nhà hàng
- **users (1) ── (N) spa_bookings:** Một user có thể đặt nhiều dịch vụ spa
- **room_types (1) ── (N) rooms:** Một loại phòng có nhiều phòng cụ thể
- **rooms (1) ── (N) bookings:** Một phòng có thể được đặt nhiều lần
- **room_types (1) ── (N) price_rules:** Một loại phòng có thể có nhiều quy tắc giá
- **users (1) ── (N) audit_logs:** Một admin có thể thực hiện nhiều thao tác

### Lưu ý:
Hệ thống sử dụng Supabase (PostgreSQL) nên hỗ trợ đầy đủ các tính năng như Foreign Key constraints, Indexes, Triggers, và Row Level Security (RLS) để đảm bảo tính toàn vẹn dữ liệu và bảo mật.

---

**Ghi chú:** Vui lòng điền tên sinh viên vào cột "SV code" trong bảng phần II theo phân công thực tế của nhóm.


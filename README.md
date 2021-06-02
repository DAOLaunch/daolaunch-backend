# IBO PROJECT

![IBO](https://dev.bintech.bappartners.com/bf9ea1a8264fe32d18a22b44fb380cd8.png)

## Yêu cầu cài đặt

- **Nodejs**: 10.16.0 (every version >= 8.\* is OK)
- **Mysql**: 5.7.25

## Các môi trường phát triển (environments)

- **LCL**: Local environment
- **DEV**: Development environment
- **STG**: Staging environment
- **PRO**: Production environment

Các file cấu hình với các môi trường tương ứng nằm ở thư mục `env`.
Các câu lệnh nếu không chỉ rõ là môi trường nào thì sẽ **mặc định là `LCL`**

## Cài đặt project và chạy server

- **Bước 1:** Clone git repository về máy:
  `git clone https://gitlab-new.bap.jp/BAPSoftware/outsource/s0089.tokenibo/token-ibo-backend.git`
- **Bước 2:** Cài đặt các packages:
  `npm install`
- **Bước 3:** Trong thư mục env:

  - Copy file `LCL.env.example`
  - Đổi tên thành `LCL.env`

    Chú ý thay đổi các thông số connect database , redis ở local, ...

- **Bước 4:** Chạy server
  - Chạy ở chế độ thường: `npm start`
  - Chạy ở chế độ theo dõi cập nhật: `npm run watch`

## Tạo database

- Ở **Bước 4** trong phần **Cài đặt**, qúa trình **database migration** sẽ tiến hành chạy tự động.
- Nếu không có database tự động tạo ra, hãy tạo một database trước với tên **ibo** ở trình quản lý MySQL (ví dụ: MySQL WorkBench) và chạy lại **Bước 4** trong phần **Cài đặt**.
- Để tiến hành **seeding dữ liệu** (tạo dữ liệu mẫu có sẵn): - Chạy lệnh `npm run seed` (mặc định là `LCL`) - Với các môi trường khác chạy lệnh sau `NODE_ENV=DEV npm run seed` (môi trường `DEV`)

  Tham khảo danh sách các môi trường ở mục trên.

## Api docs

- Để **tạo API docs**, chạy lệnh `./gendoc.sh`
- Để **xem API docs**, mở thư mục theo đường dẫn: `doc/apidoc/index.html`

## Sequelize

Sequelize là ORM dùng trong trường hợp sử dụng SQL. Xem document của [Sequelize](http://docs.sequelizejs.com/).
Trong project này, Sequelize được cấu hình sẵn để đọc các biến môi trường tương ứng.

Để chạy các lệnh của Sequelize, chạy file `sequelizer.sh` và cấp các thông số tương tự như sequelize-cli

**Ví dụ:**

- `./sequelizer db:migrate`
- `./sequelizer migration:generate --env=DEV`
  Nếu --env không được cung cấp thì mặc định là `--env=LCL`

## Build và deploy

- **Bước 1:** chạy lệnh `npm run build`, thư mục `dist` được tạo ra.
- **Bước 2:** chạy lệnh `NODE_ENV=DEV pm2 start dist/app.js`
  Trong trường hợp `pm2` chưa được cài đặt: chạy lệnh `npm install pm2 -g`

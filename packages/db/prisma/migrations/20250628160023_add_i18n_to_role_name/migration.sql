-- 1. เพิ่มคอลัมน์ใหม่ชั่วคราวสำหรับเก็บชื่อเดิม
ALTER TABLE "Role" ADD COLUMN "name_temp" TEXT;

-- 2. คัดลอกข้อมูลจากคอลัมน์ name เก่า ไปใส่ใน name_temp
UPDATE "Role" SET "name_temp" = "name";

-- 3. ลบคอลัมน์ name เก่า (ที่เป็น TEXT) ทิ้งไป
ALTER TABLE "Role" DROP COLUMN "name";

-- 4. สร้างคอลัมน์ name ใหม่ ให้เป็น Type JSONB
ALTER TABLE "Role" ADD COLUMN "name" JSONB;

-- 5. อัปเดตข้อมูลในคอลัมน์ name ใหม่ โดยแปลงข้อมูลจาก name_temp ให้เป็นรูปแบบ JSON
-- โดยจะใช้ 'th' เป็น key สำหรับข้อมูลเก่าทั้งหมด
UPDATE "Role" SET "name" = jsonb_build_object('th', "name_temp");

-- 6. ทำให้คอลัมน์ name ใหม่ ไม่สามารถเป็นค่าว่างได้ (NOT NULL)
ALTER TABLE "Role" ALTER COLUMN "name" SET NOT NULL;

-- 7. ลบคอลัมน์ชั่วคราว name_temp ทิ้งไป
ALTER TABLE "Role" DROP COLUMN "name_temp";
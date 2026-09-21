function timenow() {
    let now = new Date();

    // ตั้งค่าแสดงผลแบบ ภาษาอังกฤษ (en-US)
    const options = {
        weekday: 'long',  // แสดงชื่อวันแบบเต็ม เช่น Tuesday
        month: 'short',   // แสดงชื่อเดือนแบบย่อ เช่น Oct
        day: 'numeric'    // แสดงวันที่ เช่น 24
    };

    document.getElementById("date-now").textContent = now.toLocaleDateString('en-US', options);
}

timenow();


const titleMon = document.getElementById("title-mon");
const descMon = document.getElementById("desc-mon");

if (!data.mon) {
  titleMon.textContent = "ไม่มีข้อมูล";
  descMon.textContent = "-";
} else {
  titleMon.textContent = data.mon.title;
  descMon.textContent = `${data.mon.count} Exercises`;
}

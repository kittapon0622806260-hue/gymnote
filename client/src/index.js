function timenow () {
    let now = new Date();
    document.getElementById("date-now").textContent = now.toLocaleDateString('th-TH');
}
timenow();
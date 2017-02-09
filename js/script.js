var xhr = new XMLHttpRequest();

xhr.open("GET", "https://app.sysdigcloud.com/api/alerts/62");
xhr.setRequestHeader("Authorization", "Bearer 8aef9517-3070-4090-b55e-83296cee8cd1");

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === this.DONE) {
    // Done!
    console.log(this.responseText);
  }
});

xhr.send(data);
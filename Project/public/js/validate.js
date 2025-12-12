function checkForm(event) {
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmPassword").value;
  var errorElement = document.getElementById("error");

  errorElement.innerText = "";
  errorElement.style.display = "none";
  var emailRegex = /^\S+@\S+\.\S+$/;
  var phoneRegex = /^0\d{9}$/;

  if (!emailRegex.test(email)) {
    errorElement.innerText = "Email không đúng định dạng!";
    errorElement.style.display = "block";
    event.preventDefault();
    return;
  }

  if (!phoneRegex.test(phone)) {
    errorElement.innerText =
      "Số điện thoại phải là 10 số và bắt đầu bằng số 0!";
    errorElement.style.display = "block";
    event.preventDefault();
    return;
  }

  if (password !== confirmPassword) {
    errorElement.innerText = "Mật khẩu xác nhận không khớp!";
    errorElement.style.display = "block";
    event.preventDefault();
    return;
  }

  errorElement.style.display = "block";
  errorElement.style.backgroundColor = "#35dc7b";
  errorElement.style.color = "green";
  errorElement.innerText = "Đăng kí thành công ! Vui lòng đăng nhập.";
}

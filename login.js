// 로그인 버튼 클릭 시 로그인 폼을 표시
document.getElementById("loginBtn").addEventListener("click", function() {
    // 로그인 폼을 보이게 설정
    document.getElementById("loginForm").style.display = "block";
});

// 로그인 폼 닫기 버튼 클릭 시 로그인 폼을 숨김
document.getElementById("closeLogin").addEventListener("click", function() {
    // 로그인 폼을 숨김
    document.getElementById("loginForm").style.display = "none";
});

// 로그인 폼 제출 시 실행되는 함수
document.getElementById("login").addEventListener("submit", function(event) {
    event.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    // 아이디와 비밀번호를 소문자로 변환
    const username = document.getElementById("loginUsername").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value; // 비밀번호는 소문자로 변환 X

   
    // 로컬스토리지에서 저장된 사용자 정보 가져오기
    const storedUser = JSON.parse(localStorage.getItem(username));

    // 아이디와 비밀번호가 일치하는지 확인 + 승인 확인
    if (storedUser && storedUser.password === password) {
        if (storedUser.status === "승인됨") {
            alert("로그인 성공!");

            // 로그인 성공 후, 로컬스토리지에 로그인한 사용자 정보 저장
            localStorage.setItem("loggedInUser", username);  // 로그인한 사용자 아이디 저장
            window.location.href = "home.html";  // 기본 홈페이지로 이동

        } else {
            alert("관리자의 승인을 기다려주세요.");
        }
    } else {
        alert("아이디나 비밀번호가 틀렸습니다.");
    }
});

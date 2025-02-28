// 페이지 로드 시 로그인 상태를 확인
window.onload = function() {
    // 로그인한 사용자가 있는지 확인
    const loggedInUser = localStorage.getItem("loggedInUser");

    // 로그인하지 않으면 login.html로 리디렉션
    if (!loggedInUser) {
        window.location.href = "login.html";
    }
};

// 로그아웃 버튼 클릭 시 로그아웃 처리
document.getElementById("logoutBtn").addEventListener("click", function(event) {
    event.preventDefault(); // 기본 동작 방지

    // 로컬스토리지에서 로그인 상태 정보 삭제
    localStorage.clear();  // 모든 로컬스토리지 항목 삭제

    // 로그인 페이지로 리디렉션
    window.location.href = "login.html";  // 로그인 페이지로 이동
});

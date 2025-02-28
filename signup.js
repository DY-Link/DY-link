// 회원가입 버튼 클릭 시 회원가입 폼을 표시
document.getElementById("signupBtn").addEventListener("click", function() {
    document.getElementById("signupForm").style.display = "block";
});

// 회원가입 폼 닫기 버튼 클릭 시 회원가입 폼을 숨김
document.getElementById("closeSignup").addEventListener("click", function() {

    // 회원가입 폼을 숨김
    document.getElementById("signupForm").style.display = "none";
});

// 회원가입 폼 제출 시 실행되는 함수
document.getElementById("signup").addEventListener("submit", function(event) {
    event.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    
    // 폼에서 입력된 데이터 가져오기
    let username = document.getElementById("signupUsername").value.trim().toLowerCase(); // 소문자로 변환
    let name = document.getElementById("signupName").value.trim();
    let gender = document.getElementById("signupGender").value;
    let birthdate = document.getElementById("signupBirthdate").value;
    let address = document.getElementById("signupAddress").value.trim();
    let password = document.getElementById("signupPassword").value;

     // 중복 아이디 확인
    if (localStorage.getItem(username)) {
        alert("이미 존재하는 아이디입니다.");
        return;
    }

    // 사용자 정보 객체 생성
    let user = {
        username: username, // 소문자로 변환된 아이디 저장
        name: name,
        gender: gender,
        birthdate: birthdate,
        address: address,
        password: password,
        status: "대기 중"
    };

    // 로컬스토리지에 저장
    localStorage.setItem(username, JSON.stringify(user));
    alert("회원가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.");

    // 폼 초기화 및 닫기
    document.getElementById("signup").reset();
    document.getElementById("signupForm").style.display = "none";
});

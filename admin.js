// 페이지가 로드되면 대기 중인 사용자를 확인하여 리스트를 갱신
window.onload = function() {
    updatePendingList();
};

// 대기 중인 사용자 리스트를 갱신하는 함수
function updatePendingList() {
    const pendingList = document.getElementById("pendingList");
    pendingList.innerHTML = ""; // 기존 리스트 초기화

    // 로컬스토리지에서 모든 아이템 확인
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i); // 저장된 키(아이디) 가져오기
        const userData = localStorage.getItem(key); // 해당 키의 데이터 가져오기

        try {
            const user = JSON.parse(userData); // JSON 데이터 파싱

            // 유효한 사용자 정보인지 확인 후 상태가 "대기 중"인 경우 리스트에 추가
            if (user && user.status === "대기 중") {
                const li = document.createElement("li");
                li.textContent = `${user.username} (${user.name}) - ${user.gender} - ${user.birthdate} - ${user.address}`;

                // 승인 버튼 추가
                const approveButton = document.createElement("button");
                approveButton.textContent = "승인";
                approveButton.onclick = function() {
                    approveUser(user.username);
                };

                // 취소 버튼 추가
                const cancelButton = document.createElement("button");
                cancelButton.textContent = "취소";
                cancelButton.onclick = function() {
                    cancelUser(user.username);
                };

                li.appendChild(approveButton);
                li.appendChild(cancelButton);
                pendingList.appendChild(li);
            }
        } catch (error) {
            console.error(`유효하지 않은 데이터: ${key}`, error);
        }
    }
}

// 승인 함수
function approveUser(username) {
    const userData = JSON.parse(localStorage.getItem(username));

    if (userData && userData.status === "대기 중") {
        userData.status = "승인됨"; // 상태 변경
        localStorage.setItem(username, JSON.stringify(userData)); // 변경된 데이터 저장
        alert(`${username}님의 가입이 승인되었습니다.`);
        updatePendingList(); // 리스트 갱신
    }
}

// 취소 함수
function cancelUser(username) {
    const userData = JSON.parse(localStorage.getItem(username));

    if (userData && userData.status === "대기 중") {
        localStorage.removeItem(username); // 해당 사용자 데이터 삭제
        alert(`${username}님의 가입이 취소되었습니다.`);
        updatePendingList(); // 리스트 갱신
    }
}

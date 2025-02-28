window.onload = function() {
    // 로그인한 사용자가 있는지 확인
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        window.location.href = "login.html"; // 로그인하지 않았다면 login.html로 리디렉션
    }

    // 페이지 로드 시 게시글 목록 불러오기
    loadPosts();

    // ✅ 검색 버튼 클릭 시 검색 실행
document.getElementById("searchBtn").addEventListener("click", function() {
    const searchQuery = document.getElementById("searchInput").value.trim().toLowerCase();
    const searchCategory = document.getElementById("searchCategory").value;
    currentPage = 1;
    loadPosts(searchQuery, searchCategory);  // ✅ 검색어 유지한 채 검색 기능 적용!
});

    // 새 게시글 작성 버튼 클릭 시 모달 표시
    document.getElementById("newPostBtn").addEventListener("click", function() {
        document.getElementById("postAuthor").value = loggedInUser; // 작성자 필드 자동 설정
        document.getElementById("postCategory").value = "A"; // 카테고리 기본값으로 A 선택
        document.getElementById("newPostModal").style.display = "block"; // 모달 표시
    });

    // 모달 닫기 버튼 클릭 시 모달 숨기기
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", function () {
        document.getElementById("editPostModal").style.display = "none";
    });
}

    // 새 게시글 작성 폼 제출 시 처리
	document.getElementById("newPostForm").addEventListener("submit", async function(event) {  
	 event.preventDefault(); // 폼 제출 시 새로고침 방지

        // 폼에서 제목, 작성자, 내용, 카테고리 가져오기
        const title = document.getElementById("postTitle").value;
        const author = document.getElementById("postAuthor").value;
        const content = document.getElementById("postContent").value;
        const category = document.getElementById("postCategory").value;
	const fileInput = document.getElementById("postFile"); // 파일 첨부 필드 가져오기
	const file = fileInput.files[0]; // 첨부된 파일 가져오기

    // 제목과 내용이 비어있거나 공백만 있는지 검사
    if (!title.trim() || !content.trim()) {
        alert("제목과 내용을 입력해주세요!");
        return;
    }

    let fileData = null;
    let fileName = null;

if (file) {
    try {
        fileData = await convertFileToBase64(file);
        fileName = file.name;
    } catch (error) {
        console.error("파일 변환 오류:", error);
        alert("파일을 변환하는 중 오류가 발생했습니다.");
        return;
    }
}

        // 새 게시글 객체 생성
        const newPost = {
            id: getNextPostId(),  // 게시글 번호 자동 증가
            title: title,
            author: author,
            content: content,
            category: category,
            date: new Date().toISOString(),
            isOpen: false, // 펼쳐진 상태를 나타내는 변수
            fileData: fileData, // 파일 데이터 추가
            fileName   // ✅ 원본 파일명 저장
        };

      // 기존 게시글 목록을 로컬스토리지에서 가져오기
        let posts = JSON.parse(localStorage.getItem("posts")) || [];
        posts.push(newPost); // 새 게시글 목록에 추가
        localStorage.setItem("posts", JSON.stringify(posts)); // 로컬스토리지에 저장

        loadPosts(); // 게시글 목록 새로고침
        document.getElementById("newPostModal").style.display = "none"; // 모달 숨기기
        document.getElementById("newPostForm").reset(); // 폼 초기화
    });

// ✅ 파일을 Base64로 변환하는 함수
async function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

    // 로그아웃 기능
    document.getElementById("logoutBtn").addEventListener("click", function() {
        localStorage.removeItem("loggedInUser"); // 로그인 정보 삭제
        window.location.href = "login.html"; // 로그인 페이지로 리디렉션
    });
};

let currentPage = 1; // 현재 페이지
// 한 페이지에 표시할 게시글 수
const postsPerPage = 10;

// 페이지네이션 버튼을 표시하는 함수
function displayPagination(totalPages, searchQuery, searchCategory) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = ""; // 기존 페이지네이션 내용 초기화

    // "이전" 버튼 추가
    if (currentPage > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "이전";
        prevBtn.addEventListener("click", function() {
            currentPage--;
            loadPosts(searchQuery, searchCategory); // ✅ 검색어 유지
        });
        pagination.appendChild(prevBtn);
    }

    // 페이지 번호 버튼 추가
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;

        if (i === currentPage) {
            pageBtn.classList.add("active");
        }

        pageBtn.addEventListener("click", function() {
            currentPage = i;
            loadPosts(searchQuery, searchCategory); // ✅ 검색어 유지
        });
        pagination.appendChild(pageBtn);
    }

    // "다음" 버튼 추가
    if (currentPage < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "다음";
        nextBtn.addEventListener("click", function() {
            currentPage++;
            loadPosts(searchQuery, searchCategory); // ✅ 검색어 유지
        });
        pagination.appendChild(nextBtn);
    }
}

// 게시글 목록을 로컬스토리지에서 불러와 화면에 표시하는 함수
function loadPosts(searchQuery = "", searchCategory = "title") {

    const postList = document.getElementById("postList");
    postList.innerHTML = "";  // 기존 목록 비우기

	let posts = JSON.parse(localStorage.getItem("posts")) || [];
	posts.sort((a, b) => new Date(b.date) - new Date(a.date)); // 최신 글이 위로!

    // 검색어를 포함하는 게시글만 필터링
    const filteredPosts = posts.filter(function(post) {
        if (searchCategory === "title") {
            return post.title.toLowerCase().includes(searchQuery);
        } else if (searchCategory === "content") {
            return post.content.toLowerCase().includes(searchQuery);
        } else if (searchCategory === "author") {
            return post.author.toLowerCase().includes(searchQuery);
        } else {
            // 기본적으로 모든 카테고리에서 검색 (제목 + 내용 + 작성자)
            return post.title.toLowerCase().includes(searchQuery) ||
                   post.content.toLowerCase().includes(searchQuery) ||
                   post.author.toLowerCase().includes(searchQuery);
        }
    });

    // 페이지별로 게시글을 분리
    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수

    // 현재 페이지의 게시글만 표시
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = Math.min(startIndex + postsPerPage, totalPosts);
    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    // 검색 결과가 없을 경우 안내 메시지 표시
    if (currentPosts.length === 0) {
        const li = document.createElement("li");
        li.textContent = "검색 결과가 없습니다."; // 검색 결과 없음 메시지
        postList.appendChild(li);
    }

    // 게시글 목록을 화면에 표시
    currentPosts.forEach(function(post) {
        const postElement = document.createElement("div");
        postElement.classList.add("post");

        const postNumber = document.createElement("span");
        postNumber.textContent = `번호: ${post.id}`; // 게시글 번호 표시
        postNumber.classList.add("post-number");

        const title = document.createElement("h3");
        title.textContent = post.title; // 게시글 제목

        const author = document.createElement("p");
        author.textContent = `작성자: ${post.author}`; // 게시글 작성자

        const category = document.createElement("p");
        category.textContent = `카테고리: ${post.category}`; // 게시글 카테고리

        const formattedDate = new Date(post.date);
        const timestamp = document.createElement("p");

        // 날짜가 유효한지 체크한 후 포맷
        if (!isNaN(formattedDate)) {
            const formattedDateString = new Intl.DateTimeFormat("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(formattedDate);
            timestamp.textContent = `작성일시: ${formattedDateString}`; // ✅ 한국식 날짜 포맷 적용
        } else {
            timestamp.textContent = `작성일시: 잘못된 날짜 형식`; // 날짜가 잘못되었을 경우 에러 메시지 표시
        }

        // 게시글 내용 (기본적으로 숨김 처리)
        const content = document.createElement("p");
        content.textContent = post.content;
        content.style.display = post.isOpen ? "block" : "none"; // `isOpen`이 true일 경우 내용이 보임

        // 펼침/접기 버튼 추가
        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = post.isOpen ? "접기" : "펼치기";
        toggleBtn.classList.add("toggle-btn");

        // 펼침/접기 버튼 클릭 시 처리
        toggleBtn.addEventListener("click", function() {
            post.isOpen = !post.isOpen; // `isOpen` 토글
            content.style.display = post.isOpen ? "block" : "none"; // 내용 표시/숨기기
            toggleBtn.textContent = post.isOpen ? "접기" : "펼치기"; // 버튼 텍스트 변경

            // 로컬스토리지에 수정된 게시글 상태 저장
            let posts = JSON.parse(localStorage.getItem("posts")) || [];
            posts = posts.map(p => p.id === post.id ? post : p); // 해당 게시글의 `isOpen` 상태 업데이트
            localStorage.setItem("posts", JSON.stringify(posts)); // 로컬스토리지에 저장
        });

        // 게시글 요소에 추가
        postElement.appendChild(postNumber);
        postElement.appendChild(title);
        postElement.appendChild(author);
        postElement.appendChild(category);
        postElement.appendChild(timestamp);
        postElement.appendChild(content);
        postElement.appendChild(toggleBtn); // 펼침/접기 버튼 추가

        // 게시글 제목 클릭 시 새 창에서 게시글 열기
	title.addEventListener("click", function(event) {
	    event.preventDefault();  // ✅ 기본 동작 방지 (새 창에서 기존 페이지 로드 방지)
 	   openPostInNewWindow(post);
	});

        // 수정 버튼 추가
        const editBtn = document.createElement("button");
        editBtn.textContent = "수정";
        editBtn.classList.add("edit-btn");

        // 수정 버튼 클릭 시 수정 모달 열기
        editBtn.addEventListener("click", function(event) {
            event.stopPropagation(); // 클릭 시 이벤트 버블링 방지
            if (post.author === localStorage.getItem("loggedInUser")) {
                openEditModal(post); // 수정 모달 열기
            } else {
                alert("본인의 게시물만 수정할 수 있습니다.");
            }
        });

        // 삭제 버튼 추가
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "삭제";
        deleteBtn.classList.add("delete-btn");

        // 삭제 버튼 클릭 시 게시글 삭제
        deleteBtn.addEventListener("click", function(event) {
            event.stopPropagation(); // 클릭 시 이벤트 버블링 방지
            if (post.author === localStorage.getItem("loggedInUser")) {
                deletePost(post.id); // 해당 게시글 삭제
            } else {
                alert("본인의 게시물만 삭제할 수 있습니다.");
            }
        });

        postElement.appendChild(editBtn); // 수정 버튼을 게시글에 추가
        postElement.appendChild(deleteBtn); // 삭제 버튼을 게시글에 추가

        postList.appendChild(postElement); // 게시글 목록에 추가
    });

    // 페이지네이션 표시
    displayPagination(totalPages, searchQuery, searchCategory);
}

// 새 창에서 게시글을 표시하는 함수
function openPostInNewWindow(post) {
    const postWindow = window.open("", "_blank", "width=600,height=400");

    // 날짜를 한국 시간 형식으로 변환
    const formattedDate = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(post.date));

    // 기본 게시글 HTML
    let postContent = `
        <html>
        <head>
            <title>${post.title}</title>
        </head>
        <body>
            <h1>${post.title}</h1>
            <p><strong>작성자:</strong> ${post.author}</p>
            <p><strong>작성일시:</strong> ${formattedDate}</p>  <!-- ✅ 한국식 날짜 포맷 적용 -->
            <hr>
            <p><strong>내용:</strong> ${post.content.replace(/\n/g, "<br>")}</p>
    `;

   // 첨부파일이 있는 경우 표시
    if (post.fileData && post.fileName) {
        postContent += `
            <hr>
            <p><strong>첨부 파일:</strong> 
	<a class="file-link" href="${post.fileData}" download="${post.fileName}" 	target="_blank">${post.fileName}</a>
            </p>
        `;
    }

    // ✅ 댓글 입력 폼 추가 (새로운 방식)
    postContent += `
        <div class="comment-box">
            <h3>댓글 작성</h3>
            <input type="text" id="commentInput" placeholder="댓글을 입력하세요">
            <button id="addCommentBtn">댓글 작성</button>
        </div>

        <div class="comment-section" id="commentsSection">
            <h3>댓글 목록</h3>
    `;

    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            postContent += `<div class="comment"><strong>${comment.author}</strong>: ${comment.content}</div>`;
        });
    } else {
        postContent += `<p>댓글이 없습니다.</p>`;
    }

    postContent += `
        </div>
        <script>
            window.onload = function() {
                document.getElementById('addCommentBtn').addEventListener('click', function() {
                    const commentInput = document.getElementById('commentInput');
                    const commentContent = commentInput.value.trim();
                    if (!commentContent) {
                        alert("댓글을 입력해주세요!");
                        return;
                    }

                    // localStorage에서 게시글 가져오기
                    let posts = JSON.parse(localStorage.getItem("posts")) || [];
                    let post = posts.find(p => p.id == ${post.id});

                    if (!post) {
                        alert("게시물을 찾을 수 없습니다.");
                        return;
                    }

                    // 새로운 댓글 추가
                    const newComment = {
                        author: localStorage.getItem("loggedInUser") || "익명",
                        content: commentContent,
                        date: new Date().toLocaleString()
                    };

                    post.comments = post.comments || [];
                    post.comments.push(newComment);

                    // 변경된 댓글 저장
                    localStorage.setItem("posts", JSON.stringify(posts));

                    // 댓글 UI 업데이트
                    const commentsSection = document.getElementById('commentsSection');
                    commentsSection.innerHTML += '<div class="comment"><strong>' + newComment.author + '</strong>: ' + newComment.content + '</div>';

                    // 입력 필드 초기화
                    commentInput.value = "";
                });
            };
        </script>
        </body>
        </html>
    `;
    // 새 창에 게시글 내용, 첨부파일 및 댓글 표시
    postWindow.document.write(postContent);
    postWindow.document.close();
}

// 수정 모달을 열어 수정 폼을 보여주는 함수
function openEditModal(post) {
    const editModal = document.getElementById("editPostModal");

    // 수정 폼에 기존 게시글 데이터 채우기
    document.getElementById("editPostTitle").value = post.title; // 기존 제목
    document.getElementById("editPostContent").value = post.content; // 기존 내용
    document.getElementById("editPostCategory").value = post.category; // 기존 카테고리
    document.getElementById("editPostId").value = post.id; // 기존 게시글 id

    // 기존 파일 미리보기 (만약 파일이 있다면)
const filePreview = document.getElementById("editPostFilePreview");
if (post.fileData && post.fileName) {
    filePreview.style.display = "inline-block";  // ✅ 수정: inline-block 적용
    filePreview.href = post.fileData;
    filePreview.textContent = post.fileName;
} else {
    filePreview.style.display = "none";  // ✅ 파일 없을 경우 숨김 처리
}

    // 수정 모달 표시
    document.getElementById("editPostModal").style.display = "block";

    // 기존 이벤트 리스너 제거 후 새 이벤트 추가 (중복 방지)
    const editBtn = document.getElementById("editPostBtn");
    editBtn.removeEventListener("click", handleEditPost); // 기존 이벤트 제거
    editBtn.addEventListener("click", handleEditPost); // 새로운 이벤트 추가
}

// 게시글 수정 이벤트 핸들러 (중복 실행 방지)
async function handleEditPost() {
    const postId = document.getElementById("editPostId").value;
    const title = document.getElementById("editPostTitle").value.trim();
    const content = document.getElementById("editPostContent").value.trim();
    const category = document.getElementById("editPostCategory").value;
    const fileInput = document.getElementById("editPostFile");
    const file = fileInput.files[0];

    if (!title || !content) {
        alert("제목과 내용을 입력해주세요!");
        return;
    }

	let fileData = post.fileData;
	let fileName = post.fileName;


if (file) {
    fileData = await convertFileToBase64(file);
    fileName = file.name;
}

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts = posts.map(post => {
        if (post.id == postId) {
            return { 
                ...post, 
                title, 
                content, 
                category,
                fileData: file ? fileData : post.fileData,  // ✅ 기존 파일 유지 or 새 파일 적용
                fileName: file ? fileName : post.fileName   // ✅ 기존 파일명 유지 or 새 파일 적용
            };
        }
        return post;
    });


    localStorage.setItem("posts", JSON.stringify(posts)); // 수정된 게시글 저장
    loadPosts(); // 게시글 목록 새로고침

    // 수정 모달 닫기 및 폼 초기화
    document.getElementById("editPostModal").style.display = "none";
    document.getElementById("editPostForm").reset();
}


// 게시글 수정 함수
function editPost(updatedPost) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    // 기존의 게시글을 수정된 게시글로 대체
    posts = posts.map(post => post.id === updatedPost.id ? updatedPost : post);
    // 게시글 순서를 변경하지 않도록 날짜를 수정하지 않음
    localStorage.setItem("posts", JSON.stringify(posts)); // 수정된 게시글 저장
    loadPosts(); // 게시글 목록 새로고침
}

// 게시글 번호 자동 부여 함수
function getNextPostId() {
    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const maxId = posts.reduce((max, post) => Math.max(max, parseInt(post.id, 10) || 0), 0);
    return maxId + 1;
}

// 게시글 삭제 함수
function deletePost(postId) {
    if (!confirm("정말 삭제하시겠습니까?")) return; // 확인 창 추가

    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts = posts.filter(post => post.id !== Number(postId)); // 해당 id의 게시글 삭제
    localStorage.setItem("posts", JSON.stringify(posts)); // 로컬스토리지에 저장
    loadPosts(); // 게시글 목록 새로고침
}
// 검색 기능

(function() {
  const searchInput = document.getElementById('search-input');
  let allPosts = [];
  let filteredPosts = [];

  // 검색어로 게시글 필터링
  function filterPosts(searchTerm) {
    if (!searchTerm.trim()) {
      filteredPosts = allPosts;
      return;
    }

    const term = searchTerm.toLowerCase();
    filteredPosts = allPosts.filter(post => {
      const titleMatch = post.title.toLowerCase().includes(term);
      const excerptMatch = post.excerpt.toLowerCase().includes(term);
      const tagsMatch = post.tags.some(tag => tag.toLowerCase().includes(term));
      const categoryMatch = post.category.toLowerCase().includes(term);
      
      return titleMatch || excerptMatch || tagsMatch || categoryMatch;
    });
  }

  // 검색 입력 이벤트
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value;
      filterPosts(searchTerm);
      
      // 검색 결과 업데이트 (app.js의 renderPosts 함수 호출)
      if (window.renderPosts) {
        window.renderPosts(filteredPosts);
      }
    });
  }

  // 외부에서 사용할 수 있도록 전역 함수로 등록
  window.setAllPosts = function(posts) {
    allPosts = posts;
    filteredPosts = posts;
  };

  window.getFilteredPosts = function() {
    return filteredPosts;
  };
})();


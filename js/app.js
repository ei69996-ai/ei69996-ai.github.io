// 메인 애플리케이션 로직

(function() {
  const postsContainer = document.getElementById('posts-container');
  let allPosts = [];

  // posts.json 로드
  async function loadPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error('posts.json을 불러올 수 없습니다.');
      }
      const posts = await response.json();
      allPosts = posts;
      
      // 검색 기능에 게시글 전달
      if (window.setAllPosts) {
        window.setAllPosts(posts);
      }
      
      // 태그 필터 생성
      createTagFilters(posts);
      
      // 게시글 렌더링
      renderPosts(posts);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      if (postsContainer) {
        postsContainer.innerHTML = '<p class="no-results">게시글을 불러올 수 없습니다.</p>';
      }
    }
  }

  // 태그 필터 버튼 생성
  function createTagFilters(posts) {
    const filtersContainer = document.querySelector('.filters');
    if (!filtersContainer) return;

    // 모든 태그 수집
    const allTags = new Set();
    posts.forEach(post => {
      post.tags.forEach(tag => allTags.add(tag));
    });

    // 태그 버튼 생성
    const tagButtons = Array.from(allTags).sort().map(tag => {
      const button = document.createElement('button');
      button.className = 'filter-btn';
      button.textContent = tag;
      button.setAttribute('data-tag', tag);
      button.addEventListener('click', () => {
        // 활성 상태 토글
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');

        // 필터링
        const filtered = tag === 'all' 
          ? allPosts 
          : allPosts.filter(post => post.tags.includes(tag));
        
        // 검색어가 있으면 검색 결과와 교집합
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
          const searchTerm = searchInput.value.toLowerCase();
          const searchFiltered = filtered.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const excerptMatch = post.excerpt.toLowerCase().includes(searchTerm);
            const tagsMatch = post.tags.some(t => t.toLowerCase().includes(searchTerm));
            const categoryMatch = post.category.toLowerCase().includes(searchTerm);
            return titleMatch || excerptMatch || tagsMatch || categoryMatch;
          });
          renderPosts(searchFiltered);
        } else {
          renderPosts(filtered);
        }
      });
      return button;
    });

    // 기존 필터 버튼들 제거 (전체 버튼 제외)
    const existingButtons = filtersContainer.querySelectorAll('.filter-btn:not([data-tag="all"])');
    existingButtons.forEach(btn => btn.remove());

    // 새 태그 버튼들 추가
    tagButtons.forEach(btn => filtersContainer.appendChild(btn));
  }

  // 게시글 목록 렌더링
  window.renderPosts = function(posts) {
    if (!postsContainer) return;

    if (posts.length === 0) {
      postsContainer.innerHTML = '<p class="no-results">게시글이 없습니다.</p>';
      return;
    }

    postsContainer.innerHTML = posts.map(post => {
      const tagsHtml = post.tags.map(tag => 
        `<span class="tag">${escapeHtml(tag)}</span>`
      ).join('');

      const categoryHtml = post.category 
        ? `<span>카테고리: ${escapeHtml(post.category)}</span>`
        : '';

      return `
        <article class="post-card" onclick="window.location.href='post.html?file=${encodeURIComponent(post.file)}'">
          <h2><a href="post.html?file=${encodeURIComponent(post.file)}">${escapeHtml(post.title)}</a></h2>
          <div class="post-meta">
            <span>${post.date}</span>
            ${categoryHtml}
            <div class="post-tags">${tagsHtml}</div>
          </div>
          <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
        </article>
      `;
    }).join('');
  };

  // HTML 이스케이프
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 페이지 로드 시 게시글 불러오기
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPosts);
  } else {
    loadPosts();
  }
})();


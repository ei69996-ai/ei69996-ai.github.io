// 게시글 상세 페이지 로더

(function() {
  // URL에서 파일명 가져오기
  function getPostFile() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
  }

  // Front Matter 파싱
  function parseFrontMatter(content) {
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let metadata = {};
    let postContent = content;

    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      postContent = frontMatterMatch[2];

      const lines = frontMatter.split('\n');
      lines.forEach((line) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();

          // 따옴표 제거
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }

          // 배열 파싱 (tags)
          if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
            try {
              value = JSON.parse(value);
            } catch {
              value = value
                .slice(1, -1)
                .split(',')
                .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
            }
          }

          metadata[key] = value;
        }
      });
    }

    return { metadata, content: postContent };
  }

  // 마크다운을 HTML로 변환
  function renderMarkdown(content) {
    if (typeof marked === 'undefined') {
      return '<p>마크다운 파서를 불러올 수 없습니다.</p>';
    }

    // marked.js 설정
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    return marked.parse(content);
  }

  // 코드 하이라이팅 적용
  function highlightCode() {
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }

  // Giscus 댓글 로드
  function loadGiscus() {
    const container = document.getElementById('giscus-container');
    if (!container) return;

    // 기존 스크립트 제거
    const existingScript = document.querySelector('script[src*="giscus"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Giscus 스크립트 생성
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'ei69996-ai/ei69996-ai.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // Giscus 설정 후 변경 필요
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // Giscus 설정 후 변경 필요
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    container.appendChild(script);
  }

  // 게시글 로드 및 렌더링
  async function loadPost() {
    const filename = getPostFile();
    if (!filename) {
      document.getElementById('post-content').innerHTML = 
        '<p class="no-results">게시글 파일을 찾을 수 없습니다.</p>';
      return;
    }

    try {
      const response = await fetch(`pages/${filename}`);
      if (!response.ok) {
        throw new Error('게시글을 불러올 수 없습니다.');
      }

      const content = await response.text();
      const { metadata, content: postContent } = parseFrontMatter(content);

      // 제목 설정
      const title = metadata.title || filename.replace('.md', '');
      document.title = `${title} - ei69996-ai의 블로그`;
      document.getElementById('post-title').textContent = title;
      document.getElementById('post-heading').textContent = title;

      // 메타데이터 표시
      const dateEl = document.getElementById('post-date');
      if (dateEl) {
        dateEl.textContent = metadata.date || new Date().toISOString().split('T')[0];
      }

      const categoryEl = document.getElementById('post-category');
      if (categoryEl && metadata.category) {
        categoryEl.textContent = `카테고리: ${metadata.category}`;
      }

      const tagsEl = document.getElementById('post-tags');
      if (tagsEl && metadata.tags) {
        const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
        tagsEl.innerHTML = tags.map(tag => 
          `<span class="tag">${escapeHtml(tag)}</span>`
        ).join('');
      }

      // 본문 렌더링
      const htmlContent = renderMarkdown(postContent);
      const contentEl = document.getElementById('post-content');
      if (contentEl) {
        contentEl.innerHTML = htmlContent;
        
        // 코드 하이라이팅 적용
        setTimeout(() => {
          highlightCode();
        }, 100);
      }

      // Giscus 댓글 로드
      setTimeout(() => {
        loadGiscus();
      }, 500);

    } catch (error) {
      console.error('게시글 로드 실패:', error);
      document.getElementById('post-content').innerHTML = 
        '<p class="no-results">게시글을 불러올 수 없습니다.</p>';
    }
  }

  // HTML 이스케이프
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 페이지 로드 시 게시글 불러오기
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPost);
  } else {
    loadPost();
  }
})();


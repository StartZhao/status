<template>
  <div class="bg-animation">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
  <div class="wrapper">
    <main class="main">
      <h1>菜旺窝</h1>
      <button class="bookmark-btn" @click="addToFavorites">
        <i class="fas fa-bookmark"></i>
        Ctrl+D 收藏本页到浏览器收藏夹
      </button>
      <div class="notice">
        <!-- <i class="fas fa-info-circle"></i> -->
        <p>菜旺所有站点，展示厅！</p>
      </div>
      <ul>
        <li
          v-for="(item, index) in urls"
          :key="index"
          :class="{ disabled: item.statusClass != 'status-normal' }"
        >
          <span :class="['ms-display', item.msClass]">{{ item.ms }}</span>
          <div class="url-content">
            <span></span>
            <a :href="item.url" target="_blank">
              <i class="fas fa-external-link-alt"></i>
              {{ item.name }}
            </a>
            <span :class="['status-badge', item.statusClass]">{{
              item.status
            }}</span>
          </div>
        </li>
      </ul>
      <div id="stats-container">
        <div id="last-checked-time">
          <i class="fas fa-clock icon-clock"></i> 最后检测时间: {{ timeString }}
        </div>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">
              <i class="fas fa-check icon-check"></i>{{ accessibleCount }}
            </div>
            <div class="stat-label">正常数量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">
              <i class="fas fa-times icon-times"></i>{{ inaccessibleCount }}
            </div>
            <div class="stat-label">无法访问数量</div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">
      <p>Copyright &copy; 2024- {{ currentYear }} | 菜旺保留所有权利</p>
    </footer>
    <div class="extra">
      <button class="mode-toggle" @click="toggleMode">
        <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import urlsData from "@/assets/data/urls";

// 初始化 urls 数据
const urls = ref(
  urlsData.map((item) => ({
    ...item,
    status: "检测中...",
    ms: "-ms",
    statusClass: "status-checking",
    msClass: "ms-checking",
  }))
);
// 初始化状态检查时间
const timeString = ref(new Date().toLocaleTimeString());
// 计算属性：统计正常和无法访问的数量
const accessibleCount = computed(() => {
  return urls.value.filter((item) => item.status === "正常").length;
});
const inaccessibleCount = computed(() => {
  return urls.value.filter((item) => item.status === "无法访问").length;
});
// 当前年份
const currentYear = ref(new Date().getFullYear());

/**
 * 更新网址状态
 * @param {*} index - URL 在数组中的索引
 * @param {*} isAccessible - 是否可访问
 * @param {*} duration - 响应时间
 */
function updateUrlStatus(index, isAccessible, duration) {
  const item = urls.value[index];
  if (isAccessible) {
    item.status = "正常";
    item.statusClass = "status-normal";
    item.ms = `${duration}ms`;
  } else {
    item.status = "无法访问";
    item.statusClass = "status-error";
    item.ms = "9999ms";
  }
  item.msClass = `ms-${item.statusClass.split("-")[1]}`;
}

/**
 * 检查网址是否可以访问
 * @param {*} url - 网址
 * @param {*} index - URL 在数组中的索引
 * @returns Promise
 */
async function checkUrl(url, index) {
  return new Promise(async (resolve) => {
    let isResolved = false;
    const startTime = performance.now();
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        updateUrlStatus(index, false, 9999);
        isResolved = true;
        resolve(false);
      }
      clearTimeout(timeoutId);
    }, 9999); // 9.99秒超时

    try {
      const response = await fetch(url, {
        method: "HEAD", // 使用 HEAD 方法只获取响应头，不下载整个页面内容
        mode: "cors", // 如果是跨域请求，确保服务器支持 CORS
      });
      if (!isResolved) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        updateUrlStatus(index, response.ok, duration);
        isResolved = true;
        resolve(response.ok);
      }
    } catch (error) {
      if (!isResolved) {
        updateUrlStatus(index, false, 9999);
        isResolved = true;
        resolve(false);
      }
    }
  });
}

/**
 * 检查所有的网址是否可访问
 */
async function checkAllUrls() {
  // 更新所有 URL 的状态为“检测中...”
  urls.value.forEach((item) => {
    item.status = "检测中...";
    item.statusClass = "status-checking";
    item.ms = "-ms";
    item.msClass = "ms-checking";
  });

  // 创建一个包含所有 Promise 的数组
  const checkPromises = urls.value.map((item, index) =>
    checkUrl(item.url, index)
  );

  // 并发执行所有 Promise
  await Promise.all(checkPromises);

  // 更新最后检测时间
  timeString.value = new Date().toLocaleTimeString();
}

// 初始检查
checkAllUrls();

// 每1分钟检查一次
setInterval(checkAllUrls, 60 * 1000);

// 暗黑模式状态
const isDarkMode = ref(false);

// 检查系统偏好
function checkSystemPreference() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

// 初始化暗黑模式
function initializeDarkMode() {
  const userPreference = localStorage.getItem("darkMode");
  if (userPreference === "enabled") {
    setDarkMode(true);
  } else if (userPreference === "disabled") {
    setDarkMode(false);
  } else {
    setDarkMode(checkSystemPreference());
  }
}

// 设置暗黑模式
function setDarkMode(isDark) {
  isDarkMode.value = isDark;
  const body = document.body;
  body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
}

// 切换暗黑模式
function toggleMode() {
  setDarkMode(!isDarkMode.value);
}

// 监听系统主题变化
onMounted(() => {
  initializeDarkMode();
  // 监听系统颜色方案变化
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (e) => {
    if (localStorage.getItem("darkMode") === null) {
      setDarkMode(e.matches);
    }
  });
});

function addToFavorites(e) {
  e.preventDefault();

  // 检查是否是 Firefox 浏览器
  if (window.sidebar && window.sidebar.addPanel) {
    // Mozilla Firefox Bookmark
    window.sidebar.addPanel(document.title, window.location.href, "");
  } else {
    // 对于其他浏览器（包括 Chrome、Safari、Edge 等），提示用户手动添加到收藏夹
    const key = navigator.userAgent.toLowerCase().includes("mac")
      ? "Command/Cmd"
      : "Ctrl";
    alert(`请按 ${key} + D 将此页面添加到收藏夹。`);
  }
}
</script>

<style scoped></style>

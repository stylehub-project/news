// --- BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', () => {
    // Note: MapManager and UIManager are loaded globally via <script> tags
    const mapManager = new MapManager('map', (newsItem) => {
        uiManager.showNewsDetail(newsItem);
    });

    mapManager.init();

    const uiManager = new UIManager(mapManager);
    const chatManager = new ChatManager(mapManager, uiManager);

    document.addEventListener('news-explain', (e) => {
        chatManager.explainNews(e.detail);
    });

    setTimeout(() => {
        // MOCK_NEWS is loaded globally
        mapManager.addMarkers(MOCK_NEWS);
    }, 500);
});

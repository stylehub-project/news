// --- DATA ---
const MOCK_NEWS = [
    {
        id: 1, title: "Major Climate Summit Begins in Paris", summary: "World leaders gather to discuss urgent climate action targets for 2030, focusing on renewable energy transitions.",
        type: "breaking", location: { lat: 48.8566, lng: 2.3522 }, source: "Global News", timestamp: "10 mins ago",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: 2, title: "Tech Giant Unveils Quantum Processor", summary: "Silicon Valley sees the reveal of the first commercial-grade quantum processor in San Francisco.",
        type: "trending", location: { lat: 37.7749, lng: -122.4194 }, source: "TechDaily", timestamp: "2 hours ago",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: 3, title: "Historic Peace Treaty Signed", summary: "A landmark agreement has been reached in Geneva, promising stability for the region.",
        type: "normal", location: { lat: 46.2044, lng: 6.1432 }, source: "World Peace Org", timestamp: "1 hour ago", image: null
    },
    {
        id: 4, title: "New Coral Reef Discovered", summary: "Validating marine biodiversity efforts, a massive new reef system was found off the coast of Australia.",
        type: "normal", location: { lat: -16.9186, lng: 145.7781 }, source: "Cairns Post", timestamp: "5 hours ago",
        image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: 5, title: "Volcanic Activity detected", summary: "Mount Etna shows signs of increased activity, geologists are monitoring the situation closely.",
        type: "breaking", location: { lat: 37.7510, lng: 14.9934 }, source: "GeoWatch", timestamp: "Just now",
        image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=300"
    },
    {
        id: 6, title: "Tokyo Olympics Update", summary: "Preparations for the next summer games are ahead of schedule according to officials.",
        type: "trending", location: { lat: 35.6762, lng: 139.6503 }, source: "Sports Asia", timestamp: "30 mins ago",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=300"
    }
];

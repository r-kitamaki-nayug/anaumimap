// ベースマップの設定
export const baseMap = {
    id: "modern",
    name: "現代 (地理院地図)",
    url: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    attribution: "地理院地図┃現在の日本の標準的な地図です。最新の道路、建物、地形が正確に反映されており、古地図と比較する際の基準（ベースマップ）となります。"
};

// 重ねる古地図のリスト
export const overlays = [
    {
        id: "meiji_swale",
        name: "明治期の海岸線(低湿地図。1880s-1910s)",
        url: "https://cyberjapandata.gsi.go.jp/xyz/swale/{z}/{x}/{y}.png",
        attribution: "明治13年（1880年）〜明治45年（1912年）にかけて測量された「迅速測図」などの古い地形図を基に、当時の湿地、葦原、水域などを可視化したデータです。 昭和以降の大規模な埋め立てが行われる前の「自然に近い海岸線」や、標高が低く水が溜まりやすかった場所を知る手がかりとなります。",
        defaultOpacity: 0.5,
        zIndex: 50
    },

    // ここに新しいMapWarperのデータを追加していくだけで、UIに自動反映されます
];